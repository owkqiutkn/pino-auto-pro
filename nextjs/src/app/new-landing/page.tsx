import Link from "next/link";
import ContactMap from "@/components/ContactMap";

const heroImage = "/new-landing/hero.jpg";
const financingImage = "/new-landing/financing.jpg";
const missionImage = "/new-landing/mission.jpg";
const aboutImage = "/new-landing/about.jpg";
const aboutBackgroundImage = "https://images.pexels.com/photos/33271364/pexels-photo-33271364.jpeg";
const mapImage = "/new-landing/map.jpg";

const inventoryCards = [
    { title: "Audi A5 S-Line", year: "2019", price: "$32,900", km: "64,000 km", image: "/new-landing/hero.jpg" },
    { title: "BMW 430i xDrive", year: "2020", price: "$39,500", km: "51,200 km", image: "/new-landing/financing.jpg" },
    { title: "Mercedes C300", year: "2021", price: "$42,900", km: "38,000 km", image: "/new-landing/mission.jpg" },
    { title: "Lexus IS 300", year: "2022", price: "$44,200", km: "22,600 km", image: "/new-landing/about.jpg" },
];

const categoryCards = [
    { name: "Sedan", image: "/new-landing/category-sedan.jpg" },
    { name: "SUV", image: "/new-landing/category-suv.jpg" },
    { name: "Coupe", image: "/new-landing/category-coupe.jpg" },
    { name: "Truck", image: "/new-landing/category-truck.jpg" },
];

const featureCards = [
    {
        title: "View Inventory",
        description: "Browse from our selection of pre-owned cars, trucks and SUVs.",
        image: "/new-landing/feature-certified.jpg",
        icon: "✓",
        iconImage: "https://img.icons8.com/?id=12666&format=png&size=36",
    },
    {
        title: "Apply For Financing",
        description: "Count on our finance team for hassle-free savings!",
        image: "/new-landing/feature-finance.jpg",
        icon: "$",
        iconImage: "https://img.icons8.com/?id=13025&format=png&size=36",
    },
    {
        title: "Contact Us",
        description: "Call or email our team for more information!",
        image: "/new-landing/feature-tradein.jpg",
        icon: "✉",
        iconImage: "https://img.icons8.com/?id=63598&format=png&size=36",
    },
];

