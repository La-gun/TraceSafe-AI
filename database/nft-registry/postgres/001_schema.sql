-- TraceSafe NFT Tag Registry — PostgreSQL (separate logical database / schema)
-- Run against a dedicated DB or use schema isolation: SET search_path TO nft_registry, public;
--
-- Design goals:
--   • Enterprise hierarchy: any depth parent → child (tenant → portfolio → collection → class → tag slot)
--   • Dual truth: physical NFC UID + on-chain token identity (optional until minted)
--   • Product bridge: link SKUs / platform product_id to hierarchy nodes without duplicating ops data
--   • Auditability: immutable-style event log + metadata revisions for compliance & disputes

CREATE SCHEMA IF NOT EXISTS nft_registry;

SET search_path TO nft_registry, public;

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE nft_node_kind AS ENUM (
    'tenant_root',       -- virtual root per tenant (optional single child of null parent)
    'organization',      -- legal entity / manufacturer
    'brand',
    'product_line',
    'sku',               -- sellable SKU aligned with platform product_id
    'nft_collection',    -- on-chain collection intent (pre-mint)
    'token_class',       -- contract + class id (e.g. ERC-1155 id) or 721 type
    'tag_instance'       -- leaf: one physical tag / serial slot
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE nft_lifecycle_state AS ENUM (
    'draft',
    'approved',
    'mint_pending',
    'minted',
    'anchored',
    'transferred',
    'burned',
    'revoked'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE nft_audit_action AS ENUM (
    'node_created', 'node_updated', 'node_moved', 'node_deactivated',
    'token_bound', 'token_updated',
    'tag_assigned', 'tag_unassigned', 'tag_recalled',
    'product_linked', 'product_unlinked',
    'metadata_published', 'metadata_superseded'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tenancy (enterprise boundary)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_tenant (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_key    TEXT NOT NULL UNIQUE,  -- stable id from IdP / ERP / org slug
  display_name    TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nft_tenant_external ON nft_tenant (external_key);

-- ---------------------------------------------------------------------------
-- Adjacency-list hierarchy (parent / child); path for fast subtree reads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_hierarchy_node (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES nft_hierarchy_node (id) ON DELETE RESTRICT,
  node_kind       nft_node_kind NOT NULL,
  code            TEXT NOT NULL,           -- unique per tenant, stable business key
  display_name    TEXT,
  description     TEXT,
  attributes      JSONB NOT NULL DEFAULT '{}',
  path            TEXT NOT NULL,           -- materialized path e.g. /uuid1/uuid2/uuid3/
  depth           INT NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_nft_node_tenant_code UNIQUE (tenant_id, code),
  CONSTRAINT chk_nft_node_no_self_parent CHECK (parent_id IS DISTINCT FROM id)
);

CREATE INDEX IF NOT EXISTS idx_nft_node_parent ON nft_hierarchy_node (parent_id);
CREATE INDEX IF NOT EXISTS idx_nft_node_tenant_kind ON nft_hierarchy_node (tenant_id, node_kind);
CREATE INDEX IF NOT EXISTS idx_nft_node_path ON nft_hierarchy_node (path text_pattern_ops);

-- ---------------------------------------------------------------------------
-- On-chain token facts (0..1 per tag_instance or token_class, depending on model)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_token_record (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  hierarchy_node_id   UUID NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE CASCADE,
  chain_id            BIGINT NOT NULL,           -- EIP-155 style or internal registry id
  contract_address    TEXT NOT NULL,             -- checksummed hex
  token_standard      TEXT NOT NULL
                        CHECK (token_standard IN ('ERC-721', 'ERC-1155', 'OTHER')),
  token_id            NUMERIC(78, 0) NOT NULL,  -- uint256 as numeric
  metadata_uri        TEXT,
  content_hash        TEXT,                      -- IPFS CID or sha256 of resolved JSON
  mint_tx_hash        TEXT,
  minted_at           TIMESTAMPTZ,
  lifecycle_state     nft_lifecycle_state NOT NULL DEFAULT 'draft',
  raw_extra           JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_nft_token_chain_contract_id UNIQUE (chain_id, contract_address, token_id)
);

CREATE INDEX IF NOT EXISTS idx_nft_token_node ON nft_token_record (hierarchy_node_id);
CREATE INDEX IF NOT EXISTS idx_nft_token_tenant_state ON nft_token_record (tenant_id, lifecycle_state);

-- ---------------------------------------------------------------------------
-- Physical NFC ↔ hierarchy leaf (upload / manage tag inventory here)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS physical_tag_assignment (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  tag_uid               TEXT NOT NULL,           -- matches ops TagRegistry.tag_uid
  hierarchy_node_id     UUID NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE RESTRICT,
  batch_external_ref    TEXT,                    -- batch_number or batch UUID from ops DB
  platform_product_id   TEXT,                    -- ops product_id / SKU id
  serial_number         TEXT,
  commissioning_ref     TEXT,                    -- external commissioning job id
  status                TEXT NOT NULL DEFAULT 'inventory'
                          CHECK (status IN ('inventory', 'commissioned', 'shipped', 'recalled', 'void')),
  commissioned_at       TIMESTAMPTZ,
  nft_token_record_id   UUID REFERENCES nft_token_record (id) ON DELETE SET NULL,
  attributes            JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_physical_tag_uid UNIQUE (tag_uid)
);

CREATE INDEX IF NOT EXISTS idx_phys_tag_tenant ON physical_tag_assignment (tenant_id);
CREATE INDEX IF NOT EXISTS idx_phys_tag_node ON physical_tag_assignment (hierarchy_node_id);
CREATE INDEX IF NOT EXISTS idx_phys_tag_product ON physical_tag_assignment (platform_product_id);

-- ---------------------------------------------------------------------------
-- Explicit product ↔ catalog link (many SKUs → one collection, versioned)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_product_catalog_link (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  platform_product_id   TEXT NOT NULL,
  hierarchy_node_id     UUID NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE CASCADE,
  effective_from        DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to          DATE,
  priority              INT NOT NULL DEFAULT 0,  -- disambiguate overlapping rules
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_product_link_window UNIQUE (tenant_id, platform_product_id, hierarchy_node_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_product_link_lookup ON platform_product_catalog_link (tenant_id, platform_product_id)
  WHERE effective_to IS NULL OR effective_to >= CURRENT_DATE;

-- ---------------------------------------------------------------------------
-- Metadata revisions (regulatory: show what consumers saw at time T)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_metadata_revision (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  hierarchy_node_id     UUID NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE CASCADE,
  revision              INT NOT NULL,
  uri                   TEXT,
  content_hash          TEXT NOT NULL,
  json_document         JSONB,
  effective_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by            TEXT,
  CONSTRAINT uq_metadata_rev UNIQUE (hierarchy_node_id, revision)
);

CREATE INDEX IF NOT EXISTS idx_metadata_node ON nft_metadata_revision (hierarchy_node_id, effective_at DESC);

-- ---------------------------------------------------------------------------
-- Append-only style audit (who changed the NFT registry)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_audit_event (
  id              BIGSERIAL PRIMARY KEY,
  tenant_id       UUID REFERENCES nft_tenant (id) ON DELETE SET NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id        TEXT,
  actor_email     TEXT,
  action          nft_audit_action NOT NULL,
  entity_table    TEXT NOT NULL,
  entity_id       UUID,
  payload         JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_nft_audit_tenant_time ON nft_audit_event (tenant_id, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- Helper: subtree under a node (recursive)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW nft_registry.v_nft_subtree AS
WITH RECURSIVE tree AS (
  SELECT n.*, ARRAY[n.id]::UUID[] AS ancestry
  FROM nft_registry.nft_hierarchy_node n
  WHERE n.parent_id IS NULL
  UNION ALL
  SELECT c.*, t.ancestry || c.id
  FROM nft_registry.nft_hierarchy_node c
  JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;

COMMENT ON SCHEMA nft_registry IS
  'Separate NFT tag catalog: hierarchy, token binding, physical tags, and product links. Integrate with ops TagRegistry via tag_uid / product_id.';
