import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import ContactMap from "@/components/ContactMap";
import { getCachedSiteSettings } from "@/lib/supabase/cached";
import type { OpeningHoursJson } from "@/lib/types";

interface SiteFooterProps {
    /** When false, skip the map section (page already has it). Default: true */
    showMap?: boolean;
    /** Base path for about/contact anchors (e.g. "/new" for /new#about). Default: "" for /#about */
    basePath?: string;
}

const DEFAULT_FACEBOOK = "https://facebook.com";
const DEFAULT_INSTAGRAM = "https://instagram.com";
const DEFAULT_TWITTER = "https://x.com";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DB_DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function formatTimeForLocale(time24: string, locale: string): string {
    const [hStr, mStr] = time24.split(":");
    const hour = parseInt(hStr ?? "0", 10);
    const minute = parseInt(mStr ?? "0", 10);
    if (locale === "fr") {
        return `${hour} h`;
    }
    if (locale === "es") {
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
    const period = hour >= 12 ? "pm" : "am";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}${minute > 0 ? ":" + mStr : ""}${period}`;
}

function formatHoursRange(open: string, close: string, locale: string): string {
    const openFmt = formatTimeForLocale(open, locale);
    const closeFmt = formatTimeForLocale(close, locale);
    if (locale === "fr") return `${openFmt} à ${closeFmt}`;
    return `${openFmt}-${closeFmt}`;
}

function getNavLinks(basePath: string) {
    return [
        { href: "/inventory", labelKey: "links.inventory" as const },
        { href: basePath ? `${basePath}#about` : "/#about", labelKey: "links.about" as const },
        { href: basePath ? `${basePath}#contact` : "/#contact", labelKey: "links.contact" as const },
    ];
}

export default async function SiteFooter({ showMap = true, basePath = "" }: SiteFooterProps) {
    const [landingT, navT, siteSettings, locale] = await Promise.all([
        getTranslations("NewLanding"),
        getTranslations("Navbar"),
        getCachedSiteSettings(),
        getLocale(),
    ]);
    const openingHours = (siteSettings?.opening_hours ?? null) as OpeningHoursJson | null;
    const businessName = siteSettings?.business_name || "Pino Auto Pro";
    const address = siteSettings?.address || landingT("footer.addressLine1");
    const email = siteSettings?.email || landingT("footer.email");
    const phone = siteSettings?.phone || landingT("footer.phone");
    const facebookUrl = siteSettings?.facebook_url || DEFAULT_FACEBOOK;
    const instagramUrl = siteSettings?.instagram_url || DEFAULT_INSTAGRAM;
    const twitterUrl = siteSettings?.twitter_url || DEFAULT_TWITTER;

    return (
        <>
            {showMap && (
                <section className="bg-[#0c1320] text-white" aria-label="Map">
                    <ContactMap showForm={false} />
                </section>
            )}
            <footer className="bg-[#171717] py-10 text-xs text-white/80">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 text-center sm:grid-cols-2 sm:gap-8 sm:text-left md:grid-cols-3">
                <div>
                    {siteSettings?.logo_light ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={siteSettings.logo_light}
                            alt={businessName}
                            className="mx-auto mb-3 h-8 md:h-10 max-w-[160px] object-contain object-center sm:mx-0 sm:object-left"
                        />
                    ) : (
                        <h4 className="mb-3 font-bold uppercase text-white">
                            {businessName}
                        </h4>
                    )}
                    <p className="text-white/60">{address}</p>
                    {phone && (
                        <p className="text-white/60">
                            <a href={`tel:${phone.replace(/\D/g, "")}`} className="hover:text-white">
                                {phone}
                            </a>
                        </p>
                    )}
                    {email && (
                        <p className="text-white/60">
                            <a href={`mailto:${email}`} className="hover:text-white">
                                {email}
                            </a>
                        </p>
                    )}
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
                            href={facebookUrl}
                            aria-label="Visit us on Facebook"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#1877f2]/60"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/icon-facebook.png"
                                alt="Facebook"
                                className="h-4 w-4 brightness-0 invert"
                            />
                        </a>
                        <a
                            href={instagramUrl}
                            aria-label="Visit us on Instagram"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-[#e1306c]/60"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/icon-instagram.png"
                                alt="Instagram"
                                className="h-4 w-4 brightness-0 invert"
                            />
                        </a>
                        <a
                            href={twitterUrl}
                            aria-label="Visit us on X"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/15 hover:bg-white/10 hover:ring-white/70"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/icon-x.png"
                                alt="X (Twitter)"
                                className="h-4 w-4 brightness-0 invert"
                            />
                        </a>
                    </div>
                </div>
                {openingHours && Object.keys(openingHours).length > 0 && (
                <div className="min-w-0 text-center sm:ml-auto sm:w-fit sm:min-w-[10rem] sm:text-left md:ml-0">
                    <h4 className="mb-2 font-bold uppercase tracking-wide text-white text-[11px]">
                        {landingT("footer.hoursTitle")}
                    </h4>
                    <dl className="mx-auto flex w-fit flex-col gap-0.5 text-[11px] text-white/60 sm:mx-0 sm:w-full">
                        {DAY_KEYS.map((key, idx) => {
                            const dbKey = DB_DAY_KEYS[idx];
                            const dayLabel = landingT(`footer.dayAbbrev.${key}`);
                            const dayData = openingHours?.[dbKey] ?? null;
                            let hoursDisplay: string;
                            if (dayData) {
                                if ("closed" in dayData && dayData.closed) {
                                    hoursDisplay = landingT("footer.hoursClosed");
                                } else if ("open" in dayData && "close" in dayData) {
                                    hoursDisplay = formatHoursRange(dayData.open, dayData.close, locale);
                                } else {
                                    hoursDisplay = landingT("footer.hoursClosed");
                                }
                            } else {
                                hoursDisplay = "—";
                            }
                            const isWeekend = key === "sat";
                            return (
                                <div
                                    key={key}
                                    className={`flex justify-between gap-4 ${isWeekend ? "border-t border-white/10 pt-1 mt-0.5" : ""}`}
                                >
                                    <dt className="w-10 shrink-0 text-white/50">{dayLabel}</dt>
                                    <dd className="text-right tabular-nums">{hoursDisplay}</dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>
                )}
                <div className="hidden md:block">
                    <h4 className="mb-3 font-bold uppercase text-white">
                        {landingT("footer.navTitle")}
                    </h4>
                    <nav className="flex flex-col gap-1">
                        {getNavLinks(basePath).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-white/60 hover:text-white"
                            >
                                {navT(link.labelKey)}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            <div id="footer-bottom-bar" className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-2 border-t border-white/10 px-4 pt-4 text-[10px] text-white/60 sm:flex-row sm:justify-between">
                <div>{landingT("footer.poweredBy", { businessName })}</div>
                <div>{landingT("footer.copyright", { businessName })}</div>
            </div>
        </footer>
        </>
    );
}
