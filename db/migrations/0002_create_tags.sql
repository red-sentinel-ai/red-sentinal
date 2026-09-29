-- Tags: labels that can be attached to sentinels at launch time. Tags are
-- managed by Red Sentinel admins (via the admin UI); the launch-sentinel
-- form reads the list to populate its Tags dropdown.
--
-- Run in the Supabase SQL Editor (schema: sentinel).

CREATE TABLE IF NOT EXISTS sentinel.ss_tags (
  tag_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text NOT NULL,
  description  text NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid NULL
);

-- Case-insensitive uniqueness so admins cannot create duplicate tags.
CREATE UNIQUE INDEX IF NOT EXISTS uq_tags_slug
  ON sentinel.ss_tags (lower(slug));

CREATE UNIQUE INDEX IF NOT EXISTS uq_tags_name
  ON sentinel.ss_tags (lower(name));

-- Launch form reads active tags alphabetically.
CREATE INDEX IF NOT EXISTS idx_tags_active_name
  ON sentinel.ss_tags (is_active, name);

-- Junction table: which tags are attached to which sentinel (ss_agents row).
CREATE TABLE IF NOT EXISTS sentinel.ss_sentinel_tags (
  sentinel_id  integer NOT NULL REFERENCES sentinel.ss_agents (agent_id) ON DELETE CASCADE,
  tag_id       uuid NOT NULL REFERENCES sentinel.ss_tags (tag_id) ON DELETE CASCADE,
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sentinel_id, tag_id)
);

-- Lookup of all sentinels carrying a given tag.
CREATE INDEX IF NOT EXISTS idx_sentinel_tags_tag
  ON sentinel.ss_sentinel_tags (tag_id);
