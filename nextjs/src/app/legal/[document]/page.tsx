'use client';

import React from 'react';
import LegalDocument from '@/components/LegalDocument';
import { notFound, useParams } from 'next/navigation';

const legalDocuments = {
    'privacy': {
        title: 'Privacy Notice',
        path: '/terms/privacy-notice.md'
    },
    'terms': {
        title: 'Terms of Service',
        path: '/terms/terms-of-service.md'
    },
    'refund': {
        title: 'Refund Policy',
        path: '/terms/refund-policy.md'
    }
} as const;

type LegalDocument = keyof typeof legalDocuments;

type RouteDocument = 'terms' | 'privacy' | 'cookies';

export default function LegalPage() {
    const { document: rawDocument } = useParams<{ document: RouteDocument | string[] }>();
    const document = Array.isArray(rawDocument) ? rawDocument[0] : rawDocument;

    if (!legalDocuments[document as LegalDocument]) {
        notFound();
    }

    const { title, path } = legalDocuments[document as LegalDocument];

    return (
        <div className="container mx-auto px-4 py-8">
            <LegalDocument
                title={title}
                filePath={path}
            />
        </div>
    );
}