import Link from "next/link";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

interface InventoryPageProps {
    searchParams: Promise<{
        brand?: string;
        body_type?: string;
        model?: string;
        year?: string;
        km?: string;
        price?: string;
    }>;
}

function toNumber(value?: string) {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

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
            <p className="mt-1">
                <span className="text-primary-700 font-semibold">{formatPrice(car.discounted_price)}</span>{" "}
                <span className="text-sm text-gray-500 line-through">{formatPrice(car.price)}</span>
            </p>
        );
    }
    return <p className="text-primary-700 font-semibold mt-1">{formatPrice(car.price)}</p>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const params = await searchParams;
    const brand = params.brand?.trim() || undefined;
    const bodyType = params.body_type?.trim() || undefined;
    const model = params.model?.trim() || undefined;
    const year = toNumber(params.year);
    const kmMax = toNumber(params.km);
    const priceMax = toNumber(params.price);

    const client = await createSSRSassClient();
    const { data: cars, error } = await client.getAvailableCars({
        brand,
        bodyType,
        model,
        year,
        kmMax,
        priceMax,
    });

    if (error) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold">Inventory</h1>
                <p className="mt-6 text-red-600">Failed to load vehicles.</p>
            </div>
        );
    }

    const carsList = (cars ?? []) as Car[];
    const carIds = carsList.map((car) => car.id);
    const { data: allImages } = await client.getCarImagesForCars(carIds);
    const allImagesList = (allImages ?? []) as CarImage[];
    const imagesByCar = new Map<string, CarImage[]>();
    for (const image of allImagesList) {
        const bucket = imagesByCar.get(image.car_id) || [];
        bucket.push(image);
        imagesByCar.set(image.car_id, bucket);
    }

    const brands = Array.from(new Set(carsList.map((car) => car.brand))).sort();

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">Vehicle Inventory</h1>
                <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
                    Back to home
                </Link>
            </div>

            <form className="mt-6 grid md:grid-cols-4 gap-3 p-4 bg-white border rounded-lg">
                <select name="brand" defaultValue={brand || ""} className="border rounded-md px-3 py-2">
                    <option value="">All brands</option>
                    {brands.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <input
                    name="year"
                    type="number"
                    defaultValue={year}
                    placeholder="Year (exact)"
                    className="border rounded-md px-3 py-2"
                />
                <input
                    name="km"
                    type="number"
                    defaultValue={kmMax}
                    placeholder="Max km"
                    className="border rounded-md px-3 py-2"
                />
                <input
                    name="price"
                    type="number"
                    defaultValue={priceMax}
                    placeholder="Max price"
                    className="border rounded-md px-3 py-2"
                />
                <div className="md:col-span-4 flex gap-3">
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
                    >
                        Apply filters
                    </button>
                    <Link
                        href="/inventory"
                        className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                        Reset
                    </Link>
                </div>
            </form>

            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carsList.map((car) => {
                    const images = imagesByCar.get(car.id) || [];
                    const cover = images.find((item) => item.is_cover) || images[0];
                    return (
                        <Link
                            key={car.id}
                            href={`/inventory/${car.slug}`}
                            className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-[4/3] bg-gray-100">
                                {cover ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={cover.image_url} alt={car.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h2 className="font-semibold text-lg">{car.title}</h2>
                                <PriceDisplay car={car} />
                                <p className="mt-2 text-sm text-gray-600">
                                    {car.year} • {car.km.toLocaleString()} km
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {carsList.length === 0 && (
                <div className="mt-10 text-center text-gray-500">No vehicles match your filters.</div>
            )}
        </div>
    );
}
