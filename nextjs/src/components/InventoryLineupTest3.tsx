"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";
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

type Segment = "featured" | "new-arrivals";

type Car = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    model: string;
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
    /** Preloaded data for the "featured" segment so the client does not need to fetch on mount. */
    initialFeaturedData?: InitialFeaturedData;
};

const DESKTOP_ITEMS_PER_PAGE = 8;
const MOBILE_ITEMS_PER_PAGE = 4;

const PALETTE = {
    charcoal: "#1C1C1E",
    deepAmethyst: "#2A0F3B",
    imperialAubergine: "#1F0C33",
    royalGold: "#D4AF37",
    royalGoldHover: "#B99320",
    creamWhite: "#E5E1D3",
} as const;

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

export default function InventoryLineupTest3({ categories, engines, fuels, transmissions, initialFeaturedData }: LookupProps) {
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

    const activeSegmentClasses =
        "flex-1 md:flex-none rounded-sm px-2 py-1 text-center shadow-sm transition-colors";
    const inactiveSegmentClasses =
        "flex-1 md:flex-none rounded-sm border px-2 py-1 text-center transition-colors";

    return (
        <section
            id="inventory"
            className="py-2 md:py-10"
            style={{
                backgroundColor: PALETTE.creamWhite,
                color: PALETTE.charcoal,
            }}
        >
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-black uppercase" style={{ color: PALETTE.imperialAubergine }}>
                        {t("title")}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase">
                        <button
                            type="button"
                            onClick={() => setSegment("featured")}
                            className={segment === "featured" ? activeSegmentClasses : inactiveSegmentClasses}
                            style={
                                segment === "featured"
                                    ? { backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }
                                    : {
                                          backgroundColor: "rgba(31, 12, 51, 0.08)",
                                          borderColor: "rgba(31, 12, 51, 0.18)",
                                          color: PALETTE.imperialAubergine,
                                      }
                            }
                        >
                            {t("segments.featured")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSegment("new-arrivals")}
                            className={segment === "new-arrivals" ? activeSegmentClasses : inactiveSegmentClasses}
                            style={
                                segment === "new-arrivals"
                                    ? { backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }
                                    : {
                                          backgroundColor: "rgba(31, 12, 51, 0.08)",
                                          borderColor: "rgba(31, 12, 51, 0.18)",
                                          color: PALETTE.imperialAubergine,
                                      }
                            }
                        >
                            {t("segments.newArrivals")}
                        </button>
                        <Link
                            href="/inventory"
                            className={`${inactiveSegmentClasses} hover:opacity-95`}
                            style={{
                                backgroundColor: "rgba(42, 15, 59, 0.06)",
                                borderColor: "rgba(42, 15, 59, 0.16)",
                                color: PALETTE.deepAmethyst,
                            }}
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
                                className="overflow-hidden rounded border shadow-sm"
                                style={{ borderColor: "rgba(31, 12, 51, 0.14)", backgroundColor: "#ffffff" }}
                            >
                                <div className="aspect-[4/3] w-full animate-pulse" style={{ backgroundColor: "rgba(31, 12, 51, 0.08)" }} />
                                <div className="p-4">
                                    <div className="h-4 w-3/4 animate-pulse rounded" style={{ backgroundColor: "rgba(31, 12, 51, 0.10)" }} />
                                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded" style={{ backgroundColor: "rgba(31, 12, 51, 0.08)" }} />
                                    <div className="mt-3 h-3 w-full animate-pulse rounded" style={{ backgroundColor: "rgba(31, 12, 51, 0.08)" }} />
                                    <div className="mt-2 h-6 w-1/3 animate-pulse rounded" style={{ backgroundColor: "rgba(212, 175, 55, 0.18)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : cars.length === 0 ? (
                    <p className="py-8 text-center text-sm" style={{ color: "rgba(229, 225, 211, 0.75)" }}>
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
                                        <div
                                            className="group block overflow-hidden rounded border shadow-sm"
                                            style={{
                                                borderColor: "rgba(31, 12, 51, 0.14)",
                                                backgroundColor: "#ffffff",
                                            }}
                                        >
                                            <Link href={`/inventory/${car.slug}`} className="block">
                                                <div
                                                    className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden"
                                                    style={{ backgroundColor: "rgba(31, 12, 51, 0.06)" }}
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
                                                        <div className="flex h-full w-full items-center justify-center" style={{ color: "rgba(31, 12, 51, 0.45)" }}>
                                                            {tCard("card.noImage")}
                                                        </div>
                                                    )}
                                                    <div
                                                        className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[8px] font-bold"
                                                        style={{ backgroundColor: PALETTE.imperialAubergine, color: "#ffffff", border: "1px solid rgba(212, 175, 55, 0.35)" }}
                                                    >
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
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                                                style={{
                                                                    backgroundColor: PALETTE.royalGold,
                                                                    color: PALETTE.charcoal,
                                                                    border: "1px solid rgba(229, 225, 211, 0.55)",
                                                                }}
                                                            >
                                                                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
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
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                                                style={{
                                                                    backgroundColor: PALETTE.royalGold,
                                                                    color: PALETTE.charcoal,
                                                                    border: "1px solid rgba(229, 225, 211, 0.55)",
                                                                }}
                                                            >
                                                                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
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
                                                <div className="flex flex-col p-3" style={{ color: PALETTE.charcoal }}>
                                                    <h2 className="text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {car.year} {car.brand} {car.model}
                                                    </h2>
                                                    <p className="mt-0.5 text-xs" style={{ color: "rgba(28, 28, 30, 0.7)" }}>
                                                        {getCategoryDisplay(car.category, categories, locale) ?? tCard("card.fallbackBodyStyle")}{" "}
                                                        {car.model} {car.km.toLocaleString()} km
                                                    </p>
                                                    <p className="mt-2 min-h-[1rem] text-[11px]" style={{ color: "rgba(28, 28, 30, 0.68)" }}>
                                                        {[
                                                            car.engine && getEngineDisplay(car.engine, engines, locale),
                                                            car.fuel && getFuelDisplay(car.fuel, fuels, locale),
                                                            car.transmission && getTransmissionDisplay(car.transmission, transmissions, locale),
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" • ")}
                                                    </p>
                                                    <div className="mt-2">
                                                        <p className="text-xs font-semibold" style={{ color: "rgba(28, 28, 30, 0.7)" }}>
                                                            {tCard("card.dealerPriceLabel")}
                                                        </p>
                                                        {car.discounted_price != null ? (
                                                            <p>
                                                                <span className="text-sm line-through" style={{ color: "rgba(28, 28, 30, 0.45)" }}>
                                                                    {formatPrice(car.price)}
                                                                </span>
                                                                <span className="ml-2 text-xl font-bold" style={{ color: PALETTE.royalGold }}>
                                                                    {formatPrice(car.discounted_price)}
                                                                </span>
                                                            </p>
                                                        ) : (
                                                            <p className="text-xl font-bold" style={{ color: PALETTE.royalGold }}>
                                                                {formatPrice(car.price)}
                                                            </p>
                                                        )}
                                                        <p className="mt-0.5 text-[10px]" style={{ color: "rgba(28, 28, 30, 0.5)" }}>
                                                            {tCard("card.taxNote")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="mx-4 mt-0 mb-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className="block w-fit rounded px-2 py-1 text-xs font-medium"
                                                        style={{ backgroundColor: "rgba(212, 175, 55, 0.22)", color: PALETTE.charcoal, border: "1px solid rgba(212, 175, 55, 0.30)" }}
                                                    >
                                                        {tCard("card.fairDeal")}
                                                    </span>
                                                    {car.carfax_url ? (
                                                        <a
                                                            href={car.carfax_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-95"
                                                            style={{ borderColor: "rgba(31, 12, 51, 0.18)", color: "rgba(31, 12, 51, 0.85)" }}
                                                        >
                                                            {tCard("card.carfax")}
                                                        </a>
                                                    ) : (
                                                        <span className="rounded border px-2.5 py-1 text-[11px] font-medium cursor-default" style={{ borderColor: "rgba(31, 12, 51, 0.14)", color: "rgba(31, 12, 51, 0.35)" }}>
                                                            {tCard("card.carfax")}
                                                        </span>
                                                    )}
                                                    {car.cargurus_url ? (
                                                        <a
                                                            href={car.cargurus_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-95"
                                                            style={{ borderColor: "rgba(31, 12, 51, 0.18)", color: "rgba(31, 12, 51, 0.85)" }}
                                                        >
                                                            {tCard("card.cargurus")}
                                                        </a>
                                                    ) : (
                                                        <span className="rounded border px-2.5 py-1 text-[11px] font-medium cursor-default" style={{ borderColor: "rgba(31, 12, 51, 0.14)", color: "rgba(31, 12, 51, 0.35)" }}>
                                                            {tCard("card.cargurus")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/inventory/${car.slug}`}
                                                className="mx-4 mb-4 mt-3 block rounded py-2 text-center text-sm font-bold transition-colors"
                                                style={{ backgroundColor: PALETTE.imperialAubergine, color: "#ffffff", border: "1px solid rgba(212, 175, 55, 0.28)" }}
                                            >
                                                {tCard("card.viewDetails")}
                                            </Link>
                                        </div>
                                    );
                                })()}
                                {cars.length > 1 && (
                                    <div className="mt-2 text-center text-[11px]" style={{ color: "rgba(28, 28, 30, 0.6)" }}>
                                        {mobileIndex + 1} / {cars.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {paginatedCars.map((car) => (
                                    <div
                                        key={car.id}
                                        className="group block overflow-hidden rounded border shadow-sm transition-all duration-300 ease-out hover:-translate-y-1"
                                        style={{
                                            borderColor: "rgba(31, 12, 51, 0.14)",
                                            backgroundColor: "#ffffff",
                                        }}
                                    >
                                        <Link href={`/inventory/${car.slug}`} className="block">
                                            <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: "rgba(31, 12, 51, 0.06)" }}>
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
                                                    <div className="flex h-full w-full items-center justifycenter" style={{ color: "rgba(31, 12, 51, 0.45)" }}>
                                                        {tCard("card.noImage")}
                                                    </div>
                                                )}
                                                <div
                                                    className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[8px] font-bold"
                                                    style={{ backgroundColor: PALETTE.imperialAubergine, color: "#ffffff", border: "1px solid rgba(212, 175, 55, 0.35)" }}
                                                >
                                                    PAP
                                                </div>
                                            </div>
                                            <div className="flex flex-col p-4" style={{ color: PALETTE.charcoal }}>
                                                <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {car.year} {car.brand} {car.model}
                                                </h2>
                                                <p className="mt-0.5 text-sm" style={{ color: "rgba(28, 28, 30, 0.7)" }}>
                                                    {getCategoryDisplay(car.category, categories, locale) ?? tCard("card.fallbackBodyStyle")}{" "}
                                                    {car.model} {car.km.toLocaleString()} km
                                                </p>
                                                <p className="mt-3 min-h-[1rem] text-xs" style={{ color: "rgba(28, 28, 30, 0.68)" }}>
                                                    {[
                                                        car.engine && getEngineDisplay(car.engine, engines, locale),
                                                        car.fuel && getFuelDisplay(car.fuel, fuels, locale),
                                                        car.transmission && getTransmissionDisplay(car.transmission, transmissions, locale),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </p>
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold" style={{ color: "rgba(28, 28, 30, 0.7)" }}>
                                                        {tCard("card.dealerPriceLabel")}
                                                    </p>
                                                    {car.discounted_price != null ? (
                                                        <p>
                                                            <span className="text-sm line-through" style={{ color: "rgba(28, 28, 30, 0.45)" }}>
                                                                {formatPrice(car.price)}
                                                            </span>
                                                            <span className="ml-2 text-xl font-bold" style={{ color: PALETTE.royalGold }}>
                                                                {formatPrice(car.discounted_price)}
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-xl font-bold" style={{ color: PALETTE.royalGold }}>
                                                            {formatPrice(car.price)}
                                                        </p>
                                                    )}
                                                    <p className="mt-0.5 text-[10px]" style={{ color: "rgba(28, 28, 30, 0.5)" }}>
                                                        {tCard("card.taxNote")}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="mx-4 mt-0 mb-2 space-y-2">
                                            <span
                                                className="block w-fit rounded px-2 py-1 text-xs font-medium"
                                                style={{ backgroundColor: "rgba(212, 175, 55, 0.22)", color: PALETTE.charcoal, border: "1px solid rgba(212, 175, 55, 0.30)" }}
                                            >
                                                {tCard("card.fairDeal")}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {car.carfax_url ? (
                                                    <a
                                                        href={car.carfax_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-95"
                                                        style={{ borderColor: "rgba(31, 12, 51, 0.18)", color: "rgba(31, 12, 51, 0.85)" }}
                                                    >
                                                        {tCard("card.carfax")}
                                                    </a>
                                                ) : (
                                                    <span className="rounded border px-2.5 py-1 text-[11px] font-medium cursor-default" style={{ borderColor: "rgba(31, 12, 51, 0.14)", color: "rgba(31, 12, 51, 0.35)" }}>
                                                        {tCard("card.carfax")}
                                                    </span>
                                                )}
                                                {car.cargurus_url ? (
                                                    <a
                                                        href={car.cargurus_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-95"
                                                        style={{ borderColor: "rgba(31, 12, 51, 0.18)", color: "rgba(31, 12, 51, 0.85)" }}
                                                    >
                                                        {tCard("card.cargurus")}
                                                    </a>
                                                ) : (
                                                    <span className="rounded border px-2.5 py-1 text-[11px] font-medium cursor-default" style={{ borderColor: "rgba(31, 12, 51, 0.14)", color: "rgba(31, 12, 51, 0.35)" }}>
                                                        {tCard("card.cargurus")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/inventory/${car.slug}`}
                                            className="mx-4 mb-4 mt-3 block rounded py-2 text-center text-sm font-bold transition-colors"
                                            style={{ backgroundColor: PALETTE.imperialAubergine, color: "#ffffff", border: "1px solid rgba(212, 175, 55, 0.28)" }}
                                        >
                                            {tCard("card.viewDetails")}
                                        </Link>
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
                                    className="rounded-sm border px-3 py-1.5 text-sm font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    style={{
                                        borderColor: "rgba(212, 175, 55, 0.35)",
                                        backgroundColor: PALETTE.royalGold,
                                        color: PALETTE.charcoal,
                                    }}
                                >
                                    {t("pagination.previous")}
                                </button>
                                <span className="text-sm font-medium" style={{ color: "rgba(229, 225, 211, 0.75)" }}>
                                    {t("pagination.pageOf", { page, totalPages })}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-sm border px-3 py-1.5 text-sm font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    style={{
                                        borderColor: "rgba(212, 175, 55, 0.35)",
                                        backgroundColor: PALETTE.royalGold,
                                        color: PALETTE.charcoal,
                                    }}
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

