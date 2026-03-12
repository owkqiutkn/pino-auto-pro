import Link from "next/link";
import { Suspense } from "react";
import InventoryFilters from "@/components/InventoryFilters";
import InventorySearchInput from "@/components/InventorySearchInput";
import InventorySortSelect from "@/components/InventorySortSelect";
import InventoryHero from "@/components/InventoryHero";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";
import { getLocale, getTranslations } from "next-intl/server";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

interface InventoryPageProps {
    searchParams: Promise<{
        brand?: string;
        category?: string;
        model?: string;
        exteriorColor?: string;
        transmission?: string;
        engine?: string;
        fuel?: string;
        search?: string;
        yearMin?: string;
        yearMax?: string;
        kmMin?: string;
        kmMax?: string;
        priceMin?: string;
        priceMax?: string;
        sort?: string;
    }>;
}

function getEngineDisplay(engineValue: string | null | undefined, engines: Engine[], locale: string): string | null {
    if (!engineValue) return null;
    const engine = engines.find((e) => (e.name_en ?? e.name) === engineValue || e.name === engineValue);
    return engine ? getLocalizedEngineName(engine, locale) : engineValue;
}

function getFuelDisplay(fuelValue: string | null | undefined, fuels: Fuel[], locale: string): string | null {
    if (!fuelValue) return null;
    const fuel = fuels.find((f) => (f.name_en ?? f.name) === fuelValue || f.name === fuelValue);
    return fuel ? getLocalizedFuelName(fuel, locale) : fuelValue;
}

function getCategoryDisplay(categoryValue: string | null | undefined, categories: Category[], locale: string): string | null {
    if (!categoryValue) return null;
    const category = categories.find(
        (c) => c.name_en === categoryValue || c.name_fr === categoryValue || c.name === categoryValue
    );
    return category ? getLocalizedCategoryName(category, locale) : categoryValue;
}

function getTransmissionDisplay(transmissionValue: string | null | undefined, transmissions: Transmission[], locale: string): string | null {
    if (!transmissionValue) return null;
    const transmission = transmissions.find(
        (tr) => (tr.name_en ?? tr.name) === transmissionValue || tr.name_fr === transmissionValue || tr.name === transmissionValue
    );
    return transmission ? getLocalizedTransmissionName(transmission, locale) : transmissionValue;
}

