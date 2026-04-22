-- Allow events.ends_at to be NULL when the end date/time is not provided.
-- This matches the UI behavior where end date/time is optional.
-- 
-- IMPORTANT:
-- If you have existing rows with ends_at = starts_at that were created as a fallback,
-- you can optionally clean them up manually depending on your business rules.

ALTER TABLE public.events
  ALTER COLUMN ends_at DROP NOT NULL;
