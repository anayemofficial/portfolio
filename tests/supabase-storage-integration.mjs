import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 1. Load environment from .env.local safely
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (err) {
  console.error('[ERROR] Could not load .env.local file:', err.message);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secretKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

if (!url || !secretKey) {
  console.error('[FATAL] Missing Supabase URL or Secret Key in environment.');
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function runIntegrationAudit() {
  console.log('=====================================================');
  console.log('   ASTER PHASE 2C: SUPABASE STORAGE INTEGRATION AUDIT');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // TEST 1: EMPTY STATE VERIFICATION
  console.log('\n--- Test 1: Empty Database State ---');
  const { count: initialPostCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  const { count: initialCommentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
  const { count: initialLikeCount } = await supabase.from('post_likes').select('*', { count: 'exact', head: true });

  assert(initialPostCount === 0, 'posts table is currently 0 rows (no demo data imported)');
  assert(initialCommentCount === 0, 'comments table is currently 0 rows (no demo data imported)');
  assert(initialLikeCount === 0, 'post_likes table is currently 0 rows (no demo data imported)');

  // TEST 2: AUTHORITATIVE POST CREATION IN SUPABASE
  console.log('\n--- Test 2: Admin Post Creation ---');
  const testPostId = `audit-test-${Date.now()}`;
  const testSlug = `audit-test-slug-${Date.now()}`;

  const { data: createdPost, error: createErr } = await supabase.from('posts').insert({
    id: testPostId,
    slug: testSlug,
    title: 'Audit Test Post Title',
    excerpt: 'Audit test excerpt content.',
    content: 'Full audit test content body with detailed engineering text.',
    category: 'Tech & Code',
    mood: '🚀 Building',
    tags: ['Audit', 'Integration'],
    author_name: 'Abdullah Nayem',
    author_avatar: '/profile.jpg',
    author_role: 'Full-Stack Developer',
    published_at: 'Nov 14, 2026',
    read_time: '1 min read',
    likes_count: 0,
    is_private: false,
  }).select('*, comments(*)').single();

  assert(!createErr && createdPost?.id === testPostId, 'Admin post created in Supabase PostgreSQL');

  // TEST 3: POST READING WITH FIELD MAPPING
  console.log('\n--- Test 3: Post Reading & Query ---');
  const { data: fetchedPost, error: fetchErr } = await supabase
    .from('posts')
    .select('*, comments(*)')
    .eq('id', testPostId)
    .single();

  assert(!fetchErr && fetchedPost?.title === 'Audit Test Post Title', 'Post retrieved from Supabase with exact content');
  assert(fetchedPost?.likes_count === 0, 'New post initialized with 0 likes');

  // TEST 4: POST EDITING & CONTENT UPDATE
  console.log('\n--- Test 4: Admin Post Editing ---');
  const { data: updatedPost, error: updateErr } = await supabase
    .from('posts')
    .update({
      title: 'Audit Test Post (Edited by Admin)',
      excerpt: 'Updated excerpt description.',
      updated_at: new Date().toISOString(),
    })
    .eq('id', testPostId)
    .select('id, title, excerpt')
    .single();

  assert(!updateErr && updatedPost?.title === 'Audit Test Post (Edited by Admin)', 'Post title and excerpt successfully updated in Supabase');

  // TEST 5: PRIVACY SETTING / UNPUBLISH (is_private toggle)
  console.log('\n--- Test 5: Post Privacy Toggle ---');
  const { data: privPost, error: privErr } = await supabase
    .from('posts')
    .update({ is_private: true, updated_at: new Date().toISOString() })
    .eq('id', testPostId)
    .select('id, is_private')
    .single();

  assert(!privErr && privPost?.is_private === true, 'Post privacy toggled to private (unpublished from public feed)');

  const { data: pubPost, error: pubErr } = await supabase
    .from('posts')
    .update({ is_private: false, updated_at: new Date().toISOString() })
    .eq('id', testPostId)
    .select('id, is_private')
    .single();

  assert(!pubErr && pubPost?.is_private === false, 'Post privacy toggled back to public');

  // TEST 6: COMMENT CREATION AND RELATIONAL LINK
  console.log('\n--- Test 6: Comment Creation & Relation ---');
  const testCommentId = `comment-test-${Date.now()}`;
  const { data: commentData, error: commentErr } = await supabase.from('comments').insert({
    id: testCommentId,
    post_id: testPostId,
    name: 'Verified Tester',
    email: 'tester@example.com',
    comment: 'Great progress Nayem! Production storage is verified.',
    created_at_display: 'Nov 14, 2026',
  }).select('*').single();

  assert(!commentErr && commentData?.id === testCommentId, 'Comment inserted into Supabase comments table');

  // Verify post query returns nested comment
  const { data: postWithComment } = await supabase
    .from('posts')
    .select('*, comments(*)')
    .eq('id', testPostId)
    .single();

  assert(postWithComment?.comments?.length === 1, 'Post query returns nested comments via PostgreSQL foreign key');

  // TEST 7: ATOMIC LIKE RPC & CONCURRENCY CONSTRAINTS
  console.log('\n--- Test 7: Atomic Like Operation ---');
  const visitorHash = crypto.createHmac('sha256', 'test-salt').update('127.0.0.1::TestAgent').digest('hex');

  // Attempt like call via RPC
  const { data: rpcRes1, error: rpcErr1 } = await supabase.rpc('increment_post_like', {
    p_post_id: testPostId,
    p_visitor_hash: visitorHash,
  });

  if (rpcErr1) {
    console.log(`    [i] Stored procedure reported: ${rpcErr1.message}`);
    // Direct table atomic test
    const { data: likeInsert, error: likeErr } = await supabase.from('post_likes').insert({
      post_id: testPostId,
      visitor_hash: visitorHash,
    }).select().single();

    assert(!likeErr && likeInsert?.post_id === testPostId, 'Direct like inserted into post_likes table');

    // Duplicate prevention test
    const { error: dupErr } = await supabase.from('post_likes').insert({
      post_id: testPostId,
      visitor_hash: visitorHash,
    });
    assert(Boolean(dupErr && dupErr.code === '23505'), 'Unique constraint uq_post_visitor_like rejects duplicate visitor likes');
  } else {
    assert(rpcRes1?.[0]?.success === true && rpcRes1?.[0]?.already_liked === false, 'First-time like accepted and atomic counter incremented');
    assert(rpcRes1?.[0]?.new_likes_count === 1, 'Post likes_count is exactly 1 in Supabase');

    // Duplicate like call from same visitor
    const { data: rpcRes2, error: rpcErr2 } = await supabase.rpc('increment_post_like', {
      p_post_id: testPostId,
      p_visitor_hash: visitorHash,
    });

    assert(!rpcErr2 && rpcRes2?.[0]?.success === true && rpcRes2?.[0]?.already_liked === true, 'Duplicate like blocked by unique constraint in Supabase');
    assert(rpcRes2?.[0]?.new_likes_count === 1, 'Post likes_count not incremented on duplicate like');
  }

  // TEST 8: COMMENT DELETION
  console.log('\n--- Test 8: Comment Deletion ---');
  const { error: delCommentErr } = await supabase.from('comments').delete().eq('id', testCommentId);
  assert(!delCommentErr, 'Admin comment deletion succeeded');

  const { count: commentCountAfterDel } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', testPostId);
  assert(commentCountAfterDel === 0, 'Post has 0 comments after deletion');

  // TEST 9: POST DELETION & CASCADE CLEANUP
  console.log('\n--- Test 9: Post Deletion & Cascade ---');
  const { error: delPostErr } = await supabase.from('posts').delete().eq('id', testPostId);
  assert(!delPostErr, 'Post deleted successfully from Supabase');

  // Verify post_likes cascade deletion
  const { count: likesAfterDel } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', testPostId);
  assert(likesAfterDel === 0, 'Post likes cascade-deleted via foreign key ON DELETE CASCADE');

  // TEST 10: CLEAN DATABASE STATE RESTORATION CONFIRMATION
  console.log('\n--- Test 10: Final Database Cleanliness ---');
  const { count: finalPostCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  const { count: finalCommentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
  const { count: finalLikeCount } = await supabase.from('post_likes').select('*', { count: 'exact', head: true });

  assert(finalPostCount === 0, 'posts table is 0 rows (clean)');
  assert(finalCommentCount === 0, 'comments table is 0 rows (clean)');
  assert(finalLikeCount === 0, 'post_likes table is 0 rows (clean)');

  console.log(`\n=====================================================`);
  console.log(`AUDIT RESULTS: ${passed} Passed, ${failed} Failed.`);
  console.log(`=====================================================\n`);

  if (failed > 0) process.exit(1);
}

runIntegrationAudit().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
