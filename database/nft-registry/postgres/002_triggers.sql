-- Maintains path + depth on insert/update; prevents simple cycles (direct self only — full cycle check in app).

SET search_path TO nft_registry, public;

CREATE OR REPLACE FUNCTION nft_registry.trg_nft_hierarchy_node_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT;
  parent_depth INT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := '/' || NEW.id::TEXT || '/';
    NEW.depth := 0;
  ELSE
    SELECT path, depth INTO parent_path, parent_depth
    FROM nft_registry.nft_hierarchy_node WHERE id = NEW.parent_id;
    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent node % not found', NEW.parent_id;
    END IF;
    NEW.path := parent_path || NEW.id::TEXT || '/';
    NEW.depth := parent_depth + 1;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nft_hierarchy_node_path_bi ON nft_registry.nft_hierarchy_node;
CREATE TRIGGER nft_hierarchy_node_path_bi
  BEFORE INSERT OR UPDATE OF parent_id ON nft_registry.nft_hierarchy_node
  FOR EACH ROW
  EXECUTE PROCEDURE nft_registry.trg_nft_hierarchy_node_path();

CREATE OR REPLACE FUNCTION nft_registry.trg_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nft_tenant_touch ON nft_registry.nft_tenant;
CREATE TRIGGER nft_tenant_touch BEFORE UPDATE ON nft_registry.nft_tenant
  FOR EACH ROW EXECUTE PROCEDURE nft_registry.trg_touch_updated_at();

DROP TRIGGER IF EXISTS nft_token_touch ON nft_registry.nft_token_record;
CREATE TRIGGER nft_token_touch BEFORE UPDATE ON nft_registry.nft_token_record
  FOR EACH ROW EXECUTE PROCEDURE nft_registry.trg_touch_updated_at();

DROP TRIGGER IF EXISTS phys_tag_touch ON nft_registry.physical_tag_assignment;
CREATE TRIGGER phys_tag_touch BEFORE UPDATE ON nft_registry.physical_tag_assignment
  FOR EACH ROW EXECUTE PROCEDURE nft_registry.trg_touch_updated_at();
