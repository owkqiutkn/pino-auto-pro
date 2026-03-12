"use client";

import { useState, useEffect } from "react";
import { Database } from "@/lib/types";

type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

interface CarDetailGalleryProps {
    images: CarImage[];
    title: string;
}

function NavButton({ direction, onClick, stopPropagation }: { direction: "prev" | "next"; onClick: () => void; stopPropagation?: boolean }) {
    const posClass = direction === "prev" ? "left-3" : "right-3";
    const handleClick = (e: React.MouseEvent) => {
        if (stopPropagation) e.stopPropagation();
        onClick();
    };
    return (
        <button
            type="button"
            onClick={handleClick}
            className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#1d4ed8] text-white shadow-lg transition-colors hover:bg-[#1e40af] ${posClass}`}
            aria-label={direction === "prev" ? "Previous image" : "Next image"}
        >
            {direction === "prev" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );
}

export default function CarDetailGallery({ images, title }: CarDetailGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const displayImages = sortedImages.length > 0 ? sortedImages : [];
    const currentImage = displayImages[selectedIndex] ?? null;

    const goPrev = () => {
        setSelectedIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));
    };
    const goNext = () => {
        setSelectedIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === "Escape") setLightboxOpen(false);
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen]);

    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [lightboxOpen]);

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => currentImage && setLightboxOpen(true)}
                onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && currentImage) { e.preventDefault(); setLightboxOpen(true); } }}
                className="relative block w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 cursor-pointer text-left"
                aria-label="View image full screen"
            >
                {currentImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={currentImage.image_url}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">No image</div>
                )}

                {/* ML AUTOS watermark overlay */}
                <div className="absolute left-3 top-3 z-[2] pointer-events-none">
                    <span className="text-sm font-black tracking-wider text-white drop-shadow-lg">
                        ML AUTOS
                    </span>
                    <div className="h-0.5 w-full bg-[#1d4ed8]" />
                </div>

                {/* Prev / Next arrows */}
                {displayImages.length > 1 && (
                    <>
                        <NavButton direction="prev" onClick={goPrev} stopPropagation />
                        <NavButton direction="next" onClick={goNext} stopPropagation />
                    </>
                )}
            </div>

            {/* Lightbox modal */}
            {lightboxOpen && currentImage && (
                <div
                    className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setLightboxOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image full screen view"
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                        aria-label="Close"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {displayImages.length > 1 && (
                        <>
                            <NavButton direction="prev" onClick={goPrev} stopPropagation />
                            <NavButton direction="next" onClick={goNext} stopPropagation />
                        </>
                    )}
                    <img
                        src={currentImage.image_url}
                        alt={title}
                        className="max-h-full max-w-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Thumbnail strip */}
            {displayImages.length > 1 && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goPrev}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
                        aria-label="Previous thumbnail"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                        {displayImages.map((img, idx) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setSelectedIndex(idx)}
                                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded border-2 transition-colors ${
                                    idx === selectedIndex ? "border-[#1d4ed8]" : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.image_url}
                                    alt={`${title} - view ${idx + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={goNext}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
                        aria-label="Next thumbnail"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
