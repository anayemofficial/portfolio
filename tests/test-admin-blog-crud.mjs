import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

console.log('=====================================================');
console.log('   ASTER PHASE 2: STEP 5.4 ADMIN BLOG CRUD AUDIT');
console.log('=====================================================\n');

// 1. Load environment from .env.local
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

let passed = 0;
let failed = 0;

function check(testName, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failed++;
  }
}

async function runAdminCrudAudit() {
  const testId = `test-crud-${Date.now()}`;
  const testSlug = `test-crud-slug-${Date.now()}`;
  const testCommentId = `test-comment-${Date.now()}`;
  const visitorHash = crypto.createHmac('sha256', 'crud-test-salt').update('127.0.0.1::AdminCRUDTest').digest('hex');

  // Pre-flight check: ensure clean starting state
  console.log('--- 1. Pre-Flight Clean Database State Check ---');
  const { count: prePostCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  const { count: preCommentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
  const { count: preLikeCount } = await supabase.from('post_likes').select('*', { count: 'exact', head: true });

  check('posts table starts at 0 rows', prePostCount === 0);
  check('comments table starts at 0 rows', preCommentCount === 0);
  check('post_likes table starts at 0 rows', preLikeCount === 0);

  try {
    // 2. CREATE POST
    console.log('\n--- 2. Post Creation (CREATE) ---');
    const { data: createdPost, error: createErr } = await supabase
      .from('posts')
      .insert({
        id: testId,
        slug: testSlug,
        title: 'Initial Admin Post Title',
        excerpt: 'Initial excerpt description for CRUD test.',
        content: 'Initial body text content for admin CRUD verification.',
        cover_image: null,
        category: 'Tech & Code',
        mood: '🚀 Building',
        tags: ['Admin', 'Test'],
        author_name: 'Abdullah Nayem',
        author_avatar: '/profile.jpg',
        author_role: 'Full-Stack Developer',
        published_at: 'Nov 14, 2026',
        read_time: '1 min read',
        likes_count: 0,
        is_private: false,
      })
      .select('*, comments(*)')
      .single();

    check('Admin post successfully created in Supabase PostgreSQL', !createErr && createdPost?.id === testId);
    check('Initial likes_count is 0', createdPost?.likes_count === 0);
    check('Initial is_private is false', createdPost?.is_private === false);

    // Duplicate slug constraint test
    const { error: dupSlugErr } = await supabase.from('posts').insert({
      id: `${testId}-dup`,
      slug: testSlug, // Same unique slug
      title: 'Duplicate Slug Post',
      content: 'Duplicate content',
      category: 'Tech & Code',
      published_at: 'Nov 14, 2026',
      read_time: '1 min read',
    });
    check('Unique constraint rejects duplicate slug', Boolean(dupSlugErr && dupSlugErr.code === '23505'));

    // 3. READ POST (Public vs Private)
    console.log('\n--- 3. Post Reading & Privacy Boundary (READ) ---');
    const { data: fetchedPost, error: fetchErr } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .eq('id', testId)
      .single();

    check('Post retrieved with complete field values', !fetchErr && fetchedPost?.title === 'Initial Admin Post Title');
    check('Comments array initialized empty', Array.isArray(fetchedPost?.comments) && fetchedPost.comments.length === 0);

    // 4. UPDATE POST (All editable fields)
    console.log('\n--- 4. Post Modification (UPDATE) ---');
    const updatedTitle = 'Updated Post Title (Modified by Admin)';
    const updatedExcerpt = 'Updated excerpt text reflecting new modifications.';
    const updatedContent = 'Updated full article content body with engineering details.';
    const updatedCategory = 'Project Updates';
    const updatedMood = '💡 Idea';
    const updatedTags = ['Updated', 'Production', 'Verified'];
    const updatedCover = 'https://images.unsplash.com/photo-test-cover.jpg';

    const { data: updatedPost, error: updateErr } = await supabase
      .from('posts')
      .update({
        title: updatedTitle,
        excerpt: updatedExcerpt,
        content: updatedContent,
        category: updatedCategory,
        mood: updatedMood,
        tags: updatedTags,
        cover_image: updatedCover,
        updated_at: new Date().toISOString(),
      })
      .eq('id', testId)
      .select('*')
      .single();

    check('Post fields successfully updated in PostgreSQL', !updateErr && updatedPost?.title === updatedTitle);
    check('Updated content persisted', updatedPost?.content === updatedContent);
    check('Updated excerpt persisted', updatedPost?.excerpt === updatedExcerpt);
    check('Updated category persisted', updatedPost?.category === updatedCategory);
    check('Updated mood persisted', updatedPost?.mood === updatedMood);
    check('Updated tags array persisted', updatedPost?.tags?.length === 3);
    check('Updated cover image persisted', updatedPost?.cover_image === updatedCover);

    // 5. PUBLISH / PRIVACY TOGGLE
    console.log('\n--- 5. Privacy State Transitions (PUBLISH / UNPUBLISH) ---');
    // Toggle to Private
    const { data: privPost, error: privErr } = await supabase
      .from('posts')
      .update({ is_private: true, updated_at: new Date().toISOString() })
      .eq('id', testId)
      .select('id, is_private')
      .single();

    check('Post privacy successfully toggled to private (unpublished)', !privErr && privPost?.is_private === true);

    // Toggle back to Public
    const { data: pubPost, error: pubErr } = await supabase
      .from('posts')
      .update({ is_private: false, updated_at: new Date().toISOString() })
      .eq('id', testId)
      .select('id, is_private')
      .single();

    check('Post privacy successfully toggled back to public (published)', !pubErr && pubPost?.is_private === false);

    // 6. RELATED RECORDS & CASCADE CHECK
    console.log('\n--- 6. Relational Linking & Atomic Like Handling ---');
    // A. Add Comment
    const { data: commentData, error: commentErr } = await supabase
      .from('comments')
      .insert({
        id: testCommentId,
        post_id: testId,
        name: 'CRUD Tester',
        email: 'tester@example.com',
        comment: 'Relational integrity test comment.',
        created_at_display: 'Nov 14, 2026',
      })
      .select('*')
      .single();

    check('Comment linked to post via foreign key', !commentErr && commentData?.post_id === testId);

    // B. Atomic Like RPC
    const { data: rpcData1, error: rpcErr1 } = await supabase.rpc('increment_post_like', {
      p_post_id: testId,
      p_visitor_hash: visitorHash,
    });

    check('Atomic increment_post_like accepted first like', !rpcErr1 && rpcData1?.[0]?.success === true && rpcData1?.[0]?.already_liked === false);
    check('Post likes_count is 1 in database', rpcData1?.[0]?.new_likes_count === 1);

    // C. Duplicate Like Rejection
    const { data: rpcData2, error: rpcErr2 } = await supabase.rpc('increment_post_like', {
      p_post_id: testId,
      p_visitor_hash: visitorHash,
    });

    check('Duplicate like rejected by unique constraint', !rpcErr2 && rpcData2?.[0]?.success === true && rpcData2?.[0]?.already_liked === true);
    check('likes_count remains 1 (no regression or duplicate bump)', rpcData2?.[0]?.new_likes_count === 1);

    // 7. POST DELETION & FOREIGN KEY CASCADE
    console.log('\n--- 7. Post Deletion & Cascade Verification (DELETE) ---');
    const { error: delErr } = await supabase.from('posts').delete().eq('id', testId);
    check('Post row successfully deleted from posts table', !delErr);

    // Verify Cascade on comments table
    const { count: commentsAfterDel } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', testId);

    check('Child comments cascade-deleted via ON DELETE CASCADE', commentsAfterDel === 0);

    // Verify Cascade on post_likes table
    const { count: likesAfterDel } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', testId);

    check('Child post_likes cascade-deleted via ON DELETE CASCADE', likesAfterDel === 0);

  } finally {
    // 8. GUARANTEED CLEANUP
    console.log('\n--- 8. Guaranteed Cleanup & Teardown ---');
    await supabase.from('comments').delete().eq('post_id', testId);
    await supabase.from('post_likes').delete().eq('post_id', testId);
    await supabase.from('posts').delete().eq('id', testId);

    const { count: finalPostCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: finalCommentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    const { count: finalLikeCount } = await supabase.from('post_likes').select('*', { count: 'exact', head: true });

    check('Clean database state confirmed: 0 posts remain', finalPostCount === 0);
    check('Clean database state confirmed: 0 comments remain', finalCommentCount === 0);
    check('Clean database state confirmed: 0 likes remain', finalLikeCount === 0);
  }

  console.log('\n=====================================================');
  console.log(`STEP 5.4 AUDIT RESULTS: ${passed} Passed, ${failed} Failed.`);
  console.log('=====================================================\n');

  if (failed > 0) process.exit(1);
}

runAdminCrudAudit().catch((err) => {
  console.error('[FATAL ERROR IN CRUD AUDIT]:', err);
  process.exit(1);
});
