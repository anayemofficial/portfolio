import { NextResponse } from 'next/server';
import { toggleLikeBlogPost, getBlogPostByIdOrSlug } from '@/lib/blogStorage';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyAdminRequest } from '@/lib/auth';
import { generateVisitorHash } from '@/lib/supabase';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const rawId = params?.id;

    if (!rawId || typeof rawId !== 'string' || rawId.trim().length === 0 || rawId.length > 100) {
      return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 });
    }

    const id = rawId.trim();

    // Rate limiting: 30 likes per minute per IP
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit('like', ip);
    if (!rateLimit.success) {
      if (rateLimit.serviceUnavailable) {
        return NextResponse.json(
          { success: false, error: 'Like service rate limiter is unavailable in production.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded for likes. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    // Verify post exists and check visibility
    const post = await getBlogPostByIdOrSlug(id);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    if (post.isPrivate) {
      const auth = await verifyAdminRequest(request);
      if (!auth.authorized) {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }
    }

    // Server-generated privacy-preserving visitor identifier
    const visitorHash = generateVisitorHash(ip, request.headers.get('user-agent'));
    const result = await toggleLikeBlogPost(id, visitorHash);
    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, likes: result.likes, alreadyLiked: result.alreadyLiked },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Like error:', err);
    return NextResponse.json({ success: false, error: 'Failed to record like' }, { status: 500 });
  }
}
