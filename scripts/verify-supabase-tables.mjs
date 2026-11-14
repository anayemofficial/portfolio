import { createClient } from '@supabase/supabase-js';

// Load .env.local
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (err) {
  console.error('[ERROR] Could not load .env.local:', err.message);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secretKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

if (!url || !secretKey) {
  console.error('[ERROR] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

async function verifyEmptyTables() {
  console.log('=== ASTER: SUPABASE DATABASE STATE VERIFICATION ===\n');

  // 1. Check posts count
  const { count: postsCount, error: postsErr } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  if (postsErr) {
    console.error('[FAIL] Failed to query posts table:', postsErr.message);
    return false;
  }

  // 2. Check comments count
  const { count: commentsCount, error: commentsErr } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });

  if (commentsErr) {
    console.error('[FAIL] Failed to query comments table:', commentsErr.message);
    return false;
  }

  // 3. Check post_likes count
  const { count: likesCount, error: likesErr } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true });

  if (likesErr) {
    console.error('[FAIL] Failed to query post_likes table:', likesErr.message);
    return false;
  }

  // 4. Check migration history
  const { data: migrationHistory, error: migErr } = await supabase
    .from('_migration_history')
    .select('*');

  console.log('[1] Table Row Counts:');
  console.log(`    - posts:               ${postsCount} rows (Expected: 0)`);
  console.log(`    - comments:            ${commentsCount} rows (Expected: 0)`);
  console.log(`    - post_likes:          ${likesCount} rows (Expected: 0)`);

  const isEmpty = postsCount === 0 && commentsCount === 0 && likesCount === 0;
  console.log(`\n[2] Clean Database State:  ${isEmpty ? 'PASS (100% Clean / Zero Demo Records)' : 'FAIL'}`);

  if (migrationHistory && migrationHistory.length > 0) {
    console.log(`\n[3] Applied Migrations:    ${migrationHistory.map(m => `${m.version} (${m.name}: ${m.status})`).join(', ')}`);
  }

  return isEmpty;
}

verifyEmptyTables().then((ok) => {
  console.log('\n=====================================================');
  console.log(`VERIFICATION RESULT: ${ok ? 'PASS' : 'FAIL'}`);
  console.log('=====================================================\n');
  if (!ok) process.exit(1);
}).catch((err) => {
  console.error('[FATAL] Verification failed with exception:', err);
  process.exit(1);
});
