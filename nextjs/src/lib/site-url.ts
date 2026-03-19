import { headers } from "next/headers";

function stripTrailingSlash(url: string): string {
    return url.replace(/\/$/, "");
}

/**
 * Absolute site origin for canonical URLs, Open Graph, and share links.
 * 1) NEXT_PUBLIC_SITE_URL when set
 * 2) Request Host / X-Forwarded-* (visitor’s domain — fixes custom domains without env)
 * 3) VERCEL_URL (preview / deployment hostname)
 * 4) http://localhost:3000
 */
export async function getSiteUrl(): Promise<string> {
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (fromEnv) {
        return stripTrailingSlash(fromEnv);
    }

    try {
        const h = await headers();
        const hostRaw = h.get("x-forwarded-host") ?? h.get("host");
        if (hostRaw) {
            const host = hostRaw.split(",")[0]?.trim() ?? hostRaw;
            const protoRaw = h.get("x-forwarded-proto") ?? "https";
            const proto = protoRaw.split(",")[0]?.trim() ?? "https";
            return stripTrailingSlash(`${proto}://${host}`);
        }
    } catch {
        // headers() unavailable in some build/static paths
    }

    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) {
        const host = vercel.replace(/^https?:\/\//i, "");
        return stripTrailingSlash(`https://${host}`);
    }

    return "http://localhost:3000";
}
