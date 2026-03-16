import Link from "next/link";
import ContactMap from "@/components/ContactMap";
import InventoryLineup from "@/components/InventoryLineup";
import SiteNavbar from "@/components/SiteNavbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import {
    getCachedCategories,
    getCachedEngines,
    getCachedFuels,
    getCachedTransmissions,
    getCachedBrands,
    getCachedSiteSettings,
} from "@/lib/supabase/cached";
import { getInventorySegmentData } from "@/lib/inventory/segment";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { Database } from "@/lib/types";
import { CATEGORY_IMAGE, getTransformedStorageUrl } from "@/lib/storage";
import { getLocale, getTranslations } from "next-intl/server";

type Brand = Database["public"]["Tables"]["brands"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

// Placeholder for categories without an attached image
const CATEGORY_PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect fill="%23334155" width="200" height="120"/><text fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">No image</text></svg>'
    );

const heroImage = "/new-landing/hero.jpg";
const financingImage = "/new-landing/financing.jpg";
const aboutBackgroundImage = "/new-landing/about-bg.jpeg";

const featureCards = [
    {
        id: "viewInventory" as const,
        image: "/new-landing/feature-certified.jpg",
        icon: "✓",
        iconImage: "/new-landing/icons/icon-certified.png",
    },
    {
        id: "applyFinancing" as const,
        image: "/new-landing/feature-finance.jpg",
        icon: "$",
        iconImage: "/new-landing/icons/icon-finance.png",
    },
    {
        id: "contactUs" as const,
        image: "/new-landing/feature-tradein.jpg",
        icon: "✉",
        iconImage: "/new-landing/icons/icon-contact.png",
    },
];

const DEFAULT_FACEBOOK = "https://facebook.com";
const DEFAULT_INSTAGRAM = "https://instagram.com";
const DEFAULT_TWITTER = "https://x.com";

