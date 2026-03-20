"use client";

import { useState } from "react";

interface VehicleShareButtonsProps {
    shareUrl: string;
    vehicleTitle: string;
    label: string;
}

const iconBtnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1877f2]/10 text-gray-900 transition-colors hover:bg-[#1877f2]/20 [&_img]:brightness-0 [&_img]:contrast-[1.1]";

export default function VehicleShareButtons({ shareUrl, vehicleTitle, label }: VehicleShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(vehicleTitle);

    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const xShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    const smsBody = encodeURIComponent(`${vehicleTitle} ${shareUrl}`);
    const smsShareUrl = `sms:?body=${smsBody}`;
    const messengerShareUrl = `fb-messenger://share/?link=${encodedUrl}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const emailSubject = encodeURIComponent(`Check out this vehicle: ${vehicleTitle}`);
    const emailBody = encodeURIComponent(`${vehicleTitle}\n\n${shareUrl}`);
    const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-base font-medium text-gray-600">{label}</span>
            <div className="flex items-center gap-2">
                <a
                    href={facebookShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Facebook"
                    className={iconBtnClass}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/icon-facebook.png"
                        alt="Facebook"
                        className="h-4 w-4"
                    />
                </a>
                <a
                    href={xShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X"
                    className={iconBtnClass}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/icon-x.png"
                        alt="X (Twitter)"
                        className="h-4 w-4"
                    />
                </a>
                <a
                    href={smsShareUrl}
                    aria-label="Share by text message"
                    className={iconBtnClass}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-9 8l3-3h10a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h2v3z" />
                    </svg>
                </a>
                <a
                    href={messengerShareUrl}
                    aria-label="Share on Facebook Messenger"
                    className={iconBtnClass}
                >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.91 1.45 5.5 3.72 7.2V22l3.24-1.78c.97.27 2 .41 3.04.41 5.52 0 10-4.15 10-9.26S17.52 2 12 2zm1 12.4l-2.55-2.72-4.95 2.72 5.45-5.78 2.6 2.72 4.9-2.72L13 14.4z" />
                    </svg>
                </a>
                <button
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="Copy link to share on Instagram"
                    title="Copy link"
                    className={iconBtnClass}
                >
                    {copied ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src="/images/icon-instagram.png"
                            alt="Instagram"
                            className="h-4 w-4 brightness-0 contrast-[1.3] saturate-0"
                        />
                    )}
                </button>
                <a
                    href={mailtoUrl}
                    aria-label="Email"
                    className={iconBtnClass}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </a>
                <button
                    type="button"
                    onClick={handlePrint}
                    aria-label="Print"
                    className={iconBtnClass}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H2a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
