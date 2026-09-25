-- Partner Applications: public intake from the /partners partner-application
-- page (WO-2). The route inserts with service-role; new submissions always
-- start in pending_review and only Red Sentinel admin actions may move them
-- to approved/rejected (via the future admin review workflow).
--
-- Run in the Supabase SQL Editor (schema: sentinel).

-- CREATE TYPE has no IF NOT EXISTS; the DO block makes this re-runnable.
DO $$
BEGIN
  CREATE TYPE sentinel.partner_application_status AS ENUM (
    'pending_review',
    'approved',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL; -- type already exists
END
$$;

CREATE TABLE IF NOT EXISTS sentinel.ss_partner_applications (
  application_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name     text NOT NULL,
  contact_name     text NOT NULL,
  email            text NOT NULL,
  telegram_handle  text NOT NULL,
  campaign_goal    text NOT NULL,
  status           sentinel.partner_application_status NOT NULL DEFAULT 'pending_review',
  submitted_at     timestamptz NOT NULL DEFAULT now(),
  reviewed_at      timestamptz NULL,
  reviewed_by      uuid NULL,
  rejection_reason text NULL
);

-- Admin review queue reads pending applications newest-first.
CREATE INDEX IF NOT EXISTS idx_partner_applications_status_submitted
  ON sentinel.ss_partner_applications (status, submitted_at DESC);
