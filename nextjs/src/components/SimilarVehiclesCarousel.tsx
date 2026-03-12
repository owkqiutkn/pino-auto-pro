"use client";

import Link from "next/link";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

interface SimilarVehiclesCarouselProps {
    cars: Car[];
    imagesByCar: Map<string, CarImage[]>;
    currentSlug: string;
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function SimilarVehiclesCarousel({ cars, imagesByCar, currentSlug }: SimilarVehiclesCarouselProps) {
    const t = useTranslations("Inventory.carDetail");
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 280;
        scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    if (cars.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                        {t("similarVehicles")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{t("similarVehiclesIntro")}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => scroll("left")}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                        aria-label="Scroll left"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll("right")}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                        aria-label="Scroll right"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-thin"
                style={{ scrollbarWidth: "thin" }}
            >
                {cars
                    .filter((car) => car.slug !== currentSlug)
                    .map((car) => {
                        const images = imagesByCar.get(car.id) || [];
                        const cover = images.find((i) => i.is_cover) || images[0];
                        const price = car.discounted_price ?? car.price;
                        return (
                            <Link
                                key={car.id}
                                href={`/inventory/${car.slug}`}
                                className="group w-64 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-[#1d4ed8] hover:shadow-md"
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
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">No image</div>
                                    )}
                                    <div className="absolute left-2 top-2">
                                        <span className="text-[10px] font-black tracking-wider text-white drop-shadow">ML AUTOS</span>
                                        <div className="h-0.5 w-full bg-[#1d4ed8]" />
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-gray-900">{car.year} {car.brand} {car.model}</h4>
                                    <p className="text-sm text-gray-600">{car.km.toLocaleString()} km</p>
                                    <p className="mt-1 text-lg font-bold text-[#1d4ed8]">{formatPrice(price)}</p>
                                    <span className="mt-2 inline-block w-full rounded bg-[#1d4ed8] py-2 text-center text-sm font-bold text-white">
                                        {t("viewDetails")}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
            </div>
        </div>
    );
}
