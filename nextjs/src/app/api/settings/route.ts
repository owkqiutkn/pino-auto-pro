import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createSSRClient } from "@/lib/supabase/server";
import { createSSRSassClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const ssrClient = await createSSRClient();
        const { data: { user } } = await ssrClient.auth.getUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            business_name,
            logo_light,
            logo_dark,
            instagram_url,
            facebook_url,
            twitter_url,
            opening_hours,
            meta_title,
            meta_description,
            og_image,
            site_url,
            google_analytics_id,
        } = body;

        const updates: Record<string, unknown> = {};
        if (business_name !== undefined) updates.business_name = business_name ?? null;
        if (logo_light !== undefined) updates.logo_light = logo_light ?? null;
        if (logo_dark !== undefined) updates.logo_dark = logo_dark ?? null;
        if (instagram_url !== undefined) updates.instagram_url = instagram_url ?? null;
        if (facebook_url !== undefined) updates.facebook_url = facebook_url ?? null;
        if (twitter_url !== undefined) updates.twitter_url = twitter_url ?? null;
        if (opening_hours !== undefined) updates.opening_hours = opening_hours ?? null;
        if (meta_title !== undefined) updates.meta_title = meta_title ?? null;
        if (meta_description !== undefined) updates.meta_description = meta_description ?? null;
        if (og_image !== undefined) updates.og_image = og_image ?? null;
        if (site_url !== undefined) updates.site_url = site_url ?? null;
        if (google_analytics_id !== undefined) updates.google_analytics_id = google_analytics_id ?? null;

        const client = await createSSRSassClient();
        const { data, error } = await client.updateSiteSettings(updates);

        if (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
        revalidateTag("site-settings");
        return Response.json({ data });
    } catch (err) {
        console.error("Settings update error:", err);
        return Response.json(
            { error: err instanceof Error ? err.message : "Failed to update settings" },
            { status: 500 }
        );
    }
}
