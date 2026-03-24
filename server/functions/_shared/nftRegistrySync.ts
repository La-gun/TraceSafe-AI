/**
 * Syncs commissioned NFC tags into the separate PostgreSQL NFT registry (schema nft_registry).
 * Secrets: NFT_REGISTRY_DATABASE_URL or DATABASE_URL, optional NFT_REGISTRY_TENANT_EXTERNAL_KEY / NFT_REGISTRY_TENANT_DISPLAY_NAME.
 */
import postgres from 'npm:postgres@3.4.5';

export type CommissionSyncPayload = {
  tag_uid: string;
  batch_number: string;
  product_name: string;
  product_id?: string | null;
  batch_id?: string | null;
  serial_number?: string | null;
  commissioning_location?: string | null;
};

function dbUrl(): string | undefined {
  return Deno.env.get('NFT_REGISTRY_DATABASE_URL') ?? Deno.env.get('DATABASE_URL') ?? undefined;
}

function tenantExternalKey(): string {
  return Deno.env.get('NFT_REGISTRY_TENANT_EXTERNAL_KEY') ?? 'default';
}

function tenantDisplayName(): string {
  return Deno.env.get('NFT_REGISTRY_TENANT_DISPLAY_NAME') ?? 'Default tenant';
}

/** Safe, unique-ish business keys for hierarchy codes */
export function slugCode(s: string): string {
  const t = String(s || 'unknown').replace(/[^a-zA-Z0-9:_-]+/g, '_');
  return t.length > 180 ? `${t.slice(0, 120)}_${t.length}` : t;
}

export async function syncCommissionedTagToNftRegistry(
  p: CommissionSyncPayload,
): Promise<
  | { skipped: true }
  | { ok: true; sku_node_id: string; tag_instance_node_id: string }
  | { ok: false; error: string }
> {
  const url = dbUrl();
  if (!url) return { skipped: true };

  const sql = postgres(url, { max: 1, prepare: false });
  const tenantExt = tenantExternalKey();
  const productKey = slugCode(p.product_id || p.batch_number);
  const skuCode = `sku:${productKey}`;
  const tagCode = `tag:${slugCode(p.tag_uid)}`;

  try {
    let sku_node_id = '';
    let tag_instance_node_id = '';

    await sql.begin(async (tx) => {
      const [trow] = await tx`
        INSERT INTO nft_registry.nft_tenant (external_key, display_name)
        VALUES (${tenantExt}, ${tenantDisplayName()})
        ON CONFLICT (external_key) DO UPDATE
          SET display_name = EXCLUDED.display_name, updated_at = now()
        RETURNING id
      `;
      const tenantId = trow.id as string;

      const [cat] = await tx`
        INSERT INTO nft_registry.nft_hierarchy_node (tenant_id, parent_id, node_kind, code, display_name)
        VALUES (${tenantId}, ${null}, 'product_line', 'catalog-root', 'Product catalog')
        ON CONFLICT (tenant_id, code) DO UPDATE SET updated_at = now()
        RETURNING id
      `;
      const catalogId = cat.id as string;

      const [sku] = await tx`
        INSERT INTO nft_registry.nft_hierarchy_node (tenant_id, parent_id, node_kind, code, display_name)
        VALUES (${tenantId}, ${catalogId}, 'sku', ${skuCode}, ${p.product_name})
        ON CONFLICT (tenant_id, code) DO UPDATE
          SET display_name = EXCLUDED.display_name, updated_at = now()
        RETURNING id
      `;
      sku_node_id = sku.id as string;

      const [tagNode] = await tx`
        INSERT INTO nft_registry.nft_hierarchy_node (tenant_id, parent_id, node_kind, code, display_name)
        VALUES (${tenantId}, ${sku_node_id}, 'tag_instance', ${tagCode}, ${p.product_name})
        ON CONFLICT (tenant_id, code) DO UPDATE
          SET display_name = EXCLUDED.display_name, parent_id = EXCLUDED.parent_id, updated_at = now()
        RETURNING id
      `;
      tag_instance_node_id = tagNode.id as string;

      await tx`
        INSERT INTO nft_registry.physical_tag_assignment (
          tenant_id, tag_uid, hierarchy_node_id, batch_external_ref, platform_product_id, serial_number,
          status, commissioned_at
        )
        VALUES (
          ${tenantId},
          ${p.tag_uid},
          ${tag_instance_node_id},
          ${p.batch_number},
          ${p.product_id ?? null},
          ${p.serial_number ?? p.tag_uid},
          'commissioned',
          now()
        )
        ON CONFLICT (tag_uid) DO UPDATE SET
          hierarchy_node_id = EXCLUDED.hierarchy_node_id,
          batch_external_ref = EXCLUDED.batch_external_ref,
          platform_product_id = EXCLUDED.platform_product_id,
          serial_number = EXCLUDED.serial_number,
          status = EXCLUDED.status,
          commissioned_at = EXCLUDED.commissioned_at,
          updated_at = now()
      `;

      if (p.product_id) {
        await tx`
          INSERT INTO nft_registry.platform_product_catalog_link (
            tenant_id, platform_product_id, hierarchy_node_id, effective_from
          )
          VALUES (${tenantId}, ${p.product_id}, ${sku_node_id}, CURRENT_DATE)
          ON CONFLICT (tenant_id, platform_product_id, hierarchy_node_id, effective_from) DO NOTHING
        `;
      }
    });

    return { ok: true, sku_node_id, tag_instance_node_id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

export type NftRegistryTagRow = {
  tag_uid: string;
  assignment_status: string;
  batch_external_ref: string | null;
  platform_product_id: string | null;
  hierarchy_code: string;
  node_kind: string;
  path: string;
  lifecycle_state: string | null;
  chain_id: string | null;
  contract_address: string | null;
  token_id: string | null;
};

export async function fetchNftRegistryByTagUid(tag_uid: string): Promise<NftRegistryTagRow | null> {
  const url = dbUrl();
  if (!url) return null;

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    const rows = await sql`
      SELECT
        p.tag_uid,
        p.status AS assignment_status,
        p.batch_external_ref,
        p.platform_product_id,
        n.code AS hierarchy_code,
        n.node_kind::text AS node_kind,
        n.path,
        t.lifecycle_state::text AS lifecycle_state,
        t.chain_id::text AS chain_id,
        t.contract_address,
        t.token_id::text AS token_id
      FROM nft_registry.physical_tag_assignment p
      JOIN nft_registry.nft_hierarchy_node n ON n.id = p.hierarchy_node_id
      LEFT JOIN nft_registry.nft_token_record t ON t.id = p.nft_token_record_id
      WHERE p.tag_uid = ${tag_uid}
      LIMIT 1
    `;
    return rows[0] ?? null;
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}