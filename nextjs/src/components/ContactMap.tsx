"use client";

import {useEffect, useRef} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const defaultCenter = {lat: 45.5019, lng: -73.5674};

export default function ContactMap() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

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
        <div className="relative h-96 w-full md:h-[420px]">
            <div ref={mapContainerRef} className="relative h-full w-full">
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-center px-4">
                        <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-gray-900 shadow-[0_22px_55px_rgba(0,0,0,0.7)] md:max-w-sm md:p-6">
                            <form className="space-y-4 w-full">
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        Your Name
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        Email Address
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        Write Your Message
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        rows={3}
                                        placeholder="Write us your question here..."
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/40"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af]"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

