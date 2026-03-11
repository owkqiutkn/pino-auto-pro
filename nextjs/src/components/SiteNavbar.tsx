"use client";

import Link from "next/link";
import { useState } from "react";

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const bgClass = variant === "standalone" ? "bg-[#0c1320]" : "bg-[#0a0a0d]/90";
    const mobileDrawerBgClass = variant === "standalone" ? "bg-[#0c1320]" : "bg-[#0a0a0d]/95";

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
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-white md:hidden"
                        aria-label="Toggle mobile menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-drawer"
                        onClick={() => setIsMobileMenuOpen((open) => !open)}
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                            <path
                                d="M4 7h16M4 12h16M4 17h16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                <div
                    className={`fixed inset-0 z-[10000] bg-black/40 transition-opacity duration-300 md:hidden ${
                        isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
                <div
                    id="mobile-drawer"
                    role="dialog"
                    aria-modal="true"
                    className={`fixed right-0 top-0 z-[10010] h-full w-72 max-w-[85vw] border-l border-white/15 ${mobileDrawerBgClass} p-4 pt-12 transition-transform duration-300 ease-out md:hidden ${
                        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <button
                        type="button"
                        aria-label="Close mobile menu"
                        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white ring-1 ring-white/40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                    <nav className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-white/90">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="py-1 hover:text-[#1d4ed8]"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-1 flex items-center gap-2 text-white/80">
                            <a
                                href="https://facebook.com"
                                aria-label="Visit us on Facebook"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#1877f2]/60"
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
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#e1306c]/60"
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
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-white/70"
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
