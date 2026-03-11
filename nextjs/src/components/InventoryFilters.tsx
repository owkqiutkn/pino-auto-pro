"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DEBOUNCE_MS = 350;

type Brand = { id: string; name: string };
type Category = { id: string; name: string };
type ExteriorColor = { id: string; name: string };
type OptionItem = { id: string; name: string };

interface InventoryFiltersProps {
    brands: Brand[];
    categories: Category[];
    models: string[];
    exteriorColors: ExteriorColor[];
    transmissions: OptionItem[];
    engines: OptionItem[];
    fuels: OptionItem[];
    currentYear: number;
    filters: {
        category?: string;
        brand?: string;
        model?: string;
        exteriorColor?: string;
        transmission?: string;
        engine?: string;
        fuel?: string;
        priceMin?: number | "";
        priceMax?: number | "";
        kmMin?: number | "";
        kmMax?: number | "";
        yearMin?: number | "";
        yearMax?: number | "";
    };
}

function toNum(v: unknown): number | "" {
    if (v === undefined || v === null || v === "") return "";
    const n = Number(v);
    return Number.isFinite(n) ? n : "";
}

export default function InventoryFilters({
    brands,
    categories,
    models,
    exteriorColors,
    transmissions,
    engines,
    fuels,
    currentYear,
    filters,
}: InventoryFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [priceMin, setPriceMin] = useState<number | "">(toNum(filters.priceMin));
    const [priceMax, setPriceMax] = useState<number | "">(toNum(filters.priceMax));
    const [kmMin, setKmMin] = useState<number | "">(toNum(filters.kmMin));
    const [kmMax, setKmMax] = useState<number | "">(toNum(filters.kmMax));
    const [yearMin, setYearMin] = useState<number | "">(toNum(filters.yearMin));
    const [yearMax, setYearMax] = useState<number | "">(toNum(filters.yearMax));

    useEffect(() => {
        setPriceMin(toNum(filters.priceMin));
        setPriceMax(toNum(filters.priceMax));
        setKmMin(toNum(filters.kmMin));
        setKmMax(toNum(filters.kmMax));
        setYearMin(toNum(filters.yearMin));
        setYearMax(toNum(filters.yearMax));
    }, [filters.priceMin, filters.priceMax, filters.kmMin, filters.kmMax, filters.yearMin, filters.yearMax]);

    const navigate = useCallback(
        (updates: Record<string, string | number | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());
            for (const [key, val] of Object.entries(updates)) {
                if (val === undefined || val === "") {
                    params.delete(key);
                } else {
                    params.set(key, String(val));
                }
            }
            router.push(`/inventory?${params.toString()}`);
        },
        [router, searchParams]
    );

    const handleSelectChange = useCallback(
        (name: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
            const val = e.target.value.trim() || undefined;
            navigate({ [name]: val });
        },
        [navigate]
    );

    const useDebouncedNavigate = (name: string, value: number | "", prevValue: number | "") => {
        useEffect(() => {
            if (value === prevValue) return;
            const timer = setTimeout(() => navigate({ [name]: value === "" ? undefined : value }), DEBOUNCE_MS);
            return () => clearTimeout(timer);
        }, [value, prevValue, name, navigate]);
    };

    useDebouncedNavigate("priceMin", priceMin, toNum(filters.priceMin));
    useDebouncedNavigate("priceMax", priceMax, toNum(filters.priceMax));
    useDebouncedNavigate("kmMin", kmMin, toNum(filters.kmMin));
    useDebouncedNavigate("kmMax", kmMax, toNum(filters.kmMax));
    useDebouncedNavigate("yearMin", yearMin, toNum(filters.yearMin));
    useDebouncedNavigate("yearMax", yearMax, toNum(filters.yearMax));

    const selectClass = "w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900";
    const inputClass = "w-full rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm";

    return (
        <aside className="w-64 shrink-0">
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase text-gray-800">Filter Results</h2>
                    <span className="text-gray-500" aria-hidden="true">☰</span>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Body Types
                    </label>
                    <select
                        name="category"
                        value={filters.category ?? ""}
                        onChange={handleSelectChange("category")}
                        className={selectClass}
                    >
                        <option value="">Any</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Make
                    </label>
                    <select
                        name="brand"
                        value={filters.brand ?? ""}
                        onChange={handleSelectChange("brand")}
                        className={selectClass}
                    >
                        <option value="">All Makes</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Model
                    </label>
                    <select
                        name="model"
                        value={filters.model ?? ""}
                        onChange={handleSelectChange("model")}
                        className={selectClass}
                    >
                        <option value="">Models</option>
                        {models.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Price
                    </label>
                    <p className="mb-2 text-xs text-gray-500">
                        {!priceMin && !priceMax ? "No minimum or maximum" : "Set range below"}
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={(e) => setPriceMin(toNum(e.target.value))}
                            className={inputClass}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={(e) => setPriceMax(toNum(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Mileage
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="KM"
                            value={kmMin}
                            onChange={(e) => setKmMin(toNum(e.target.value))}
                            className={inputClass}
                        />
                        <input
                            type="number"
                            placeholder="KM"
                            value={kmMax}
                            onChange={(e) => setKmMax(toNum(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Year
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="YYYY"
                            min={1990}
                            max={currentYear}
                            value={yearMin}
                            onChange={(e) => setYearMin(toNum(e.target.value))}
                            className={inputClass}
                        />
                        <input
                            type="number"
                            placeholder="YYYY"
                            min={1990}
                            max={currentYear}
                            value={yearMax}
                            onChange={(e) => setYearMax(toNum(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Exterior Colour
                    </label>
                    <select
                        name="exteriorColor"
                        value={filters.exteriorColor ?? ""}
                        onChange={handleSelectChange("exteriorColor")}
                        className={selectClass}
                    >
                        <option value="">Any</option>
                        {exteriorColors.map((color) => (
                            <option key={color.id} value={color.name}>
                                {color.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Transmission
                    </label>
                    <select
                        name="transmission"
                        value={filters.transmission ?? ""}
                        onChange={handleSelectChange("transmission")}
                        className={selectClass}
                    >
                        <option value="">Any</option>
                        {transmissions.map((transmission) => (
                            <option key={transmission.id} value={transmission.name}>
                                {transmission.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Engine
                    </label>
                    <select
                        name="engine"
                        value={filters.engine ?? ""}
                        onChange={handleSelectChange("engine")}
                        className={selectClass}
                    >
                        <option value="">Any</option>
                        {engines.map((engine) => (
                            <option key={engine.id} value={engine.name}>
                                {engine.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        Fuel
                    </label>
                    <select
                        name="fuel"
                        value={filters.fuel ?? ""}
                        onChange={handleSelectChange("fuel")}
                        className={selectClass}
                    >
                        <option value="">Any</option>
                        {fuels.map((fuel) => (
                            <option key={fuel.id} value={fuel.name}>
                                {fuel.name}
                            </option>
                        ))}
                    </select>
                </div>

                <Link
                    href="/inventory"
                    className="block w-full rounded border border-gray-300 py-2 text-center text-sm font-bold uppercase text-gray-700 hover:bg-gray-50"
                >
                    Reset Filters
                </Link>
            </div>
        </aside>
    );
}