export default function NewLandingPage() {
    return (
        <div className="bg-[#0f0f12] text-white">
            <div className="fixed right-4 top-[150px] z-[9999] hidden flex-col gap-2 lg:flex" aria-label="Quick actions">
                {["Get Approved", "Book Test Drive", "Value Trade"].map((item) => (
                    <a key={item} href="#financing" className="rounded-sm bg-[#1d4ed8] px-3 py-2 text-[10px] font-bold uppercase">
                        {item}
                    </a>
                ))}
            </div>
            <section className="relative min-h-[440px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="ML Autos hero" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/70" />
                <div className="absolute inset-x-0 top-0 h-10 md:h-12 bg-[#0a0a0d]/90" />

                <div className="relative z-10 mx-auto max-w-6xl px-4">
                    <header className="flex items-center justify-between py-1 md:py-2 text-[11px]">
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-black tracking-wider">M&L Autos</div>
                        </div>
                        <nav className="hidden md:flex items-center gap-5 font-semibold uppercase tracking-wide text-white/85">
                            <a href="#inventory" className="hover:text-[#1d4ed8]">Inventory</a>
                            <a href="#financing" className="hover:text-[#1d4ed8]">Finance</a>
                            <a href="#about" className="hover:text-[#1d4ed8]">About</a>
                            <a href="#contact" className="hover:text-[#1d4ed8]">Contact</a>
                            <div className="flex items-center gap-2 text-white/80">
                                <a
                                    href="https://facebook.com"
                                    aria-label="Visit us on Facebook"
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#1877f2]/60"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://img.icons8.com/?id=118466&format=png&size=32"
                                        alt="Facebook"
                                        className="h-3.5 w-3.5 brightness-0 invert"
                                    />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    aria-label="Visit us on Instagram"
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#e1306c]/60"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://img.icons8.com/?id=32292&format=png&size=32"
                                        alt="Instagram"
                                        className="h-3.5 w-3.5 brightness-0 invert"
                                    />
                                </a>
                                <a
                                    href="https://x.com"
                                    aria-label="Visit us on X"
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-white/70"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://img.icons8.com/?id=01GWmP9aUoPj&format=png&size=32"
                                        alt="X (Twitter)"
                                        className="h-3.5 w-3.5 brightness-0 invert"
                                    />
                                </a>
                            </div>
                        </nav>
                    </header>

                    <div className="pt-14 pb-16 text-center">
                        <h1 className="max-w-3xl mx-auto text-3xl md:text-5xl font-black leading-tight">
                            Luxury and Performance Vehicles, Ready to Drive.
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-sm text-white/80">
                            Find your perfect match from our curated inventory and get approved fast.
                        </p>
                        <form action="/inventory" method="get" className="mt-6 grid max-w-5xl mx-auto grid-cols-1 gap-2 md:grid-cols-4">
                            <input name="year" placeholder="Year" className="h-10 rounded-sm bg-white px-3 text-xs text-black placeholder:text-gray-500" />
                            <input name="brand" placeholder="Brand" className="h-10 rounded-sm bg-white px-3 text-xs text-black placeholder:text-gray-500" />
                            <input name="price" placeholder="Max Price" className="h-10 rounded-sm bg-white px-3 text-xs text-black placeholder:text-gray-500" />
                            <button className="h-10 rounded-sm bg-[#1d4ed8] text-xs font-bold uppercase tracking-wide hover:bg-[#4338ca]">
                                Search Inventory
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="relative z-20 bg-[#020617] pt-10 pb-10 md:pt-12 md:pb-14">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 -mt-20 md:-mt-28">
                        {featureCards.map((item) => (
                            <div
                                key={item.title}
                                className="relative flex h-[180px] items-center overflow-hidden rounded-xl border border-white/20 bg-[#020617] shadow-[0_22px_55px_rgba(0,0,0,0.7)]"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover scale-110 opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1d4ed8]/80 via-[#1e40af]/90 to-[#1d4ed8]/85 mix-blend-multiply" />
                                <div className="relative z-10 flex h-full w-full flex-col justify-center p-5">
                                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
                                        {"iconImage" in item && item.iconImage ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={item.iconImage} alt="" className="h-5 w-5 brightness-0 invert" aria-hidden />
                                        ) : (
                                            item.icon
                                        )}
                                    </div>
                                    <div className="text-sm md:text-base font-bold tracking-wide">
                                        {item.title}
                                    </div>
                                    <p className="mt-1 text-[11px] md:text-xs leading-snug text-white/90">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="inventory" className="bg-[#f2f2f3] py-10 text-black">
                <div className="mx-auto max-w-6xl px-4">
                        <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-black uppercase">Inventory Lineup</h2>
                        <div className="flex gap-2 text-[10px] font-bold uppercase">
                            <span className="rounded-sm bg-[#1d4ed8] px-2 py-1 text-white">Featured</span>
                            <span className="rounded-sm bg-[#1f1f25] px-2 py-1 text-white">New Arrivals</span>
                            <Link href="/inventory" className="rounded-sm border border-[#1d4ed8] px-2 py-1 text-[#1d4ed8]">View All</Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {inventoryCards.map((car) => (
                            <Link key={car.title} href="/inventory" className="overflow-hidden rounded-sm border bg-white shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={car.image} alt={car.title} className="h-32 w-full object-cover" />
                                <div className="p-3 text-[11px]">
                                    <h3 className="text-xs font-bold uppercase">{car.title}</h3>
                                    <p className="mt-1 text-[10px] text-gray-600">{car.year} • {car.km}</p>
                                    <p className="mt-2 text-sm font-black text-[#1d4ed8]">{car.price}</p>
                                    <div className="mt-2 flex items-center justify-between text-[10px]">
                                        <span className="rounded bg-gray-100 px-2 py-1">Certified</span>
                                        <span className="font-bold text-[#1f1f25]">View Details</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section id="financing" className="relative overflow-hidden py-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={financingImage} alt="Financing background" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#0f172a]/90" />
                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <h2 className="text-3xl font-black">Apply For Financing</h2>
                    <p className="mt-2 text-xs text-white/90">What Type of Vehicle Do You Want?</p>
                    <form className="mt-8 grid grid-cols-2 gap-3 rounded border border-white/30 bg-black/20 p-4 text-left md:grid-cols-4">
                        <label className="text-[10px] uppercase"><span className="mb-1 block">Year</span><input className="h-8 w-full rounded-sm bg-white px-2 text-black" /></label>
                        <label className="text-[10px] uppercase"><span className="mb-1 block">Make</span><input className="h-8 w-full rounded-sm bg-white px-2 text-black" /></label>
                        <label className="text-[10px] uppercase"><span className="mb-1 block">Model</span><input className="h-8 w-full rounded-sm bg-white px-2 text-black" /></label>
                        <label className="text-[10px] uppercase"><span className="mb-1 block">Budget</span><input className="h-8 w-full rounded-sm bg-white px-2 text-black" /></label>
                        <button className="col-span-2 mt-2 h-9 rounded-sm bg-[#1d3f73] text-xs font-bold uppercase md:col-span-4">Submit</button>
                    </form>
                </div>
            </section>

            <section className="bg-white py-12 text-black">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
                    <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={missionImage} alt="Cars on road" className="h-72 w-full rounded-sm object-cover" />
                    </div>
                    <div className="rounded-sm border p-6">
                        <h3 className="text-xl font-black">Our Mission</h3>
                        <p className="mt-3 text-sm text-gray-700">
                            At M&amp;L Autos, our mission is to redefine automotive service around five core principles.
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-gray-700">
                            <li>
                                <span className="font-semibold">Customer-Centric Care:</span> Your satisfaction is the focus from first visit to final keys.
                            </li>
                            <li>
                                <span className="font-semibold">Service Excellence:</span> Skilled technicians deliver high-quality, reliable automotive solutions.
                            </li>
                            <li>
                                <span className="font-semibold">Transparency &amp; Trust:</span> Clear explanations, upfront pricing, and honest recommendations.
                            </li>
                            <li>
                                <span className="font-semibold">Innovation &amp; Expertise:</span> Up-to-date with the latest automotive technology for efficient results.
                            </li>
                            <li>
                                <span className="font-semibold">Community Engagement:</span> Supporting local initiatives and contributing positively to our community.
                            </li>
                        </ul>
                        <p className="mt-4 text-xs text-gray-700">
                            We are committed to exceeding expectations, building long-term relationships, and setting a new standard in automotive care and customer service.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link href="/inventory" className="rounded bg-[#1d4ed8] px-3 py-2 text-center text-xs font-bold text-white">View Inventory</Link>
                            <a href="#contact" className="rounded bg-[#1d4ed8] px-3 py-2 text-center text-xs font-bold text-white">Contact Us</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" className="relative py-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aboutBackgroundImage} alt="About background" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative mx-auto max-w-6xl px-4">
                    <div className="max-w-xl bg-black/60 p-6 md:p-7">
                        <h3 className="text-3xl font-black">About M&amp;L Autos</h3>
                        <p className="mt-3 text-sm text-white/85">
                            M&amp;L Autos is your trusted pre-owned vehicle destination in Mississauga, making every step of buying a car clear, simple, and
                            stress-free. We offer a carefully selected lineup of quality used cars, trucks, and SUVs, each thoroughly inspected for reliability
                            and real value.
                        </p>
                        <p className="mt-3 text-sm text-white/80">
                            Our friendly team helps you choose the right vehicle, explains your options in plain language, and works with you on flexible
                            financing that fits your budget. With fair trade-in values, transparent deals, and a genuine focus on satisfaction, we want you to
                            drive away confident in your decision.
                        </p>
                        <p className="mt-3 text-sm text-white/80">
                            Choose M&amp;L Autos for quality vehicles, honest service, and a smooth buying experience in Mississauga and beyond.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold">
                            <a href="#about" className="rounded bg-white px-4 py-2 text-black uppercase tracking-wide">
                                About
                            </a>
                            <a href="#contact" className="rounded bg-[#1d4ed8] px-4 py-2 text-white uppercase tracking-wide">
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#17181f] py-10 text-white">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase tracking-wide">Browse by Category</h3>
                        <span className="text-[10px] uppercase text-white/60">Sedan • SUV • Coupe • Truck</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {categoryCards.map((item) => (
                            <div
                                key={item.name}
                                    className="group overflow-hidden rounded-sm border border-white/10 bg-[#22242c] shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="border-t border-white/5 bg-gradient-to-r from-[#1d283a] via-[#111827] to-[#1d283a] p-3 text-center">
                                    <div className="text-xs font-bold uppercase tracking-wide">{item.name}</div>
                                    <button className="mt-2 inline-flex items-center justify-center rounded-sm bg-[#1d4ed8] px-3 py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-[#4338ca]">
                                        View Listings
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#111217] py-12 text-white">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                                Customer Reviews
                            </p>
                            <h3 className="text-xl font-black tracking-tight sm:text-2xl">
                                What Our Customers Say
                            </h3>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[11px] font-medium text-white/80 ring-1 ring-white/10">
                            <div className="flex items-center text-[#f4c84b]">
                                <span className="mr-0.5 text-xs">★</span>
                                <span className="mr-0.5 text-xs">★</span>
                                <span className="mr-0.5 text-xs">★</span>
                                <span className="mr-0.5 text-xs">★</span>
                                <span className="text-xs">★</span>
                            </div>
                            <span>4.9/5 from 500+ customer reviews</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            "Smooth purchase process and very fair pricing. Team was responsive and transparent from day one.",
                            "Fast approval and excellent support. The car was exactly as described and in great condition.",
                            "Great after-sale support and clean paperwork. I recommend this dealership to friends.",
                        ].map((text, index) => (
                            <div
                                key={index}
                                className="group rounded-xl border border-white/10 bg-white/5 p-0 shadow-[0_18px_60px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:border-[#4338ca]/70 hover:shadow-[0_28px_80px_rgba(0,0,0,0.9)]"
                            >
                                <div className="flex items-center justify-between bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white">
                                    <span>{index === 2 ? "Customer Story" : "Customer Review"}</span>
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm leading-relaxed text-white/80">{text}</p>
                                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/60">
                                        {index === 2 ? "Verified Seller" : "Verified Customer"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="bg-[#ececec] py-0 text-black">
                <ContactMap />
            </section>

            <footer className="bg-[#171717] py-10 text-xs text-white/80">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
                    <div>
                        <h4 className="mb-3 font-bold uppercase text-white">Inventory</h4>
                        <p className="text-white/60">Sedan</p>
                        <p className="text-white/60">SUV</p>
                        <p className="text-white/60">Coupe</p>
                    </div>
                    <div>
                        <h4 className="mb-3 font-bold uppercase text-white">Financing</h4>
                        <p className="text-white/60">Apply Online</p>
                        <p className="text-white/60">Trade In</p>
                        <p className="text-white/60">Credit Help</p>
                    </div>
                    <div>
                        <h4 className="mb-3 font-bold uppercase text-white">Hours</h4>
                        <p className="text-white/60">Mon-Fri: 9am-7pm</p>
                        <p className="text-white/60">Sat: 10am-5pm</p>
                        <p className="text-white/60">Sun: Closed</p>
                    </div>
                    <div>
                        <h4 className="mb-3 font-bold uppercase text-white">Contact</h4>
                        <p className="text-white/60">1230 Automotive Blvd</p>
                        <p className="text-white/60">Sales: (555) 123-4567</p>
                        <p className="text-white/60">info@mlautos.com</p>
                        <div className="mt-4 flex items-center gap-3">
                            <a
                                href="https://facebook.com"
                                aria-label="Visit us on Facebook"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#1877f2]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://img.icons8.com/?id=118466&format=png&size=32"
                                    alt="Facebook"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://instagram.com"
                                aria-label="Visit us on Instagram"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#e1306c]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://img.icons8.com/?id=32292&format=png&size=32"
                                    alt="Instagram"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://x.com"
                                aria-label="Visit us on X"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-white/70"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://img.icons8.com/?id=01GWmP9aUoPj&format=png&size=32"
                                    alt="X (Twitter)"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 pt-4 text-[10px] text-white/60">
                    <div>Powered by M&L Autos.</div>
                    <div>Copyright 2026 M&L Autos.</div>
                </div>
            </footer>
        </div>
    );
}
