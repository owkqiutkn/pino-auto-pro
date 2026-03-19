"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations } from "next-intl";

const defaultCenter = { lat: 45.5019, lng: -73.5674 };

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

const PALETTE = {
    charcoal: "#1C1C1E",
    deepAmethyst: "#2A0F3B",
    imperialAubergine: "#1F0C33",
    royalGold: "#D4AF37",
    creamWhite: "#E5E1D3",
} as const;

export default function ContactMapTest3({ showForm = true, variant = "default" }: ContactMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const t = useTranslations("NewLanding.contactForm");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const contactSchema = useMemo(
        () =>
            z.object({
                name: z.string().min(1, t("validation.nameRequired")).min(2, t("validation.nameMin")).max(100),
                email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")).max(200),
                phone: z.string().max(50, t("validation.phoneMax")).optional().or(z.literal("")),
                message: z.string().min(1, t("validation.messageRequired")).min(10, t("validation.messageMin")).max(2000, t("validation.messageMax")),
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
                body: JSON.stringify(values),
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
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    },
                },
                layers: [
                    {
                        id: "osm-layer",
                        type: "raster",
                        source: "osm",
                    },
                ],
            },
            center: [defaultCenter.lng, defaultCenter.lat],
            zoom: 14,
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
                        <div
                            className="w-full max-w-xs rounded-2xl p-5 shadow-[0_22px_55px_rgba(0,0,0,0.7)] md:max-w-sm md:p-6"
                            style={{
                                backgroundColor: "#ffffff",
                                color: PALETTE.charcoal,
                                border: "1px solid rgba(212, 175, 55, 0.35)",
                            }}
                        >
                            <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
                                <div>
                                    <label
                                        htmlFor="contact-name"
                                        className="block text-xs font-semibold uppercase tracking-wide"
                                        style={{ color: "rgba(31, 12, 51, 0.70)" }}
                                    >
                                        {t("nameLabel")}
                                    </label>
                                    <input
                                        {...register("name")}
                                        id="contact-name"
                                        type="text"
                                        placeholder={t("namePlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
                                            errors.name ? "border-red-500 focus:border-red-500" : ""
                                        }`}
                                        style={{
                                            backgroundColor: "rgba(229, 225, 211, 0.35)",
                                            color: PALETTE.charcoal,
                                            borderColor: errors.name ? "#ef4444" : "rgba(31, 12, 51, 0.18)",
                                            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                                        }}
                                    />
                                    {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-email"
                                        className="block text-xs font-semibold uppercase tracking-wide"
                                        style={{ color: "rgba(31, 12, 51, 0.70)" }}
                                    >
                                        {t("emailLabel")}
                                    </label>
                                    <input
                                        {...register("email")}
                                        id="contact-email"
                                        type="email"
                                        placeholder={t("emailPlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
                                            errors.email ? "border-red-500 focus:border-red-500" : ""
                                        }`}
                                        style={{
                                            backgroundColor: "rgba(229, 225, 211, 0.35)",
                                            color: PALETTE.charcoal,
                                            borderColor: errors.email ? "#ef4444" : "rgba(31, 12, 51, 0.18)",
                                        }}
                                    />
                                    {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-phone"
                                        className="block text-xs font-semibold uppercase tracking-wide"
                                        style={{ color: "rgba(31, 12, 51, 0.70)" }}
                                    >
                                        {t("phoneLabel")}
                                    </label>
                                    <input
                                        {...register("phone")}
                                        id="contact-phone"
                                        type="tel"
                                        placeholder={t("phonePlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
                                            errors.phone ? "border-red-500 focus:border-red-500" : ""
                                        }`}
                                        style={{
                                            backgroundColor: "rgba(229, 225, 211, 0.35)",
                                            color: PALETTE.charcoal,
                                            borderColor: errors.phone ? "#ef4444" : "rgba(31, 12, 51, 0.18)",
                                        }}
                                    />
                                    {errors.phone && <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>}
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-message"
                                        className="block text-xs font-semibold uppercase tracking-wide"
                                        style={{ color: "rgba(31, 12, 51, 0.70)" }}
                                    >
                                        {t("messageLabel")}
                                    </label>
                                    <textarea
                                        {...register("message")}
                                        id="contact-message"
                                        rows={3}
                                        placeholder={t("messagePlaceholder")}
                                        disabled={status === "submitting"}
                                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
                                            errors.message ? "border-red-500 focus:border-red-500" : ""
                                        }`}
                                        style={{
                                            backgroundColor: "rgba(229, 225, 211, 0.35)",
                                            color: PALETTE.charcoal,
                                            borderColor: errors.message ? "#ef4444" : "rgba(31, 12, 51, 0.18)",
                                        }}
                                    />
                                    {errors.message && <p className="mt-0.5 text-xs text-red-600">{errors.message.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold shadow-md transition disabled:opacity-70"
                                    style={{
                                        backgroundColor: PALETTE.royalGold,
                                        color: PALETTE.charcoal,
                                    }}
                                >
                                    {status === "submitting" ? t("submitting") : t("submit")}
                                </button>

                                {status === "success" && (
                                    <p className="text-xs" style={{ color: PALETTE.imperialAubergine }}>
                                        {t("successMessage")}
                                    </p>
                                )}
                                {status === "error" && <p className="text-xs text-red-600">{t("errorMessage")}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

