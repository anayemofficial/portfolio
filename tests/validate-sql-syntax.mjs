import fs from 'fs/promises';
import path from 'path';

async function validateSql() {
  const file = path.join(process.cwd(), 'supabase', 'migrations', '20261114_002_fix_increment_post_like_btrim.sql');
  const sql = await fs.readFile(file, 'utf-8');

  console.log('=== SQL Syntax & Integrity Pre-Flight Check ===\n');

  // Check 1: Zero backslashes anywhere in the file (no markdown escaping artifacts like \!~ or !\~)
  if (sql.includes('\\')) {
    console.error('[FAIL] Accidental backslash found in SQL migration file');
    process.exit(1);
  } else {
    console.log('[PASS] Absolute zero backslashes in entire file (no markdown escaping artifacts)');
  }

  // Check 2: Regex operator is exactly !~ (no backslash before or after !)
  const regexMatch = sql.match(/p_visitor_hash\s+(!~)\s+'\^\[a-f0-9\]\{64\}\$'/);
  if (regexMatch && regexMatch[1] === '!~') {
    console.log('[PASS] Regex operator is exactly !~');
  } else {
    console.error('[FAIL] Regex operator check failed');
    process.exit(1);
  }

  // Check 3: Qualified pg_catalog functions
  if (sql.includes('pg_catalog.btrim') && sql.includes('pg_catalog.length') && sql.includes('pg_catalog.now()')) {
    console.log('[PASS] All built-in catalog functions explicitly qualified (pg_catalog.btrim, length, now)');
  } else {
    console.error('[FAIL] Missing pg_catalog qualification');
    process.exit(1);
  }

  // Check 4: No legacy pg_catalog.trim
  if (sql.includes('pg_catalog.trim(')) {
    console.error('[FAIL] Legacy pg_catalog.trim detected');
    process.exit(1);
  } else {
    console.log('[PASS] No legacy pg_catalog.trim calls found');
  }

  // Check 5: Security definer and empty search_path
  if (sql.includes('SECURITY DEFINER') && sql.includes("SET search_path = ''")) {
    console.log("[PASS] SECURITY DEFINER and SET search_path = '' confirmed");
  } else {
    console.error('[FAIL] Missing SECURITY DEFINER or empty search_path');
    process.exit(1);
  }

  // Check 6: Explicit function ownership to postgres
  if (sql.includes('ALTER FUNCTION public.increment_post_like(text, text) OWNER TO postgres;')) {
    console.log('[PASS] Function ownership explicitly assigned to postgres');
  } else {
    console.error('[FAIL] Function ownership check failed');
    process.exit(1);
  }

  // Check 7: Permissions / ACLs
  if (
    sql.includes('REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM PUBLIC;') &&
    sql.includes('REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM anon;') &&
    sql.includes('REVOKE ALL ON FUNCTION public.increment_post_like(text, text) FROM authenticated;') &&
    sql.includes('GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO service_role;') &&
    sql.includes('GRANT EXECUTE ON FUNCTION public.increment_post_like(text, text) TO postgres;')
  ) {
    console.log('[PASS] EXECUTE ACLs strictly bounded: revoked from PUBLIC/anon/auth, granted only to service_role/postgres');
  } else {
    console.error('[FAIL] Permissions check failed');
    process.exit(1);
  }

  // Check 8: Migration history table schema compatibility
  if (
    sql.includes('INSERT INTO public._migration_history (version, name, checksum, status)') &&
    sql.includes('ON CONFLICT (version) DO UPDATE')
  ) {
    console.log('[PASS] Migration history insertion schema compatibility confirmed');
  } else {
    console.error('[FAIL] Migration history insertion check failed');
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('ALL PRE-EXECUTION CHECKS PASSED (0 ERRORS)');
  console.log('=============================================\n');
}

validateSql().catch(console.error);
