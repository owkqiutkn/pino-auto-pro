import Link from "next/link";
import { getTranslations } from "next-intl/server";
import InventoryHero from "@/components/InventoryHero";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const legalDocuments = [
    { id: "terms", titleKey: "terms" },
    { id: "privacy", titleKey: "privacy" },
    { id: "refund", titleKey: "refund" },
];

export default async function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = await getTranslations("Legal");

    return (
        <div className="min-h-screen bg-white">
            <InventoryHero title={t("title")} />

            <div className="mx-auto max-w-6xl px-4 pt-8 pb-16">
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3
                                className="text-lg font-bold"
                                style={{ color: "#1d4ed8" }}
                            >
                                {t("heading")}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {t("intro")}
                            </p>
                        </div>
                        <nav className="flex items-center gap-2">
                            {legalDocuments.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/legal/${doc.id}`}
                                    className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#1d4ed8] hover:bg-gray-50 hover:text-[#1d4ed8]"
                                >
                                    {t(doc.titleKey)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {children}
                </div>
            </div>

            <SiteFooter />
            <ScrollToTopButton />
        </div>
    );
}
