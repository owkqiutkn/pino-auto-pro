"use client";

import { useMemo, useState } from "react";

type OptionItem = {
    id: string;
    name: string;
};

type BrandModelItem = {
    id: string;
    name: string;
    brand_id: string;
};

interface HomeSearchFormProps {
    categories: OptionItem[];
    brands: OptionItem[];
    brandModels: BrandModelItem[];
}

export default function HomeSearchForm({ categories, brands, brandModels }: HomeSearchFormProps) {
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");

    const selectedBrandId = useMemo(
        () => brands.find((item) => item.name === brand)?.id || "",
        [brand, brands]
    );

    const modelOptions = useMemo(() => {
        const models = selectedBrandId
            ? brandModels.filter((item) => item.brand_id === selectedBrandId)
            : [];
        return Array.from(new Set(models.map((item) => item.name))).sort((a, b) => a.localeCompare(b));
    }, [brandModels, selectedBrandId]);

    return (
        <form action="/inventory" method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
                name="brand"
                value={brand}
                onChange={(event) => {
                    setBrand(event.target.value);
                    setModel("");
                }}
                className="w-full bg-[#f8f5f5] border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f20d0d]/50 appearance-none"
            >
                <option value="">Any Make</option>
                {brands.map((item) => (
                    <option key={item.id} value={item.name}>
                        {item.name}
                    </option>
                ))}
            </select>
            <select
                name="category"
                className="w-full bg-[#f8f5f5] border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f20d0d]/50 appearance-none"
            >
                <option value="">All Categories</option>
                {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                        {item.name}
                    </option>
                ))}
            </select>
            <select
                name="model"
                value={model}
                disabled={!selectedBrandId}
                onChange={(event) => setModel(event.target.value)}
                className="w-full bg-[#f8f5f5] border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f20d0d]/50 appearance-none"
            >
                <option value="">Any Model</option>
                {modelOptions.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                className="bg-[#f20d0d] text-white rounded-lg h-12 font-bold inline-flex items-center justify-center hover:opacity-90"
            >
                Search Results
            </button>
        </form>
    );
}
