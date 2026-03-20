"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";
import { getLocalizedTrimName } from "@/lib/i18n/trims";
import type { Database } from "@/lib/types";
import { getTransformedStorageUrl } from "@/lib/storage";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        setIsMobile(mq.matches);
        const handler = () => setIsMobile(mq.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return isMobile;
}

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];
type ModelTrim = Database["public"]["Tables"]["model_trims"]["Row"];

type Segment = "featured" | "new-arrivals";

type Car = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    model: string;
    trim: string | null;
    year: number;
    km: number;
    price: number;
    discounted_price: number | null;
    category: string | null;
    engine: string | null;
    fuel: string | null;
    transmission: string | null;
    carfax_url?: string | null;
    cargurus_url?: string | null;
};

type InitialFeaturedData = {
    cars: Car[];
    coverImageByCarId: Record<string, string>;
};

type LookupProps = {
    categories: Category[];
    engines: Engine[];
    fuels: Fuel[];
    transmissions: Transmission[];
    modelTrims: ModelTrim[];
    /** Preloaded data for the "featured" segment so the client does not need to fetch on mount. */
    initialFeaturedData?: InitialFeaturedData;
};

const DESKTOP_ITEMS_PER_PAGE = 8;
const MOBILE_ITEMS_PER_PAGE = 4;

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function getEngineDisplay(engineValue: string | null, engines: Engine[], locale: string): string | null {
    if (!engineValue) return null;
    const engine = engines.find((e) => (e.name_en ?? e.name) === engineValue || e.name_es === engineValue || e.name === engineValue);
    return engine ? getLocalizedEngineName(engine, locale) : engineValue;
}

function getFuelDisplay(fuelValue: string | null, fuels: Fuel[], locale: string): string | null {
    if (!fuelValue) return null;
    const fuel = fuels.find((f) => (f.name_en ?? f.name) === fuelValue || f.name_es === fuelValue || f.name === fuelValue);
    return fuel ? getLocalizedFuelName(fuel, locale) : fuelValue;
}

function getCategoryDisplay(categoryValue: string | null, categories: Category[], locale: string): string | null {
    if (!categoryValue) return null;
    const category = categories.find(
        (c) => c.name_en === categoryValue || c.name_es === categoryValue || c.name_fr === categoryValue || c.name === categoryValue
    );
    return category ? getLocalizedCategoryName(category, locale) : categoryValue;
}

function getTransmissionDisplay(transmissionValue: string | null, transmissions: Transmission[], locale: string): string | null {
    if (!transmissionValue) return null;
    const transmission = transmissions.find(
        (tr) => (tr.name_en ?? tr.name) === transmissionValue || tr.name_es === transmissionValue || tr.name_fr === transmissionValue || tr.name === transmissionValue
    );
    return transmission ? getLocalizedTransmissionName(transmission, locale) : transmissionValue;
}

function getTrimDisplay(trimValue: string | null, modelTrims: ModelTrim[], locale: string): string | null {
    if (!trimValue) return null;
    const trim = modelTrims.find(
        (tr) =>
            (tr.name_en ?? tr.name) === trimValue ||
            tr.name_es === trimValue ||
            tr.name_fr === trimValue ||
            tr.name === trimValue
    );
    return trim ? getLocalizedTrimName(trim, locale) : trimValue;
}

