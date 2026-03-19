import Link from "next/link";
import ContactMapTest3 from "@/components/ContactMapTest3";
import InventoryLineupTest3 from "@/components/InventoryLineupTest3";
import SiteFooter from "@/components/SiteFooter";
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

// Palette (from provided reference image)
const PALETTE = {
    charcoal: "#1C1C1E",
    deepAmethyst: "#2A0F3B",
    royalGold: "#D4AF37",
    imperialAubergine: "#1F0C33",
    creamWhite: "#E5E1D3",
    royalGoldHover: "#B99320",
} as const;

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

export default async function Test3Page() {
    const [brands, categories, engines, fuels, transmissions, siteSettings, featuredSegment, t, locale] = await Promise.all([
        getCachedBrands(),
        getCachedCategories(),
        getCachedEngines(),
        getCachedFuels(),
        getCachedTransmissions(),
        getCachedSiteSettings(),
        getInventorySegmentData("featured"),
        getTranslations("NewLanding"),
        getLocale(),
    ]);
    const businessName = siteSettings?.business_name || "Pino Auto Pro";
    const brandsTyped = (brands ?? []) as Brand[];
    const categoriesTyped = (categories ?? []) as Category[];
    const enginesTyped = (engines ?? []) as Engine[];
    const fuelsTyped = (fuels ?? []) as Fuel[];
    const transmissionsTyped = (transmissions ?? []) as Transmission[];

    return (
        <div className="text-[#E5E1D3]" style={{ backgroundColor: PALETTE.charcoal }}>
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
                        <p className="mt-3 max-w-2xl mx-auto text-sm text-[#E5E1D3]/80">
                            {t("hero.subtitle")}
                        </p>
                        <form action="/inventory" method="get" className="mt-6 grid max-w-5xl mx-auto grid-cols-2 gap-2 md:grid-cols-4">
                            <select
                                name="yearMin"
                                className="h-10 rounded-sm bg-[#E5E1D3] px-3 text-xs text-[#1C1C1E] outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B]"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    {t("hero.filters.year")}
                                </option>
                                {Array.from({ length: new Date().getFullYear() - 1990 + 2 }, (_, i) => 1990 + i).reverse().map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select
                                name="brand"
                                className="h-10 rounded-sm bg-[#E5E1D3] px-3 text-xs text-[#1C1C1E] outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B]"
                                defaultValue=""
                            >
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
                                className="h-10 rounded-sm bg-[#E5E1D3] px-3 text-xs text-[#1C1C1E] placeholder:text-[#1C1C1E]/60 outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B]"
                            />
                            <button
                                className="h-10 rounded-sm text-xs font-bold uppercase tracking-wide text-[#1C1C1E]"
                                style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                            >
                                {t("hero.filters.search")}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="relative z-20 pt-10 pb-10 md:pt-12 md:pb-14" style={{ backgroundColor: PALETTE.imperialAubergine }}>
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 -mt-20 md:-mt-28">
                        {featureCards.map((item) => {
                            const title = t(`features.${item.id}.title`);
                            const description = t(`features.${item.id}.description`);
                            const cardContent = (
                                <div
                                    className="relative flex h-[180px] items-center overflow-hidden rounded-xl border shadow-[0_22px_55px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-out hover:-translate-y-2"
                                    style={{
                                        backgroundColor: PALETTE.imperialAubergine,
                                        borderColor: "rgba(184, 134, 11, 0.35)",
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={title}
                                        className="absolute inset-0 h-full w-full object-cover scale-110 opacity-60"
                                    />
                                    <div
                                        className="absolute inset-0 mix-blend-multiply"
                                        style={{
                                            backgroundImage: `linear-gradient(to bottom right, rgba(45, 22, 67, 0.55), rgba(45, 22, 67, 0.8), rgba(28, 28, 30, 0.95))`,
                                        }}
                                    />
                                    <div className="relative z-10 flex h-full w-full flex-col justify-center p-5 text-center md:text-left items-center md:items-start">
                                        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E1D3] text-[11px] font-black text-[#2D1643]">
                                            {"iconImage" in item && item.iconImage ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={item.iconImage}
                                                    alt=""
                                                    className="h-5 w-5 scale-110 [filter:brightness(0)_saturate(100%)_invert(11%)_sepia(28%)_saturate(2280%)_hue-rotate(246deg)_contrast(1.05)]"
                                                    aria-hidden
                                                />
                                            ) : (
                                                item.icon
                                            )}
                                        </div>
                                        <div className="text-sm md:text-base font-bold tracking-wide">
                                            {title}
                                        </div>
                                        <p className="mt-1 text-[11px] md:text-xs leading-snug text-[#E5E1D3]/90">
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

            <InventoryLineupTest3
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
                    <p className="mt-6 max-w-xl mx-auto text-sm text-[#E5E1D3]/90">
                        {t("financing.body")}
                    </p>
                    <a
                        href="#contact"
                        className="mt-6 inline-block rounded-sm px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#1C1C1E]"
                        style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                    >
                        {t("financing.cta")}
                    </a>
                </div>
            </section>

            <section className="py-8" aria-labelledby="process-title" style={{ backgroundColor: PALETTE.creamWhite, color: PALETTE.charcoal }}>
                <div className="mx-auto max-w-6xl px-4">
                    <h2 id="process-title" className="text-center text-2xl font-black md:text-3xl">{t("process.title")}</h2>
                    <p className="mx-auto mt-1 max-w-xl text-center text-sm text-[#1C1C1E]/70">
                        {t("process.subtitle")}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {(["browse", "apply", "drive"] as const).map((key, i) => (
                            <div
                                key={key}
                                className="relative rounded-sm border p-4 text-center transition-shadow hover:shadow-lg"
                                style={{ borderColor: "rgba(45, 22, 67, 0.18)", backgroundColor: "rgba(229, 225, 211, 0.55)" }}
                            >
                                <div
                                    className="mx-auto mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black"
                                    style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                                >
                                    {i + 1}
                                </div>
                                <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: PALETTE.imperialAubergine }}>
                                    {t(`process.steps.${key}.title`)}
                                </h3>
                                <p className="mt-1.5 text-sm text-[#1C1C1E]/75">
                                    {t(`process.steps.${key}.body`)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex justify-center">
                        <Link
                            href="/inventory"
                            className="rounded-sm px-6 py-2.5 text-sm font-bold uppercase tracking-wide"
                            style={{ backgroundColor: PALETTE.imperialAubergine, color: PALETTE.creamWhite }}
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
                        <div className="flex flex-col justify-center rounded-sm border border-white/10 bg-black/60 p-6 md:p-7">
                            <h3 className="text-2xl font-black text-[#E5E1D3] md:text-3xl">{t("about.title", { businessName })}</h3>
                            <p className="mt-3 text-sm text-[#E5E1D3]/85">
                                {t("about.paragraph1", { businessName })}
                            </p>
                            <p className="mt-3 text-sm text-[#E5E1D3]/80">
                                {t("about.paragraph2")}
                            </p>
                            <p className="mt-3 text-sm text-[#E5E1D3]/80">
                                {t("about.paragraph3", { businessName })}
                            </p>
                        </div>
                        <div className="rounded-sm border p-6 shadow-xl backdrop-blur-sm" style={{ borderColor: "rgba(184, 134, 11, 0.25)", backgroundColor: "rgba(229, 225, 211, 0.94)", color: PALETTE.charcoal }}>
                            <h3 className="text-xl font-black" style={{ color: PALETTE.imperialAubergine }}>{t("mission.title")}</h3>
                            <p className="mt-3 text-sm text-[#1C1C1E]/75">
                                {t("mission.intro", { businessName })}
                            </p>
                            <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-[#1C1C1E]/80">
                                <li>
                                    <span className="font-semibold" style={{ color: PALETTE.deepAmethyst }}>{t("mission.points.customerCare.title")}</span>{" "}
                                    {t("mission.points.customerCare.body")}
                                </li>
                                <li>
                                    <span className="font-semibold" style={{ color: PALETTE.deepAmethyst }}>{t("mission.points.serviceExcellence.title")}</span>{" "}
                                    {t("mission.points.serviceExcellence.body")}
                                </li>
                                <li>
                                    <span className="font-semibold" style={{ color: PALETTE.deepAmethyst }}>{t("mission.points.transparency.title")}</span>{" "}
                                    {t("mission.points.transparency.body")}
                                </li>
                                <li>
                                    <span className="font-semibold" style={{ color: PALETTE.deepAmethyst }}>{t("mission.points.innovation.title")}</span>{" "}
                                    {t("mission.points.innovation.body")}
                                </li>
                                <li>
                                    <span className="font-semibold" style={{ color: PALETTE.deepAmethyst }}>{t("mission.points.community.title")}</span>{" "}
                                    {t("mission.points.community.body")}
                                </li>
                            </ul>
                            <p className="mt-4 text-xs text-[#1C1C1E]/75">
                                {t("mission.outro")}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                        <Link
                            href="/inventory"
                            className="rounded px-4 py-2 text-xs font-bold uppercase tracking-wide"
                            style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                        >
                            {t("mission.buttons.viewInventory")}
                        </Link>
                        <a
                            href="#contact"
                            className="rounded px-4 py-2 text-xs font-bold uppercase tracking-wide"
                            style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                        >
                            {t("about.cta")}
                        </a>
                    </div>
                </div>
            </section>

            <section
                className="flex flex-col justify-end py-6 min-h-[80px]"
                style={{ backgroundColor: "#13051F" }}
            >
                <div className="mx-auto max-w-6xl px-4 w-full">
                    <div className="mx-auto h-px max-w-xs opacity-80" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(229, 225, 211, 0.25), transparent)` }} />
                </div>
            </section>

            <section
                id="browse-by-category"
                className="pt-3 pb-10"
                aria-labelledby="browse-by-category-title"
                style={{
                    backgroundColor: "#13051F",
                    backgroundImage: "linear-gradient(to bottom, #13051F 0%, #13051F 22%, rgba(18, 18, 20, 0.18) 100%)",
                }}
            >
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
                                        className="group block overflow-hidden rounded-sm border shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
                                        style={{ borderColor: "rgba(229, 225, 211, 0.12)", backgroundColor: "rgba(28, 28, 30, 0.55)" }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageSrc}
                                            alt={displayName}
                                            loading="eager"
                                            className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div
                                            className="border-t p-3 text-center"
                                            style={{
                                                borderColor: "rgba(229, 225, 211, 0.08)",
                                                backgroundImage: `linear-gradient(to right, ${PALETTE.deepAmethyst}, ${PALETTE.imperialAubergine}, ${PALETTE.deepAmethyst})`,
                                            }}
                                        >
                                            <div className="text-xs font-bold uppercase tracking-wide">
                                                {displayName}
                                            </div>
                                            <span
                                                className="mt-2 inline-flex items-center justify-center rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
                                                style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                                            >
                                                {t("categories.viewListings")}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-sm border p-6 text-center" style={{ borderColor: "rgba(229, 225, 211, 0.12)", backgroundColor: "rgba(28, 28, 30, 0.55)" }}>
                            <p className="text-sm text-[#E5E1D3]/80">{t("categories.subtitle")}</p>
                            <Link
                                href="/inventory"
                                className="mt-4 inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-bold uppercase tracking-wide"
                                style={{ backgroundColor: PALETTE.royalGold, color: PALETTE.charcoal }}
                            >
                                {t("categories.viewListings")}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-6" style={{ backgroundImage: `linear-gradient(to bottom, #13051F 0%, #17031F 22%, #1B0628 55%, #161018 78%, #121214 100%)` }}>
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto h-px max-w-xs opacity-80" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(229, 225, 211, 0.3), transparent)` }} />
                </div>
            </section>

            <section className="py-12" style={{ backgroundColor: "#121214" }}>
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E5E1D3]/60">
                                {t("reviews.label")}
                            </p>
                            <h3 className="text-xl font-black tracking-tight sm:text-2xl">
                                {t("reviews.title")}
                            </h3>
                        </div>
                        <div
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-medium border"
                            style={{
                                backgroundColor: "rgba(229, 225, 211, 0.06)",
                                color: "rgba(229, 225, 211, 0.82)",
                                borderColor: "rgba(212, 175, 55, 0.22)",
                            }}
                        >
                            <div className="flex items-center" style={{ color: PALETTE.royalGold }}>
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
                                className="group rounded-xl border p-0 transition-transform duration-300 hover:-translate-y-1.5"
                                style={{
                                    borderColor: "rgba(184, 134, 11, 0.22)",
                                    backgroundColor: "rgba(45, 22, 67, 0.22)",
                                }}
                            >
                                <div className="flex items-start gap-3 p-4">
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2"
                                        style={{
                                            backgroundColor: "rgba(212, 175, 55, 0.10)",
                                            borderColor: "rgba(212, 175, 55, 0.55)",
                                        }}
                                    >
                                        <span className="text-lg font-bold text-[#E5E1D3]/80">
                                            {t(`reviews.items.${review.key}.name`).charAt(0)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-[#E5E1D3]">
                                            {t(`reviews.items.${review.key}.name`)}
                                        </p>
                                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#E5E1D3]/60">
                                            {t(`reviews.items.${review.key}.role`)}
                                        </p>
                                        <p className="mt-3 text-sm leading-relaxed text-[#E5E1D3]/80">
                                            {t(`reviews.items.${review.key}.text`)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="pt-0 pb-0" style={{ backgroundColor: PALETTE.charcoal }}>
                <ContactMapTest3 variant="large" />
            </section>

            <SiteFooter showMap={false} basePath="/" />
            <ScrollToTopButton />
        </div>
    );
}

