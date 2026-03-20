import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = await getSiteUrl();
    const client = await createSSRSassClient();
    const { data: cars } = await client.getAvailableCars();
    const carsList = (cars ?? []) as Car[];

    const dynamicEntries = carsList.map((car) => ({
        url: `${baseUrl}/inventory/${car.slug}`,
        lastModified: car.updated_at,
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    return [
        {
            url: `${baseUrl}/inventory`,
            lastModified: new Date().toISOString(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        ...dynamicEntries,
    ];
}
