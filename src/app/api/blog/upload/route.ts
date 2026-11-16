import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { verifyAdminRequest } from '@/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB max upload limit
const BUCKET_NAME = 'blog-images';

/**
 * Validates file magic bytes to verify actual image content against MIME type
 */
function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  const mime = mimeType.toLowerCase();

  if (mime === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mime === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  if (mime === 'image/gif') {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }

  if (mime === 'image/webp') {
    const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF';
    const isWebp = buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    return isRiff && isWebp;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Session / Token and Anti-CSRF Protection
    const auth = await verifyAdminRequest(request, { requireCsrfForMutations: true });
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            auth.reason ||
            'Unauthorized: Only Abdullah Al Nayem can upload blog media.',
        },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Enforce Rate Limiting
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit('upload', ip);
    if (!rateLimit.success && !rateLimit.serviceUnavailable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many uploads. Please wait a few minutes before trying again.',
        },
        { status: 429 }
      );
    }

    // 3. Parse and Validate Form Data
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data payload.' },
        { status: 400 }
      );
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No image file provided in form data.' },
        { status: 400 }
      );
    }

    // 4. Validate File Size
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 5MB maximum limit (received ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file is empty.' },
        { status: 400 }
      );
    }

    // 5. Validate MIME Type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file format (${mimeType || 'unknown'}). Please upload JPEG, PNG, WebP, or GIF.`,
        },
        { status: 415 }
      );
    }

    // 6. Inspect Magic Bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!validateImageMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File content does not match the declared image header.',
        },
        { status: 400 }
      );
    }

    // 7. Derive Safe Unique Filename
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const safeExt = extMap[mimeType] || 'jpg';
    const uniqueFileName = `post_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${safeExt}`;

    // 8. Upload to Supabase Storage if configured
    const isProd = process.env.NODE_ENV === 'production';
    const supabase = getSupabaseAdmin();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uniqueFileName, buffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const storagePath = `${BUCKET_NAME}/${uniqueFileName}`;

          // Create temporary signed URL for author preview (15 minutes expiry)
          const { data: signedData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(uniqueFileName, 15 * 60);

          return NextResponse.json(
            {
              success: true,
              storagePath,
              url: signedData?.signedUrl || storagePath,
              filename: uniqueFileName,
              size: buffer.length,
              storage: 'supabase',
            },
            { status: 201 }
          );
        }

        console.error(
          '[SUPABASE STORAGE ERROR] Failed to upload image to bucket:',
          uploadError?.message
        );

        if (isProd) {
          return NextResponse.json(
            {
              success: false,
              error: `Storage upload failed: ${uploadError?.message || 'Unknown storage error.'}`,
            },
            { status: 502 }
          );
        }
      } catch (storageException: unknown) {
        console.error(
          '[SUPABASE STORAGE EXCEPTION]:',
          storageException instanceof Error ? storageException.message : storageException
        );
        if (isProd) {
          return NextResponse.json(
            { success: false, error: 'Storage service connection error.' },
            { status: 502 }
          );
        }
      }
    }

    // 9. Local Development Fallback
    if (isProd) {
      return NextResponse.json(
        { success: false, error: 'Production cloud storage is not configured.' },
        { status: 503 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, uniqueFileName), buffer);

    const storagePath = `blog-images/${uniqueFileName}`;
    return NextResponse.json(
      {
        success: true,
        storagePath,
        url: `/uploads/blog/${uniqueFileName}`,
        filename: uniqueFileName,
        size: buffer.length,
        storage: 'local',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Unhandled upload error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during image upload.' },
      { status: 500 }
    );
  }
}