export default async function NewPage() {
    const [brands, categories, engines, fuels, transmissions, siteSettings, featuredSegment, t, navT, locale] = await Promise.all([
        getCachedBrands(),
        getCachedCategories(),
        getCachedEngines(),
        getCachedFuels(),
        getCachedTransmissions(),
        getCachedSiteSettings(),
        getInventorySegmentData("featured"),
        getTranslations("NewLanding"),
        getTranslations("Navbar"),
        getLocale(),
    ]);
    const businessName = siteSettings?.business_name || "Pino Auto Pro";
    const brandsTyped = (brands ?? []) as Brand[];
    const categoriesTyped = (categories ?? []) as Category[];
    const enginesTyped = (engines ?? []) as Engine[];
    const fuelsTyped = (fuels ?? []) as Fuel[];
    const transmissionsTyped = (transmissions ?? []) as Transmission[];

    return (
        <div className="bg-[#0c1320] text-white">
            <section className="relative min-h-[440px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="ML Autos hero" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative z-[10020]">
                    <SiteNavbar siteSettings={siteSettings ?? undefined} />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4">
                    <div className="pt-14 pb-16 text-center">
                        <h1 className="max-w-3xl mx-auto text-3xl md:text-5xl font-black leading-tight">
                            {t("hero.title")}
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-sm text-white/80">
                            {t("hero.subtitle")}
                        </p>
                        <form action="/inventory" method="get" className="mt-6 grid max-w-5xl mx-auto grid-cols-1 gap-2 md:grid-cols-4">
                            <select name="yearMin" className="h-10 rounded-sm bg-white px-3 text-xs text-black outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8]" defaultValue="">
                                <option value="" disabled>
                                    {t("hero.filters.year")}
                                </option>
                                {Array.from({ length: new Date().getFullYear() - 1990 + 2 }, (_, i) => 1990 + i).reverse().map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select name="brand" className="h-10 rounded-sm bg-white px-3 text-xs text-black outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8]" defaultValue="">
                                <option value="" disabled>
                                    {t("hero.filters.brand")}
                                </option>
                                {brandsTyped.map((b) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                            <input
                                name="priceMax"
                                placeholder={t("hero.filters.maxPrice")}
                                className="h-10 rounded-sm bg-white px-3 text-xs text-black placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8]"
                            />
                            <button className="h-10 rounded-sm bg-[#1d4ed8] text-xs font-bold uppercase tracking-wide hover:bg-[#1e40af]">
                                {t("hero.filters.search")}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="relative z-20 bg-[#071d38] pt-10 pb-10 md:pt-12 md:pb-14">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 -mt-20 md:-mt-28">
                        {featureCards.map((item) => {
                            const title = t(`features.${item.id}.title`);
                            const description = t(`features.${item.id}.description`);
                            const cardContent = (
                                <div className="relative flex h-[180px] items-center overflow-hidden rounded-xl border border-blue-400/30 bg-[#071d38] shadow-[0_22px_55px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-out hover:-translate-y-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={title}
                                        className="absolute inset-0 h-full w-full object-cover scale-110 opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-blue-950/85 to-blue-950/95 mix-blend-multiply" />
                                    <div className="relative z-10 flex h-full w-full flex-col justify-center p-5 text-center md:text-left items-center md:items-start">
                                        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[11px] font-black text-blue-600">
                                            {"iconImage" in item && item.iconImage ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={item.iconImage} alt="" className="h-5 w-5 scale-110 [filter:brightness(0)_saturate(100%)_invert(27%)_sepia(51%)_saturate(2878%)_hue-rotate(217deg)_contrast(1.15)]" aria-hidden />
                                            ) : (
                                                item.icon
                                            )}
                                        </div>
                                        <div className="text-sm md:text-base font-bold tracking-wide">
                                            {title}
                                        </div>
                                        <p className="mt-1 text-[11px] md:text-xs leading-snug text-white/90">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            );

                            if (item.id === "contactUs") {
                                return (
                                    <a key={item.id} href="#contact" className="block">
                                        {cardContent}
                                    </a>
                                );
                            }

                            if (item.id === "viewInventory") {
                                return (
                                    <Link key={item.id} href="/inventory" className="block">
                                        {cardContent}
                                    </Link>
                                );
                            }

                            return (
                                <div key={item.id}>
                                    {cardContent}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <InventoryLineup
                categories={categoriesTyped}
                engines={enginesTyped}
                fuels={fuelsTyped}
                transmissions={transmissionsTyped}
                initialFeaturedData={featuredSegment}
            />

            <section id="financing" className="relative overflow-hidden py-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={financingImage} alt="Financing background" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/90" />
                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <h2 className="text-3xl font-black">{t("financing.title")}</h2>
                    <p className="mt-6 max-w-xl mx-auto text-sm text-white/90">
                        {t("financing.body")}
                    </p>
                    <a href="#contact" className="mt-6 inline-block rounded-sm bg-[#1d4ed8] px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-[#1e40af]">
                        {t("financing.cta")}
                    </a>
                </div>
            </section>

            <section className="bg-white py-8 text-black" aria-labelledby="process-title">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 id="process-title" className="text-center text-2xl font-black md:text-3xl">{t("process.title")}</h2>
                    <p className="mx-auto mt-1 max-w-xl text-center text-sm text-gray-600">
                        {t("process.subtitle")}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {(["browse", "apply", "drive"] as const).map((key, i) => (
                            <div
                                key={key}
                                className="relative rounded-sm border border-gray-200 bg-gray-50/50 p-4 text-center transition-shadow hover:shadow-lg"
                            >
                                <div className="mx-auto mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-sm font-black text-white">
                                    {i + 1}
                                </div>
                                <h3 className="text-base font-bold uppercase tracking-wide text-gray-900">{t(`process.steps.${key}.title`)}</h3>
                                <p className="mt-1.5 text-sm text-gray-600">
                                    {t(`process.steps.${key}.body`)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex justify-center">
                        <Link
                            href="/inventory"
                            className="rounded-sm bg-[#1d4ed8] px-6 py-2.5 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#1e40af]"
                        >
                            {t("mission.buttons.viewInventory")}
                        </Link>
                    </div>
                </div>
            </section>

            <section id="about" className="relative py-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aboutBackgroundImage} alt="About background" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                        {/* Mission block - preserves white-card aesthetic on dark overlay */}
                        <div className="rounded-sm border border-white/10 bg-white/95 p-6 text-black shadow-xl backdrop-blur-sm">
                            <h3 className="text-xl font-black">{t("mission.title")}</h3>
                            <p className="mt-3 text-sm text-gray-700">
                                {t("mission.intro", { businessName })}
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-gray-700">
                                <li>
                                    <span className="font-semibold">{t("mission.points.customerCare.title")}</span>{" "}
                                    {t("mission.points.customerCare.body")}
                                </li>
                                <li>
                                    <span className="font-semibold">{t("mission.points.serviceExcellence.title")}</span>{" "}
                                    {t("mission.points.serviceExcellence.body")}
                                </li>
                                <li>
                                    <span className="font-semibold">{t("mission.points.transparency.title")}</span>{" "}
                                    {t("mission.points.transparency.body")}
                                </li>
                                <li>
                                    <span className="font-semibold">{t("mission.points.innovation.title")}</span>{" "}
                                    {t("mission.points.innovation.body")}
                                </li>
                                <li>
                                    <span className="font-semibold">{t("mission.points.community.title")}</span>{" "}
                                    {t("mission.points.community.body")}
                                </li>
                            </ul>
                            <p className="mt-4 text-xs text-gray-700">
                                {t("mission.outro")}
                            </p>
                        </div>
                        {/* About block - preserves dark card aesthetic */}
                        <div className="flex flex-col justify-center rounded-sm border border-white/10 bg-black/60 p-6 md:p-7">
                            <h3 className="text-2xl font-black text-white md:text-3xl">{t("about.title", { businessName })}</h3>
                            <p className="mt-3 text-sm text-white/85">
                                {t("about.paragraph1", { businessName })}
                            </p>
                            <p className="mt-3 text-sm text-white/80">
                                {t("about.paragraph2")}
                            </p>
                            <p className="mt-3 text-sm text-white/80">
                                {t("about.paragraph3", { businessName })}
                            </p>
                        </div>
                    </div>
                    {/* Shared CTAs */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/inventory" className="rounded bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white uppercase tracking-wide hover:bg-[#1e40af]">
                            {t("mission.buttons.viewInventory")}
                        </Link>
                        <a href="#contact" className="rounded bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white uppercase tracking-wide hover:bg-[#1e40af]">
                            {t("about.cta")}
                        </a>
                    </div>
                </div>
            </section>

            <section className="flex flex-col justify-end bg-gradient-to-b from-[#0c1320] via-[#15161d] to-[#17181f] py-6 min-h-[80px]">
                <div className="mx-auto max-w-6xl px-4 w-full">
                    <div className="mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-80" />
                </div>
            </section>

            <section id="browse-by-category" className="bg-[#17181f] pt-3 pb-10 text-white" aria-labelledby="browse-by-category-title">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-4">
                        <h3 id="browse-by-category-title" className="text-lg font-black uppercase tracking-wide">{t("categories.title")}</h3>
                    </div>
                    {categoriesTyped.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {categoriesTyped.slice(0, 8).map((cat) => {
                            const displayName =
                                getLocalizedCategoryName(cat, locale) || (cat.name_en ?? cat.name_es ?? cat.name) || "";
                            const imageSrc = cat.image_url
                                ? getTransformedStorageUrl(cat.image_url, CATEGORY_IMAGE)
                                : CATEGORY_PLACEHOLDER;
                            return (
                                    <Link
                                        key={cat.id}
                                        href={`/inventory?category=${encodeURIComponent(displayName)}`}
                                        className="group block overflow-hidden rounded-sm border border-white/10 bg-[#22242c] shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageSrc}
                                            alt={displayName}
                                            loading="eager"
                                            className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="border-t border-white/5 bg-gradient-to-r from-[#1d283a] via-[#111827] to-[#1d283a] p-3 text-center">
                                            <div className="text-xs font-bold uppercase tracking-wide">
                                                {displayName}
                                            </div>
                                            <span className="mt-2 inline-flex items-center justify-center rounded-sm bg-[#1d4ed8] px-3 py-1 text-[10px] font-bold uppercase tracking-wide group-hover:bg-[#1e40af]">
                                                {t("categories.viewListings")}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-sm border border-white/10 bg-[#22242c] p-6 text-center">
                            <p className="text-sm text-white/80">{t("categories.subtitle")}</p>
                            <Link
                                href="/inventory"
                                className="mt-4 inline-flex items-center justify-center rounded-sm bg-[#1d4ed8] px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-[#1e40af]"
                            >
                                {t("categories.viewListings")}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-gradient-to-b from-[#17181f] via-[#15161d] to-[#111217] py-6">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-80" />
                </div>
            </section>

            <section className="bg-[#111217] py-12 text-white">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                                {t("reviews.label")}
                            </p>
                            <h3 className="text-xl font-black tracking-tight sm:text-2xl">
                                {t("reviews.title")}
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
                            <span>{t("reviews.summary")}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            {
                                key: "james" as const,
                            },
                            {
                                key: "sarah" as const,
                            },
                            {
                                key: "mike" as const,
                            },
                        ].map((review, index) => (
                            <div
                                key={index}
                                className="group rounded-xl border border-[#1d4ed8]/30 bg-[#1e3a5f]/30 p-0 transition-transform duration-300 hover:-translate-y-1.5 hover:border-[#4338ca]/70"
                            >
                                <div className="flex items-start gap-3 p-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8]/25 ring-2 ring-[#1d4ed8]/40">
                                        <span className="text-lg font-bold text-white/80">
                                            {t(`reviews.items.${review.key}.name`).charAt(0)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white">
                                            {t(`reviews.items.${review.key}.name`)}
                                        </p>
                                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/60">
                                            {t(`reviews.items.${review.key}.role`)}
                                        </p>
                                        <p className="mt-3 text-sm leading-relaxed text-white/80">
                                            {t(`reviews.items.${review.key}.text`)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="bg-[#0c1320] pt-0 pb-0 text-white">
                <ContactMap variant="large" />
            </section>

            <footer className="bg-[#171717] py-10 text-xs text-white/80">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 text-center sm:grid-cols-2 sm:gap-8 sm:text-left md:grid-cols-3">
                    <div>
                        {siteSettings?.logo_light ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={siteSettings.logo_light}
                                alt={businessName}
                                className="mx-auto mb-3 h-8 max-w-[140px] object-contain object-center sm:mx-0 sm:object-left"
                            />
                        ) : (
                            <h4 className="mb-3 font-bold uppercase text-white">
                                {businessName}
                            </h4>
                        )}
                        <p className="text-white/60">{t("footer.addressLine1")}</p>
                        <p className="text-white/60">{t("footer.phone")}</p>
                        <p className="text-white/60">{t("footer.email")}</p>
                        <hr className="mt-4 mb-2 border-white/10" />
                        <div className="mt-2 flex flex-col gap-1">
                            <Link href="/legal/terms" className="text-white/60 hover:text-white">
                                {navT("links.terms")}
                            </Link>
                            <Link href="/legal/privacy" className="text-white/60 hover:text-white">
                                {navT("links.privacy")}
                            </Link>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
                            <a
                                href={siteSettings?.facebook_url || DEFAULT_FACEBOOK}
                                aria-label="Visit us on Facebook"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#1877f2]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/new-landing/icons/icon-facebook.png"
                                    alt="Facebook"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                            <a
                                href={siteSettings?.instagram_url || DEFAULT_INSTAGRAM}
                                aria-label="Visit us on Instagram"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#e1306c]/60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/new-landing/icons/icon-instagram.png"
                                    alt="Instagram"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                            <a
                                href={siteSettings?.twitter_url || DEFAULT_TWITTER}
                                aria-label="Visit us on X"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-white/70"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/new-landing/icons/icon-x-twitter.png"
                                    alt="X (Twitter)"
                                    className="h-4 w-4 brightness-0 invert"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="min-w-0 text-center sm:ml-auto sm:w-fit sm:min-w-[10rem] sm:text-left md:ml-0">
                        <h4 className="mb-2 font-bold uppercase tracking-wide text-white text-[11px]">
                            {t("footer.hoursTitle")}
                        </h4>
                        <dl className="mx-auto flex w-fit flex-col gap-0.5 text-[11px] text-white/60 sm:mx-0 sm:w-full">
                            {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((key) => {
                                const raw = t(`footer.hours.${key}`);
                                const colonIdx = raw.indexOf(":");
                                const day = colonIdx >= 0 ? raw.slice(0, colonIdx).trim() : raw;
                                const hours = colonIdx >= 0 ? raw.slice(colonIdx + 1).trim() : "";
                                const isWeekend = key === "sat";
                                return (
                                    <div
                                        key={key}
                                        className={`flex justify-between gap-4 ${isWeekend ? "border-t border-white/10 pt-1 mt-0.5" : ""}`}
                                    >
                                        <dt className="w-10 shrink-0 text-white/50">{day}</dt>
                                        <dd className="text-right tabular-nums">{hours}</dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                    <div className="hidden md:block">
                        <h4 className="mb-3 font-bold uppercase text-white">
                            {t("footer.navTitle")}
                        </h4>
                        <nav className="flex flex-col gap-1">
                            <Link href="/inventory" className="text-white/60 hover:text-white">
                                {navT("links.inventory")}
                            </Link>
                            <Link href="/new#about" className="text-white/60 hover:text-white">
                                {navT("links.about")}
                            </Link>
                            <Link href="/new#contact" className="text-white/60 hover:text-white">
                                {navT("links.contact")}
                            </Link>
                        </nav>
                    </div>
                </div>
                <div id="footer-bottom-bar" className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-2 border-t border-white/10 px-4 pt-4 text-[10px] text-white/60 sm:flex-row sm:justify-between">
                    <div>{t("footer.poweredBy", { businessName })}</div>
                    <div>{t("footer.copyright", { businessName })}</div>
                </div>
            </footer>
            <ScrollToTopButton />
        </div>
    );
}
