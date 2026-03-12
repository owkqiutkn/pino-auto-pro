"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CarDetailRequestForm() {
    const t = useTranslations("Inventory.carDetail");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("submitting");
        // TODO: wire to API
        await new Promise((r) => setTimeout(r, 800));
        setStatus("success");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <input
                type="text"
                name="name"
                placeholder={t("namePlaceholder")}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
            />
            <input
                type="email"
                name="email"
                placeholder={t("email")}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
            />
            <input
                type="tel"
                name="phone"
                placeholder={t("phone")}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <textarea
                name="comments"
                placeholder={t("comments")}
                rows={4}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded bg-[#1d4ed8] py-3 font-bold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-70"
            >
                {status === "submitting" ? "..." : t("submit")}
            </button>
        </form>
    );
}
