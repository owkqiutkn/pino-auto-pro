import { unstable_cache } from "next/cache";
import { createAnonymousSassClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];
type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];
type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

const CACHE_REVALIDATE = 3600; // 1 hour for lookup tables

async function fetchCategories(): Promise<Category[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getCategories();
    return (data ?? []) as Category[];
}

async function fetchEngines(): Promise<Engine[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getEngines();
    return (data ?? []) as Engine[];
}

async function fetchFuels(): Promise<Fuel[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getFuels();
    return (data ?? []) as Fuel[];
}

async function fetchTransmissions(): Promise<Transmission[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getTransmissions();
    return (data ?? []) as Transmission[];
}

async function fetchBrands(): Promise<Brand[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getBrands();
    return (data ?? []) as Brand[];
}

async function fetchBrandModels(): Promise<BrandModel[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getBrandModels();
    return (data ?? []) as BrandModel[];
}

async function fetchExteriorColors(): Promise<ExteriorColor[]> {
    const client = createAnonymousSassClient();
    const { data } = await client.getExteriorColors();
    return (data ?? []) as ExteriorColor[];
}

async function fetchSiteSettings(): Promise<SiteSettings | null> {
    const client = createAnonymousSassClient();
    const { data } = await client.getSiteSettings();
    return data as SiteSettings | null;
}

export const getCachedCategories = unstable_cache(
    fetchCategories,
    ["inventory-lookup-categories"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedEngines = unstable_cache(
    fetchEngines,
    ["inventory-lookup-engines"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedFuels = unstable_cache(
    fetchFuels,
    ["inventory-lookup-fuels"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedTransmissions = unstable_cache(
    fetchTransmissions,
    ["inventory-lookup-transmissions"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedBrands = unstable_cache(
    fetchBrands,
    ["inventory-lookup-brands"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedBrandModels = unstable_cache(
    fetchBrandModels,
    ["inventory-lookup-brand-models"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedExteriorColors = unstable_cache(
    fetchExteriorColors,
    ["inventory-lookup-exterior-colors"],
    { revalidate: CACHE_REVALIDATE }
);

export const getCachedSiteSettings = unstable_cache(
    fetchSiteSettings,
    ["site-settings"],
    { revalidate: CACHE_REVALIDATE, tags: ["site-settings"] }
);
