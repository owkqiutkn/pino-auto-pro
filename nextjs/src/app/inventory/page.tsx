import Link from "next/link";
import { Suspense } from "react";
import InventoryFilters from "@/components/InventoryFilters";
import InventorySearchInput from "@/components/InventorySearchInput";
import InventorySortSelect from "@/components/InventorySortSelect";
import SiteNavbar from "@/components/SiteNavbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";
import { getTranslations } from "next-intl/server";

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

const INVENTORY_HERO_IMAGE = "/new-landing/hero.jpg";

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

async function InventoryHero() {
    const t = await getTranslations("Inventory.page");
    return (
        <section
            className="relative overflow-hidden"
            style={{ backgroundImage: `url(${INVENTORY_HERO_IMAGE})`, backgroundPosition: "center 10%", backgroundSize: "cover" }}
            aria-label={t("heroAria")}
        >
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative z-[10020]">
                <SiteNavbar />
            </div>
            <div className="relative mx-auto flex h-[55px] max-w-7xl items-end px-4 pb-2 opacity-90 md:h-[55px] md:pb-3">
                <div>
                    <p className="text-xl font-bold text-white md:text-2xl"></p>
                </div>
            </div>
        </section>
    );
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
    const landingT = await getTranslations("NewLanding");
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
                    <p className="mt-6 text-red-600">{t("errorMessage")}</p>
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

            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-8">
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
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        {t("title")}
                    </h1>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                                    className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="relative aspect-[4/3] bg-gray-100">
                                        {cover ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={cover.image_url}
                                                alt={car.title}
                                                className="h-full w-full object-cover"
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
                                    <div className="flex h-[300px] flex-col p-4">
                                        <h2 className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                            {car.year} {car.brand} {car.model}
                                        </h2>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            {(car.category ?? t("card.fallbackBodyStyle"))} {car.model} {car.km.toLocaleString()} km
                                        </p>
                                        <ul className="mt-3 space-y-0.5 text-xs text-gray-600">
                                            {car.engine && <li>{car.engine}</li>}
                                            {car.fuel && <li>{car.fuel}</li>}
                                            {car.transmission && <li>{car.transmission}</li>}
                                        </ul>
                                        <div className="mt-3">
                                            <p className="text-[10px] text-gray-500">{t("card.dealerPriceLabel")}</p>
                                            {car.discounted_price != null ? (
                                                <p>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatPrice(car.price)}
                                                    </span>
                                                    <span className="ml-2 text-lg font-bold text-red-600">
                                                        {formatPrice(car.discounted_price)}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-lg font-bold text-red-600">
                                                    {formatPrice(car.price)}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-[10px] text-gray-500">
                                                {t("card.taxNote")}
                                            </p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                                {t("card.fairDeal")}
                                            </span>
                                            <span className="text-[10px]">{t("card.fairDealSource")}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="mt-auto w-full rounded bg-[#0c1320] py-2 text-sm font-bold text-white hover:bg-gray-800"
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

            <footer className="bg-[#171717] py-10 text-xs text-white/80">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-3">
                    <div>
                        <h4 className="mb-3 font-bold uppercase text-white">
                            {landingT("footer.contactTitle")}
                        </h4>
                        <p className="text-white/60">{landingT("footer.addressLine1")}</p>
                        <p className="text-white/60">{landingT("footer.phone")}</p>
                        <p className="text-white/60">{landingT("footer.email")}</p>
                        <div className="mt-4 flex items-center gap-3">
                            <a
                                href="https://facebook.com"
                                aria-label="Visit us on Facebook"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#1877f2]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://img.icons8.com/?id=118466&format=png&size=32"
                                    alt="Facebook"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://instagram.com"
                                aria-label="Visit us on Instagram"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#e1306c]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://img.icons8.com/?id=32292&format=png&size=32"
                                    alt="Instagram"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://x.com"
                                aria-label="Visit us on X"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-white/70"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://img.icons8.com/?id=01GWmP9aUoPj&format=png&size=32"
                                    alt="X (Twitter)"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-3 font-bold uppercase text-white">
                            {landingT("footer.hoursTitle")}
                        </h4>
                        <p className="text-white/60">{landingT("footer.hours.mon")}</p>
                        <p className="text-white/60">{landingT("footer.hours.tue")}</p>
                        <p className="text-white/60">{landingT("footer.hours.wed")}</p>
                        <p className="text-white/60">{landingT("footer.hours.thu")}</p>
                        <p className="text-white/60">{landingT("footer.hours.fri")}</p>
                        <p className="text-white/60">{landingT("footer.hours.sat")}</p>
                        <p className="text-white/60">{landingT("footer.hours.sun")}</p>
                    </div>
                    <div className="hidden md:block">
                        <h4 className="mb-3 font-bold uppercase text-white">
                            {landingT("footer.inventoryTitle")}
                        </h4>
                        <p className="text-white/60">{landingT("footer.inventoryItems.sedan")}</p>
                        <p className="text-white/60">{landingT("footer.inventoryItems.suv")}</p>
                        <p className="text-white/60">{landingT("footer.inventoryItems.coupe")}</p>
                    </div>
                </div>
                <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 pt-4 text-[10px] text-white/60">
                    <div>{landingT("footer.poweredBy")}</div>
                    <div>{landingT("footer.copyright")}</div>
                </div>
            </footer>

            <ScrollToTopButton />
        </div>
    );
}
