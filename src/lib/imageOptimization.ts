/**
 * Client-side Image Optimization Utility for ASTER Blog
 *
 * Resizes oversized images, compresses JPEG/WebP/PNG, preserves aspect ratio,
 * and generates optimized Blob/File objects and fast preview URLs.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0 (default 0.85)
  maxInputBytes?: number; // Maximum allowed raw input file size (default 20MB)
}

export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  wasCompressed: boolean;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validates whether the given file is an allowed image format.
 */
export function isAllowedImageFormat(file: File): boolean {
  if (!file || typeof file.type !== 'string') return false;
  const mime = file.type.toLowerCase();
  return ALLOWED_MIME_TYPES.includes(mime);
}

/**
 * Optimizes an image client-side before sending to the upload API.
 * - Scales down images exceeding maxWidth / maxHeight while strictly preserving aspect ratio.
 * - Compresses JPEG and WebP to the specified quality (default: 0.85).
 * - Converts large non-transparent PNGs to modern WebP for significant bandwidth reduction.
 * - Preserves animated GIFs as-is.
 */
export async function optimizeImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    maxInputBytes = 20 * 1024 * 1024, // 20MB raw file cap
  } = options;

  if (!file) {
    throw new Error('No file provided for optimization.');
  }

  if (!isAllowedImageFormat(file)) {
    throw new Error(
      'Unsupported image format. Please select a JPEG, PNG, WebP, or GIF image.'
    );
  }

  if (file.size > maxInputBytes) {
    throw new Error(
      `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 20MB.`
    );
  }

  // Preserve animated GIFs as-is to avoid losing frames during canvas rendering
  if (file.type.toLowerCase() === 'image/gif') {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      optimizedSize: file.size,
      width: 0,
      height: 0,
      wasCompressed: false,
    };
  }

  // Ensure DOM / Canvas is available (browser environment)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      file,
      previewUrl: '',
      originalSize: file.size,
      optimizedSize: file.size,
      width: 0,
      height: 0,
      wasCompressed: false,
    };
  }

  return new Promise<OptimizedImageResult>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          throw new Error('Could not read image dimensions.');
        }

        // Calculate aspect-ratio-preserving dimensions
        const needsResize = width > maxWidth || height > maxHeight;
        if (needsResize) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        // If image is already smaller than limits, small in byte size, and doesn't need conversion
        const isSmall = file.size < 300 * 1024; // under 300KB
        if (!needsResize && isSmall && file.type === 'image/webp') {
          return resolve({
            file,
            previewUrl: URL.createObjectURL(file),
            originalSize: file.size,
            optimizedSize: file.size,
            width,
            height,
            wasCompressed: false,
          });
        }

        // Create Offscreen Canvas for high-fidelity rendering
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          throw new Error('Unable to create canvas 2D rendering context.');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine optimal export mime type
        // Use WebP for WebP and for large PNGs; use JPEG for JPEG
        let targetMime = file.type.toLowerCase();
        let extension = 'jpg';

        if (targetMime === 'image/webp') {
          targetMime = 'image/webp';
          extension = 'webp';
        } else if (targetMime === 'image/png') {
          // If PNG is large (> 400KB), convert to WebP for massive compression with alpha support
          if (file.size > 400 * 1024) {
            targetMime = 'image/webp';
            extension = 'webp';
          } else {
            targetMime = 'image/png';
            extension = 'png';
          }
        } else {
          targetMime = 'image/jpeg';
          extension = 'jpg';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to compress image into blob.'));
            }

            // If compressed result is somehow larger than original and not resized, keep original
            if (blob.size >= file.size && !needsResize) {
              return resolve({
                file,
                previewUrl: URL.createObjectURL(file),
                originalSize: file.size,
                optimizedSize: file.size,
                width,
                height,
                wasCompressed: false,
              });
            }

            // Derive clean output filename
            const baseName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_');
            const newFileName = `${baseName}.${extension}`;

            const optimizedFile = new File([blob], newFileName, {
              type: targetMime,
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(optimizedFile);

            resolve({
              file: optimizedFile,
              previewUrl,
              originalSize: file.size,
              optimizedSize: optimizedFile.size,
              width,
              height,
              wasCompressed: true,
            });
          },
          targetMime,
          quality
        );
      } catch (procErr) {
        reject(procErr);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid or corrupted image file.'));
    };

    img.src = objectUrl;
  });
}
