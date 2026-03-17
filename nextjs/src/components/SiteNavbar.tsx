"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";

const LOCALES = ["fr", "en", "es"] as const;

type SiteSettingsRow = {
    business_name: string | null;
    logo_light: string | null;
    logo_dark: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    twitter_url: string | null;
};

interface SiteNavbarProps {
    /** Use "standalone" for pages with white/light background (e.g. inventory) */
    variant?: "hero" | "standalone";
    /** Site settings (logo, social URLs). When provided, logos/links use these values. */
    siteSettings?: SiteSettingsRow | null;
}

const DEFAULT_FACEBOOK = "https://facebook.com";
const DEFAULT_INSTAGRAM = "https://instagram.com";
const DEFAULT_TWITTER = "https://x.com";

const navLinks = [
    { href: "/inventory", labelKey: "links.inventory" },
    { href: "/#about", labelKey: "links.about" },
    { href: "/#contact", labelKey: "links.contact" },
];

export default function SiteNavbar({ variant = "hero", siteSettings }: SiteNavbarProps) {
    const [logoError, setLogoError] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [langDropdownSource, setLangDropdownSource] = useState<"desktop" | "mobile">("desktop");
    const [langDropdownPosition, setLangDropdownPosition] = useState<{ top: number; right: number; minWidth: number } | null>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);
    const mobileLangDropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownPortalRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!isLangDropdownOpen) {
            setLangDropdownPosition(null);
            return;
        }
        const triggerRef = langDropdownSource === "mobile" ? mobileLangDropdownRef : langDropdownRef;
        if (!triggerRef.current) {
            setLangDropdownPosition(null);
            return;
        }
        const rect = triggerRef.current.getBoundingClientRect();
        setLangDropdownPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
            minWidth: rect.width,
        });
    }, [isLangDropdownOpen, langDropdownSource]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (langDropdownRef.current?.contains(target)) return;
            if (mobileLangDropdownRef.current?.contains(target)) return;
            if (langDropdownPortalRef.current?.contains(target)) return;
            setIsLangDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const bgClass = variant === "standalone" ? "bg-[#0c1320]" : "bg-[#0a0a0d]/70";
    const mobileDrawerBgClass = variant === "standalone" ? "bg-[#0c1320]" : "bg-[#0a0a0d]/90";

    const businessName = siteSettings?.business_name ?? null;
    const logoUrl = siteSettings?.logo_light ?? null;

    useEffect(() => {
        setLogoError(false);
    }, [logoUrl]);
    const facebookUrl = siteSettings?.facebook_url || DEFAULT_FACEBOOK;
    const instagramUrl = siteSettings?.instagram_url || DEFAULT_INSTAGRAM;
    const twitterUrl = siteSettings?.twitter_url || DEFAULT_TWITTER;

    const t = useTranslations("Navbar");
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const returnTo = useMemo(() => {
        const search = searchParams.toString();
        return `${pathname}${search ? `?${search}` : ""}`;
    }, [pathname, searchParams]);

    const localeSwitchHref = (targetLocale: string) =>
        `/api/locale?locale=${targetLocale}&returnTo=${encodeURIComponent(returnTo)}`;

    return (
        <header className={`${bgClass} text-white`}>
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex items-center justify-between py-3 md:py-3 text-[11px]">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center">
                            {logoUrl && !logoError ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={logoUrl}
                                    alt={businessName ?? t("brand")}
                                    className="h-10 md:h-10 max-w-[160px] object-contain object-left"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className="text-sm font-black tracking-wider">{businessName ?? t("brand")}</span>
                            )}
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-5 font-semibold uppercase tracking-wide text-white/85">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-[#1d4ed8]">
                                {t(link.labelKey)}
                            </Link>
                        ))}
                        <div className="flex items-center gap-3 text-white/80">
                            <div ref={langDropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLangDropdownSource("desktop");
                                        setIsLangDropdownOpen((o) => !o);
                                    }}
                                    aria-label={t("language.label")}
                                    aria-expanded={isLangDropdownOpen}
                                    aria-haspopup="listbox"
                                    className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] ring-1 ring-white/20 hover:bg-white/10 transition-colors"
                                >
                                    <span className="uppercase font-semibold">{locale}</span>
                                    <svg
                                        className={`h-3 w-3 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M3 4.5L6 7.5L9 4.5" />
                                    </svg>
                                </button>
                                {isLangDropdownOpen &&
                                    langDropdownPosition &&
                                    typeof document !== "undefined" &&
                                    createPortal(
                                        <div
                                            ref={langDropdownPortalRef}
                                            role="listbox"
                                            className="fixed rounded-lg bg-[#0a0a0d] py-1 shadow-lg ring-1 ring-white/20 z-[99999]"
                                            style={{
                                                top: langDropdownPosition.top,
                                                right: langDropdownPosition.right,
                                                minWidth: langDropdownPosition.minWidth,
                                            }}
                                        >
                                            {LOCALES.map((loc) => (
                                                <a
                                                    key={loc}
                                                    href={localeSwitchHref(loc)}
                                                    role="option"
                                                    aria-selected={locale === loc}
                                                    className={`block px-3 py-1.5 text-[10px] uppercase tracking-wide transition-colors ${
                                                        locale === loc
                                                            ? "bg-white/20 text-white font-semibold"
                                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {t(`language.${loc}`)}
                                                </a>
                                            ))}
                                        </div>,
                                        document.body
                                    )}
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={facebookUrl}
                                    aria-label="Visit us on Facebook"
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#1877f2]/60"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/images/icon-facebook.png"
                                        alt="Facebook"
                                        className="h-3.5 w-3.5 brightness-0 invert"
                                    />
                                </a>
                                <a
                                    href={instagramUrl}
                                    aria-label="Visit us on Instagram"
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#e1306c]/60"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/images/icon-instagram.png"
                                        alt="Instagram"
                                        className="h-3.5 w-3.5 brightness-0 invert"
                                    />
                                </a>
                                <a
                                    href={twitterUrl}
                                    aria-label="Visit us on X"
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-white/70"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/images/icon-x.png"
                                        alt="X (Twitter)"
                                        className="h-3.5 w-3.5 brightness-0 invert"
                                    />
                                </a>
                            </div>
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
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLangDropdownOpen(false);
                    }}
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
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsLangDropdownOpen(false);
                        }}
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
                                onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsLangDropdownOpen(false);
                        }}
                            >
                                {t(link.labelKey)}
                            </Link>
                        ))}
                        <div className="mt-2 flex items-center justify-between text-white/80">
                            <span className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                                {t("language.label")}
                            </span>
                            <div ref={mobileLangDropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLangDropdownSource("mobile");
                                        setIsLangDropdownOpen((o) => !o);
                                    }}
                                    aria-label={t("language.label")}
                                    aria-expanded={isLangDropdownOpen}
                                    aria-haspopup="listbox"
                                    className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] ring-1 ring-white/20"
                                >
                                    <span className="uppercase font-semibold">{locale}</span>
                                    <svg
                                        className={`h-3 w-3 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M3 4.5L6 7.5L9 4.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-white/80">
                            <a
                                href={facebookUrl}
                                aria-label="Visit us on Facebook"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#1877f2]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/icon-facebook.png"
                                    alt="Facebook"
                                    className="h-3.5 w-3.5 brightness-0 invert"
                                />
                            </a>
                            <a
                                href={instagramUrl}
                                aria-label="Visit us on Instagram"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-[#e1306c]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/icon-instagram.png"
                                    alt="Instagram"
                                    className="h-3.5 w-3.5 brightness-0 invert"
                                />
                            </a>
                            <a
                                href={twitterUrl}
                                aria-label="Visit us on X"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/20 hover:bg-white/10 hover:ring-white/70"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/icon-x.png"
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

