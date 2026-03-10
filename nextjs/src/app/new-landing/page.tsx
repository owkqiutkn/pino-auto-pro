import Link from "next/link";

const heroImage = "/new-landing/hero.jpg";
const financingImage = "/new-landing/financing.jpg";
const missionImage = "/new-landing/mission.jpg";
const aboutImage = "/new-landing/about.jpg";
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
        title: "Certified Vehicles",
        description: "Multi-point inspected inventory with quality assurance.",
        image: "/new-landing/feature-certified.jpg",
        icon: "✓",
    },
    {
        title: "Great Finance Rates",
        description: "Fast approvals and flexible terms tailored to you.",
        image: "/new-landing/feature-finance.jpg",
        icon: "$",
    },
    {
        title: "Trade-In Support",
        description: "Fair market trade values with a smooth process.",
        image: "/new-landing/feature-tradein.jpg",
        icon: "↺",
    },
];

export default function NewLandingPage() {
    return (
        <div className="bg-[#0f0f12] text-white">
            <section className="relative min-h-[440px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="ML Autos hero" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-x-0 top-0 h-10 md:h-12 bg-[#0a0a0d]/90" />

                <div className="relative z-10 mx-auto max-w-6xl px-4">
                    <header className="flex items-center justify-between py-1 md:py-2 text-[11px]">
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-black tracking-wider">M&L Autos</div>
                            <span className="h-4 w-px bg-white/30" />
                            <span className="text-white/70">Premium Pre-Owned</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-5 font-semibold uppercase tracking-wide text-white/85">
                            <a href="#inventory" className="hover:text-[#ff4747]">Inventory</a>
                            <a href="#financing" className="hover:text-[#ff4747]">Finance</a>
                            <a href="#about" className="hover:text-[#ff4747]">About</a>
                            <a href="#contact" className="hover:text-[#ff4747]">Contact</a>
                            <span className="text-white/60">○ ○ ○</span>
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
                            <button className="h-10 rounded-sm bg-[#e10f18] text-xs font-bold uppercase tracking-wide hover:bg-[#ff1d29]">
                                Search Inventory
                            </button>
                        </form>
                        <div className="absolute right-4 top-[150px] hidden flex-col gap-2 lg:flex">
                            {["Get Approved", "Book Test Drive", "Value Trade"].map((item) => (
                                <a key={item} href="#financing" className="rounded-sm bg-[#e10f18] px-3 py-2 text-[10px] font-bold uppercase">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-20 bg-[#e10f18] pt-10 pb-10 md:pt-12 md:pb-14">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 -mt-20 md:-mt-28">
                        {featureCards.map((item) => (
                            <div
                                key={item.title}
                                className="relative flex h-[180px] items-center overflow-hidden rounded-xl border border-white/20 bg-[#7f0b12] shadow-[0_22px_55px_rgba(0,0,0,0.7)]"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover scale-110 opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#3f0509]/80 via-[#b10f18]/90 to-[#ff4242]/85 mix-blend-multiply" />
                                <div className="relative z-10 flex h-full w-full flex-col justify-center p-5">
                                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
                                        {item.icon}
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
                            <span className="rounded-sm bg-[#e10f18] px-2 py-1 text-white">Featured</span>
                            <span className="rounded-sm bg-[#1f1f25] px-2 py-1 text-white">New Arrivals</span>
                            <Link href="/inventory" className="rounded-sm border border-[#e10f18] px-2 py-1 text-[#e10f18]">View All</Link>
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
                                    <p className="mt-2 text-sm font-black text-[#e10f18]">{car.price}</p>
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
                <div className="absolute inset-0 bg-[#b10f18]/85" />
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
                            We help drivers buy high-quality used vehicles with confidence. Every unit is inspected and priced fairly.
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-gray-700">
                            <li>Customer first, always.</li>
                            <li>Transparent process and pricing.</li>
                            <li>Strong vehicle quality standards.</li>
                        </ul>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link href="/inventory" className="rounded bg-[#f05454] px-3 py-2 text-center text-xs font-bold text-white">View Inventory</Link>
                            <a href="#contact" className="rounded bg-[#f05454] px-3 py-2 text-center text-xs font-bold text-white">Contact Us</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" className="relative py-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aboutImage} alt="About background" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative mx-auto max-w-6xl px-4">
                    <div className="max-w-md bg-black/60 p-6">
                        <h3 className="text-3xl font-black">About M&L Autos</h3>
                        <p className="mt-3 text-sm text-white/85">
                            A modern dealership experience focused on quality inventory, quick financing, and long-term support.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-[#2a2d33] py-10 text-white">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
                    {categoryCards.map((item) => (
                        <div key={item.name} className="overflow-hidden rounded-sm border border-white/20 bg-[#343841]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="h-20 w-full object-cover" />
                            <div className="p-3 text-center">
                                <div className="text-xs font-bold uppercase">{item.name}</div>
                                <button className="mt-2 rounded-sm bg-[#4d5a70] px-3 py-1 text-[10px] font-bold uppercase">
                                    View Listings
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#f7f7f7] py-10 text-black">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-black">What Our Customers Say</h3>
                        <span className="text-xs text-gray-500">Real Reviews</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            "Smooth purchase process and very fair pricing. Team was responsive and transparent from day one.",
                            "Fast approval and excellent support. The car was exactly as described and in great condition.",
                            "Great after-sale support and clean paperwork. I recommend this dealership to friends.",
                        ].map((text, index) => (
                            <div key={index} className="rounded-sm border bg-white">
                                <div className="flex items-center justify-between bg-[#e10f18] px-3 py-2 text-xs text-white">
                                    <span>Google Review</span>
                                    <span>{index + 1}</span>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-gray-700">{text}</p>
                                    <p className="mt-3 text-xs font-bold text-[#1f1f25]">Verified Customer</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="bg-[#ececec] py-0 text-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mapImage} alt="Dealership map" className="h-44 w-full object-cover md:h-56" />
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
