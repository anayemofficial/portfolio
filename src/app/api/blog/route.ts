import { NextResponse } from 'next/server';
import { getAllBlogPosts, createBlogPost, deleteBlogPost, togglePostPrivacy } from '@/lib/blogStorage';

const ADMIN_PASSCODE = process.env.BLOG_ADMIN_PASSCODE || 'nayem2026';

export async function GET() {
  try {
    const posts = await getAllBlogPosts();
    return NextResponse.json({ success: true, posts }, { status: 200 });
  } catch (err: unknown) {
    console.error('Failed to fetch blog posts:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, mood, tags, passcode, isPrivate, authorAvatar } = body;

    // Strict Author Protection: Only Abdullah Nayem can publish
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Abdullah Nayem can publish posts.' },
        { status: 401 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required fields.' },
        { status: 400 }
      );
    }

    const newPost = await createBlogPost({
      title,
      content,
      excerpt,
      coverImage,
      category,
      mood,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
      authorName: 'Abdullah Nayem',
      authorAvatar,
      isPrivate: Boolean(isPrivate),
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (err: unknown) {
    console.error('Failed to create blog post:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to publish post' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, passcode, action } = body;

    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Abdullah Nayem can change post settings.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing post ID' }, { status: 400 });
    }

    if (action === 'togglePrivacy') {
      const result = await togglePostPrivacy(id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, isPrivate: result.isPrivate }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Patch error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const passcode = searchParams.get('passcode');

    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Abdullah Nayem can delete posts.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing post ID' }, { status: 400 });
    }

    const result = await deleteBlogPost(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('Delete post error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 });
  }
}
