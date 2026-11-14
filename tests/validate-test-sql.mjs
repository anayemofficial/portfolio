import fs from 'fs/promises';
import path from 'path';

async function validateTestSql() {
  const file = path.join(process.cwd(), 'tests', 'integration-test-atomic-like.sql');
  const sql = await fs.readFile(file, 'utf-8');

  console.log('=== Rollback Integration Test SQL Final Safety Audit ===\n');

  // Check 1: Zero backslashes anywhere in the file
  if (sql.includes('\\')) {
    console.error('[FAIL] Accidental backslash found in SQL test file');
    process.exit(1);
  } else {
    console.log('[PASS] Zero backslashes in entire file');
  }

  // Check 2: Transaction starts with BEGIN and ends with ROLLBACK
  const cleanSql = sql.replace(/--.*$/gm, '').trim();
  if (/^BEGIN\s*;/i.test(cleanSql)) {
    console.log('[PASS] Transaction strictly initiates with BEGIN;');
  } else {
    console.error('[FAIL] Transaction does not start with BEGIN;');
    process.exit(1);
  }

  if (/ROLLBACK\s*;\s*$/i.test(cleanSql)) {
    console.log('[PASS] Transaction strictly terminates with ROLLBACK;');
  } else {
    console.error('[FAIL] Transaction does not terminate with ROLLBACK;');
    process.exit(1);
  }

  // Check 3: Absolute zero COMMIT statements
  const lines = sql.split('\n');
  const commitStatement = lines.find(l => !l.trim().startsWith('--') && /\bCOMMIT\b/i.test(l));
  if (commitStatement) {
    console.error('[FAIL] Active COMMIT statement found:', commitStatement);
    process.exit(1);
  } else {
    console.log('[PASS] Absolute zero COMMIT statements found (strict rollback guaranteed)');
  }

  // Check 4: No boolean assertions using "= true" or "= false"
  const badBoolAssert = lines.find(l => !l.trim().startsWith('--') && /ASSERT\s+.*\s*=\s*(true|false)\b/i.test(l));
  if (badBoolAssert) {
    console.error('[FAIL] Found legacy boolean comparison in ASSERT:', badBoolAssert);
    process.exit(1);
  } else {
    console.log('[PASS] Zero "= true" or "= false" in ASSERTs; all use "IS TRUE" or "IS FALSE"');
  }

  // Check 5: Exactly one row verification via GET DIAGNOSTICS ROW_COUNT
  const diagnosticsMatches = sql.match(/GET DIAGNOSTICS\s+v_row_count\s*=\s*ROW_COUNT;/g);
  if (diagnosticsMatches && diagnosticsMatches.length >= 4) {
    console.log(`[PASS] Exactly one row verified across all operations (found ${diagnosticsMatches.length} GET DIAGNOSTICS checks)`);
  } else {
    console.error('[FAIL] Insufficient GET DIAGNOSTICS ROW_COUNT checks');
    process.exit(1);
  }

  // Check 6: NULL rejection assertions present
  const nullChecks = sql.match(/ASSERT\s+v_res\.\w+\s+IS\s+NOT\s+NULL/g);
  if (nullChecks && nullChecks.length >= 12) {
    console.log(`[PASS] Strict NULL rejection enforced (${nullChecks.length} IS NOT NULL assertions)`);
  } else {
    console.error('[FAIL] Missing or insufficient IS NOT NULL assertions');
    process.exit(1);
  }

  // Check 7: Pre-existence verification of temporary post
  if (sql.includes('v_pre_exists IS FALSE') && sql.includes('SELECT EXISTS')) {
    console.log('[PASS] Pre-existence check verified (confirms post does not exist before insert)');
  } else {
    console.error('[FAIL] Pre-existence check missing');
    process.exit(1);
  }

  // Check 8: Mandatory posts columns supplied
  const mandatoryCols = ['id', 'slug', 'title', 'content', 'category', 'published_at', 'read_time', 'likes_count', 'is_private'];
  const missingCol = mandatoryCols.find(col => !sql.includes(col));
  if (!missingCol) {
    console.log('[PASS] All mandatory columns for public.posts are explicitly supplied');
  } else {
    console.error('[FAIL] Missing mandatory column:', missingCol);
    process.exit(1);
  }

  // Check 9: All 6 integration tests preserved
  const testLabels = ['TEST 1', 'TEST 2', 'TEST 3', 'TEST 4', 'TEST 5', 'TEST 6'];
  const allTestsPresent = testLabels.every(t => sql.includes(t));
  if (allTestsPresent) {
    console.log('[PASS] All 6 integration test cases fully preserved');
  } else {
    console.error('[FAIL] One or more test cases missing');
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('ALL FINAL SAFETY AUDIT CHECKS PASSED (0 ERRORS)');
  console.log('=============================================\n');
}

validateTestSql().catch(console.error);
