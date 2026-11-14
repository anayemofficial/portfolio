import { NextResponse } from 'next/server';
import { addCommentToBlogPost, getBlogPostByIdOrSlug, deleteComment } from '@/lib/blogStorage';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { commentSchema, isPayloadSizeAllowed } from '@/lib/validation';
import { verifyAdminRequest } from '@/lib/auth';

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

    // 1. Enforce payload size limit (max 50KB)
    if (!isPayloadSizeAllowed(request, 50 * 1024)) {
      return NextResponse.json(
        { success: false, error: 'Payload too large. Maximum comment size is 50KB.' },
        { status: 413 }
      );
    }

    // 2. Rate limiting: 5 comments per 5 minutes per IP
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit('comment', ip);
    if (!rateLimit.success) {
      if (rateLimit.serviceUnavailable) {
        return NextResponse.json(
          { success: false, error: 'Comment service rate limiter is unavailable in production.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Comment rate limit reached. Please wait until ${new Date(
            rateLimit.reset * 1000
          ).toLocaleTimeString()} before commenting again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    // 3. Verify post existence & privacy
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

    // 4. Validate and sanitize input with Zod
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const validation = commentSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(' ');
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { name, email, comment } = validation.data;

    const result = await addCommentToBlogPost(id, {
      name,
      email,
      comment,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, comment: result.comment, totalComments: result.totalComments },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Comment error:', err);
    return NextResponse.json({ success: false, error: 'Failed to post comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  _props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Only administrator can manage comments.' },
        { status: auth.statusCode || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId || typeof commentId !== 'string' || commentId.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing or invalid comment ID.' }, { status: 400 });
    }

    const result = await deleteComment(commentId.trim());
    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Comment not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Comment successfully deleted.' }, { status: 200 });
  } catch (err: unknown) {
    console.error('Delete comment error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete comment.' }, { status: 500 });
  }
}
