-- TraceSafe NFT Tag Registry — SQLite (local dev, edge, or embedded catalog)
-- Parent/child via nft_hierarchy_node.parent_id; path/depth maintained by application
-- or triggers if your SQLite version supports them.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS nft_tenant (
  id              TEXT PRIMARY KEY,
  external_key    TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  metadata        TEXT NOT NULL DEFAULT '{}',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS nft_hierarchy_node (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  parent_id       TEXT REFERENCES nft_hierarchy_node (id) ON DELETE RESTRICT,
  node_kind       TEXT NOT NULL CHECK (node_kind IN (
                    'tenant_root', 'organization', 'brand', 'product_line', 'sku',
                    'nft_collection', 'token_class', 'tag_instance')),
  code            TEXT NOT NULL,
  display_name    TEXT,
  description     TEXT,
  attributes      TEXT NOT NULL DEFAULT '{}',
  path            TEXT NOT NULL DEFAULT '',
  depth           INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, code),
  CHECK (parent_id IS NULL OR parent_id != id)
);

CREATE INDEX IF NOT EXISTS idx_nft_node_parent ON nft_hierarchy_node (parent_id);
CREATE INDEX IF NOT EXISTS idx_nft_node_tenant_kind ON nft_hierarchy_node (tenant_id, node_kind);
CREATE INDEX IF NOT EXISTS idx_nft_node_path ON nft_hierarchy_node (path);

CREATE TABLE IF NOT EXISTS nft_token_record (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  hierarchy_node_id   TEXT NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE CASCADE,
  chain_id            INTEGER NOT NULL,
  contract_address    TEXT NOT NULL,
  token_standard      TEXT NOT NULL CHECK (token_standard IN ('ERC-721', 'ERC-1155', 'OTHER')),
  token_id            TEXT NOT NULL,
  metadata_uri        TEXT,
  content_hash        TEXT,
  mint_tx_hash        TEXT,
  minted_at           TEXT,
  lifecycle_state     TEXT NOT NULL DEFAULT 'draft' CHECK (lifecycle_state IN (
                      'draft', 'approved', 'mint_pending', 'minted', 'anchored',
                      'transferred', 'burned', 'revoked')),
  raw_extra           TEXT NOT NULL DEFAULT '{}',
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (chain_id, contract_address, token_id)
);

CREATE INDEX IF NOT EXISTS idx_nft_token_node ON nft_token_record (hierarchy_node_id);

CREATE TABLE IF NOT EXISTS physical_tag_assignment (
  id                    TEXT PRIMARY KEY,
  tenant_id             TEXT NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  tag_uid               TEXT NOT NULL UNIQUE,
  hierarchy_node_id     TEXT NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE RESTRICT,
  batch_external_ref    TEXT,
  platform_product_id   TEXT,
  serial_number         TEXT,
  commissioning_ref     TEXT,
  status                TEXT NOT NULL DEFAULT 'inventory' CHECK (status IN (
                        'inventory', 'commissioned', 'shipped', 'recalled', 'void')),
  commissioned_at       TEXT,
  nft_token_record_id   TEXT REFERENCES nft_token_record (id) ON DELETE SET NULL,
  attributes            TEXT NOT NULL DEFAULT '{}',
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_phys_tag_tenant ON physical_tag_assignment (tenant_id);
CREATE INDEX IF NOT EXISTS idx_phys_tag_node ON physical_tag_assignment (hierarchy_node_id);
CREATE INDEX IF NOT EXISTS idx_phys_tag_product ON physical_tag_assignment (platform_product_id);

CREATE TABLE IF NOT EXISTS platform_product_catalog_link (
  id                    TEXT PRIMARY KEY,
  tenant_id             TEXT NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  platform_product_id   TEXT NOT NULL,
  hierarchy_node_id     TEXT NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE CASCADE,
  effective_from        TEXT NOT NULL DEFAULT (date('now')),
  effective_to          TEXT,
  priority              INTEGER NOT NULL DEFAULT 0,
  metadata              TEXT NOT NULL DEFAULT '{}',
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, platform_product_id, hierarchy_node_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_product_link_lookup ON platform_product_catalog_link (tenant_id, platform_product_id);

CREATE TABLE IF NOT EXISTS nft_metadata_revision (
  id                    TEXT PRIMARY KEY,
  tenant_id             TEXT NOT NULL REFERENCES nft_tenant (id) ON DELETE CASCADE,
  hierarchy_node_id     TEXT NOT NULL REFERENCES nft_hierarchy_node (id) ON DELETE CASCADE,
  revision              INTEGER NOT NULL,
  uri                   TEXT,
  content_hash          TEXT NOT NULL,
  json_document         TEXT,
  effective_at          TEXT NOT NULL DEFAULT (datetime('now')),
  created_by            TEXT,
  UNIQUE (hierarchy_node_id, revision)
);

CREATE TABLE IF NOT EXISTS nft_audit_event (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id       TEXT REFERENCES nft_tenant (id) ON DELETE SET NULL,
  occurred_at     TEXT NOT NULL DEFAULT (datetime('now')),
  actor_id        TEXT,
  actor_email     TEXT,
  action          TEXT NOT NULL,
  entity_table    TEXT NOT NULL,
  entity_id       TEXT,
  payload         TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_nft_audit_tenant_time ON nft_audit_event (tenant_id, occurred_at DESC);
