import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

interface CarPageProps {
    params: Promise<{ slug: string }>;
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
            <p className="mt-2 text-2xl font-semibold">
                <span className="text-primary-700">{formatPrice(car.discounted_price)}</span>{" "}
                <span className="text-lg text-gray-500 line-through">{formatPrice(car.price)}</span>
            </p>
        );
    }
    return <p className="mt-2 text-primary-700 text-2xl font-semibold">{formatPrice(car.price)}</p>;
}

async function getAvailableCarWithImages(slug: string) {
    const client = await createSSRSassClient();
    const { data: car, error } = await client.getAvailableCarBySlug(slug);
    if (error || !car) {
        return { car: null, images: [] as CarImage[] };
    }
    const { data: images = [] } = await client.getCarImages(car.id);
    return { car: car as Car, images: images as CarImage[] };
}

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
    const { slug } = await params;
    const { car, images } = await getAvailableCarWithImages(slug);
    if (!car) {
        return {
            title: "Vehicle Not Found",
            description: "This vehicle is not available.",
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const cover = images.find((img) => img.is_cover) || images[0];
    const title = `${car.year} ${car.brand} ${car.model} | Dealer Name`;
    const description =
        `Used ${car.year} ${car.brand} ${car.model} with ${car.km.toLocaleString()} km available now.`;
    const canonicalUrl = `${siteUrl}/inventory/${car.slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: cover ? [{ url: cover.image_url }] : [],
        },
    };
}

export default async function CarDetailPage({ params }: CarPageProps) {
    const { slug } = await params;
    const { car, images } = await getAvailableCarWithImages(slug);
    if (!car) {
        notFound();
    }

    const cover = images.find((img) => img.is_cover) || images[0];

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold">{car.title}</h1>
            <PriceDisplay car={car} />

            <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden bg-gray-100 aspect-[4/3]">
                    {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover.image_url} alt={car.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {images.filter((img) => img.id !== cover?.id).map((img) => (
                        <div key={img.id} className="border rounded-lg overflow-hidden bg-gray-100 aspect-[4/3]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image_url} alt={car.title} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-white">
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-medium">{car.brand}</p>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium">{car.model}</p>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{car.year}</p>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                    <p className="text-sm text-gray-500">Mileage</p>
                    <p className="font-medium">{car.km.toLocaleString()} km</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{car.description || "No description provided."}</p>
            </div>
        </div>
    );
}
