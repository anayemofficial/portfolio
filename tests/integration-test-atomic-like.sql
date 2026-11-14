-- ============================================================================
-- ASTER PHASE 2, STEP 4: ATOMIC LIKE SAFE ROLLBACK INTEGRATION TEST
-- ============================================================================
-- SAFETY & INTEGRITY GUARANTEES:
--   1. Transaction strictly initiated with BEGIN.
--   2. Transaction strictly terminated with ROLLBACK (zero COMMIT statements).
--   3. Pre-flight check confirms test post does not already exist.
--   4. All mandatory columns in public.posts are fully supplied.
--   5. Function returns exactly one row per invocation (GET DIAGNOSTICS ROW_COUNT = 1).
--   6. Boolean assertions strictly use IS TRUE / IS FALSE (rejecting NULLs).
--   7. Unexpected NULL returns explicitly cause assertion failures.
--   8. Zero changes persist to production; database state fully restored on ROLLBACK.
-- ============================================================================

BEGIN;

-- Step 1: Automated Verification DO Block with Pre-checks, Test Execution, and Assertions
DO $$
DECLARE
  v_res record;
  v_row_count integer := 0;
  v_post_count integer := 0;
  v_likes_table_count integer := 0;
  v_pre_exists boolean := false;
  c_test_post_id constant text := 'test_post_phase2_step4';
  c_test_slug constant text := 'test-post-phase2-step4-slug';
  c_valid_hash constant text := 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
  c_invalid_hash constant text := 'invalid_short_hash_not_64_characters';
  c_nonexistent_post_id constant text := 'nonexistent_post_id_99999';
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Starting Atomic increment_post_like Integration Test...';
  RAISE NOTICE '=======================================================';

  -- PRE-CHECK: Verify temporary post does not already exist
  SELECT EXISTS(
    SELECT 1 FROM public.posts WHERE id = c_test_post_id OR slug = c_test_slug
  ) INTO v_pre_exists;
  ASSERT v_pre_exists IS FALSE, 'PRE-CHECK FAILED: Temporary test post already exists in public.posts';
  RAISE NOTICE '[PASS] Pre-check: Confirmed test post does not exist prior to test.';

  -- STEP 1: Insert Temporary Test Post with all mandatory columns supplied
  INSERT INTO public.posts (
    id,
    slug,
    title,
    excerpt,
    content,
    cover_image,
    category,
    mood,
    tags,
    author_name,
    author_avatar,
    author_role,
    published_at,
    read_time,
    likes_count,
    is_private
  )
  VALUES (
    c_test_post_id,
    c_test_slug,
    'Atomic Like Integration Test Post',
    'Temporary test post for atomic like verification',
    'Test post content for public.increment_post_like integration test.',
    NULL,
    'Testing',
    NULL,
    '{}'::text[],
    'Abdullah Nayem',
    '/profile.jpg',
    'Full-Stack Developer',
    '2026-11-14',
    '1 min',
    0,
    false
  );
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  ASSERT v_row_count = 1, 'STEP 1 FAILED: Expected exactly 1 test post inserted';
  RAISE NOTICE '[PASS] Step 1: Temporary test post successfully inserted into transaction state.';

  -- TEST 1: Valid First Like
  SELECT * INTO v_res FROM public.increment_post_like(c_test_post_id, c_valid_hash);
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  ASSERT v_row_count = 1, 'TEST 1 FAILED: increment_post_like did not return exactly 1 row';
  ASSERT v_res.success IS NOT NULL, 'TEST 1 FAILED: success returned NULL';
  ASSERT v_res.already_liked IS NOT NULL, 'TEST 1 FAILED: already_liked returned NULL';
  ASSERT v_res.new_likes_count IS NOT NULL, 'TEST 1 FAILED: new_likes_count returned NULL';
  ASSERT v_res.success IS TRUE, 'TEST 1 FAILED: Expected success IS TRUE';
  ASSERT v_res.already_liked IS FALSE, 'TEST 1 FAILED: Expected already_liked IS FALSE';
  ASSERT v_res.new_likes_count = 1, 'TEST 1 FAILED: Expected new_likes_count = 1';
  RAISE NOTICE '[PASS] TEST 1 (First Like): success=%, already_liked=%, new_likes_count=%',
    v_res.success, v_res.already_liked, v_res.new_likes_count;

  -- TEST 2: Duplicate Like (Same post_id, Same visitor_hash)
  SELECT * INTO v_res FROM public.increment_post_like(c_test_post_id, c_valid_hash);
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  ASSERT v_row_count = 1, 'TEST 2 FAILED: increment_post_like did not return exactly 1 row';
  ASSERT v_res.success IS NOT NULL, 'TEST 2 FAILED: success returned NULL';
  ASSERT v_res.already_liked IS NOT NULL, 'TEST 2 FAILED: already_liked returned NULL';
  ASSERT v_res.new_likes_count IS NOT NULL, 'TEST 2 FAILED: new_likes_count returned NULL';
  ASSERT v_res.success IS TRUE, 'TEST 2 FAILED: Expected success IS TRUE';
  ASSERT v_res.already_liked IS TRUE, 'TEST 2 FAILED: Expected already_liked IS TRUE';
  ASSERT v_res.new_likes_count = 1, 'TEST 2 FAILED: Expected new_likes_count = 1 (counter must not increment again)';
  RAISE NOTICE '[PASS] TEST 2 (Duplicate Like): success=%, already_liked=%, new_likes_count=%',
    v_res.success, v_res.already_liked, v_res.new_likes_count;

  -- TEST 3: Verify Counter in public.posts Table
  SELECT likes_count INTO v_post_count FROM public.posts WHERE id = c_test_post_id;
  ASSERT v_post_count IS NOT NULL, 'TEST 3 FAILED: posts.likes_count is NULL';
  ASSERT v_post_count = 1, 'TEST 3 FAILED: posts.likes_count is not exactly 1';
  RAISE NOTICE '[PASS] TEST 3 (Post likes_count state): posts.likes_count = %', v_post_count;

  -- TEST 4: Verify Row Count in public.post_likes Table
  SELECT count(*)::integer INTO v_likes_table_count FROM public.post_likes WHERE post_id = c_test_post_id;
  ASSERT v_likes_table_count IS NOT NULL, 'TEST 4 FAILED: post_likes row count returned NULL';
  ASSERT v_likes_table_count = 1, 'TEST 4 FAILED: post_likes row count is not exactly 1';
  RAISE NOTICE '[PASS] TEST 4 (post_likes table state): exactly % row recorded', v_likes_table_count;

  -- TEST 5: Invalid Visitor Hash Rejection (non-hex, wrong length)
  SELECT * INTO v_res FROM public.increment_post_like(c_test_post_id, c_invalid_hash);
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  ASSERT v_row_count = 1, 'TEST 5 FAILED: increment_post_like did not return exactly 1 row';
  ASSERT v_res.success IS NOT NULL, 'TEST 5 FAILED: success returned NULL';
  ASSERT v_res.already_liked IS NOT NULL, 'TEST 5 FAILED: already_liked returned NULL';
  ASSERT v_res.new_likes_count IS NOT NULL, 'TEST 5 FAILED: new_likes_count returned NULL';
  ASSERT v_res.success IS FALSE, 'TEST 5 FAILED: Expected success IS FALSE for invalid hash';
  ASSERT v_res.already_liked IS FALSE, 'TEST 5 FAILED: Expected already_liked IS FALSE for invalid hash';
  ASSERT v_res.new_likes_count = 0, 'TEST 5 FAILED: Expected new_likes_count = 0 for invalid hash';
  RAISE NOTICE '[PASS] TEST 5 (Invalid Hash Rejection): success=%, already_liked=%, new_likes_count=%',
    v_res.success, v_res.already_liked, v_res.new_likes_count;

  -- TEST 6: Nonexistent Post Rejection
  SELECT * INTO v_res FROM public.increment_post_like(c_nonexistent_post_id, c_valid_hash);
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  ASSERT v_row_count = 1, 'TEST 6 FAILED: increment_post_like did not return exactly 1 row';
  ASSERT v_res.success IS NOT NULL, 'TEST 6 FAILED: success returned NULL';
  ASSERT v_res.already_liked IS NOT NULL, 'TEST 6 FAILED: already_liked returned NULL';
  ASSERT v_res.new_likes_count IS NOT NULL, 'TEST 6 FAILED: new_likes_count returned NULL';
  ASSERT v_res.success IS FALSE, 'TEST 6 FAILED: Expected success IS FALSE for nonexistent post';
  ASSERT v_res.already_liked IS FALSE, 'TEST 6 FAILED: Expected already_liked IS FALSE for nonexistent post';
  ASSERT v_res.new_likes_count = 0, 'TEST 6 FAILED: Expected new_likes_count = 0 for nonexistent post';
  RAISE NOTICE '[PASS] TEST 6 (Nonexistent Post Rejection): success=%, already_liked=%, new_likes_count=%',
    v_res.success, v_res.already_liked, v_res.new_likes_count;

  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'ALL 6 INTEGRATION ASSERTIONS PASSED SUCCESSFULLY.';
  RAISE NOTICE 'Executing ROLLBACK to discard all test modifications...';
  RAISE NOTICE '=======================================================';
END;
$$;

-- Step 2: Rollback Transaction to guarantee zero persistent database changes
ROLLBACK;
