"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Segment = "featured" | "new-arrivals";

type Car = {
    id: string;
    slug: string;
    title: string;
    year: number;
    km: number;
    price: number;
    discounted_price: number | null;
};

const ITEMS_PER_PAGE = 8;

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function InventoryLineup() {
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
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">
                        Inventory Lineup
                    </h2>
                    <div className="flex gap-2 text-[10px] font-bold uppercase">
                        <button
                            type="button"
                            onClick={() => setSegment("featured")}
                            className={
                                segment === "featured"
                                    ? "rounded-sm bg-[#1d4ed8] px-2 py-1 text-white"
                                    : "rounded-sm bg-[#1f1f25] px-2 py-1 text-white hover:bg-[#2d2d35]"
                            }
                        >
                            Featured
                        </button>
                        <button
                            type="button"
                            onClick={() => setSegment("new-arrivals")}
                            className={
                                segment === "new-arrivals"
                                    ? "rounded-sm bg-[#1d4ed8] px-2 py-1 text-white"
                                    : "rounded-sm bg-[#1f1f25] px-2 py-1 text-white hover:bg-[#2d2d35]"
                            }
                        >
                            New Arrivals
                        </button>
                        <Link
                            href="/inventory"
                            className="rounded-sm border border-[#1d4ed8] px-2 py-1 text-[#1d4ed8] hover:bg-[#1d4ed8]/5"
                        >
                            View All
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
                        No vehicles in this section right now.
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
                                            No image
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 text-[11px]">
                                    <h3 className="text-xs font-bold uppercase">
                                        {car.title}
                                    </h3>
                                    <p className="mt-1 text-[10px] text-gray-600">
                                        {car.year} •{" "}
                                        {car.km.toLocaleString()} km
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
                                            Certified
                                        </span>
                                        <span className="font-bold text-[#1f1f25]">
                                            View Details
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
                                Previous
                            </button>
                            <span className="text-sm font-medium text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-sm border border-[#1f1f25] px-3 py-1.5 text-sm font-bold uppercase text-[#1f1f25] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1f1f25] hover:text-white"
                            >
                                Next
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        </section>
    );
}
