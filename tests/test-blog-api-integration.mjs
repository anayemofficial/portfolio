import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=====================================================');
console.log('   ASTER PHASE 2: STEP 5.2 API INTEGRATION AUDIT');
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

// 1. ROUTE EXISTENCE & STRUCTURE
console.log('--- 1. Route Existence & File Structure ---');
const blogRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'blog', 'route.ts');
const commentRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'blog', '[id]', 'comment', 'route.ts');
const likeRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'blog', '[id]', 'like', 'route.ts');
const authLoginPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'login', 'route.ts');
const authMePath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'me', 'route.ts');
const authLogoutPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'logout', 'route.ts');

check('Main blog API route exists (src/app/api/blog/route.ts)', fs.existsSync(blogRoutePath));
check('Comment API route exists (src/app/api/blog/[id]/comment/route.ts)', fs.existsSync(commentRoutePath));
check('Like API route exists (src/app/api/blog/[id]/like/route.ts)', fs.existsSync(likeRoutePath));
check('Auth login API route exists (src/app/api/auth/login/route.ts)', fs.existsSync(authLoginPath));
check('Auth me API route exists (src/app/api/auth/me/route.ts)', fs.existsSync(authMePath));
check('Auth logout API route exists (src/app/api/auth/logout/route.ts)', fs.existsSync(authLogoutPath));

const blogRouteContent = fs.readFileSync(blogRoutePath, 'utf-8');
const commentRouteContent = fs.readFileSync(commentRoutePath, 'utf-8');
const likeRouteContent = fs.readFileSync(likeRoutePath, 'utf-8');

// 2. HTTP METHOD HANDLING
console.log('\n--- 2. HTTP Method Handling ---');
check('src/app/api/blog/route.ts exports GET handler', /export\s+async\s+function\s+GET/.test(blogRouteContent));
check('src/app/api/blog/route.ts exports POST handler', /export\s+async\s+function\s+POST/.test(blogRouteContent));
check('src/app/api/blog/route.ts exports PATCH handler', /export\s+async\s+function\s+PATCH/.test(blogRouteContent));
check('src/app/api/blog/route.ts exports PUT handler', /export\s+async\s+function\s+PUT/.test(blogRouteContent));
check('src/app/api/blog/route.ts exports DELETE handler', /export\s+async\s+function\s+DELETE/.test(blogRouteContent));

check('src/app/api/blog/[id]/comment/route.ts exports POST handler', /export\s+async\s+function\s+POST/.test(commentRouteContent));
check('src/app/api/blog/[id]/comment/route.ts exports DELETE handler', /export\s+async\s+function\s+DELETE/.test(commentRouteContent));

check('src/app/api/blog/[id]/like/route.ts exports POST handler', /export\s+async\s+function\s+POST/.test(likeRouteContent));

// 3. STORAGE LAYER INTEGRATION & NO DIRECT JSON ACCESS
console.log('\n--- 3. Storage Layer Integration ---');
check(
  'Main blog route delegates all reads to getAllBlogPosts in blogStorage',
  blogRouteContent.includes('getAllBlogPosts()') &&
  blogRouteContent.includes("from '@/lib/blogStorage'")
);
check(
  'Main blog route delegates writes to createBlogPost, updateBlogPost, deleteBlogPost, togglePostPrivacy',
  blogRouteContent.includes('createBlogPost') &&
  blogRouteContent.includes('updateBlogPost') &&
  blogRouteContent.includes('deleteBlogPost') &&
  blogRouteContent.includes('togglePostPrivacy')
);
check(
  'Comment route delegates to addCommentToBlogPost and deleteComment in blogStorage',
  commentRouteContent.includes('addCommentToBlogPost') &&
  commentRouteContent.includes('deleteComment') &&
  commentRouteContent.includes("from '@/lib/blogStorage'")
);
check(
  'Like route delegates to toggleLikeBlogPost in blogStorage',
  likeRouteContent.includes('toggleLikeBlogPost') &&
  likeRouteContent.includes("from '@/lib/blogStorage'")
);
check(
  'No direct JSON imports or fs access in API routes',
  !blogRouteContent.includes('blogPosts.json') &&
  !blogRouteContent.includes("from 'fs'") &&
  !commentRouteContent.includes('blogPosts.json') &&
  !likeRouteContent.includes('blogPosts.json')
);

// 4. AUTHENTICATION & CSRF CHECKS
console.log('\n--- 4. Authentication, Authorization & Anti-CSRF Protection ---');
check(
  'POST /api/blog verifies admin session and enforces CSRF protection',
  blogRouteContent.includes("verifyAdminRequest(request, { requireCsrfForMutations: true })")
);
check(
  'PATCH /api/blog verifies admin session and enforces CSRF protection',
  blogRouteContent.includes("verifyAdminRequest(request, { requireCsrfForMutations: true })")
);
check(
  'PUT /api/blog verifies admin session and enforces CSRF protection',
  blogRouteContent.includes("verifyAdminRequest(request, { requireCsrfForMutations: true })")
);
check(
  'DELETE /api/blog verifies admin session and enforces CSRF protection',
  blogRouteContent.includes("verifyAdminRequest(request, { requireCsrfForMutations: true })")
);
check(
  'DELETE /api/blog/[id]/comment verifies admin session and enforces CSRF protection',
  commentRouteContent.includes("verifyAdminRequest(request, { requireCsrfForMutations: true })")
);

