"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { getTransformedStorageUrl } from "@/lib/storage";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function PriceDisplay({ car }: { car: Car }) {
    if (car.discounted_price !== null) {
        return (
            <span>
                <span className="font-semibold text-primary-700">{formatPrice(car.discounted_price)}</span>{" "}
                <span className="text-xs text-gray-500 line-through">{formatPrice(car.price)}</span>
            </span>
        );
    }
    return <span>{formatPrice(car.price)}</span>;
}

function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error && err.message) {
        return err.message;
    }
    if (err && typeof err === "object") {
        const maybe = err as {
            message?: unknown;
            code?: unknown;
            details?: unknown;
            hint?: unknown;
        };
        if (maybe.code === "42P01") {
            return "Cars table is missing. Run Supabase migrations and reload.";
        }
        const base = typeof maybe.message === "string" && maybe.message.length > 0 ? maybe.message : fallback;
        const details = [maybe.code, maybe.details, maybe.hint]
            .filter((part): part is string => typeof part === "string" && part.length > 0)
            .join(" | ");
        return details ? `${base} (${details})` : base;
    }
    return fallback;
}

type CarsListPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function CarsListPage({ searchParams }: CarsListPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const [cars, setCars] = useState<Car[]>([]);
    const [coverByCar, setCoverByCar] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCars = async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data, error: carsError } = await client.getAllCars();
            if (carsError) throw carsError;
            const allCars = data || [];
            setCars(allCars);

            const { data: images } = await client.getCarImagesForCars(allCars.map((car) => car.id));
            const map: Record<string, string> = {};
            (images as CarImage[] | null)?.forEach((img) => {
                if (!map[img.car_id] || img.is_cover) {
                    map[img.car_id] = img.image_url;
                }
            });
            setCoverByCar(map);
            setError("");
        } catch (err: unknown) {
            console.error("Load cars failed:", err);
            setError(getErrorMessage(err, "Failed to load cars."));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this car?")) return;
        try {
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteCar(id);
            if (deleteError) throw deleteError;
            await loadCars();
        } catch (err: unknown) {
            console.error("Delete car failed:", err);
            setError(getErrorMessage(err, "Failed to delete car."));
        }
    };

    useEffect(() => {
        loadCars();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Cars</h1>
                <Link href="/app/cars/new" className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Car
                </Link>
            </div>
            {error && <p className="text-red-600">{error}</p>}

            {!error && cars.length === 0 ? (
                <div className="border rounded-lg bg-white p-8 text-center">
                    <p className="font-medium text-gray-800">No cars yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first vehicle to start managing inventory.</p>
                    <Link
                        href="/app/cars/new"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 mt-4"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Car
                    </Link>
                </div>
            ) : (
            <div className="overflow-x-auto border rounded-lg bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left p-3">Image</th>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Price</th>
                        <th className="text-left p-3">Year</th>
                        <th className="text-left p-3">KM</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cars.map((car) => (
                        <tr key={car.id} className="border-t">
                            <td className="p-3">
                                <div className="relative w-16 h-12 rounded bg-gray-100 overflow-hidden">
                                    {coverByCar[car.id] ? (
                                        <Image
                                            src={getTransformedStorageUrl(coverByCar[car.id])}
                                            alt={car.title}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                            unoptimized
                                        />
                                    ) : null}
                                </div>
                            </td>
                            <td className="p-3">{car.title}</td>
                            <td className="p-3"><PriceDisplay car={car} /></td>
                            <td className="p-3">{car.year}</td>
                            <td className="p-3">{car.km.toLocaleString()}</td>
                            <td className="p-3 capitalize">{car.status}</td>
                            <td className="p-3">
                                <div className="inline-flex items-center gap-2">
                                    <Link href={`/app/cars/${car.id}/edit`} title="Edit" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(car.id)} title="Delete" className="text-red-600 hover:text-red-700 inline-flex items-center">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
}
