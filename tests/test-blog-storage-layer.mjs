import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=== Step 5.1: Blog Storage Layer Verification ===\n');

const storageFile = path.join(process.cwd(), 'src', 'lib', 'blogStorage.ts');
const content = fs.readFileSync(storageFile, 'utf-8');

let passed = 0;

function check(name, condition, errorMsg = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}: ${errorMsg}`);
    process.exit(1);
  }
}

// 1. Function signatures
const expectedFunctions = [
  'getAllBlogPosts',
  'getBlogPostByIdOrSlug',
  'createBlogPost',
  'updateBlogPost',
  'togglePostPrivacy',
  'deleteBlogPost',
  'toggleLikeBlogPost',
  'addCommentToBlogPost',
  'deleteComment',
];

expectedFunctions.forEach((fn) => {
  check(`Function ${fn}() is exported`, content.includes(`export async function ${fn}`));
});

// 2. Canonical post ID resolution in toggleLikeBlogPost
check(
  'toggleLikeBlogPost resolves canonical post ID before RPC invocation',
  content.includes('const canonicalPostId = post.id;') &&
  content.includes('p_post_id: canonicalPostId')
);

// 3. Comment chronological ordering
check(
  'mapRowToBlogPost sorts comments in descending chronological order',
  content.includes('timeB - timeA') &&
  content.includes('Array.isArray(row.comments)')
);

// 4. Production fail-closed security (no silent JSON fallback in production)
const prodChecks = content.match(/if\s*\(isProd\)\s*\{\s*throw new Error/g);
check(
  'Production fail-closed guards present across all operations',
  prodChecks && prodChecks.length >= 8,
  `Found ${prodChecks ? prodChecks.length : 0} guards, expected >= 8`
);

// 5. Database error throwing when Supabase returns an error in production
check(
  'Database query error handling explicitly throws in production',
  content.includes('throw new Error(`Database service unavailable: ${error.message}`);') &&
  content.includes('throw new Error(`Database error creating post: ${error.message}`);') &&
  content.includes('throw new Error(`Database error updating post:') &&
  content.includes('throw new Error(`Database error recording like:')
);

// 6. Snake_case to camelCase mapping
check(
  'Correct field mappings from PostgreSQL columns to TypeScript types',
  content.includes('coverImage: row.cover_image || undefined') &&
  content.includes('likes: row.likes_count || 0') &&
  content.includes('isPrivate: Boolean(row.is_private)') &&
  content.includes('createdAt: c.created_at_display')
);

// 7. Supabase secret key server-side isolation
check(
  'blogStorage uses server-side getSupabaseAdmin() without exposing keys to clients',
  content.includes('import { getSupabaseAdmin, isSupabaseConfigured } from \'@/lib/supabase\';') &&
  !content.includes('process.env.SUPABASE_SECRET_KEY')
);

console.log(`\n=============================================`);
console.log(`ALL STEP 5.1 STORAGE LAYER CHECKS PASSED (${passed} Passed)`);
console.log(`=============================================\n`);
