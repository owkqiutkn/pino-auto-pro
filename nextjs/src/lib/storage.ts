/**
 * Supabase Storage image transformation (resize on the fly).
 * Converts a storage public URL to the CDN transform endpoint so images
 * are resized/optimized when requested.
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  resize?: "cover" | "contain" | "fill";
  quality?: number;
};

const OBJECT_PREFIX = "/storage/v1/object/public/";
const RENDER_PREFIX = "/storage/v1/render/image/public/";

/**
 * Returns a URL that requests the image with the given transform options.
 * If the URL is not a Supabase storage object URL, or no transform is given,
 * returns the original URL unchanged.
 */
export function getTransformedStorageUrl(
  publicUrl: string,
  transform?: ImageTransformOptions
): string {
  const hasOptions =
    transform &&
    (transform.width != null ||
      transform.height != null ||
      transform.resize != null ||
      transform.quality != null);
  if (!hasOptions) return publicUrl;
  const idx = publicUrl.indexOf(OBJECT_PREFIX);
  if (idx === -1) return publicUrl;

  const base = publicUrl.slice(0, idx) + RENDER_PREFIX + publicUrl.slice(idx + OBJECT_PREFIX.length);
  const params = new URLSearchParams();
  if (transform.width != null) params.set("width", String(transform.width));
  if (transform.height != null) params.set("height", String(transform.height));
  if (transform.resize) params.set("resize", transform.resize);
  if (transform.quality != null) params.set("quality", String(transform.quality));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Defaults for car list/cover thumbnails (e.g. cards). */
export const CAR_IMAGE_LIST = { width: 800, height: 600, resize: "cover" as const };

/** Defaults for car detail main image. */
export const CAR_IMAGE_DETAIL = { width: 1200, height: 900, resize: "cover" as const };

/** Defaults for car gallery thumbnails. */
export const CAR_IMAGE_THUMB = { width: 192, height: 128, resize: "cover" as const };

/** Defaults for category/site images (small icons or cards). */
export const CATEGORY_IMAGE = { width: 400, height: 300, resize: "cover" as const };
