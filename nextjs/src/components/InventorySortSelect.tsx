"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SORT_VALUES = ["", "price-asc", "price-desc", "year-desc", "year-asc"] as const;

interface InventorySortSelectProps {
    currentSort?: string;
}

export default function InventorySortSelect({ currentSort = "" }: InventorySortSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("Inventory.sort");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("sort", value);
        } else {
            params.delete("sort");
        }
        router.push(`/inventory?${params.toString()}`);
    };

    return (
        <select
            value={currentSort}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
        >
            {SORT_VALUES.map((value) => (
                <option key={value || "default"} value={value}>
                    {value === ""
                        ? t("default")
                        : value === "price-asc"
                        ? t("priceAsc")
                        : value === "price-desc"
                        ? t("priceDesc")
                        : value === "year-desc"
                        ? t("yearDesc")
                        : t("yearAsc")}
                </option>
            ))}
        </select>
    );
}
