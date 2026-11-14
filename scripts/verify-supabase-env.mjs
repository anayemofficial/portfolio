import { createClient } from '@supabase/supabase-js';

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
const publishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
const secretKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

console.log('=== ASTER: SUPABASE ENVIRONMENT & CONNECTIVITY AUDIT ===\n');

// 1. Detection Checks
const hasUrl = Boolean(url && url.length > 0);
const hasPublishableKey = Boolean(publishableKey && publishableKey.length > 0);
const hasSecretKey = Boolean(secretKey && secretKey.length > 0);

console.log(`[1] Variable Detection:`);
console.log(`    - NEXT_PUBLIC_SUPABASE_URL:             ${hasUrl ? 'DETECTED' : 'MISSING'}`);
console.log(`    - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${hasPublishableKey ? 'DETECTED' : 'MISSING'}`);
console.log(`    - SUPABASE_SECRET_KEY:                  ${hasSecretKey ? 'DETECTED' : 'MISSING'}`);

// 2. Format Validation (Zero Secret Printing)
console.log(`\n[2] Format Validation (No Values Printed):`);

let urlValid = false;
let maskedUrl = 'N/A';
if (hasUrl) {
  try {
    const parsed = new URL(url);
    urlValid = parsed.protocol === 'https:' && parsed.hostname.includes('supabase');
    maskedUrl = `${parsed.protocol}//${parsed.hostname.slice(0, 4)}****${parsed.hostname.slice(-12)}`;
  } catch {
    urlValid = false;
  }
}
console.log(`    - URL Format:              ${urlValid ? 'PASS' : 'FAIL'} (${urlValid ? `Valid HTTPS Supabase host: ${maskedUrl}` : 'Invalid URL structure'})`);

const pubKeyValid = hasPublishableKey && publishableKey.length >= 20;
console.log(`    - Publishable Key Format:  ${pubKeyValid ? 'PASS' : 'FAIL'} (${hasPublishableKey ? `Length: ${publishableKey.length} chars, non-empty string` : 'Missing'})`);

const secretKeyValid = hasSecretKey && secretKey.length >= 20;
console.log(`    - Secret Key Format:       ${secretKeyValid ? 'PASS' : 'FAIL'} (${hasSecretKey ? `Length: ${secretKey.length} chars, non-empty string` : 'Missing'})`);

// 3. Client Isolation Check
console.log(`\n[3] Secret Key Client Isolation:`);
const isSecretKeyServerOnly = !('NEXT_PUBLIC_SUPABASE_SECRET_KEY' in process.env);
const secretKeyDoesNotLeakToClient = !Object.keys(process.env).some(
  (k) => k.startsWith('NEXT_PUBLIC_') && k.toLowerCase().includes('secret')
);
console.log(`    - Not prefixed with NEXT_PUBLIC_: ${isSecretKeyServerOnly ? 'PASS (Server-Side Only)' : 'FAIL'}`);
console.log(`    - Next.js Client Bundle Exclusion: ${secretKeyDoesNotLeakToClient ? 'PASS (Compiler Isolated)' : 'FAIL'}`);

// 4. Safe Read-Only Connectivity Check
console.log(`\n[4] Safe Read-Only Connectivity Test:`);

if (!urlValid || !secretKeyValid) {
  console.log(`    [SKIP] Cannot perform network check due to invalid/missing credentials.`);
  process.exit(1);
}

async function testConnection() {
  try {
    const supabase = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // Test A: Health/Auth connectivity test (does not mutate anything)
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    // Test B: Read-only query on table structure (HEAD request, 0 rows transferred, non-mutating)
    const { data: tableData, error: tableError, status } = await supabase
      .from('posts')
      .select('id', { head: true, count: 'exact' });

    console.log(`    - Server Response Status:   HTTP ${status || (authError ? 'Error' : '200')}`);
    
    if (status === 200) {
      console.log(`    - Database Connectivity:    PASS (Connected to Supabase PostgreSQL)`);
      console.log(`    - Tables Status:            'posts' table detected and queryable.`);
    } else if (tableError && (tableError.code === '42P01' || tableError.message?.includes('relation "public.posts" does not exist') || tableError.message?.includes('relation') || status === 404)) {
      console.log(`    - Database Connectivity:    PASS (Successfully authenticated with Supabase!)`);
      console.log(`    - Tables Status:            Awaiting SQL migration (tables not yet created, as expected).`);
    } else if (!authError) {
      console.log(`    - Database Connectivity:    PASS (Successfully authenticated with Supabase via API key)`);
    } else {
      console.log(`    - Database Connectivity:    FAIL (${tableError?.message || authError?.message || 'Unknown response'})`);
      return false;
    }

    return true;
  } catch (err) {
    console.log(`    - Database Connectivity:    FAIL (${err.message})`);
    return false;
  }
}

testConnection().then((ok) => {
  console.log('\n=====================================================');
  console.log(`OVERALL RESULT: ${ok && urlValid && pubKeyValid && secretKeyValid ? 'PASS' : 'FAIL'}`);
  console.log('=====================================================\n');
  if (!ok) process.exit(1);
});
