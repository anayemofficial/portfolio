import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { contactSchema, isPayloadSizeAllowed } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // 1. Enforce payload size limit (max 50KB)
    if (!isPayloadSizeAllowed(request, 50 * 1024)) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum allowed size is 50KB.' },
        { status: 413 }
      );
    }

    // 2. Enforce IP-based rate limiting (5 inquiries per 10 minutes)
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit('contact', ip);
    if (!rateLimit.success) {
      if (rateLimit.serviceUnavailable) {
        return NextResponse.json(
          { error: 'Contact service rate limiter is unavailable in production.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          error: `Too many contact requests from your IP. Please try again later after ${new Date(
            rateLimit.reset * 1000
          ).toLocaleTimeString()}.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    // 3. Parse and strictly validate input with Zod
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const validation = contactSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(' ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, subject, message } = validation.data;

    // 4. Secure server-side dispatch to external email gateways
    const web3formsAccessKey = process.env.WEB3FORMS_ACCESS_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (web3formsAccessKey && web3formsAccessKey.trim() !== '') {
      const formData = new FormData();
      formData.append('access_key', web3formsAccessKey.trim());
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', `[Portfolio Inquiry] ${subject}`);
      formData.append('message', message);
      formData.append('from_name', name);

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const resText = await res.text();
      let data: { success?: boolean; message?: string } = {};
      try {
        data = JSON.parse(resText);
      } catch {
        console.error('Web3Forms returned non-JSON text response.');
        throw new Error('Web3Forms API returned invalid response format.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Web3Forms submission failed.');
      }
    } else if (resendApiKey && resendApiKey.trim() !== '') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: 'anayem.official@gmail.com',
          reply_to: email,
          subject: `[Portfolio Inquiry] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message || 'Failed to dispatch via Resend API.');
      }
    } else {
      // Local development fallback
      console.log('--- NEW CONTACT FORM SUBMISSION (Server Console) ---');
      console.log(`From: ${name} (${email})`);
      console.log(`Subject: ${subject}`);
      console.log(`Message:\n${message}`);
      console.log('----------------------------------------------------');
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received! Thank you for reaching out.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Contact API Error:', errorMsg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your message. Please try again later.' },
      { status: 500 }
    );
  }
}
