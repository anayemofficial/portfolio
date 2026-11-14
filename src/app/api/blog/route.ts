import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { getAllBlogPosts, createBlogPost, deleteBlogPost, togglePostPrivacy, updateBlogPost } from '@/lib/blogStorage';
import { postCreateSchema, postPatchSchema, postUpdateSchema, isPayloadSizeAllowed } from '@/lib/validation';
import { BlogCategory, BlogMood } from '@/data/initialBlogs';

export async function GET(request: Request) {
  try {
    const auth = await verifyAdminRequest(request);
    const allPosts = await getAllBlogPosts();

    // Strict Blog Privacy: Unauthorized visitors only receive public posts
    const visiblePosts = auth.authorized
      ? allPosts
      : allPosts.filter((post) => !post.isPrivate);

    return NextResponse.json(
      {
        success: true,
        posts: visiblePosts,
        isAdmin: auth.authorized,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Failed to fetch blog posts:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve blog posts.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Session / Token and Anti-CSRF Protection
    const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Only Abdullah Nayem can publish posts.' },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Enforce payload size limit (500KB max)
    if (!isPayloadSizeAllowed(request, 500 * 1024)) {
      return NextResponse.json(
        { success: false, error: 'Payload too large. Maximum post payload size is 500KB.' },
        { status: 413 }
      );
    }

    // 3. Strict schema validation & input sanitization
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const validation = postCreateSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(' ');
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const data = validation.data;

    const newPost = await createBlogPost({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      category: data.category,
      mood: data.mood as BlogMood | undefined,
      tags: data.tags,
      authorName: 'Abdullah Nayem',
      authorAvatar: data.authorAvatar,
      isPrivate: Boolean(data.isPrivate),
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (err: unknown) {
    console.error('Failed to create blog post:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to publish post due to an internal server error.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // 1. Verify Admin Session / Token and Anti-CSRF Protection
    const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Only Abdullah Nayem can change post settings.' },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Validate payload
    const rawBody = await request.json().catch(() => null);
    const validation = postPatchSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(' ');
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { id, action } = validation.data;

    if (action === 'togglePrivacy') {
      const result = await togglePostPrivacy(id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, isPrivate: result.isPrivate }, { status: 200 });
    }

    if (action === 'edit') {
      const result = await updateBlogPost(id, {
        title: validation.data.title,
        content: validation.data.content,
        excerpt: validation.data.excerpt,
        category: validation.data.category as BlogCategory | undefined,
        mood: validation.data.mood as BlogMood | undefined,
        tags: Array.isArray(validation.data.tags) ? validation.data.tags : undefined,
        coverImage: validation.data.coverImage,
        isPrivate: validation.data.isPrivate,
      });

      if (!result.success || !result.post) {
        return NextResponse.json({ success: false, error: 'Failed to update post.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, post: result.post }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Patch error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update post.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Only Abdullah Nayem can edit posts.' },
        { status: auth.statusCode || 401 }
      );
    }

    const rawBody = await request.json().catch(() => null);
    const validation = postUpdateSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(' ');
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { id, ...data } = validation.data;
    const result = await updateBlogPost(id, {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category as BlogCategory | undefined,
      mood: data.mood as BlogMood | undefined,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      coverImage: data.coverImage,
      isPrivate: data.isPrivate,
    });

    if (!result.success || !result.post) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: result.post }, { status: 200 });
  } catch (err: unknown) {
    console.error('Put error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update post.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Verify Admin Session / Token and Anti-CSRF Protection
    const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Only Abdullah Nayem can delete posts.' },
        { status: auth.statusCode || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing or invalid post ID.' }, { status: 400 });
    }

    const result = await deleteBlogPost(id.trim());
    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post successfully deleted.' }, { status: 200 });
  } catch (err: unknown) {
    console.error('Delete post error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete post.' }, { status: 500 });
  }
}
