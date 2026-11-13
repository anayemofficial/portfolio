import { NextResponse } from 'next/server';
import { toggleLikeBlogPost } from '@/lib/blogStorage';

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

    const result = await toggleLikeBlogPost(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, likes: result.likes }, { status: 200 });
  } catch (err: unknown) {
    console.error('Like error:', err);
    return NextResponse.json({ success: false, error: 'Failed to record like' }, { status: 500 });
  }
}
