import ContactMap from "@/components/ContactMap";
import { ContactForm } from "@/components/ContactForm";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="bg-[#0c1320] text-white">
            <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
                        Contact
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                        Get in touch with our team
                    </h1>
                    <p className="mt-3 text-sm text-white/75 md:text-base">
                        Tell us what you&apos;re looking for and we&apos;ll respond as soon as possible
                        with next steps, vehicle options, and clear pricing.
                    </p>
                </div>

                <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start">
                    <div className="rounded-xl border border-white/10 bg-[#111827]/70 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.75)] backdrop-blur">
                        <ContactForm />
                    </div>
                    <div className="h-full min-h-[260px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
                        <ContactMap variant="large" />
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                    <p>
                        Prefer to browse first?{" "}
                        <Link href="/inventory" className="font-semibold text-white hover:underline">
                            Explore our inventory
                        </Link>
                        .
                    </p>
                    <p>
                        Looking for directions? Scroll on the map or tap to open full-screen in your
                        maps app.
                    </p>
                </div>
            </main>
        </div>
    );
}

