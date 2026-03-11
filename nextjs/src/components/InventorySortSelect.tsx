"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
    { value: "", label: "Sort By" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "year-desc", label: "Year: Newest First" },
    { value: "year-asc", label: "Year: Oldest First" },
] as const;

interface InventorySortSelectProps {
    currentSort?: string;
}

export default function InventorySortSelect({ currentSort = "" }: InventorySortSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

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
            {SORT_OPTIONS.map((opt) => (
                <option key={opt.value || "default"} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
