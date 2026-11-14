import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request, { requireCsrfForMutations: false });
  return NextResponse.json(
    {
      authenticated: auth.authorized,
      csrfToken: auth.csrfToken || null,
    },
    { status: 200 }
  );
}
