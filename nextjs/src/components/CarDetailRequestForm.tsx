"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

type CarDetailFormValues = {
    name: string;
    email: string;
    phone: string;
    message: string;
};

export default function CarDetailRequestForm() {
    const t = useTranslations("Inventory.carDetail");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const schema = useMemo(
        () =>
            z.object({
                name: z
                    .string()
                    .min(1, t("validation.nameRequired"))
                    .min(2, t("validation.nameMin"))
                    .max(100),
                email: z
                    .string()
                    .min(1, t("validation.emailRequired"))
                    .email(t("validation.emailInvalid"))
                    .max(200),
                phone: z
                    .string()
                    .max(50, t("validation.phoneMax"))
                    .optional()
                    .or(z.literal("")),
                message: z
                    .string()
                    .min(1, t("validation.messageRequired"))
                    .min(10, t("validation.messageMin"))
                    .max(2000, t("validation.messageMax")),
            }),
        [t]
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CarDetailFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", phone: "", message: "" },
    });

    const onSubmit = async (values: CarDetailFormValues) => {
        setStatus("submitting");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    message: values.message,
                }),
            });
            if (!res.ok) {
                setStatus("error");
                return;
            }
            setStatus("success");
            reset();
        } catch {
            setStatus("error");
        } finally {
            setTimeout(() => setStatus("idle"), 4000);
        }
    };

    const inputBase =
        "mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-[#1d4ed8]/40";
    const inputError = "border-red-500 focus:border-red-500";
    const inputDefault = "border-gray-200 focus:border-[#1d4ed8]";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label
                    htmlFor="car-form-name"
                    className="block text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                    {t("namePlaceholder")}
                </label>
                <input
                    {...register("name")}
                    id="car-form-name"
                    type="text"
                    placeholder={t("namePlaceholder")}
                    disabled={status === "submitting"}
                    className={`${inputBase} ${errors.name ? inputError : inputDefault}`}
                />
                {errors.name && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
                )}
            </div>
            <div>
                <label
                    htmlFor="car-form-email"
                    className="block text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                    {t("email")}
                </label>
                <input
                    {...register("email")}
                    id="car-form-email"
                    type="email"
                    placeholder={t("email")}
                    disabled={status === "submitting"}
                    className={`${inputBase} ${errors.email ? inputError : inputDefault}`}
                />
                {errors.email && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>
                )}
            </div>
            <div>
                <label
                    htmlFor="car-form-phone"
                    className="block text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                    {t("phone")}
                </label>
                <input
                    {...register("phone")}
                    id="car-form-phone"
                    type="tel"
                    placeholder={t("phone")}
                    disabled={status === "submitting"}
                    className={`${inputBase} ${errors.phone ? inputError : inputDefault}`}
                />
                {errors.phone && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>
                )}
            </div>
            <div>
                <label
                    htmlFor="car-form-message"
                    className="block text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                    {t("comments")}
                </label>
                <textarea
                    {...register("message")}
                    id="car-form-message"
                    rows={3}
                    placeholder={t("comments")}
                    disabled={status === "submitting"}
                    className={`${inputBase} ${errors.message ? inputError : inputDefault}`}
                />
                {errors.message && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.message.message}</p>
                )}
            </div>
            <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af] disabled:opacity-70"
            >
                {status === "submitting" ? t("submitting") : t("submit")}
            </button>
            {status === "success" && (
                <p className="text-xs text-emerald-600">{t("successMessage")}</p>
            )}
            {status === "error" && (
                <p className="text-xs text-red-600">{t("errorMessage")}</p>
            )}
        </form>
    );
}
