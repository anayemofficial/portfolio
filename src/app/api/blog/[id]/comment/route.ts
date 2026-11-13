import { NextResponse } from 'next/server';
import { addCommentToBlogPost } from '@/lib/blogStorage';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing post ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, comment } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email is required' }, { status: 400 });
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json({ success: false, error: 'Comment message cannot be empty' }, { status: 400 });
    }

    const result = await addCommentToBlogPost(id, {
      name: name.trim(),
      email: email.trim(),
      comment: comment.trim(),
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
