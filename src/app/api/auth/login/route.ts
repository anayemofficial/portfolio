import { NextResponse } from 'next/server';
import {
  isAuthConfigured,
  verifyAdminPasscode,
  createSessionToken,
  attachSessionCookie,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Apply strict rate limiting on login attempts
    const rateLimit = await checkRateLimit('login', ip);
    if (!rateLimit.success) {
      if (rateLimit.serviceUnavailable) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication rate limiter service is unavailable in production.',
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait until ${new Date(
            rateLimit.reset * 1000
          ).toLocaleTimeString()} before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    if (!isAuthConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin authentication is not configured on this server.',
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passcode is required.' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPasscode(passcode.trim());
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect admin passcode.' },
        { status: 401 }
      );
    }

    const tokenData = createSessionToken();
    const response = NextResponse.json(
      {
        success: true,
        authenticated: true,
        csrfToken: tokenData.csrfToken,
        message: 'Author session successfully established.',
      },
      { status: 200 }
    );

    attachSessionCookie(response, tokenData.token, tokenData.csrfToken);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
