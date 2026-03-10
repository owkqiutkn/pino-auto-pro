import Link from "next/link";
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
            <p className="text-sm">
                <span className="text-2xl font-black text-[#f20d0d]">
                    {formatPrice(car.discounted_price)}
                </span>{" "}
                <span className="text-slate-500 line-through">{formatPrice(car.price)}</span>
            </p>
        );
    }
    return <p className="text-2xl font-black text-[#f20d0d]">{formatPrice(car.price)}</p>;
}

export default async function Home() {
    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME || "ML Autos";
    const client = await createSSRSassClient();

    const { data: cars } = await client.getAvailableCars();
    const featuredCars = ((cars ?? []) as Car[]).slice(0, 6);
    const { data: images } = await client.getCarImagesForCars(featuredCars.map((car) => car.id));
    const imagesList = (images ?? []) as CarImage[];

    const imageByCar = new Map<string, CarImage>();
    for (const image of imagesList) {
        if (!imageByCar.has(image.car_id) || image.is_cover) {
            imageByCar.set(image.car_id, image);
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f5f5] text-slate-900">
            <header className="sticky top-0 z-50 bg-[#f8f5f5]/90 backdrop-blur-md border-b border-[#f20d0d]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl text-[#f20d0d]" aria-hidden="true">🚗</span>
                            <span className="text-2xl font-black tracking-tighter uppercase">{productName}</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <Link className="text-sm font-semibold hover:text-[#f20d0d] transition-colors" href="/inventory">
                                Inventory
                            </Link>
                            <a className="text-sm font-semibold hover:text-[#f20d0d] transition-colors" href="#financing">
                                Financing
                            </a>
                            <a className="text-sm font-semibold hover:text-[#f20d0d] transition-colors" href="#trade">
                                Sell Your Car
                            </a>
                            <a className="text-sm font-semibold hover:text-[#f20d0d] transition-colors" href="#about">
                                About
                            </a>
                            <a className="text-sm font-semibold hover:text-[#f20d0d] transition-colors" href="#contact">
                                Contact
                            </a>
                        </nav>
                        <Link
                            href="/inventory"
                            className="bg-[#f20d0d] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#f20d0d]/20"
                        >
                            Browse Inventory
                        </Link>
                    </div>
                </div>
            </header>

            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f20d0d]/10 text-[#f20d0d] text-xs font-bold uppercase tracking-wider w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f20d0d] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f20d0d]"></span>
                                </span>
                                New Arrivals Daily
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">
                                Your Trusted Partner in <span className="text-[#f20d0d]">Quality</span> Pre-Owned Vehicles
                            </h1>
                            <p className="text-lg text-slate-600 max-w-xl">
                                Experience the new standard of excellence in automotive sales with our curated collection of premium pre-owned vehicles.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/inventory"
                                    className="bg-[#f20d0d] text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-[#f20d0d]/20"
                                >
                                    Browse Inventory
                                </Link>
                                <a
                                    href="#financing"
                                    className="bg-white border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
                                >
                                    Get Pre-Approved
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt="Luxury car showcase"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpQefR0Svtp_4kWlyXpjzs6N5-Pvv8DK6aD-t65miVj8CJOXxDsJqBYH5ngvyu4WVGCGERBzlWazlrfIakTJs2JOu3aOsgle4Tn0yol-MP-HWvagrMB400ZAnCV_NnIAFEF61C0WbNlKmqnVcXxNGF1yQSi4BCPXc6UM4ZiAV3QgBUtyr6hVcds1z3BHPs6AjMiydZJC87odNMVOxVlEhXGZFrbZNT02X32ff5BZ9-_a0hyu7yXg059WsnuyD8gfia1TokMkAZ4pDL"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden sm:block">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#f20d0d]/10 p-3 rounded-xl text-[#f20d0d]">✓</div>
                                    <div>
                                        <p className="text-2xl font-black">250+</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Certified Vehicles</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-12 relative z-10">
                <div className="bg-white p-4 lg:p-8 rounded-2xl shadow-2xl border border-slate-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-[#f20d0d]">⌕</span>
                        Find Your Perfect Match
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select className="w-full bg-[#f8f5f5] border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f20d0d]/50 appearance-none">
                            <option>All Body Types</option>
                            <option>SUV</option>
                            <option>Sedan</option>
                            <option>Coupe</option>
                            <option>Truck</option>
                        </select>
                        <select className="w-full bg-[#f8f5f5] border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f20d0d]/50 appearance-none">
                            <option>Any Make</option>
                            <option>BMW</option>
                            <option>Mercedes-Benz</option>
                            <option>Audi</option>
                            <option>Lexus</option>
                        </select>
                        <select className="w-full bg-[#f8f5f5] border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f20d0d]/50 appearance-none">
                            <option>Any Model</option>
                        </select>
                        <Link
                            href="/inventory"
                            className="bg-[#f20d0d] text-white rounded-lg h-12 font-bold inline-flex items-center justify-center hover:opacity-90"
                        >
                            Search Results
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-4xl font-black mb-4">
                            Featured <span className="text-[#f20d0d]">Inventory</span>
                        </h2>
                        <p className="text-slate-600">Live inventory from your backend.</p>
                    </div>
                    <Link href="/inventory" className="hidden md:flex items-center gap-2 text-[#f20d0d] font-bold hover:underline">
                        View All Vehicles
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>

                {featuredCars.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                        No featured vehicles found right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredCars.map((car) => {
                            const cover = imageByCar.get(car.id);
                            return (
                                <Link
                                    key={car.id}
                                    href={`/inventory/${car.slug}`}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 group"
                                >
                                    <div className="relative h-64 overflow-hidden bg-slate-100">
                                        <div className="absolute top-4 left-4 z-10 bg-[#f20d0d] text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                            Featured
                                        </div>
                                        {cover ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={cover.image_url}
                                                alt={car.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                No image available
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h3 className="text-xl font-bold line-clamp-1">{car.title}</h3>
                                        </div>
                                        <PriceDisplay car={car} />
                                        <p className="text-slate-500 text-sm mt-3">
                                            {car.year} • {car.km.toLocaleString()} km
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <span className="text-xs bg-[#f8f5f5] px-3 py-1 rounded-full font-semibold">
                                                Pre-Owned
                                            </span>
                                            <span className="text-xs bg-[#f8f5f5] px-3 py-1 rounded-full font-semibold">
                                                Inspected
                                            </span>
                                        </div>
                                        <div className="mt-6">
                                            <span className="w-full inline-flex justify-center border-2 border-[#f20d0d] text-[#f20d0d] font-bold py-3 rounded-xl group-hover:bg-[#f20d0d] group-hover:text-white transition-all">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            <section id="about" className="bg-slate-900 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-black mb-16">
                        The {productName} <span className="text-[#f20d0d]">Difference</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#f20d0d]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#f20d0d]/30 text-4xl">
                                ♥
                            </div>
                            <h3 className="text-xl font-bold mb-4">Customer-Centric</h3>
                            <p className="text-slate-400 leading-relaxed">
                                We prioritize your needs with a tailored, low-pressure car-buying experience.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#f20d0d]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#f20d0d]/30 text-4xl">
                                🛡
                            </div>
                            <h3 className="text-xl font-bold mb-4">Excellence in Service</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Every vehicle is inspected to meet strict quality and safety standards.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#f20d0d]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#f20d0d]/30 text-4xl">
                                🤝
                            </div>
                            <h3 className="text-xl font-bold mb-4">Transparency & Trust</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Honest pricing and clear information from the first click to delivery.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="financing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#f20d0d] rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden text-white">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none text-[220px] leading-none">💳</div>
                    <div className="relative z-10 max-w-2xl text-center lg:text-left">
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                            Fast &amp; Flexible Financing Solutions
                        </h2>
                        <p className="text-white/80 text-lg mb-0">
                            We work with trusted lenders to help you get approved quickly with competitive rates.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <a className="inline-flex bg-white text-[#f20d0d] px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-2xl" href="#contact">
                            Apply for Financing
                        </a>
                    </div>
                </div>
            </section>

            <section id="reviews" className="py-24 bg-[#f8f5f5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="flex justify-center gap-1 text-yellow-500 mb-4">
                            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                        <h2 className="text-4xl font-black mb-4">What Our Clients Say</h2>
                        <p className="text-slate-600">4.9/5 stars based on 500+ reviews</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <p className="italic text-slate-600 mb-6">
                                &quot;Smooth process from start to finish. Transparent, fast, and professional service.&quot;
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold">JD</div>
                                <div>
                                    <p className="font-bold">James Dalton</p>
                                    <p className="text-xs text-slate-500">Verified Buyer</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <p className="italic text-slate-600 mb-6">
                                &quot;I have bought multiple cars here. Their quality and customer care are unmatched.&quot;
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold">SR</div>
                                <div>
                                    <p className="font-bold">Sarah Reynolds</p>
                                    <p className="text-xs text-slate-500">Loyal Customer</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <p className="italic text-slate-600 mb-6">
                                &quot;Great value on my trade-in and a clean process. Highly recommended dealership team.&quot;
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold">MK</div>
                                <div>
                                    <p className="font-bold">Michael K.</p>
                                    <p className="text-xs text-slate-500">Verified Seller</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="trade" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h3 className="text-2xl font-black mb-3">Sell or Trade Your Vehicle</h3>
                    <p className="text-slate-600 mb-6">Get a fair market offer and fast turnaround from our team.</p>
                    <a href="#contact" className="inline-flex bg-[#f20d0d] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
                        Start Your Appraisal
                    </a>
                </div>
            </section>

            <footer id="contact" className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="text-[#f20d0d] text-2xl">🚗</div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase">{productName}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Premium automotive dealership specializing in quality pre-owned vehicles and trusted service.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#f20d0d] transition-colors" href="#">🌐</a>
                            <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#f20d0d] transition-colors" href="#">✉</a>
                            <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#f20d0d] transition-colors" href="#">☎</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Quick Links</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link className="hover:text-[#f20d0d] transition-colors" href="/inventory">Our Inventory</Link></li>
                            <li><a className="hover:text-[#f20d0d] transition-colors" href="#financing">Apply for Finance</a></li>
                            <li><a className="hover:text-[#f20d0d] transition-colors" href="#trade">Value Your Trade</a></li>
                            <li><a className="hover:text-[#f20d0d] transition-colors" href="#about">About Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Showroom Hours</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex justify-between"><span>Monday - Friday</span> <span>9am - 7pm</span></li>
                            <li className="flex justify-between"><span>Saturday</span> <span>10am - 5pm</span></li>
                            <li className="flex justify-between text-slate-500"><span>Sunday</span> <span>Closed</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Visit Us</h4>
                        <p className="text-sm mb-4">1230 Automotive Blvd,<br />Prestige Heights, CA 90210</p>
                        <p className="text-sm font-bold text-white mb-2">Sales: (555) 123-4567</p>
                        <p className="text-sm font-bold text-white mb-6">Service: (555) 123-9999</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 pt-10 text-center">
                    <p className="text-xs text-slate-500">© 2024 {productName}. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}