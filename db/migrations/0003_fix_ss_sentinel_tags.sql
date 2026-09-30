-- Repair: ss_sentinel_tags drifted from its intended shape in the live
-- database — it was created with `sentinel_id uuid` and no foreign keys,
-- while every consumer (launch flow, /api/agents/tags, admin sentinel-tags
-- API) keys assignments by the integer ss_agents.agent_id. The mismatch made
-- every tag write fail (22P02 on insert) and every read return nothing, so
-- tags never showed in the /attacks table or the admin console and the tag
-- filter had no data to match.
--
-- The table was empty when this drift was found (the uuid column rejected
-- every real insert), so dropping and recreating it loses nothing.
--
-- Run in the Supabase SQL Editor (schema: sentinel).

DROP TABLE IF EXISTS sentinel.ss_sentinel_tags CASCADE;

CREATE TABLE sentinel.ss_sentinel_tags (
  sentinel_id  integer NOT NULL REFERENCES sentinel.ss_agents (agent_id) ON DELETE CASCADE,
  tag_id       uuid NOT NULL REFERENCES sentinel.ss_tags (tag_id) ON DELETE CASCADE,
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sentinel_id, tag_id)
);

-- Lookup of all sentinels carrying a given tag (the PK already covers
-- per-sentinel lookups).
CREATE INDEX IF NOT EXISTS idx_sentinel_tags_tag
  ON sentinel.ss_sentinel_tags (tag_id);
