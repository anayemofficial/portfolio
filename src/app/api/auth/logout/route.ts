import { NextResponse } from 'next/server';
import { clearSessionCookie, revokeSession, verifyAdminRequest } from '@/lib/auth';

export async function POST(request: Request) {
  // Check authorization and CSRF protection
  const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.reason || 'Unauthorized' },
      { status: auth.statusCode || 401 }
    );
  }

  // Extract session token from cookie to revoke it server-side
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|; )admin_session=([^;]*)/);
  if (match && match[1]) {
    await revokeSession(decodeURIComponent(match[1]));
  }

  const response = NextResponse.json(
    { success: true, message: 'Author session terminated and revoked.' },
    { status: 200 }
  );

  clearSessionCookie(response);
  return response;
}
