"use client";

import { useState } from "react";

interface CarDetailAccordionProps {
    title: string;
    children: React.ReactNode;
}

export default function CarDetailAccordion({ title, children }: CarDetailAccordionProps) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-gray-900"
            >
                <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                    {title}
                </span>
                <svg
                    className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            {open && <div className="pb-3 text-sm text-gray-600">{children}</div>}
        </div>
    );
}
