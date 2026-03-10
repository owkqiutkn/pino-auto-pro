export function slugifyCar(title: string, year?: number, brand?: string, model?: string) {
    const raw = `${year || ""} ${brand || ""} ${model || ""} ${title}`.trim().toLowerCase();
    return raw
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function storagePathFromPublicUrl(publicUrl: string) {
    try {
        const marker = "/storage/v1/object/public/car-images/";
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return null;
        return decodeURIComponent(publicUrl.slice(idx + marker.length));
    } catch {
        return null;
    }
}
