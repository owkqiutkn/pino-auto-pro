"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DEBOUNCE_MS = 350;

interface InventorySearchInputProps {
    initialValue?: string;
}

export default function InventorySearchInput({ initialValue = "" }: InventorySearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (value === initialValue) return;
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const trimmed = value.trim();
            if (trimmed) {
                params.set("search", trimmed);
            } else {
                params.delete("search");
            }
            router.push(`/inventory?${params.toString()}`);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [value, initialValue, router, searchParams]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    return (
        <input
            type="search"
            placeholder="Search by make and model..."
            value={value}
            onChange={handleChange}
            className="flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 sm:max-w-xs"
        />
    );
}
