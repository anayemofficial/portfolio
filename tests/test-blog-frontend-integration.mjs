import fs from 'fs';
import path from 'path';

console.log('=====================================================');
console.log('   ASTER PHASE 2: STEP 5.3 FRONTEND INTEGRATION AUDIT');
console.log('=====================================================\n');

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

const blogCompPath = path.join(process.cwd(), 'src', 'components', 'Blog.tsx');
const readerModalPath = path.join(process.cwd(), 'src', 'components', 'BlogReaderModal.tsx');
const createModalPath = path.join(process.cwd(), 'src', 'components', 'CreatePostModal.tsx');
const blogPagePath = path.join(process.cwd(), 'src', 'app', 'blog', 'page.tsx');

const blogComp = fs.readFileSync(blogCompPath, 'utf-8');
const readerModal = fs.readFileSync(readerModalPath, 'utf-8');
const createModal = fs.readFileSync(createModalPath, 'utf-8');
const blogPage = fs.readFileSync(blogPagePath, 'utf-8');

// 1. BLOG FEED API INTEGRATION
console.log('--- 1. Blog Feed API Integration ---');
check(
  'Blog component fetches posts via GET /api/blog',
  blogComp.includes("fetch('/api/blog')")
);
check(
  'Blog component parses JSON posts and sets state',
  blogComp.includes('res.ok && data.success && Array.isArray(data.posts)') &&
  blogComp.includes('setPosts(data.posts)')
);

// 2. NO HARDCODED DEMO POSTS
console.log('\n--- 2. No Hardcoded Demo Content ---');
check(
  'Posts state is initialized with empty array (no demo seeds)',
  blogComp.includes('const [posts, setPosts] = useState<BlogPost[]>([]);')
);
check(
  'initialBlogs.ts defines empty initialBlogPosts array',
  fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'initialBlogs.ts'), 'utf-8').includes('export const initialBlogPosts: BlogPost[] = [];')
);
check(
  'blogPosts.json is empty array ([])',
  fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'blogPosts.json'), 'utf-8').trim() === '[]'
);

// 3. NO JSON PERSISTENCE IN PRODUCTION
console.log('\n--- 3. Removal of JSON & Stale LocalStorage Caching ---');
check(
  'localStorage nayem_blog_posts_cache write operations completely removed',
  !blogComp.includes("localStorage.setItem('nayem_blog_posts_cache'")
);
check(
  'localStorage nayem_blog_posts_cache read operations completely removed',
  !blogComp.includes("localStorage.getItem('nayem_blog_posts_cache'")
);
check(
  'Legacy cached demo posts proactively purged on component mount',
  blogComp.includes("localStorage.removeItem('nayem_blog_posts_cache')")
);

// 4. EMPTY STATE RENDERING
console.log('\n--- 4. Empty State Support ---');
check(
  'Empty state card renders when posts.length === 0',
  blogComp.includes('No Blog Posts Yet') &&
  blogComp.includes('PenLine') &&
  blogComp.includes('Welcome to the blog! Fresh updates')
);
check(
  'Author sees "Create Your First Post" CTA button in empty state',
  blogComp.includes('Create Your First Post') &&
  blogComp.includes('setIsCreateModalOpen(true)')
);

// 5. LOADING AND ERROR STATES
console.log('\n--- 5. Loading and Error Feedback States ---');
check(
  'Loading state displays animated skeleton cards',
  blogComp.includes('isLoading ? (') &&
  blogComp.includes('animate-pulse')
);
check(
  'Error state provides user feedback and retry button',
  blogComp.includes('fetchError ? (') &&
  blogComp.includes('Retry Connection') &&
  blogComp.includes('onClick={fetchPosts}')
);

