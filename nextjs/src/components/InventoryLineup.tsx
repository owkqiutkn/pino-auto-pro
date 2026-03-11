"use client";

import { useEffect, useState } from "react";
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
};

type LookupProps = {
    categories: Category[];
    engines: Engine[];
    fuels: Fuel[];
    transmissions: Transmission[];
};

const ITEMS_PER_PAGE = 8;

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function getEngineDisplay(engineValue: string | null, engines: Engine[], locale: string): string | null {
    if (!engineValue) return null;
    const engine = engines.find((e) => (e.name_en ?? e.name) === engineValue || e.name === engineValue);
    return engine ? getLocalizedEngineName(engine, locale) : engineValue;
}

function getFuelDisplay(fuelValue: string | null, fuels: Fuel[], locale: string): string | null {
    if (!fuelValue) return null;
    const fuel = fuels.find((f) => (f.name_en ?? f.name) === fuelValue || f.name === fuelValue);
    return fuel ? getLocalizedFuelName(fuel, locale) : fuelValue;
}

function getCategoryDisplay(categoryValue: string | null, categories: Category[], locale: string): string | null {
    if (!categoryValue) return null;
    const category = categories.find(
        (c) => c.name_en === categoryValue || c.name_fr === categoryValue || c.name === categoryValue
    );
    return category ? getLocalizedCategoryName(category, locale) : categoryValue;
}

function getTransmissionDisplay(transmissionValue: string | null, transmissions: Transmission[], locale: string): string | null {
    if (!transmissionValue) return null;
    const transmission = transmissions.find(
        (tr) => (tr.name_en ?? tr.name) === transmissionValue || tr.name_fr === transmissionValue || tr.name === transmissionValue
    );
    return transmission ? getLocalizedTransmissionName(transmission, locale) : transmissionValue;
}

export default function InventoryLineup({ categories, engines, fuels, transmissions }: LookupProps) {
    const t = useTranslations("NewLanding.inventorySection");
    const locale = useLocale();
    const [segment, setSegment] = useState<Segment>("featured");
    const [page, setPage] = useState(1);
    const [cars, setCars] = useState<Car[]>([]);
    const [coverImageByCarId, setCoverImageByCarId] = useState<
        Record<string, string>
    >({});
    const [loading, setLoading] = useState(true);

    const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE);
    const paginatedCars = cars.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-sm border bg-white shadow-sm"
                            >
                                <div className="h-32 w-full animate-pulse bg-gray-200" />
                                <div className="p-3">
                                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                                    <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-gray-200" />
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {paginatedCars.map((car) => (
                            <Link
                                key={car.id}
                                href={`/inventory/${car.slug}`}
                                className="overflow-hidden rounded-sm border bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="h-32 w-full bg-gray-100">
                                    {coverImageByCarId[car.id] ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={coverImageByCarId[car.id]}
                                            alt={car.title}
                                            className="h-32 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-32 w-full items-center justify-center text-gray-400 text-xs">
                                            {/* Intentionally left as plain text; can be localized if you expose it often */}
                                            No image
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 text-[11px]">
                                    <h3 className="text-xs font-bold uppercase">
                                        {car.year} {car.brand} {car.model}
                                    </h3>
                                    <p
                                        className="mt-1 text-[10px] text-gray-600"
                                        data-inspector="DOM Path: div.bg-[#0c1320] text-white > section#inventory > div.mx-auto.max-w-6xl.px-4 > div.grid > a > div.p-3 > p.mt-1 • Position: top=135px, left=284px, width=213px, height=15px • React Component: LinkComponent"
                                    >
                                        {[
                                            getCategoryDisplay(car.category, categories, locale) ?? "—",
                                            `${car.km.toLocaleString()} km`,
                                            car.engine && getEngineDisplay(car.engine, engines, locale),
                                            car.fuel && getFuelDisplay(car.fuel, fuels, locale),
                                            car.transmission && getTransmissionDisplay(car.transmission, transmissions, locale),
                                        ]
                                            .filter((x): x is string => !!x)
                                            .join(" • ")}
                                    </p>
                                    <p className="mt-2 text-sm font-black text-[#1d4ed8]">
                                        {car.discounted_price != null
                                            ? formatPrice(car.discounted_price)
                                            : formatPrice(car.price)}
                                        {car.discounted_price != null && (
                                            <span className="ml-1 text-xs font-normal text-gray-500 line-through">
                                                {formatPrice(car.price)}
                                            </span>
                                        )}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-[10px]">
                                        <span className="rounded bg-gray-100 px-2 py-1">
                                            {t("badges.certified")}
                                        </span>
                                        <span className="font-bold text-[#1f1f25]">
                                            {t("badges.viewDetails")}
                                        </span>
                                    </div>
                                </div>
                            </Link>
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
