"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

const CARDS_PER_PAGE = 4;
const BRAND_BLUE = "#1d4ed8";
const DARK_BUTTON = "#1f2937";

interface SimilarVehiclesCarouselProps {
    cars: Car[];
    imagesByCar: Map<string, CarImage[]>;
    currentSlug: string;
    businessName?: string | null;
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function SimilarVehiclesCarousel({
    cars,
    imagesByCar,
    currentSlug,
    businessName = "Pino Auto Pro",
}: SimilarVehiclesCarouselProps) {
    const t = useTranslations("Inventory.carDetail");
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
                    <h3 className="text-lg font-bold" style={{ color: BRAND_BLUE }}>
                        {t("similarVehicles")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{t("similarVehiclesIntro")}</p>
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
                        {t("seeAllVehicles")}
                    </Link>
                </div>
            </div>
            <div className="overflow-hidden">
                {filteredCars.length === 0 ? (
                    <div className="flex min-w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                        <p className="text-sm text-gray-500">{t("noSimilarVehicles")}</p>
                        <Link href="/inventory" className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">
                            {t("seeAllVehicles")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {visibleCars.map((car) => {
                            const images = imagesByCar.get(car.id) || [];
                            const cover = images.find((i) => i.is_cover) || images[0];
                            const finalPrice = car.discounted_price ?? car.price;
                            const hasDiscount = car.discounted_price != null;
                            return (
                                <Link
                                    key={car.id}
                                    href={`/inventory/${car.slug}`}
                                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        {cover ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={cover.image_url}
                                                alt={car.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                {t("noImage")}
                                            </div>
                                        )}
                                        <div className="absolute left-2 top-2">
                                            <span className="text-[10px] font-black tracking-wider text-white drop-shadow-md">
                                                {businessName}
                                            </span>
                                            <div className="mt-0.5 h-0.5 w-full bg-white/60" />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-gray-900">
                                            {car.year} {car.brand} {car.model}
                                        </h4>
                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/icons/odometer.png" alt="" className="h-4 w-4 flex-shrink-0 opacity-70" aria-hidden />
                                            <span>{car.km.toLocaleString()} km</span>
                                        </p>
                                        <div className="mt-2">
                                            <span className="text-xs text-gray-500">{t("dealerPrice")}: </span>
                                            {hasDiscount ? (
                                                <span className="text-sm text-gray-500 line-through">
                                                    {formatPrice(car.price)}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-lg font-bold" style={{ color: BRAND_BLUE }}>
                                            {formatPrice(finalPrice)}
                                        </p>
                                        <p className="text-xs text-gray-500">{t("hstAndLicensing")}</p>
                                        <span
                                            className="mt-3 inline-block w-full rounded py-2.5 text-center text-sm font-bold text-white"
                                            style={{ backgroundColor: DARK_BUTTON }}
                                        >
                                            {t("makeItYours")}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
