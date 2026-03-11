"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("Inventory.filters");
    const [mobileOpen, setMobileOpen] = useState(false);

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
        <aside className="w-full md:w-64 md:shrink-0">
            {/* Mobile toggle */}
            <button
                type="button"
                className="mb-4 flex w-full items-center justify-between rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 md:hidden"
                onClick={() => setMobileOpen((open) => !open)}
                aria-expanded={mobileOpen}
                aria-controls="inventory-filters-panel"
            >
                <span className="uppercase tracking-wide text-[11px]">
                    {t("heading")}
                </span>
                <span className="text-xs text-gray-500">
                    {mobileOpen ? "−" : "+"}
                </span>
            </button>

            <div
                id="inventory-filters-panel"
                className={`space-y-5 ${mobileOpen ? "block" : "hidden"} md:block`}
            >
                <div className="hidden items-center gap-2 md:flex">
                    <h2 className="text-sm font-bold uppercase text-gray-800">{t("heading")}</h2>
                    <span className="text-gray-500" aria-hidden="true">☰</span>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("bodyTypes")}
                    </label>
                    <select
                        name="category"
                        value={filters.category ?? ""}
                        onChange={handleSelectChange("category")}
                        className={selectClass}
                    >
                        <option value="">{t("anyBodyType")}</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("make")}
                    </label>
                    <select
                        name="brand"
                        value={filters.brand ?? ""}
                        onChange={handleSelectChange("brand")}
                        className={selectClass}
                    >
                        <option value="">{t("allMakes")}</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("model")}
                    </label>
                    <select
                        name="model"
                        value={filters.model ?? ""}
                        onChange={handleSelectChange("model")}
                        className={selectClass}
                    >
                        <option value="">{t("modelsPlaceholder")}</option>
                        {models.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("price")}
                    </label>
                    <p className="mb-2 text-xs text-gray-500">
                        {!priceMin && !priceMax ? t("noMinMax") : t("setRange")}
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={t("priceMin")}
                            value={priceMin}
                            onChange={(e) => setPriceMin(toNum(e.target.value))}
                            className={inputClass}
                        />
                        <input
                            type="number"
                            placeholder={t("priceMax")}
                            value={priceMax}
                            onChange={(e) => setPriceMax(toNum(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("mileage")}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={t("mileagePlaceholder")}
                            value={kmMin}
                            onChange={(e) => setKmMin(toNum(e.target.value))}
                            className={inputClass}
                        />
                        <input
                            type="number"
                            placeholder={t("mileagePlaceholder")}
                            value={kmMax}
                            onChange={(e) => setKmMax(toNum(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("year")}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={t("yearPlaceholder")}
                            min={1990}
                            max={currentYear}
                            value={yearMin}
                            onChange={(e) => setYearMin(toNum(e.target.value))}
                            className={inputClass}
                        />
                        <input
                            type="number"
                            placeholder={t("yearPlaceholder")}
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
                        {t("exteriorColor")}
                    </label>
                    <select
                        name="exteriorColor"
                        value={filters.exteriorColor ?? ""}
                        onChange={handleSelectChange("exteriorColor")}
                        className={selectClass}
                    >
                        <option value="">{t("anyExteriorColor")}</option>
                        {exteriorColors.map((color) => (
                            <option key={color.id} value={color.name}>
                                {color.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("transmission")}
                    </label>
                    <select
                        name="transmission"
                        value={filters.transmission ?? ""}
                        onChange={handleSelectChange("transmission")}
                        className={selectClass}
                    >
                        <option value="">{t("anyTransmission")}</option>
                        {transmissions.map((transmission) => (
                            <option key={transmission.id} value={transmission.name}>
                                {transmission.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("engine")}
                    </label>
                    <select
                        name="engine"
                        value={filters.engine ?? ""}
                        onChange={handleSelectChange("engine")}
                        className={selectClass}
                    >
                        <option value="">{t("anyEngine")}</option>
                        {engines.map((engine) => (
                            <option key={engine.id} value={engine.name}>
                                {engine.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-700">
                        {t("fuel")}
                    </label>
                    <select
                        name="fuel"
                        value={filters.fuel ?? ""}
                        onChange={handleSelectChange("fuel")}
                        className={selectClass}
                    >
                        <option value="">{t("anyFuel")}</option>
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
                    {t("reset")}
                </Link>
            </div>
        </aside>
    );
}
