"use client";

import {useEffect, useRef, useState} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {useTranslations} from "next-intl";

const defaultCenter = {lat: 45.5019, lng: -73.5674};

interface ContactMapProps {
    /** When false, only the map is shown (no contact form overlay). Default: true */
    showForm?: boolean;
    /** When "large", map height is bigger (for new-landing only). Default: "default" */
    variant?: "default" | "large";
}

export default function ContactMap({ showForm = true, variant = "default" }: ContactMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const t = useTranslations("NewLanding.contactForm");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const name = String(formData.get("name") || "").trim();
                                    const email = String(formData.get("email") || "").trim();
                                    const phone = String(formData.get("phone") || "").trim();
                                    const message = String(formData.get("message") || "").trim();

                                    setStatus("submitting");
                                    try {
                                        const res = await fetch("/api/contact", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                name,
                                                email,
                                                phone,
                                                message,
                                            }),
                                        });

                                        if (!res.ok) {
                                            setStatus("error");
                                            return;
                                        }

                                        setStatus("success");
                                        e.currentTarget.reset();
                                    } catch {
                                        setStatus("error");
                                    } finally {
                                        setTimeout(() => {
                                            setStatus("idle");
                                        }, 4000);
                                    }
                                }}
                            >
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("nameLabel")}
                                    </label>
                                    <input
                                        name="name"
                                        id="contact-name"
                                        type="text"
                                        placeholder={t("namePlaceholder")}
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("emailLabel")}
                                    </label>
                                    <input
                                        name="email"
                                        id="contact-email"
                                        type="email"
                                        placeholder={t("emailPlaceholder")}
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("phoneLabel")}
                                    </label>
                                    <input
                                        name="phone"
                                        id="contact-phone"
                                        type="tel"
                                        placeholder={t("phonePlaceholder")}
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("messageLabel")}
                                    </label>
                                    <textarea
                                        name="message"
                                        id="contact-message"
                                        rows={3}
                                        placeholder={t("messagePlaceholder")}
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="inline-flex w-full items-center justify-center rounded-md bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af] disabled:opacity-70"
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

