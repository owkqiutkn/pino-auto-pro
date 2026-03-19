"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Database } from "@/lib/types";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";
import { getTransformedStorageUrl } from "@/lib/storage";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

const CARDS_PER_PAGE = 4;
const BRAND_ACCENT = "#dc2626";

interface SimilarVehiclesCarouselProps {
    cars: Car[];
    imagesByCar: Map<string, CarImage[]>;
    currentSlug: string;
    categories: Category[];
    engines: Engine[];
    fuels: Fuel[];
    transmissions: Transmission[];
    locale: string;
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

function getEngineDisplay(engineValue: string | null | undefined, engines: Engine[], locale: string): string | null {
    if (!engineValue) return null;
    const engine = engines.find((e) => (e.name_en ?? e.name) === engineValue || e.name_es === engineValue || e.name === engineValue);
    return engine ? getLocalizedEngineName(engine, locale) : engineValue;
}

function getFuelDisplay(fuelValue: string | null | undefined, fuels: Fuel[], locale: string): string | null {
    if (!fuelValue) return null;
    const fuel = fuels.find((f) => (f.name_en ?? f.name) === fuelValue || f.name_es === fuelValue || f.name === fuelValue);
    return fuel ? getLocalizedFuelName(fuel, locale) : fuelValue;
}

function getCategoryDisplay(categoryValue: string | null | undefined, categories: Category[], locale: string): string | null {
    if (!categoryValue) return null;
    const category = categories.find(
        (c) => c.name_en === categoryValue || c.name_es === categoryValue || c.name_fr === categoryValue || c.name === categoryValue
    );
    return category ? getLocalizedCategoryName(category, locale) : categoryValue;
}

function getTransmissionDisplay(
    transmissionValue: string | null | undefined,
    transmissions: Transmission[],
    locale: string
): string | null {
    if (!transmissionValue) return null;
    const transmission = transmissions.find(
        (tr) => (tr.name_en ?? tr.name) === transmissionValue || tr.name_es === transmissionValue || tr.name_fr === transmissionValue || tr.name === transmissionValue
    );
    return transmission ? getLocalizedTransmissionName(transmission, locale) : transmissionValue;
}

export default function SimilarVehiclesCarousel({
    cars,
    imagesByCar,
    currentSlug,
    categories,
    engines,
    fuels,
    transmissions,
    locale,
}: SimilarVehiclesCarouselProps) {
    const tDetail = useTranslations("Inventory.carDetail");
    const tPage = useTranslations("Inventory.page");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredCars = cars.filter((car) => car.slug !== currentSlug);
    const totalPages = Math.max(1, Math.ceil(filteredCars.length / CARDS_PER_PAGE));
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const visibleCars = filteredCars.slice(startIndex, startIndex + CARDS_PER_PAGE);

    const goToPage = (dir: "left" | "right") => {
        setCurrentPage((p) => Math.max(1, Math.min(totalPages, dir === "left" ? p - 1 : p + 1)));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-bold" style={{ color: BRAND_ACCENT }}>
                        {tDetail("similarVehicles")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{tDetail("similarVehiclesIntro")}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            {currentPage}/{totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => goToPage("left")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            aria-label="Previous page"
                            disabled={currentPage <= 1}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icons/chevron-left.png" alt="" className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                            type="button"
                            onClick={() => goToPage("right")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            aria-label="Next page"
                            disabled={currentPage >= totalPages}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icons/chevron-right.png" alt="" className="h-4 w-4" aria-hidden />
                        </button>
                    </div>
                    <Link
                        href="/inventory"
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
                    >
                        {tDetail("seeAllVehicles")}
                    </Link>
                </div>
            </div>
            <div className="overflow-hidden">
                {filteredCars.length === 0 ? (
                    <div className="flex min-w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                        <p className="text-sm text-gray-500">{tDetail("noSimilarVehicles")}</p>
                        <Link href="/inventory" className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">
                            {tDetail("seeAllVehicles")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleCars.map((car) => {
                            const images = imagesByCar.get(car.id) || [];
                            const cover = images.find((i) => i.is_cover) || images[0];
                            return (
                                <div
                                    key={car.id}
                                    className="group block overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#b91c1c] hover:shadow-lg"
                                >
                                    <Link href={`/inventory/${car.slug}`} className="block">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            {cover ? (
                                                <Image
                                                    src={getTransformedStorageUrl(cover.image_url)}
                                                    alt={car.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 400px"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                    {tPage("card.noImage")}
                                                </div>
                                            )}
                                            <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#b91c1c] text-[8px] font-bold text-white">
                                                PAP
                                            </div>
                                        </div>
                                        <div className="flex flex-col p-4">
                                            <h2 className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {car.year} {car.brand} {car.model}
                                            </h2>
                                            <p className="mt-0.5 text-sm text-gray-600">
                                                {getCategoryDisplay(car.category, categories, locale) ?? tPage("card.fallbackBodyStyle")} {car.model}{" "}
                                                {car.km.toLocaleString()} km
                                            </p>
                                            <p className="mt-3 min-h-[1rem] text-xs text-gray-600">
                                                {[car.engine && getEngineDisplay(car.engine, engines, locale), car.fuel && getFuelDisplay(car.fuel, fuels, locale), car.transmission && getTransmissionDisplay(car.transmission, transmissions, locale)]
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </p>
                                            <div className="mt-2">
                                                <p className="text-xs font-semibold text-gray-600">{tPage("card.dealerPriceLabel")}</p>
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
                                                <p className="mt-0.5 text-[10px] text-gray-500">{tPage("card.taxNote")}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="mx-4 mt-0 mb-2 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {car.discounted_price != null ? (
                                                <span className="block w-fit rounded bg-red-100 px-2 py-1 text-xs font-semibold text-[#b91c1c] ring-1 ring-inset ring-red-200/80">
                                                    {tPage("card.discountBadge")}
                                                </span>
                                            ) : null}
                                            <span className="block w-fit rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                                {tPage("card.fairDeal")}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {car.carfax_url ? (
                                                <a
                                                    href={car.carfax_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:border-[#b91c1c] hover:bg-gray-50"
                                                >
                                                    {tPage("card.carfax")}
                                                </a>
                                            ) : (
                                                <span className="cursor-default rounded border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-400">
                                                    {tPage("card.carfax")}
                                                </span>
                                            )}
                                            {car.cargurus_url ? (
                                                <a
                                                    href={car.cargurus_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:border-[#b91c1c] hover:bg-gray-50"
                                                >
                                                    {tPage("card.cargurus")}
                                                </a>
                                            ) : (
                                                <span className="cursor-default rounded border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-400">
                                                    {tPage("card.cargurus")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/inventory/${car.slug}`}
                                        className="mx-4 mb-4 mt-3 block rounded bg-[#dc2626] py-2 text-center text-sm font-bold text-white hover:bg-[#b91c1c]"
                                    >
                                        {tPage("card.viewDetails")}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
