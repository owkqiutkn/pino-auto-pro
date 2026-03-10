import Link from "next/link";
import AuthAwareButtons from "@/components/AuthAwareButtons";
import { createSSRSassClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types";

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
            <p className="mt-1">
                <span className="text-primary-700 font-semibold">{formatPrice(car.discounted_price)}</span>{" "}
                <span className="text-sm text-gray-500 line-through">{formatPrice(car.price)}</span>
            </p>
        );
    }
    return <p className="mt-1 text-primary-700 font-semibold">{formatPrice(car.price)}</p>;
}

export default async function Home() {
    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME || "Dealer Name";
    const client = await createSSRSassClient();
    const { data: cars } = await client.getAvailableCars();
    const carsList = (cars ?? []) as Car[];
    const featuredCars = carsList.slice(0, 6);
    const { data: images } = await client.getCarImagesForCars(featuredCars.map((car) => car.id));
    const imagesList = (images ?? []) as CarImage[];
    const imageByCar = new Map<string, CarImage>();
    for (const image of imagesList) {
        if (!imageByCar.has(image.car_id) || image.is_cover) {
            imageByCar.set(image.car_id, image);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <span className="text-xl font-semibold">{productName}</span>
                    <div className="flex items-center gap-4">
                        <Link href="/inventory" className="font-medium text-gray-700 hover:text-gray-900">
                            Inventory
                        </Link>
                        <AuthAwareButtons variant="nav" />
                    </div>
                </div>
            </header>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Find your next car with confidence
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl">
                    Browse inspected used vehicles with transparent pricing, detailed photos,
                    and trusted support from our dealership team.
                </p>
                <div className="mt-8 flex gap-3">
                    <Link
                        href="/inventory"
                        className="px-5 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                    >
                        Browse Inventory
                    </Link>
                    <Link
                        href="#contact"
                        className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-white"
                    >
                        Contact Us
                    </Link>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Featured Vehicles</h2>
                    <Link href="/inventory" className="text-primary-600 hover:text-primary-700 font-medium">
                        View all
                    </Link>
                </div>
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCars.map((car) => {
                        const cover = imageByCar.get(car.id);
                        return (
                            <Link key={car.id} href={`/inventory/${car.slug}`} className="bg-white rounded-lg border overflow-hidden">
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
                                    <h3 className="font-medium">{car.title}</h3>
                                    <PriceDisplay car={car} />
                                    <p className="text-sm text-gray-600 mt-1">
                                        {car.year} • {car.km.toLocaleString()} km
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="bg-white border-y">
                <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
                    <div className="p-5 border rounded-lg">
                        <h3 className="font-semibold">Quality Inspections</h3>
                        <p className="mt-2 text-gray-600">Every vehicle is checked before it is listed for sale.</p>
                    </div>
                    <div className="p-5 border rounded-lg">
                        <h3 className="font-semibold">Transparent Pricing</h3>
                        <p className="mt-2 text-gray-600">No hidden fees. Clear details on mileage and condition.</p>
                    </div>
                    <div className="p-5 border rounded-lg">
                        <h3 className="font-semibold">Local Dealer Support</h3>
                        <p className="mt-2 text-gray-600">Friendly support before and after your purchase.</p>
                    </div>
                </div>
            </section>

            <section id="contact" className="max-w-6xl mx-auto px-4 py-14">
                <h2 className="text-2xl font-semibold">Contact</h2>
                <p className="mt-2 text-gray-600">Questions about a vehicle? Reach us directly.</p>
                <div className="mt-4 grid sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border rounded-lg">Phone: +1 (555) 123-4567</div>
                    <div className="p-4 bg-white border rounded-lg">Email: sales@dealer.com</div>
                    <div className="p-4 bg-white border rounded-lg">Address: 123 Main St, Your City</div>
                </div>
            </section>
        </div>
    );
}