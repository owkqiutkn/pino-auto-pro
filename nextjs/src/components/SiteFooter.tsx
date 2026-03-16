import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ContactMap from "@/components/ContactMap";
import { getCachedSiteSettings } from "@/lib/supabase/cached";

const navLinks = [
    { href: "/inventory", labelKey: "links.inventory" },
    { href: "/#about", labelKey: "links.about" },
    { href: "/#contact", labelKey: "links.contact" },
    { href: "/legal/terms", labelKey: "links.terms" },
    { href: "/legal/privacy", labelKey: "links.privacy" },
];

const DEFAULT_FACEBOOK = "https://facebook.com";
const DEFAULT_INSTAGRAM = "https://instagram.com";
const DEFAULT_TWITTER = "https://x.com";

export default async function SiteFooter() {
    const [landingT, navT, siteSettings] = await Promise.all([
        getTranslations("NewLanding"),
        getTranslations("Navbar"),
        getCachedSiteSettings(),
    ]);
    const businessName = siteSettings?.business_name || "Pino Auto Pro";
    const facebookUrl = siteSettings?.facebook_url || DEFAULT_FACEBOOK;
    const instagramUrl = siteSettings?.instagram_url || DEFAULT_INSTAGRAM;
    const twitterUrl = siteSettings?.twitter_url || DEFAULT_TWITTER;

    return (
        <>
            <section className="bg-[#0c1320] text-white" aria-label="Map">
                <ContactMap showForm={false} />
            </section>
            <footer className="bg-[#171717] py-10 text-xs text-white/80">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-3">
                <div>
                    {siteSettings?.logo_light ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={siteSettings.logo_light}
                            alt={businessName}
                            className="mb-3 h-8 max-w-[140px] object-contain object-left"
                        />
                    ) : (
                        <h4 className="mb-3 font-bold uppercase text-white">
                            {businessName}
                        </h4>
                    )}
                    <p className="text-white/60">{landingT("footer.addressLine1")}</p>
                    <p className="text-white/60">{landingT("footer.phone")}</p>
                    <p className="text-white/60">{landingT("footer.email")}</p>
                    <div className="mt-4 flex items-center gap-3">
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
                <div className="ml-auto w-fit min-w-[10rem] max-w-full md:ml-0">
                    <h4 className="mb-2 font-bold uppercase tracking-wide text-white text-[11px]">
                        {landingT("footer.hoursTitle")}
                    </h4>
                    <dl className="flex flex-col gap-0.5 text-[11px] text-white/60">
                        {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((key) => {
                            const raw = landingT(`footer.hours.${key}`);
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
                        {landingT("footer.navTitle")}
                    </h4>
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => (
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
            <div id="footer-bottom-bar" className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 pt-4 text-[10px] text-white/60">
                <div>{landingT("footer.poweredBy", { businessName })}</div>
                <div>{landingT("footer.copyright", { businessName })}</div>
            </div>
        </footer>
        </>
    );
}
