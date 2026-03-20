import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createSSRClient } from "@/lib/supabase/server";
import { getCachedSiteSettings } from "@/lib/supabase/cached";

export const dynamic = "force-dynamic";

const SITE_SUBDIR = "site";
const FAVICON_PREFIX = "site-favicon";
const MAX_BYTES = 512 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".ico":
      return "image/x-icon";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function extFromFileName(name: string): string | undefined {
  const m = name.match(/\.(ico|png|svg|webp)$/i);
  if (!m) return undefined;
  return `.${m[1].toLowerCase()}`;
}

function resolvePublicFile(webPath: string): string | null {
  const p = webPath.trim();
  if (!p.startsWith("/")) return null;
  const rel = p.replace(/^\/+/, "");
  if (rel.includes("..")) return null;
  const resolved = path.resolve(process.cwd(), "public", rel);
  const publicRoot = path.resolve(process.cwd(), "public");
  const sep = path.sep;
  if (resolved !== publicRoot && !resolved.startsWith(publicRoot + sep)) return null;
  return resolved;
}

function pickExt(file: File): string | null {
  const fromMime = MIME_TO_EXT[file.type];
  if (fromMime) return fromMime;
  return extFromFileName(file.name) ?? null;
}

function mimeForExt(ext: string): string {
  const map: Record<string, string> = {
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

/** Writable `public/site/` works on local/VPS; serverless (e.g. Vercel) is read-only — returns null. */
async function trySaveFaviconLocal(ext: string, bytes: Buffer): Promise<string | null> {
  try {
    const dir = path.join(process.cwd(), "public", SITE_SUBDIR);
    await mkdir(dir, { recursive: true });
    try {
      const names = await readdir(dir);
      for (const n of names) {
        if (n.startsWith(`${FAVICON_PREFIX}.`)) {
          await unlink(path.join(dir, n));
        }
      }
    } catch {
      /* ignore */
    }
    const filename = `${FAVICON_PREFIX}${ext}`;
    const absPath = path.join(dir, filename);
    await writeFile(absPath, bytes);
    return `/${SITE_SUBDIR}/${filename}`;
  } catch (err) {
    console.warn("[site-favicon] local disk save skipped:", err);
    return null;
  }
}

async function uploadFaviconToSupabase(
  supabase: Awaited<ReturnType<typeof createSSRClient>>,
  ext: string,
  bytes: Buffer
): Promise<string | null> {
  const storagePath = `favicon/favicon_${Date.now()}${ext}`;
  const { error } = await supabase.storage.from("site-logos").upload(storagePath, bytes, {
    upsert: true,
    contentType: mimeForExt(ext),
  });
  if (error) {
    console.error("[site-favicon] Supabase upload failed:", error.message);
    return null;
  }
  const { data } = supabase.storage.from("site-logos").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function GET() {
  const settings = await getCachedSiteSettings();
  const faviconRef = settings?.favicon?.trim();
  if (faviconRef) {
    if (/^https?:\/\//i.test(faviconRef)) {
      return NextResponse.redirect(faviconRef, 302);
    }
    const filePath = resolvePublicFile(faviconRef);
    if (filePath) {
      try {
        const buf = await readFile(filePath);
        const ext = path.extname(filePath);
        return new NextResponse(new Uint8Array(buf), {
          headers: {
            "Content-Type": contentTypeForExt(ext),
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch {
        /* fall through to fallback */
      }
    }
  }

  const filePath = path.join(process.cwd(), "public", "favicon-fallback.ico");
  try {
    const buf = await readFile(filePath);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/x-icon",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const ssrClient = await createSSRClient();
  const {
    data: { user },
  } = await ssrClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large (max 512KB)" }, { status: 400 });
  }

  const ext = pickExt(file);
  if (!ext || !Object.values(MIME_TO_EXT).includes(ext)) {
    return Response.json(
      { error: "Invalid type. Use .ico, .png, .svg, or .webp." },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const localPath = await trySaveFaviconLocal(ext, bytes);
  const publicPath =
    localPath ?? (await uploadFaviconToSupabase(ssrClient, ext, bytes));

  if (!publicPath) {
    return Response.json(
      {
        error:
          "Could not save favicon. Local disk is not writable and cloud upload failed — check Supabase storage policies for site-logos/favicon/.",
      },
      { status: 500 }
    );
  }

  return Response.json({ publicPath, storage: localPath ? "local" : "supabase" });
}