function toNumber(value?: string) {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const params = await searchParams;
    const brand = params.brand?.trim() || undefined;
    const category = params.category?.trim() || undefined;
    const model = params.model?.trim() || undefined;
    const exteriorColor = params.exteriorColor?.trim() || undefined;
    const transmission = params.transmission?.trim() || undefined;
    const engine = params.engine?.trim() || undefined;
    const fuel = params.fuel?.trim() || undefined;
    const searchQuery = params.search?.trim() || undefined;
    const yearMin = toNumber(params.yearMin);
    const yearMax = toNumber(params.yearMax);
    const kmMin = toNumber(params.kmMin);
    const kmMax = toNumber(params.kmMax);
    const priceMin = toNumber(params.priceMin);
    const priceMax = toNumber(params.priceMax);
    const sort = params.sort?.trim() || undefined;

    const client = await createSSRSassClient();
    const t = await getTranslations("Inventory.page");
    const locale = await getLocale();
    const [
        { data: cars, error },
        { data: brandsData },
        { data: categoriesData },
        { data: exteriorColorsData },
        { data: transmissionsData },
        { data: enginesData },
        { data: fuelsData },
    ] = await Promise.all([
        client.getAvailableCars({
            brand,
            category: category || undefined,
            model,
            exteriorColor,
            transmission,
            engine,
            fuel,
            yearMin,
            yearMax,
            kmMin,
            kmMax,
            priceMin,
            priceMax,
        }),
        client.getBrands(),
        client.getCategories(),
        client.getExteriorColors(),
        client.getTransmissions(),
        client.getEngines(),
        client.getFuels(),
    ]);

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <InventoryHero />
                <div className="max-w-5xl mx-auto px-4 py-16">
                    <h1 className="text-3xl font-bold text-gray-900">{t("errorTitle")}</h1>
                    <p className="mt-6 text-[#1d4ed8]">{t("errorMessage")}</p>
                </div>
            </div>
        );
    }

    const carsList = (cars ?? []) as Car[];
    let filteredCars = carsList;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredCars = carsList.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.brand?.toLowerCase().includes(q) ||
                c.model?.toLowerCase().includes(q)
        );
    }

    const effectivePrice = (c: Car) => c.discounted_price ?? c.price;
    if (sort === "price-asc") filteredCars = [...filteredCars].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "price-desc") filteredCars = [...filteredCars].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    if (sort === "year-desc") filteredCars = [...filteredCars].sort((a, b) => b.year - a.year);
    if (sort === "year-asc") filteredCars = [...filteredCars].sort((a, b) => a.year - b.year);

    const brands = (brandsData ?? []) as Brand[];
    const categories = (categoriesData ?? []) as Category[];
    const exteriorColors = (exteriorColorsData ?? []) as ExteriorColor[];
    const transmissions = (transmissionsData ?? []) as Transmission[];
    const engines = (enginesData ?? []) as Engine[];
    const fuels = (fuelsData ?? []) as Fuel[];
    const models = Array.from(new Set(carsList.map((c) => c.model).filter(Boolean))).sort();

    const carIds = carsList.map((c) => c.id);
    const { data: allImages } = await client.getCarImagesForCars(carIds);
    const allImagesList = (allImages ?? []) as CarImage[];
    const imagesByCar = new Map<string, CarImage[]>();
    for (const img of allImagesList) {
        const bucket = imagesByCar.get(img.car_id) || [];
        bucket.push(img);
        imagesByCar.set(img.car_id, bucket);
    }

    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-white">
            <InventoryHero />

            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 md:flex-row md:gap-8 md:py-8">
                <Suspense fallback={<aside className="w-full md:w-64 md:shrink-0"><div className="h-[300px] animate-pulse rounded border bg-gray-100" /></aside>}>
                    <InventoryFilters
                        brands={brands}
                        categories={categories}
                        models={models}
                        exteriorColors={exteriorColors}
                        transmissions={transmissions}
                        engines={engines}
                        fuels={fuels}
                        currentYear={currentYear}
                        filters={{
                            category,
                            brand,
                            model,
                            exteriorColor,
                            transmission,
                            engine,
                            fuel,
                            priceMin: priceMin ?? "",
                            priceMax: priceMax ?? "",
                            kmMin: kmMin ?? "",
                            kmMax: kmMax ?? "",
                            yearMin: yearMin ?? "",
                            yearMax: yearMax ?? "",
                        }}
                    />
                </Suspense>

                {/* Main content */}
                <main className="min-w-0 flex-1">
                    <h1 className="hidden text-2xl font-bold text-gray-900 md:block md:text-3xl">
                        {t("title")}
                    </h1>

                    <div className="mt-1 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <Suspense fallback={<div className="h-10 max-w-xs flex-1 animate-pulse rounded border bg-gray-100" />}>
                            <InventorySearchInput initialValue={searchQuery ?? ""} />
                        </Suspense>
                        <p className="text-sm text-gray-600">
                            {t("count", { shown: filteredCars.length, total: carsList.length })}
                        </p>
                        <Suspense fallback={<div className="h-10 w-36 animate-pulse rounded border bg-gray-100" />}>
                            <InventorySortSelect currentSort={sort ?? ""} />
                        </Suspense>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCars.map((car) => {
                            const images = imagesByCar.get(car.id) || [];
                            const cover = images.find((i) => i.is_cover) || images[0];
                            return (
                                <Link
                                    key={car.id}
                                    href={`/inventory/${car.slug}`}
                                    className="group block overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1d4ed8] hover:shadow-lg"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        {cover ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={cover.image_url}
                                                alt={car.title}
                                                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                {t("card.noImage")}
                                            </div>
                                        )}
                                        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1320] text-[8px] font-bold text-white">
                                            PAP
                                        </div>
                                    </div>
                                    <div className="flex h-[260px] flex-col p-4">
                                        <h2 className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                            {car.year} {car.brand} {car.model}
                                        </h2>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            {getCategoryDisplay(car.category, categories, locale) ?? t("card.fallbackBodyStyle")} {car.model} {car.km.toLocaleString()} km
                                        </p>
                                        <p className="mt-3 min-h-[1rem] text-xs text-gray-600">
                                            {[car.engine && getEngineDisplay(car.engine, engines, locale), car.fuel && getFuelDisplay(car.fuel, fuels, locale), car.transmission && getTransmissionDisplay(car.transmission, transmissions, locale)]
                                                .filter(Boolean)
                                                .join(" • ")}
                                        </p>
                                        <div className="mt-auto pt-3">
                                            <p className="text-[10px] text-gray-500">{t("card.dealerPriceLabel")}</p>
                                            {car.discounted_price != null ? (
                                                <p>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatPrice(car.price)}
                                                    </span>
                                                    <span className="ml-2 text-lg font-bold text-[#1d4ed8]">
                                                        {formatPrice(car.discounted_price)}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-lg font-bold text-[#1d4ed8]">
                                                    {formatPrice(car.price)}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-[10px] text-gray-500">
                                                {t("card.taxNote")}
                                            </p>
                                        </div>
                                        <div className="mt-3 mb-2 flex items-center gap-2 text-xs text-gray-600">
                                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                                {t("card.fairDeal")}
                                            </span>
                                            <span className="text-[10px]">{t("card.fairDealSource")}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="mt-3 w-full rounded bg-[#0c1320] py-2 text-sm font-bold text-white hover:bg-gray-800"
                                        >
                                            {t("card.viewDetails")}
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {filteredCars.length === 0 && (
                        <div className="py-16 text-center text-gray-500">
                            {t("emptyFiltered")}
                        </div>
                    )}
                </main>
            </div>

            <SiteFooter />

            <ScrollToTopButton />
        </div>
    );
}
