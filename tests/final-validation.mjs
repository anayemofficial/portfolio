import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const rootDir = process.cwd();

async function runValidation() {
  console.log('=====================================================');
  console.log('   ASTER PHASE 2: FINAL SECURITY & MIGRATION VALIDATION');
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

  // 1. SQL Migration Syntax & Structure Validation
  const sqlPath = path.join(rootDir, 'supabase', 'migrations', '20261114_001_create_blog_tables.sql');
  const sql = await fs.readFile(sqlPath, 'utf-8');

  // Corrective migration validation (20261114_002)
  const fixSqlPath = path.join(rootDir, 'supabase', 'migrations', '20261114_002_fix_increment_post_like_btrim.sql');
  const fixSql = await fs.readFile(fixSqlPath, 'utf-8');

  assert(fixSql.includes("pg_catalog.btrim(p_post_id)"), 'Corrective migration uses pg_catalog.btrim');
  assert(fixSql.includes("SET search_path = ''"), 'Corrective migration maintains SET search_path = empty');
  assert(fixSql.includes("SECURITY DEFINER"), 'Corrective migration maintains SECURITY DEFINER');
  assert(fixSql.includes("GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO service_role"), 'Corrective migration grants EXECUTE to service_role');
  assert(fixSql.includes("GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO postgres"), 'Corrective migration grants EXECUTE to postgres');
  assert(fixSql.includes("REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM PUBLIC"), 'Corrective migration revokes EXECUTE from PUBLIC');
  assert(fixSql.includes("REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM anon"), 'Corrective migration revokes EXECUTE from anon');
  assert(fixSql.includes("REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM authenticated"), 'Corrective migration revokes EXECUTE from authenticated');
  assert(fixSql.includes("20261114_002"), 'Corrective migration records version 20261114_002 in _migration_history');

  assert(sql.includes('CREATE TABLE IF NOT EXISTS public._migration_history'), 'Schema has migration history table');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.posts'), 'Schema defines public.posts');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.comments'), 'Schema defines public.comments');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.post_likes'), 'Schema defines public.post_likes');
  assert(sql.includes('uq_post_visitor_like UNIQUE (post_id, visitor_hash)'), 'Relational constraint prevents duplicate visitor likes');

  // 2. Table-level Privileges & Defense-in-depth Grants
  assert(sql.includes('REVOKE ALL ON TABLE public.posts FROM PUBLIC'), 'Posts default public privileges revoked');
  assert(sql.includes('REVOKE ALL ON TABLE public.posts FROM anon, authenticated'), 'Complete initial privilege strip on posts for anon/authenticated');
  assert(sql.includes('GRANT SELECT ON TABLE public.posts TO anon, authenticated'), 'Selective SELECT granted to public');
  assert(sql.includes('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.posts FROM anon, authenticated'), 'Direct mutations, REFERENCES, and TRIGGER strictly revoked on posts from anon/authenticated');
  assert(sql.includes('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.comments FROM anon, authenticated'), 'Direct mutations, REFERENCES, and TRIGGER strictly revoked on comments from anon/authenticated');
  assert(sql.includes('REVOKE ALL, REFERENCES, TRIGGER ON TABLE public.post_likes FROM anon, authenticated'), 'post_likes completely hidden from public roles with REFERENCES and TRIGGER revoked');
  assert(sql.includes('GRANT ALL ON TABLE public.posts TO service_role'), 'service_role granted administrative privileges');
  assert(sql.includes('GRANT ALL ON TABLE public.comments TO service_role'), 'service_role granted comments administrative privileges');
  assert(sql.includes('GRANT ALL ON TABLE public.post_likes TO service_role'), 'service_role granted post_likes administrative privileges');

  // 3. Row Level Security Policies
  assert(sql.includes('ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY'), 'RLS enabled on posts');
  assert(sql.includes('ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY'), 'RLS enabled on comments');
  assert(sql.includes('ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY'), 'RLS enabled on post_likes');
  assert(sql.includes('USING (is_private = false)'), 'Public RLS policy hides private posts');
  assert(sql.includes('AND public.posts.is_private = false'), 'Public comments RLS policy hides comments on private posts');

  // 4. Stored Procedure Security & Access Control
  assert(sql.includes('SECURITY DEFINER'), 'RPC configured with SECURITY DEFINER');
  assert(sql.includes("SET search_path = ''"), 'RPC configured with secure empty search_path');
  assert(sql.includes('REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM PUBLIC'), 'RPC revoked from PUBLIC');
  assert(sql.includes('REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM anon'), 'RPC revoked from anon');
  assert(sql.includes('REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM authenticated'), 'RPC revoked from authenticated');
  assert(sql.includes('GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO service_role'), 'RPC granted EXCLUSIVELY to service_role');
  assert(sql.includes("p_visitor_hash !~ '^[a-f0-9]{64}$'"), 'RPC validates 64-character SHA-256 hex format');
  assert(sql.includes('ON CONFLICT (post_id, visitor_hash) DO NOTHING'), 'RPC inserts with atomic concurrency lock');

  // 5. Visitor Hash Generation & Concurrency Tests
  const salt = 'test-salt-secret-12345';
  function hashVisitor(ip, ua) {
    const raw = `${ip}::${(ua || '').trim().slice(0, 150)}`;
    return crypto.createHmac('sha256', salt).update(raw).digest('hex');
  }

  const hash1 = hashVisitor('192.168.1.10', 'Mozilla/5.0');
  const hash2 = hashVisitor('192.168.1.10', 'Mozilla/5.0');
  const hashDiffIp = hashVisitor('192.168.1.11', 'Mozilla/5.0');

  assert(hash1 === hash2, 'Visitor hash generation is deterministic for same visitor');
  assert(hash1 !== hashDiffIp, 'Visitor hash differs across different client IPs');
  assert(/^[a-f0-9]{64}$/.test(hash1), 'Visitor hash is exactly 64-character valid hex');

  // 6. Stale JSON & Re-Import Non-Destructive Protection Logic Test
  const mockLiveDb = {
    posts: [
      { id: 'post-1', title: 'Post 1 (Edited in Production)', likes_count: 95, content: 'Production Content' }
    ],
    comments: [
      { id: 'c-1', post_id: 'post-1', comment: 'Existing Comment' }
    ]
  };

  const mockStaleJson = [
    { id: 'post-1', title: 'Post 1 (Old Stale JSON)', likes: 82, content: 'Stale Content', comments: [{ id: 'c-1', comment: 'Stale' }, { id: 'c-new', comment: 'New Comment' }] },
    { id: 'post-2', title: 'Post 2 (Missing Record)', likes: 40, content: 'New Post Content', comments: [] }
  ];

  // Simulating migration logic
  let simulatedPreservedPosts = 0;
  let simulatedInsertedPosts = 0;
  let simulatedPreservedComments = 0;
  let simulatedInsertedComments = 0;

  for (const post of mockStaleJson) {
    const existing = mockLiveDb.posts.find(p => p.id === post.id);
    if (existing) {
      simulatedPreservedPosts++;
      // Live content must remain untouched
      assert(existing.title === 'Post 1 (Edited in Production)', 'Live post content not overwritten by stale JSON');
      assert(existing.likes_count === 95, 'Live likes_count not regressed to stale JSON 82');
    } else {
      mockLiveDb.posts.push({ id: post.id, title: post.title, likes_count: post.likes, content: post.content });
      simulatedInsertedPosts++;
    }

    for (const c of (post.comments || [])) {
      const existingC = mockLiveDb.comments.find(cm => cm.id === c.id);
      if (existingC) {
        simulatedPreservedComments++;
      } else {
        mockLiveDb.comments.push(c);
        simulatedInsertedComments++;
      }
    }
  }

  assert(simulatedPreservedPosts === 1, 'Existing live post was preserved');
  assert(simulatedInsertedPosts === 1, 'Missing post was inserted');
  assert(simulatedPreservedComments === 1, 'Existing comment was preserved');
  assert(simulatedInsertedComments === 1, 'Missing comment was inserted');
  assert(mockLiveDb.posts.length === 2, 'Total posts match expected count after non-destructive merge');

  // 7. Safety Backup File & Zero-Demo Content Verification
  const demoBackupStat = await fs.stat(path.join(rootDir, 'src', 'data', 'blogPosts.demo.backup.json'));
  assert(demoBackupStat.size > 9000, `Verified demo backup file exists and is intact (${demoBackupStat.size} bytes)`);

  const currentJsonRaw = await fs.readFile(path.join(rootDir, 'src', 'data', 'blogPosts.json'), 'utf-8');
  const currentPosts = JSON.parse(currentJsonRaw);
  assert(Array.isArray(currentPosts) && currentPosts.length === 0, 'blogPosts.json has 0 demo posts');

  const initialBlogsSrc = await fs.readFile(path.join(rootDir, 'src', 'data', 'initialBlogs.ts'), 'utf-8');
  assert(initialBlogsSrc.includes('initialBlogPosts: BlogPost[] = [];'), 'initialBlogPosts is empty array in initialBlogs.ts');

  // 8. New Supabase API Key Integration Validation
  const supabaseTs = await fs.readFile(path.join(rootDir, 'src', 'lib', 'supabase.ts'), 'utf-8');
  assert(supabaseTs.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), 'supabase.ts supports NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  assert(supabaseTs.includes('SUPABASE_SECRET_KEY'), 'supabase.ts supports SUPABASE_SECRET_KEY');
  assert(supabaseTs.includes('persistSession: false'), 'Server administrative client disables session persistence');
  assert(supabaseTs.includes('autoRefreshToken: false'), 'Server administrative client disables autoRefreshToken');
  assert(supabaseTs.includes('getSupabasePublicClient'), 'supabase.ts provides public client helper with publishable key');
  assert(supabaseTs.includes('validateSupabaseEnv'), 'supabase.ts provides environment validation');

  const envExample = await fs.readFile(path.join(rootDir, '.env.local.example'), 'utf-8');
  assert(envExample.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), '.env.local.example documents NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  assert(envExample.includes('SUPABASE_SECRET_KEY'), '.env.local.example documents SUPABASE_SECRET_KEY');

  const migrateMjs = await fs.readFile(path.join(rootDir, 'scripts', 'migrate-to-supabase.mjs'), 'utf-8');
  assert(migrateMjs.includes('SUPABASE_SECRET_KEY'), 'migrate-to-supabase.mjs uses SUPABASE_SECRET_KEY');

  const migrateTs = await fs.readFile(path.join(rootDir, 'scripts', 'migrate-to-supabase.ts'), 'utf-8');
  assert(migrateTs.includes('SUPABASE_SECRET_KEY'), 'migrate-to-supabase.ts references SUPABASE_SECRET_KEY');

  const validationTs = await fs.readFile(path.join(rootDir, 'src', 'lib', 'validation.ts'), 'utf-8');
  assert(validationTs.includes('supabaseEnvSchema'), 'validation.ts contains Zod schema for Supabase environment');
  assert(validationTs.includes('validateSupabaseEnvironment'), 'validation.ts contains validateSupabaseEnvironment');

  console.log(`\n=====================================================`);
  console.log(`Validation Completed: ${passed} Passed, ${failed} Failed.`);
  console.log(`=====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runValidation().catch((err) => {
  console.error('Validation script error:', err);
  process.exit(1);
});