export default function InventoryLineupRed({ categories, engines, fuels, transmissions, modelTrims, initialFeaturedData }: LookupProps) {
    const t = useTranslations("NewLanding.inventorySection");
    const tCard = useTranslations("Inventory.page");
    const locale = useLocale();
    const isMobile = useIsMobile();
    const [segment, setSegment] = useState<Segment>("featured");
    const [page, setPage] = useState(1);
    const [mobileIndex, setMobileIndex] = useState(0);
    const [cars, setCars] = useState<Car[]>(() => initialFeaturedData?.cars ?? []);
    const [coverImageByCarId, setCoverImageByCarId] = useState<Record<string, string>>(
        () => initialFeaturedData?.coverImageByCarId ?? {}
    );
    const [loading, setLoading] = useState(!initialFeaturedData);

    const touchStartXRef = useRef<number | null>(null);
    const touchStartYRef = useRef<number | null>(null);

    const handleMobileTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        const touch = e.touches[0];
        touchStartXRef.current = touch.clientX;
        touchStartYRef.current = touch.clientY;
    };

    const handleMobileTouchEnd = (e: React.TouchEvent) => {
        if (!isMobile) return;
        if (touchStartXRef.current == null || touchStartYRef.current == null) return;

        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartXRef.current;
        const dy = touch.clientY - touchStartYRef.current;

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const SWIPE_THRESHOLD = 40;

        if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
            e.preventDefault();
            e.stopPropagation();

            if (dx < 0 && mobileIndex < cars.length - 1) {
                setMobileIndex((i) => Math.min(cars.length - 1, i + 1));
            } else if (dx > 0 && mobileIndex > 0) {
                setMobileIndex((i) => Math.max(0, i - 1));
            }
        }

        touchStartXRef.current = null;
        touchStartYRef.current = null;
    };

    const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : DESKTOP_ITEMS_PER_PAGE;
    const totalPages = Math.ceil(cars.length / itemsPerPage || 1);
    const paginatedCars = cars.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        if (segment === "featured" && initialFeaturedData) {
            setCars(initialFeaturedData.cars);
            setCoverImageByCarId(initialFeaturedData.coverImageByCarId);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetch(`/api/inventory/segment?segment=${segment}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data: { cars: Car[]; coverImageByCarId: Record<string, string> }) => {
                if (cancelled) return;
                setCars(data.cars ?? []);
                setCoverImageByCarId(data.coverImageByCarId ?? {});
            })
            .catch(() => {
                if (!cancelled) {
                    setCars([]);
                    setCoverImageByCarId({});
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [segment, initialFeaturedData]);

    useEffect(() => {
        setPage(1);
        setMobileIndex(0);
    }, [segment]);

    useEffect(() => {
        setPage(1);
        setMobileIndex(0);
    }, [itemsPerPage]);

    return (
        <section id="inventory" className="bg-transparent md:bg-[#f2f2f3] py-2 md:py-10 text-black">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-black uppercase text-white md:text-black">
                        {t("title")}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase">
                        <button
                            type="button"
                            onClick={() => setSegment("featured")}
                            className={
                                segment === "featured"
                                    ? "flex-1 md:flex-none rounded-sm border border-[#b91c1c] bg-[#b91c1c] px-2 py-1 text-center text-white shadow-sm outline-none transition-colors hover:bg-[#7f1d1d] hover:border-[#7f1d1d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                                    : "flex-1 md:flex-none rounded-sm border border-transparent bg-[#2e0f14]/60 px-2 py-1 text-center text-red-100 shadow-sm outline-none transition-colors hover:bg-[#b91c1c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:bg-white md:text-[#b91c1c] md:shadow-none md:hover:bg-[#b91c1c] md:hover:text-white md:focus-visible:ring-[#b91c1c]"
                            }
                        >
                            {t("segments.featured")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSegment("new-arrivals")}
                            className={
                                segment === "new-arrivals"
                                    ? "flex-1 md:flex-none rounded-sm border border-[#b91c1c] bg-[#b91c1c] px-2 py-1 text-center text-white shadow-sm outline-none transition-colors hover:bg-[#7f1d1d] hover:border-[#7f1d1d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                                    : "flex-1 md:flex-none rounded-sm border border-transparent bg-[#2e0f14]/60 px-2 py-1 text-center text-red-100 shadow-sm outline-none transition-colors hover:bg-[#b91c1c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:bg-white md:text-[#b91c1c] md:shadow-none md:hover:bg-[#b91c1c] md:hover:text-white md:focus-visible:ring-[#b91c1c]"
                            }
                        >
                            {t("segments.newArrivals")}
                        </button>
                        <Link
                            href="/inventory"
                            className="flex-1 md:flex-none rounded-sm border border-transparent bg-[#2e0f14]/60 px-2 py-1 text-center text-red-100 shadow-sm outline-none transition-colors hover:bg-[#b91c1c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:bg-white md:text-[#b91c1c] md:shadow-none md:hover:bg-[#b91c1c] md:hover:text-white md:focus-visible:ring-[#b91c1c]"
                        >
                            {t("cta.viewAll")}
                        </Link>
                    </div>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: itemsPerPage }, (_, i) => i + 1).map((i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm"
                            >
                                <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />
                                <div className="p-4">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-200" />
                                    <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : cars.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-600">
                        {t("emptyState.message")}
                    </p>
                ) : (
                    <>
                        {isMobile ? (
                            <>
                                {(() => {
                                    const car = cars[mobileIndex] ?? cars[0];
                                    if (!car) return null;
                                    return (
                                        <div className="group flex min-h-[496px] flex-col overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                                            <Link href={`/inventory/${car.slug}`} className="block shrink-0">
                                                <div
                                                    className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-gray-100"
                                                    onTouchStart={handleMobileTouchStart}
                                                    onTouchEnd={handleMobileTouchEnd}
                                                >
                                                    {coverImageByCarId[car.id] ? (
                                                        <Image
                                                            src={getTransformedStorageUrl(coverImageByCarId[car.id])}
                                                            alt={car.title}
                                                            fill
                                                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                            sizes="100vw"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            {tCard("card.noImage")}
                                                        </div>
                                                    )}
                                                    <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#b91c1c] text-[8px] font-bold text-white">
                                                        PAP
                                                    </div>
                                                    {cars.length > 1 && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setMobileIndex((i) => Math.max(0, i - 1));
                                                                }}
                                                                disabled={mobileIndex === 0}
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#b91c1c] text-white shadow-lg ring-2 ring-white outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white hover:bg-[#7f1d1d] disabled:opacity-40 disabled:hover:bg-[#b91c1c]"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        d="M14.5 5.5L8 12l6.5 6.5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setMobileIndex((i) => Math.min(cars.length - 1, i + 1));
                                                                }}
                                                                disabled={mobileIndex === cars.length - 1}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#b91c1c] text-white shadow-lg ring-2 ring-white outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white hover:bg-[#7f1d1d] disabled:opacity-40 disabled:hover:bg-[#b91c1c]"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        d="M9.5 5.5L16 12l-6.5 6.5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex flex-col px-3 pt-3 pb-2">
                                                    <h2 className="text-sm font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {car.year} {car.brand} {car.model}{car.trim ? ` ${getTrimDisplay(car.trim, modelTrims, locale)}` : ""}
                                                    </h2>
                                                    <p className="mt-0.5 text-xs text-gray-600">
                                                        {getCategoryDisplay(car.category, categories, locale) ??
                                                            tCard("card.fallbackBodyStyle")}{" "}
                                                        {car.model}{car.trim ? ` ${getTrimDisplay(car.trim, modelTrims, locale)}` : ""} {car.km.toLocaleString()} km
                                                    </p>
                                                    <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-gray-600">
                                                        {[
                                                            car.engine && getEngineDisplay(car.engine, engines, locale),
                                                            car.fuel && getFuelDisplay(car.fuel, fuels, locale),
                                                            car.transmission &&
                                                                getTransmissionDisplay(car.transmission, transmissions, locale),
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" • ")}
                                                    </p>
                                                    <div className="mt-2 min-h-[4.5rem]">
                                                        <p className="text-xs font-semibold text-gray-600">
                                                            {tCard("card.dealerPriceLabel")}
                                                        </p>
                                                        {car.discounted_price != null ? (
                                                            <div className="mt-0.5 flex flex-col gap-0.5">
                                                                <span className="text-sm text-gray-500 line-through">
                                                                    {formatPrice(car.price)}
                                                                </span>
                                                                <span className="text-xl font-bold text-[#dc2626]">
                                                                    {formatPrice(car.discounted_price)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xl font-bold text-[#dc2626]">
                                                                {formatPrice(car.price)}
                                                            </p>
                                                        )}
                                                        <p className="mt-0.5 text-[10px] text-gray-500">
                                                            {tCard("card.taxNote")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="min-h-0 flex-1 shrink" aria-hidden="true" />
                                            <div className="mx-4 mt-1 mb-1 shrink-0">
                                                <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                    {car.discounted_price != null ? (
                                                        <span className="shrink-0 whitespace-nowrap rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#b91c1c] ring-1 ring-inset ring-red-200/80 sm:px-2 sm:py-1 sm:text-xs">
                                                            {tCard("card.discountBadge")}
                                                        </span>
                                                    ) : null}
                                                    <span className="shrink-0 whitespace-nowrap rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 sm:px-2 sm:py-1 sm:text-xs">
                                                        {tCard("card.fairDeal")}
                                                    </span>
                                                    {car.carfax_url ? (
                                                        <a
                                                            href={car.carfax_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="shrink-0 whitespace-nowrap rounded border border-gray-300 px-2 py-0.5 text-[10px] font-medium text-gray-700 transition-colors hover:border-[#b91c1c] hover:bg-gray-50 sm:px-2.5 sm:py-1 sm:text-[11px]"
                                                        >
                                                            {tCard("card.carfax")}
                                                        </a>
                                                    ) : (
                                                        <span className="shrink-0 whitespace-nowrap rounded border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-400 cursor-default sm:px-2.5 sm:py-1 sm:text-[11px]">
                                                            {tCard("card.carfax")}
                                                        </span>
                                                    )}
                                                    {car.cargurus_url ? (
                                                        <a
                                                            href={car.cargurus_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="shrink-0 whitespace-nowrap rounded border border-gray-300 px-2 py-0.5 text-[10px] font-medium text-gray-700 transition-colors hover:border-[#b91c1c] hover:bg-gray-50 sm:px-2.5 sm:py-1 sm:text-[11px]"
                                                        >
                                                            {tCard("card.cargurus")}
                                                        </a>
                                                    ) : (
                                                        <span className="shrink-0 whitespace-nowrap rounded border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-400 cursor-default sm:px-2.5 sm:py-1 sm:text-[11px]">
                                                            {tCard("card.cargurus")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/inventory/${car.slug}`}
                                                className="mx-4 mb-1 mt-2 block shrink-0 rounded bg-[#dc2626] py-2 text-center text-sm font-bold text-white hover:bg-[#b91c1c]"
                                            >
                                                {tCard("card.viewDetails")}
                                            </Link>
                                        </div>
                                    );
                                })()}
                                {cars.length > 1 && (
                                    <div className="mt-2 text-center text-[11px] text-white md:text-gray-600">
                                        {mobileIndex + 1} / {cars.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {paginatedCars.map((car) => (
                                    <div
                                        key={car.id}
                                        className="group flex h-full flex-col overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#b91c1c] hover:shadow-lg"
                                    >
                                        <Link
                                            href={`/inventory/${car.slug}`}
                                            className="flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#b91c1c]"
                                        >
                                            <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gray-100">
                                                {coverImageByCarId[car.id] ? (
                                                    <Image
                                                        src={getTransformedStorageUrl(coverImageByCarId[car.id])}
                                                        alt={car.title}
                                                        fill
                                                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                        sizes="(max-width: 768px) 100vw, 400px"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        {tCard("card.noImage")}
                                                    </div>
                                                )}
                                                <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#b91c1c] text-[8px] font-bold text-white">
                                                    PAP
                                                </div>
                                            </div>
                                            <div className="flex min-h-0 flex-1 flex-col p-4">
                                                <h2 className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {car.year} {car.brand} {car.model}{car.trim ? ` ${getTrimDisplay(car.trim, modelTrims, locale)}` : ""}
                                                </h2>
                                                <p className="mt-0.5 text-sm text-gray-600">
                                                    {getCategoryDisplay(car.category, categories, locale) ?? tCard("card.fallbackBodyStyle")}{" "}
                                                    {car.model}{car.trim ? ` ${getTrimDisplay(car.trim, modelTrims, locale)}` : ""} {car.km.toLocaleString()} km
                                                </p>
                                                <p className="mt-3 min-h-[1rem] text-xs text-gray-600">
                                                    {[
                                                        car.engine && getEngineDisplay(car.engine, engines, locale),
                                                        car.fuel && getFuelDisplay(car.fuel, fuels, locale),
                                                        car.transmission && getTransmissionDisplay(car.transmission, transmissions, locale),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </p>
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold text-gray-600">{tCard("card.dealerPriceLabel")}</p>
                                                    {car.discounted_price != null ? (
                                                        <div className="mt-0.5 flex flex-col gap-0.5">
                                                            <span className="text-sm text-gray-500 line-through">
                                                                {formatPrice(car.price)}
                                                            </span>
                                                            <span className="text-xl font-bold text-[#dc2626]">
                                                                {formatPrice(car.discounted_price)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xl font-bold text-[#dc2626]">
                                                            {formatPrice(car.price)}
                                                        </p>
                                                    )}
                                                    <p className="mt-0.5 text-[10px] text-gray-500">
                                                        {tCard("card.taxNote")}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="mt-auto shrink-0">
                                            <div className="mx-4 mt-0 mb-2 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {car.discounted_price != null ? (
                                                        <span className="block w-fit rounded bg-red-100 px-2 py-1 text-xs font-semibold text-[#b91c1c] ring-1 ring-inset ring-red-200/80">
                                                            {tCard("card.discountBadge")}
                                                        </span>
                                                    ) : null}
                                                    <span className="block w-fit rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                                        {tCard("card.fairDeal")}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {car.carfax_url ? (
                                                        <a
                                                            href={car.carfax_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 hover:border-[#b91c1c] transition-colors"
                                                        >
                                                            {tCard("card.carfax")}
                                                        </a>
                                                    ) : (
                                                        <span className="rounded border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-400 cursor-default">
                                                            {tCard("card.carfax")}
                                                        </span>
                                                    )}
                                                    {car.cargurus_url ? (
                                                        <a
                                                            href={car.cargurus_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 hover:border-[#b91c1c] transition-colors"
                                                        >
                                                            {tCard("card.cargurus")}
                                                        </a>
                                                    ) : (
                                                        <span className="rounded border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-400 cursor-default">
                                                            {tCard("card.cargurus")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/inventory/${car.slug}`}
                                                className="mx-4 mb-4 mt-3 block rounded bg-[#dc2626] py-2 text-center text-sm font-bold text-white hover:bg-[#b91c1c]"
                                            >
                                                {tCard("card.viewDetails")}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isMobile && totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-sm border border-[#b91c1c] bg-[#b91c1c] px-3 py-1.5 text-sm font-bold uppercase text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7f1d1d] hover:border-[#7f1d1d]"
                                >
                                    {t("pagination.previous")}
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    {t("pagination.pageOf", { page, totalPages })}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-sm border border-[#b91c1c] bg-[#b91c1c] px-3 py-1.5 text-sm font-bold uppercase text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7f1d1d] hover:border-[#7f1d1d]"
                                >
                                    {t("pagination.next")}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

