import imageCompression from "browser-image-compression";

export type CompressImageOptions = {
  /** Convert output to WebP. Default true for photos. */
  convertToWebP?: boolean;
  /** Max file size in MB. Default 1.5 */
  maxSizeMB?: number;
  /** Max width or height in pixels. Default 1920 */
  maxWidthOrHeight?: number;
  /** Use web worker for non-blocking compression. Default true */
  useWebWorker?: boolean;
};

const DEFAULT_MAX_SIZE_MB = 1.5;
const DEFAULT_MAX_WIDTH_OR_HEIGHT = 1920;

/**
 * Compress and optionally convert an image to WebP for upload.
 * Uses browser-image-compression to resize and reduce file size.
 * Returns a new File (with .webp name when convertToWebP is true).
 */
export async function compressImageForUpload(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const {
    convertToWebP = true,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    maxWidthOrHeight = DEFAULT_MAX_WIDTH_OR_HEIGHT,
    useWebWorker = true,
  } = options;

  const isImage =
    file.type.startsWith("image/") &&
    !file.type.includes("svg"); // SVG is not raster, skip compression

  if (!isImage) {
    return file;
  }

  const compressionOptions: Parameters<typeof imageCompression>[1] = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    fileType: convertToWebP ? "image/webp" : undefined,
  };

  const compressed = await imageCompression(file, compressionOptions);

  if (convertToWebP && compressed.type === "image/webp") {
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const newName = `${baseName}.webp`;
    return new File([compressed], newName, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  }

  return compressed;
}
