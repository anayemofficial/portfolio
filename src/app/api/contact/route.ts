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
    const web3formsAccessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const isProd = process.env.NODE_ENV === 'production';

    // In production, strictly reject submission if no email provider is configured
    if (!web3formsAccessKey && !resendApiKey) {
      if (isProd) {
        console.error('[CONTACT SERVICE ERROR] No email service provider (WEB3FORMS_ACCESS_KEY or RESEND_API_KEY) configured in production.');
        return NextResponse.json(
          { error: 'Contact service is temporarily unavailable. Please email anayem.official@gmail.com directly.' },
          { status: 503 }
        );
      }

      // Local development fallback: do not log private message or email contents
      console.log('[DEV] Contact form submitted in development mode (no email provider configured).');
      return NextResponse.json({
        success: true,
        message: 'Your message has been received! Thank you for reaching out.',
      });
    }

    if (web3formsAccessKey) {
      try {
        const formData = new FormData();
        formData.append('access_key', web3formsAccessKey);
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
          return NextResponse.json(
            { error: 'Unable to deliver message at this time. Please try again later.' },
            { status: 502 }
          );
        }

        if (!res.ok || !data.success) {
          console.error('Web3Forms submission failed:', data.message || `HTTP ${res.status}`);
          return NextResponse.json(
            { error: data.message || 'Email delivery provider failed to process message.' },
            { status: 502 }
          );
        }
      } catch (netErr: unknown) {
        console.error('Web3Forms network dispatch error:', netErr instanceof Error ? netErr.message : 'Network error');
        return NextResponse.json(
          { error: 'Network error connecting to email delivery service. Please try again later.' },
          { status: 502 }
        );
      }
    } else if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
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

        let resData: { message?: string } = {};
        try {
          resData = await res.json();
        } catch {
          // Non-JSON response
        }

        if (!res.ok) {
          console.error('Resend dispatch failed with status:', res.status, resData.message || '');
          return NextResponse.json(
            { error: resData.message || 'Email delivery provider failed to dispatch message.' },
            { status: 502 }
          );
        }
      } catch (netErr: unknown) {
        console.error('Resend network dispatch error:', netErr instanceof Error ? netErr.message : 'Network error');
        return NextResponse.json(
          { error: 'Network error connecting to email delivery service. Please try again later.' },
          { status: 502 }
        );
      }
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