// 6. ADMIN MUTATION API USAGE
console.log('\n--- 6. Admin Mutations & CSRF Protection ---');
check(
  'Post creation dispatches POST /api/blog with CSRF token',
  createModal.includes("fetch('/api/blog'") &&
  createModal.includes("'x-csrf-token': csrfToken || ''")
);
check(
  'Post deletion dispatches DELETE /api/blog with CSRF token',
  blogComp.includes("fetch(`/api/blog?id=${encodeURIComponent(postId)}`") &&
  blogComp.includes("'x-csrf-token': csrfToken")
);
check(
  'Privacy toggle dispatches PATCH /api/blog with action: togglePrivacy and CSRF token',
  blogComp.includes("fetch('/api/blog'") &&
  blogComp.includes("action: 'togglePrivacy'") &&
  blogComp.includes("'x-csrf-token': csrfToken")
);

// 7. COMMENT API INTEGRATION
console.log('\n--- 7. Comments Experience ---');
check(
  'Reader modal submits comments via POST /api/blog/${post.id}/comment',
  readerModal.includes("fetch(`/api/blog/${post.id}/comment`")
);
check(
  'Comment submission validates name, email, comment body before submitting',
  readerModal.includes('Please enter your name.') &&
  readerModal.includes('Please provide a valid email address.') &&
  readerModal.includes('Please enter your comment.')
);
check(
  'Administrator can delete comments via DELETE /api/blog/${post.id}/comment with CSRF token',
  readerModal.includes("fetch(\n        `/api/blog/${post.id}/comment?commentId=${encodeURIComponent(commentId)}`") ||
  readerModal.includes("`/api/blog/${post.id}/comment?commentId=${encodeURIComponent(commentId)}`")
);

// 8. LIKE API INTEGRATION & REVERSION
console.log('\n--- 8. Atomic Likes & Optimistic Reversion ---');
check(
  'Quick like dispatches POST /api/blog/${post.id}/like and handles server count',
  blogComp.includes("fetch(`/api/blog/${post.id}/like`") &&
  blogComp.includes('handleLikeUpdated(post.id, data.likes)')
);
check(
  'Quick like reverts on network failure or duplicate like',
  blogComp.includes('handleLikeUpdated(post.id, previousLikes)')
);
check(
  'Reader modal like dispatches POST /api/blog/${post.id}/like and syncs confirmed likes',
  readerModal.includes("fetch(`/api/blog/${post.id}/like`") &&
  readerModal.includes('setLikes(data.likes)')
);
check(
  'Reader modal like reverts state on network error',
  readerModal.includes('setLikes(previousLikes)')
);

// 9. PRIVATE POST VISIBILITY
console.log('\n--- 9. Private Post Visibility Control ---');
check(
  'Unauthenticated visitors cannot see private posts in filteredPosts',
  blogComp.includes('if (post.isPrivate && !isAuthor) {\n      return false;\n    }')
);
check(
  'Author mode verifies session at /api/auth/me',
  blogComp.includes("fetch('/api/auth/me')") &&
  blogComp.includes('setIsAuthor(Boolean(data.authenticated))')
);

// 10. SECRET KEY ISOLATION
console.log('\n--- 10. Security & Secret Key Boundary ---');
function scanForSecrets(text, filename) {
  if (text.includes('SUPABASE_SECRET_KEY') || text.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.error(`[LEAK] Secret key referenced in ${filename}!`);
    return true;
  }
  return false;
}

const keyLeaked = scanForSecrets(blogComp, 'Blog.tsx') ||
                  scanForSecrets(readerModal, 'BlogReaderModal.tsx') ||
                  scanForSecrets(createModal, 'CreatePostModal.tsx') ||
                  scanForSecrets(blogPage, 'page.tsx');

check('No SUPABASE_SECRET_KEY in any frontend component or page', !keyLeaked);

console.log('\n=====================================================');
console.log(`STEP 5.3 AUDIT RESULTS: ${passed} Passed, ${failed} Failed.`);
console.log('=====================================================\n');

if (failed > 0) process.exit(1);
