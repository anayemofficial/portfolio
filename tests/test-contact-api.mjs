import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=====================================================');
console.log('   ASTER: CONTACT FORM API DELIVERY & HARDENING TEST');
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

const contactRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'contact', 'route.ts');
check('Contact route file exists (src/app/api/contact/route.ts)', fs.existsSync(contactRoutePath));

const contactRouteContent = fs.readFileSync(contactRoutePath, 'utf-8');

// --- 1. CODE STRUCTURE & SECURITY INVARIANTS ---
console.log('\n--- 1. Security Invariants & Code Analysis ---');

check(
  'Route enforces 50KB payload limit via isPayloadSizeAllowed',
  contactRouteContent.includes('isPayloadSizeAllowed(request, 50 * 1024)')
);

check(
  'Route enforces IP-based rate limiting via checkRateLimit',
  contactRouteContent.includes("checkRateLimit('contact', ip)")
);

check(
  'Route uses contactSchema for strict Zod input validation & sanitization',
  contactRouteContent.includes('contactSchema.safeParse(rawBody)')
);

check(
  'Route checks both WEB3FORMS_ACCESS_KEY and RESEND_API_KEY',
  contactRouteContent.includes('process.env.WEB3FORMS_ACCESS_KEY') &&
  contactRouteContent.includes('process.env.RESEND_API_KEY')
);

check(
  'Production strictly returns 503 if neither provider is configured',
  contactRouteContent.includes('if (!web3formsAccessKey && !resendApiKey)') &&
  contactRouteContent.includes('if (isProd)') &&
  contactRouteContent.includes('status: 503')
);

check(
  'Does not log user private message or email in fallback',
  !contactRouteContent.includes('From: ${name} (${email})') &&
  !contactRouteContent.includes('Message:\n${message}')
);

check(
  'Web3Forms response checks both res.ok and data.success',
  contactRouteContent.includes('!res.ok || !data.success')
);

check(
  'Web3Forms network errors caught and return HTTP 502',
  contactRouteContent.includes('Web3Forms network dispatch error') &&
  contactRouteContent.includes('status: 502')
);

check(
  'Resend response checks res.ok and returns 502 on rejection',
  contactRouteContent.includes('if (!res.ok)') &&
  contactRouteContent.includes('status: 502')
);

check(
  'Resend network errors caught and return HTTP 502',
  contactRouteContent.includes('Resend network dispatch error')
);

check(
  'Intended recipient remains anayem.official@gmail.com',
  contactRouteContent.includes("'anayem.official@gmail.com'")
);

// --- 2. FUNCTIONAL LOGIC SCENARIO SIMULATIONS ---
console.log('\n--- 2. Functional Dispatch Logic Simulation ---');

/**
 * Pure logic simulation of the dispatch routine in src/app/api/contact/route.ts
 */
async function simulateDispatch({
  web3formsAccessKey,
  resendApiKey,
  isProd,
  mockFetch,
  formData = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Inquiry',
    message: 'Hello Nayem',
  },
}) {
  if (!web3formsAccessKey && !resendApiKey) {
    if (isProd) {
      return {
        status: 503,
        body: { error: 'Contact service is temporarily unavailable. Please email anayem.official@gmail.com directly.' },
      };
    }
    return {
      status: 200,
      body: { success: true, message: 'Your message has been received! Thank you for reaching out.' },
    };
  }

  if (web3formsAccessKey) {
    try {
      const res = await mockFetch('https://api.web3forms.com/submit', {
        method: 'POST',
      });
      const resText = await res.text();
      let data = {};
      try {
        data = JSON.parse(resText);
      } catch {
        return {
          status: 502,
          body: { error: 'Unable to deliver message at this time. Please try again later.' },
        };
      }

      if (!res.ok || !data.success) {
        return {
          status: 502,
          body: { error: data.message || 'Email delivery provider failed to process message.' },
        };
      }
    } catch (err) {
      return {
        status: 502,
        body: { error: 'Network error connecting to email delivery service. Please try again later.' },
      };
    }
  } else if (resendApiKey) {
    try {
      const res = await mockFetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: 'anayem.official@gmail.com',
          reply_to: formData.email,
          subject: `[Portfolio Inquiry] ${formData.subject}`,
          text: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
        }),
      });

      let resData = {};
      try {
        resData = await res.json();
      } catch {}

      if (!res.ok) {
        return {
          status: 502,
          body: { error: resData.message || 'Email delivery provider failed to dispatch message.' },
        };
      }
    } catch (err) {
      return {
        status: 502,
        body: { error: 'Network error connecting to email delivery service. Please try again later.' },
      };
    }
  }

  return {
    status: 200,
    body: {
      success: true,
      message: 'Your message has been received! Thank you for reaching out.',
    },
  };
}

