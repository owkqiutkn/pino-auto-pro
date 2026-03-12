import { getTranslations } from "next-intl/server";
import SiteNavbar from "@/components/SiteNavbar";

const INVENTORY_HERO_IMAGE = "/new-landing/hero.jpg";

interface InventoryHeroProps {
    /** When provided (e.g. on car detail page), shows car name on mobile instead of default title */
    title?: string;
}

export default async function InventoryHero({ title }: InventoryHeroProps) {
    const t = await getTranslations("Inventory.page");
    const displayTitle = title ?? t("title");
    return (
        <section
            className="relative overflow-hidden"
            style={{ backgroundImage: `url(${INVENTORY_HERO_IMAGE})`, backgroundPosition: "center 10%", backgroundSize: "cover" }}
            aria-label={t("heroAria")}
        >
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative z-[10020]">
                <SiteNavbar />
            </div>
            <div className="relative mx-auto flex h-[55px] max-w-7xl items-center px-4 opacity-90 lg:items-end lg:pb-3">
                <div className="lg:hidden">
                    <p className="text-xl font-bold text-white">
                        {displayTitle}
                    </p>
                </div>
            </div>
        </section>
    );
}
