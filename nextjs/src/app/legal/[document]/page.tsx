"use client";

import React, { use } from "react";
import LegalDocument from "@/components/LegalDocument";
import { notFound, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const DOCUMENT_FILE_MAP = {
    terms: "terms-of-service",
    privacy: "privacy-notice",
    refund: "refund-policy",
} as const;

const SUPPORTED_LOCALES = ["en", "fr", "es"] as const;

type LegalDocId = keyof typeof DOCUMENT_FILE_MAP;
type RouteDocument = "terms" | "privacy" | "refund";

type LegalPageProps = {
    params?: Promise<Record<string, string | string[]>>;
};

export default function LegalPage({ params }: LegalPageProps) {
    use(params ?? Promise.resolve({}));
    const { document: rawDocument } = useParams<{ document: RouteDocument | string[] }>();
    const document = Array.isArray(rawDocument) ? rawDocument[0] : rawDocument;
    const locale = useLocale();
    const t = useTranslations("Legal");

    if (!(document in DOCUMENT_FILE_MAP)) {
        notFound();
    }

    const baseName = DOCUMENT_FILE_MAP[document as LegalDocId];
    const resolvedLocale = SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])
        ? locale
        : "en";
    const filePath = `/terms/${baseName}.${resolvedLocale}.md`;
    const titleKey = document as LegalDocId;
    const title = t(titleKey);

    return <LegalDocument title={title} filePath={filePath} fallbackPath={`/terms/${baseName}.en.md`} />;
}