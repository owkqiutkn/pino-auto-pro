"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations } from "next-intl";

const defaultCenter = {lat: 45.5019, lng: -73.5674};

interface ContactMapProps {
    /** When false, only the map is shown (no contact form overlay). Default: true */
    showForm?: boolean;
    /** When "large", map height is bigger (for new-landing only). Default: "default" */
    variant?: "default" | "large";
}

type ContactFormValues = {
    name: string;
    email: string;
    phone: string;
    message: string;
};

export default function ContactMap({ showForm = true, variant = "default" }: ContactMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const t = useTranslations("NewLanding.contactForm");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const contactSchema = useMemo(
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
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", phone: "", message: "" },
    });

    const onSubmit = async (values: ContactFormValues) => {
        setStatus("submitting");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    pageUrl: typeof window !== "undefined" ? window.location.href : "",
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

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                layers: [
                    {
                        id: "osm-layer",
                        type: "raster",
                        source: "osm"
                    }
                ]
            },
            center: [defaultCenter.lng, defaultCenter.lat],
            zoom: 14
        });

        new maplibregl.Marker().setLngLat([defaultCenter.lng, defaultCenter.lat]).addTo(map);

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div
            className={
                variant === "large"
                    ? "relative h-[460px] w-full md:h-[540px]"
                    : "relative h-72 w-full md:h-[315px]"
            }
        >
            <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
            <div className="pointer-events-auto absolute inset-0 z-10" aria-hidden />
            {showForm && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="pointer-events-auto flex h-full w-full max-w-none items-center justify-center px-4">
                        <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-gray-900 shadow-[0_22px_55px_rgba(0,0,0,0.7)] md:max-w-sm md:p-6">
                            <form
                                className="space-y-4 w-full"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("nameLabel")}
                                    </label>
                                    <input
                                        {...register("name")}
                                        id="contact-name"
                                        type="text"
                                        placeholder={t("namePlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-[#b91c1c]/40 ${
                                            errors.name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#b91c1c]"
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("emailLabel")}
                                    </label>
                                    <input
                                        {...register("email")}
                                        id="contact-email"
                                        type="email"
                                        placeholder={t("emailPlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-[#b91c1c]/40 ${
                                            errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#b91c1c]"
                                        }`}
                                    />
                                    {errors.email && (
                                        <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("phoneLabel")}
                                    </label>
                                    <input
                                        {...register("phone")}
                                        id="contact-phone"
                                        type="tel"
                                        placeholder={t("phonePlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-[#b91c1c]/40 ${
                                            errors.phone ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#b91c1c]"
                                        }`}
                                    />
                                    {errors.phone && (
                                        <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("messageLabel")}
                                    </label>
                                    <textarea
                                        {...register("message")}
                                        id="contact-message"
                                        rows={3}
                                        placeholder={t("messagePlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-[#b91c1c]/40 ${
                                            errors.message ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#b91c1c]"
                                        }`}
                                    />
                                    {errors.message && (
                                        <p className="mt-0.5 text-xs text-red-600">{errors.message.message}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="inline-flex w-full items-center justify-center rounded-md bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#b91c1c] disabled:opacity-70"
                                >
                                    {status === "submitting" ? t("submitting") : t("submit")}
                                </button>
                                {status === "success" && (
                                    <p className="text-xs text-emerald-600">
                                        {t("successMessage")}
                                    </p>
                                )}
                                {status === "error" && (
                                    <p className="text-xs text-red-600">
                                        {t("errorMessage")}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