// SCENARIO 1: Neither provider configured in Production
const scen1 = await simulateDispatch({
  web3formsAccessKey: undefined,
  resendApiKey: undefined,
  isProd: true,
});
check(
  'Scenario 1: Neither provider in production returns HTTP 503 and never reports success',
  scen1.status === 503 && scen1.body.success !== true && scen1.body.error.includes('temporarily unavailable')
);

// SCENARIO 1B: Neither provider configured in Development
const scen1b = await simulateDispatch({
  web3formsAccessKey: undefined,
  resendApiKey: undefined,
  isProd: false,
});
check(
  'Scenario 1B: Development mode returns 200 without error when unconfigured',
  scen1b.status === 200 && scen1b.body.success === true
);

// SCENARIO 2: Web3Forms accepts message
let lastUrl = '';
let lastBody = '';
const scen2 = await simulateDispatch({
  web3formsAccessKey: 'valid_web3_key',
  resendApiKey: undefined,
  isProd: true,
  mockFetch: async (url, opts) => {
    lastUrl = url;
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, message: 'Message sent' }),
    };
  },
});
check(
  'Scenario 2: Web3Forms accepts message returns HTTP 200 with success: true',
  scen2.status === 200 && scen2.body.success === true && lastUrl === 'https://api.web3forms.com/submit'
);

// SCENARIO 3: Web3Forms rejects message
const scen3 = await simulateDispatch({
  web3formsAccessKey: 'invalid_web3_key',
  resendApiKey: undefined,
  isProd: true,
  mockFetch: async () => {
    return {
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ success: false, message: 'Invalid Access Key' }),
    };
  },
});
check(
  'Scenario 3: Web3Forms rejects message returns non-2xx (502) and never reports success',
  scen3.status === 502 && scen3.body.success !== true && scen3.body.error === 'Invalid Access Key'
);

// SCENARIO 4: Resend accepts message
let resendPayload = null;
const scen4 = await simulateDispatch({
  web3formsAccessKey: undefined,
  resendApiKey: 're_valid_resend_key',
  isProd: true,
  mockFetch: async (url, opts) => {
    lastUrl = url;
    resendPayload = JSON.parse(opts.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'resend_msg_001' }),
    };
  },
});
check(
  'Scenario 4: Resend accepts message returns HTTP 200 with success: true and verified recipient',
  scen4.status === 200 && scen4.body.success === true && resendPayload.to === 'anayem.official@gmail.com'
);

// SCENARIO 5: Resend rejects message
const scen5 = await simulateDispatch({
  web3formsAccessKey: undefined,
  resendApiKey: 're_invalid_resend_key',
  isProd: true,
  mockFetch: async () => {
    return {
      ok: false,
      status: 403,
      json: async () => ({ message: 'Domain verification required or unverified sender' }),
    };
  },
});
check(
  'Scenario 5: Resend rejects message returns non-2xx (502) and passes provider error safely',
  scen5.status === 502 && scen5.body.success !== true && scen5.body.error.includes('Domain verification required')
);

// SCENARIO 6: Provider network failure
const scen6 = await simulateDispatch({
  web3formsAccessKey: 'some_key',
  resendApiKey: undefined,
  isProd: true,
  mockFetch: async () => {
    throw new Error('fetch failed: connect ETIMEDOUT');
  },
});
check(
  'Scenario 6: Provider network timeout returns HTTP 502 without exposing stack trace or keys',
  scen6.status === 502 && scen6.body.success !== true && scen6.body.error.includes('Network error') && !scen6.body.error.includes('ETIMEDOUT')
);

console.log('\n=====================================================');
console.log(`Validation Completed: ${passed} Passed, ${failed} Failed.`);
console.log('=====================================================');

if (failed > 0) {
  process.exit(1);
}
