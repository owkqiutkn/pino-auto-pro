import Link from "next/link";

interface SiteNavbarProps {
    /** Use "standalone" for pages with white/light background (e.g. inventory) */
    variant?: "hero" | "standalone";
}

const navLinks = [
    { href: "/inventory", label: "Inventory" },
    { href: "/new-landing#about", label: "About" },
    { href: "/new-landing#contact", label: "Contact" },
];

export default function SiteNavbar({ variant = "hero" }: SiteNavbarProps) {
    const bgClass = variant === "standalone" ? "bg-[#0c1320]" : "bg-[#0a0a0d]/90";

    return (
        <header className={`${bgClass} text-white`}>
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex items-center justify-between py-1 md:py-2 text-[11px]">
                    <div className="flex items-center gap-3">
                        <Link href="/new-landing" className="text-sm font-black tracking-wider">
                            Pino Auto Pro
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-5 font-semibold uppercase tracking-wide text-white/85">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-[#1d4ed8]">
                                {link.label}
                            </Link>
                        ))}
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
                </div>
            </div>
        </header>
    );
}
