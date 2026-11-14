-- ASTER Full-Stack Portfolio & Micro-Blog Database Schema
-- Version: 20261114_001 (Hardened & Certified)
-- Target: Supabase PostgreSQL with Table-Level Grants & Row Level Security (RLS)

-- ============================================================================
-- 0. MIGRATION AUDIT & STATE TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS public._migration_history (
  version text PRIMARY KEY,
  name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  checksum text NOT NULL,
  status text NOT NULL
);

-- ============================================================================
-- 1. POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  category text NOT NULL,
  mood text,
  tags text[] DEFAULT '{}'::text[],
  author_name text NOT NULL DEFAULT 'Abdullah Nayem',
  author_avatar text NOT NULL DEFAULT '/profile.jpg',
  author_role text NOT NULL DEFAULT 'Full-Stack Developer',
  published_at text NOT NULL,
  read_time text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_is_private ON public.posts(is_private);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================================================
-- 2. COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  comment text NOT NULL,
  created_at_display text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- ============================================================================
-- 3. POST LIKES TABLE (Relational duplicate prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id bigserial PRIMARY KEY,
  post_id text NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT uq_post_visitor_like UNIQUE (post_id, visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);

-- ============================================================================
-- 4. TABLE-LEVEL PERMISSIONS (DEFENSE IN DEPTH: GRANTS & REVOCATIONS)
-- ============================================================================
-- Revoke all default table privileges from PUBLIC
REVOKE ALL ON TABLE public.posts FROM PUBLIC;
REVOKE ALL ON TABLE public.comments FROM PUBLIC;
REVOKE ALL ON TABLE public.post_likes FROM PUBLIC;
REVOKE ALL ON TABLE public._migration_history FROM PUBLIC;

-- Completely strip all privileges from client/unprivileged roles first
REVOKE ALL ON TABLE public.posts FROM anon, authenticated;
REVOKE ALL ON TABLE public.comments FROM anon, authenticated;
REVOKE ALL ON TABLE public.post_likes FROM anon, authenticated;
REVOKE ALL ON TABLE public._migration_history FROM anon, authenticated;

-- Grant strictly read-only SELECT to anon and authenticated (further filtered by RLS policies)
GRANT SELECT ON TABLE public.posts TO anon, authenticated;
GRANT SELECT ON TABLE public.comments TO anon, authenticated;

-- Explicitly revoke mutation, reference, and trigger privileges from anon and authenticated
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.posts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.comments FROM anon, authenticated;
REVOKE ALL, REFERENCES, TRIGGER ON TABLE public.post_likes FROM anon, authenticated;
REVOKE ALL, REFERENCES, TRIGGER ON TABLE public._migration_history FROM anon, authenticated;

-- Grant administrative access strictly to service_role (server-side only)
GRANT ALL ON TABLE public.posts TO service_role;
GRANT ALL ON TABLE public.comments TO service_role;
GRANT ALL ON TABLE public.post_likes TO service_role;
GRANT ALL ON TABLE public._migration_history TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._migration_history ENABLE ROW LEVEL SECURITY;

-- Posts RLS: Public visitors only read non-private posts
DROP POLICY IF EXISTS "Public can view non-private posts" ON public.posts;
CREATE POLICY "Public can view non-private posts"
  ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (is_private = false);

DROP POLICY IF EXISTS "Service role full access on posts" ON public.posts;
CREATE POLICY "Service role full access on posts"
  ON public.posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments RLS: Public visitors only read comments on non-private posts
DROP POLICY IF EXISTS "Public can view comments on non-private posts" ON public.comments;
CREATE POLICY "Public can view comments on non-private posts"
  ON public.comments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = public.comments.post_id
        AND public.posts.is_private = false
    )
  );

DROP POLICY IF EXISTS "Service role full access on comments" ON public.comments;
CREATE POLICY "Service role full access on comments"
  ON public.comments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Post Likes RLS: Fully restricted to service_role
DROP POLICY IF EXISTS "Service role full access on post_likes" ON public.post_likes;
CREATE POLICY "Service role full access on post_likes"
  ON public.post_likes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Migration history RLS: Fully restricted to service_role
DROP POLICY IF EXISTS "Service role full access on migration history" ON public._migration_history;
CREATE POLICY "Service role full access on migration history"
  ON public._migration_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. ATOMIC LIKE STORED PROCEDURE (RPC)
-- ============================================================================
-- Enforces:
-- 1. SECURITY DEFINER with fixed empty search_path (search_path = '')
-- 2. Fully schema-qualified references across all system and user objects
-- 3. Execution REVOKED from PUBLIC, anon, and authenticated
-- 4. Execution GRANTED SOLELY to service_role (invoked exclusively by trusted Next.js server)
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

-- Restrict RPC execution: Revoke from all public/client roles, grant solely to service_role
REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO service_role;

-- Log migration execution record
INSERT INTO public._migration_history (version, name, checksum, status)
VALUES ('20261114_001', 'create_blog_tables', 'sha256_hardened_rls_grants', 'applied')
ON CONFLICT (version) DO UPDATE SET status = 'reapplied', applied_at = pg_catalog.now();

