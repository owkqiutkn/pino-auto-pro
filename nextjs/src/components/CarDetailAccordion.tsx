"use client";

import { useState } from "react";

interface CarDetailAccordionProps {
    title: string;
    features?: string[];
    children?: React.ReactNode;
}

export default function CarDetailAccordion({ title, features, children }: CarDetailAccordionProps) {
    const [open, setOpen] = useState(false);
    const hasFeatures = features && features.length > 0;
    const hasContent = hasFeatures || children;

    return (
        <div className="border-b border-gray-200">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between py-3 text-left text-base font-semibold text-gray-900"
            >
                {title}
                <svg
                    className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && hasContent && (
                <div className="pb-4 pt-1">
                    {hasFeatures ? (
                        (() => {
                            const mid = Math.ceil(features.length / 2);
                            const leftCol = features.slice(0, mid);
                            const rightCol = features.slice(mid);
                            const checkIcon = (
                                <svg className="h-4 w-4 shrink-0 text-gray-900" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            );
                            return (
                                <div className="flex gap-6">
                                    <div className="flex-1 space-y-2">
                                        {leftCol.map((name, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                {checkIcon}
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                    {rightCol.length > 0 && (
                                        <div className="flex-1 space-y-2 border-l border-gray-200 pl-6">
                                            {rightCol.map((name, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                    {checkIcon}
                                                    {name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    ) : (
                        <div className="text-sm text-gray-600">{children}</div>
                    )}
                </div>
            )}
        </div>
    );
}
