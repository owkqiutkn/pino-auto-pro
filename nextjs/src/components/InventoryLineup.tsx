"use client";

import { useEffect, useState } from "react";

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
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";
import type { Database } from "@/lib/types";

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

type LookupProps = {
    categories: Category[];
    engines: Engine[];
    fuels: Fuel[];
    transmissions: Transmission[];
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

export default function InventoryLineup({ categories, engines, fuels, transmissions }: LookupProps) {
    const t = useTranslations("NewLanding.inventorySection");
    const tCard = useTranslations("Inventory.page");
    const locale = useLocale();
    const isMobile = useIsMobile();
    const [segment, setSegment] = useState<Segment>("featured");
    const [page, setPage] = useState(1);
    const [cars, setCars] = useState<Car[]>([]);
    const [coverImageByCarId, setCoverImageByCarId] = useState<
        Record<string, string>
    >({});
    const [loading, setLoading] = useState(true);

    const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : DESKTOP_ITEMS_PER_PAGE;
    const totalPages = Math.ceil(cars.length / itemsPerPage);
    const paginatedCars = cars.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    useEffect(() => {
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
    }, [segment]);

    useEffect(() => {
        setPage(1);
    }, [segment]);

    useEffect(() => {
        setPage(1);
    }, [itemsPerPage]);

    return (
        <section id="inventory" className="bg-[#f2f2f3] py-10 text-black">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-black uppercase">
                        {t("title")}
                    </h2>
                    <div className="flex w-full flex-col gap-2 text-[10px] font-bold uppercase md:w-auto md:flex-row">
                        <button
                            type="button"
                            onClick={() => setSegment("featured")}
                            className={
                                segment === "featured"
                                    ? "w-full rounded-sm bg-[#1d4ed8] px-2 py-1 text-center text-white md:w-auto"
                                    : "w-full rounded-sm bg-[#1f1f25] px-2 py-1 text-center text-white hover:bg-[#2d2d35] md:w-auto"
                            }
                            >
                            {t("segments.featured")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSegment("new-arrivals")}
                            className={
                                segment === "new-arrivals"
                                    ? "w-full rounded-sm bg-[#1d4ed8] px-2 py-1 text-center text-white md:w-auto"
                                    : "w-full rounded-sm bg-[#1f1f25] px-2 py-1 text-center text-white hover:bg-[#2d2d35] md:w-auto"
                            }
                            >
                            {t("segments.newArrivals")}
                        </button>
                        <Link
                            href="/inventory"
                            className="w-full rounded-sm border border-[#1d4ed8] px-2 py-1 text-center text-[#1d4ed8] hover:bg-[#1d4ed8]/5 md:w-auto"
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {paginatedCars.map((car) => (
                            <div
                                key={car.id}
                                className="group block overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1d4ed8] hover:shadow-lg"
                            >
                                <Link href={`/inventory/${car.slug}`} className="block">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        {coverImageByCarId[car.id] ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={coverImageByCarId[car.id]}
                                                alt={car.title}
                                                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                {tCard("card.noImage")}
                                            </div>
                                        )}
                                        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1320] text-[8px] font-bold text-white">
                                            PAP
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-4">
                                        <h2 className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                            {car.year} {car.brand} {car.model}
                                        </h2>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            {getCategoryDisplay(car.category, categories, locale) ?? tCard("card.fallbackBodyStyle")} {car.model} {car.km.toLocaleString()} km
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
                                                <p>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatPrice(car.price)}
                                                    </span>
                                                    <span className="ml-2 text-xl font-bold text-[#1d4ed8]">
                                                        {formatPrice(car.discounted_price)}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-xl font-bold text-[#1d4ed8]">
                                                    {formatPrice(car.price)}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-[10px] text-gray-500">
                                                {tCard("card.taxNote")}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="mx-4 mt-0 mb-2 space-y-2">
                                    <span className="block w-fit rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                        {tCard("card.fairDeal")}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {car.carfax_url ? (
                                            <a
                                                href={car.carfax_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 hover:border-[#1d4ed8] transition-colors"
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
                                                className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 hover:border-[#1d4ed8] transition-colors"
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
                                    className="mx-4 mb-4 mt-3 block rounded bg-[#0c1320] py-2 text-center text-sm font-bold text-white hover:bg-gray-800"
                                >
                                    {tCard("card.viewDetails")}
                                </Link>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-sm border border-[#1f1f25] px-3 py-1.5 text-sm font-bold uppercase text-[#1f1f25] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1f1f25] hover:text-white"
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
                                className="rounded-sm border border-[#1f1f25] px-3 py-1.5 text-sm font-bold uppercase text-[#1f1f25] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1f1f25] hover:text-white"
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
