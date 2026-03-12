import { getTranslations } from "next-intl/server";
import ContactMap from "@/components/ContactMap";

export default async function SiteFooter() {
    const landingT = await getTranslations("NewLanding");

    return (
        <>
            <section className="bg-[#0c1320] text-white" aria-label="Map">
                <ContactMap showForm={false} />
            </section>
            <footer className="bg-[#171717] py-10 text-xs text-white/80">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-3">
                <div>
                    <h4 className="mb-3 font-bold uppercase text-white">
                        {landingT("footer.contactTitle")}
                    </h4>
                    <p className="text-white/60">{landingT("footer.addressLine1")}</p>
                    <p className="text-white/60">{landingT("footer.phone")}</p>
                    <p className="text-white/60">{landingT("footer.email")}</p>
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
                <div>
                    <h4 className="mb-3 font-bold uppercase text-white">
                        {landingT("footer.hoursTitle")}
                    </h4>
                    <p className="text-white/60">{landingT("footer.hours.mon")}</p>
                    <p className="text-white/60">{landingT("footer.hours.tue")}</p>
                    <p className="text-white/60">{landingT("footer.hours.wed")}</p>
                    <p className="text-white/60">{landingT("footer.hours.thu")}</p>
                    <p className="text-white/60">{landingT("footer.hours.fri")}</p>
                    <p className="text-white/60">{landingT("footer.hours.sat")}</p>
                    <p className="text-white/60">{landingT("footer.hours.sun")}</p>
                </div>
                <div className="hidden md:block">
                    <h4 className="mb-3 font-bold uppercase text-white">
                        {landingT("footer.inventoryTitle")}
                    </h4>
                    <p className="text-white/60">{landingT("footer.inventoryItems.sedan")}</p>
                    <p className="text-white/60">{landingT("footer.inventoryItems.suv")}</p>
                    <p className="text-white/60">{landingT("footer.inventoryItems.coupe")}</p>
                </div>
            </div>
            <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 pt-4 text-[10px] text-white/60">
                <div>{landingT("footer.poweredBy")}</div>
                <div>{landingT("footer.copyright")}</div>
            </div>
        </footer>
        </>
    );
}
