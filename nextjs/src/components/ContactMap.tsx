"use client";

import {useEffect, useRef} from "react";
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
                    ? "relative h-[400px] w-full md:h-[460px]"
                    : "relative h-72 w-full md:h-[315px]"
            }
        >
            <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
            <div className="pointer-events-auto absolute inset-0 z-10" aria-hidden />
            {showForm && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="pointer-events-auto flex h-full w-full max-w-none items-center justify-center px-4">
                        <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-gray-900 shadow-[0_22px_55px_rgba(0,0,0,0.7)] md:max-w-sm md:p-6">
                            <form className="space-y-4 w-full">
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        {t("nameLabel")}
                                    </label>
                                    <input
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
                                        id="contact-message"
                                        rows={3}
                                        placeholder={t("messagePlaceholder")}
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af]"
                                >
                                    {t("submit")}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

