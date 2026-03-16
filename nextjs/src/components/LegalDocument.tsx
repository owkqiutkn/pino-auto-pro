"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface LegalDocumentProps {
    filePath: string;
    title: string;
    /** Fallback path (e.g. English) if the locale-specific file is not found */
    fallbackPath?: string;
}

export default function LegalDocument({ filePath, title, fallbackPath }: LegalDocumentProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const tryFetch = (path: string): Promise<string> =>
            fetch(path).then((response) => {
                if (!response.ok) throw new Error("Failed to load");
                return response.text();
            });

        tryFetch(filePath)
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch(() => {
                if (fallbackPath && fallbackPath !== filePath) {
                    return tryFetch(fallbackPath).then((text) => {
                        setContent(text);
                        setLoading(false);
                    });
                }
                setError("Failed to load document. Please try again later.");
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading markdown:", err);
                setError("Failed to load document. Please try again later.");
                setLoading(false);
            });
    }, [filePath, fallbackPath]);

    return (
        <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3
                        className="text-lg font-bold"
                        style={{ color: "#1d4ed8" }}
                    >
                        {title}
                    </h3>
                </div>
            </div>
            <div className="prose prose-gray max-w-none min-h-[200px] text-gray-700">
                {loading ? (
                    <div className="flex h-[200px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d4ed8] border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-600">
                        {error}
                    </div>
                ) : (
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => (
                                <h1 className="mb-4 mt-8 text-2xl font-bold text-gray-900">
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="mb-2 mt-4 text-lg font-medium text-gray-900">
                                    {children}
                                </h3>
                            ),
                            ul: ({ children }) => (
                                <ul className="mb-4 list-disc pl-6">
                                    {children}
                                </ul>
                            ),
                            li: ({ children }) => (
                                <li className="mb-1">{children}</li>
                            ),
                            p: ({ children }) => (
                                <p className="mb-4 leading-relaxed">{children}</p>
                            ),
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    className="font-medium text-[#1d4ed8] hover:underline"
                                    target={href?.startsWith("http") ? "_blank" : undefined}
                                    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                                >
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}
