-- ASTER Corrective Migration: Fix increment_post_like schema qualification
-- Migration: 20261114_002_fix_increment_post_like_btrim.sql
-- Target: Supabase PostgreSQL
-- Purpose:
--   1. Replace unqualified or legacy trim with pg_catalog.btrim(text)
--   2. Maintain SET search_path = '' and SECURITY DEFINER
--   3. Maintain fully schema-qualified references across all objects and catalog functions
--   4. Ensure regex operator is exactly !~ (no markdown backslashes)
--   5. Explicitly assign function ownership to postgres
--   6. Restrict EXECUTE strictly to postgres and service_role (revoked from PUBLIC, anon, authenticated)

CREATE OR REPLACE FUNCTION public.increment_post_like(
  p_post_id text,
  p_visitor_hash text
)
RETURNS TABLE (
  success boolean,
  already_liked boolean,
  new_likes_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_post_exists boolean := false;
  v_inserted boolean := false;
  v_current_count integer := 0;
BEGIN
  -- 1. Strict Input Validation with fully-qualified pg_catalog functions
  IF p_post_id IS NULL OR pg_catalog.length(pg_catalog.btrim(p_post_id)) = 0 OR pg_catalog.length(p_post_id) > 128 THEN
    RETURN QUERY SELECT false, false, 0;
    RETURN;
  END IF;

  IF p_visitor_hash IS NULL OR pg_catalog.length(p_visitor_hash) != 64 OR p_visitor_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN QUERY SELECT false, false, 0;
    RETURN;
  END IF;

  -- 2. Verify Post Existence
  SELECT EXISTS(
    SELECT 1 FROM public.posts WHERE id = p_post_id
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RETURN QUERY SELECT false, false, 0;
    RETURN;
  END IF;

  -- 3. Atomic Insert with Unique Conflict Prevention
  INSERT INTO public.post_likes (post_id, visitor_hash)
  VALUES (p_post_id, p_visitor_hash)
  ON CONFLICT (post_id, visitor_hash) DO NOTHING
  RETURNING true INTO v_inserted;

  -- 4. Conditional Counter Increment
  IF v_inserted IS TRUE THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1,
        updated_at = pg_catalog.now()
    WHERE id = p_post_id
    RETURNING likes_count INTO v_current_count;

    RETURN QUERY SELECT true, false, v_current_count;
  ELSE
    SELECT likes_count INTO v_current_count
    FROM public.posts
    WHERE id = p_post_id;

    RETURN QUERY SELECT true, true, COALESCE(v_current_count, 0);
  END IF;
END;
$$;

-- Explicitly assign function ownership to postgres
ALTER FUNCTION public.increment_post_like(text, text) OWNER TO postgres;

-- Restrict function execution permissions to postgres and service_role only
REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO postgres;

-- Log migration execution record
INSERT INTO public._migration_history (version, name, checksum, status)
VALUES ('20261114_002', 'fix_increment_post_like_btrim', 'sha256_btrim_qualified_search_path_empty', 'applied')
ON CONFLICT (version) DO UPDATE SET status = 'applied', applied_at = pg_catalog.now();