// 5. INPUT VALIDATION & PAYLOAD SIZE CAPS
console.log('\n--- 5. Input Validation & Defense-in-Depth ---');
check(
  'POST /api/blog enforces 500KB payload limit',
  blogRouteContent.includes('isPayloadSizeAllowed(request, 500 * 1024)')
);
check(
  'POST /api/blog validates input with Zod postCreateSchema',
  blogRouteContent.includes('postCreateSchema.safeParse')
);
check(
  'PATCH /api/blog validates input with Zod postPatchSchema',
  blogRouteContent.includes('postPatchSchema.safeParse')
);
check(
  'PUT /api/blog validates input with Zod postUpdateSchema',
  blogRouteContent.includes('postUpdateSchema.safeParse')
);
check(
  'POST /api/blog/[id]/comment enforces 50KB payload limit',
  commentRouteContent.includes('isPayloadSizeAllowed(request, 50 * 1024)')
);
check(
  'POST /api/blog/[id]/comment validates input with Zod commentSchema',
  commentRouteContent.includes('commentSchema.safeParse')
);

// 6. PRIVATE POST PROTECTION
console.log('\n--- 6. Strict Private Post Protection ---');
check(
  'GET /api/blog filters out private posts for unauthenticated visitors',
  blogRouteContent.includes('allPosts.filter((post) => !post.isPrivate)') &&
  blogRouteContent.includes('const auth = await verifyAdminRequest(request);')
);
check(
  'POST /api/blog/[id]/comment returns 404 for private posts if caller is not admin',
  commentRouteContent.includes('if (post.isPrivate)') &&
  commentRouteContent.includes('if (!auth.authorized)') &&
  commentRouteContent.includes("{ success: false, error: 'Post not found' }, { status: 404 }")
);
check(
  'POST /api/blog/[id]/like returns 404 for private posts if caller is not admin',
  likeRouteContent.includes('if (post.isPrivate)') &&
  likeRouteContent.includes('if (!auth.authorized)') &&
  likeRouteContent.includes("{ success: false, error: 'Post not found' }, { status: 404 }")
);

// 7. RATE LIMITING PROTECTION
console.log('\n--- 7. Rate Limiting on Public Endpoints ---');
check(
  'Comment creation enforces rate limiting per IP',
  commentRouteContent.includes("checkRateLimit('comment', ip)") &&
  commentRouteContent.includes('status: 429')
);
check(
  'Like endpoint enforces rate limiting per IP',
  likeRouteContent.includes("checkRateLimit('like', ip)") &&
  likeRouteContent.includes("checkRateLimit('like', ip)") &&
  likeRouteContent.includes('status: 429')
);

// 8. VISITOR HASH VALIDATION FOR LIKES
console.log('\n--- 8. Visitor Hash & Duplicate Like Protection ---');
check(
  'Like endpoint generates HMAC-SHA256 visitor hash on server',
  likeRouteContent.includes('generateVisitorHash(ip, request.headers.get(\'user-agent\'))') &&
  likeRouteContent.includes('toggleLikeBlogPost(id, visitorHash)')
);

// 9. SECRET KEY ISOLATION
console.log('\n--- 9. Secret Key Isolation & Client Boundary ---');
function scanDirForSecretKey(dir) {
  let exposed = false;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        if (scanDirForSecretKey(full)) exposed = true;
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      // Exclude server-only lib files: supabase.ts and validation.ts
      if (!full.includes('src\\lib\\supabase.ts') && !full.includes('src\\lib\\validation.ts') && !full.includes('src/lib/supabase.ts') && !full.includes('src/lib/validation.ts')) {
        const text = fs.readFileSync(full, 'utf-8');
        if (text.includes('SUPABASE_SECRET_KEY') || text.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          console.error(`[LEAK DETECTED] ${full} contains secret key reference!`);
          exposed = true;
        }
      }
    }
  }
  return exposed;
}

const keyLeakedInAppOrComponents = scanDirForSecretKey(path.join(process.cwd(), 'src', 'components')) ||
                                  scanDirForSecretKey(path.join(process.cwd(), 'src', 'app'));

check('SUPABASE_SECRET_KEY is never referenced in src/components or src/app', !keyLeakedInAppOrComponents);

// 10. FAIL-CLOSED BEHAVIOR IN PRODUCTION
console.log('\n--- 10. Absence of JSON Fallback in Production ---');
const storageContent = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'blogStorage.ts'), 'utf-8');
const failClosedMatches = storageContent.match(/if\s*\(isProd\)\s*\{\s*throw new Error/g);
check(
  'Production fail-closed guard is implemented across all storage functions',
  failClosedMatches && failClosedMatches.length >= 8
);

console.log('\n=====================================================');
console.log(`STEP 5.2 AUDIT RESULTS: ${passed} Passed, ${failed} Failed.`);
console.log('=====================================================\n');

if (failed > 0) process.exit(1);
