"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, CheckCircle, Upload, X, Clock, Search, BarChart3, Globe } from "lucide-react";
import { createSPASassClientAuthenticated } from "@/lib/supabase/client";
import type { Database, OpeningHoursJson } from "@/lib/types";

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

interface SiteSettingsFormProps {
    initialSettings: SiteSettingsRow | null;
}

export default function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
    const [businessName, setBusinessName] = useState("");
    const [logoLight, setLogoLight] = useState("");
    const [logoDark, setLogoDark] = useState("");
    const [logoLightFile, setLogoLightFile] = useState<File | null>(null);
    const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
    const [instagramUrl, setInstagramUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [openingHours, setOpeningHours] = useState<OpeningHoursJson>({});
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [siteUrl, setSiteUrl] = useState("");
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [ogImage, setOgImage] = useState("");
    const [ogImageFile, setOgImageFile] = useState<File | null>(null);
    const [favicon, setFavicon] = useState("");
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const lightInputRef = useRef<HTMLInputElement>(null);
    const darkInputRef = useRef<HTMLInputElement>(null);
    const ogInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialSettings) {
            setBusinessName(initialSettings.business_name ?? "");
            setLogoLight(initialSettings.logo_light ?? "");
            setLogoDark(initialSettings.logo_dark ?? "");
            setInstagramUrl(initialSettings.instagram_url ?? "");
            setFacebookUrl(initialSettings.facebook_url ?? "");
            setTwitterUrl(initialSettings.twitter_url ?? "");
            setMetaTitle(initialSettings.meta_title ?? "");
            setMetaDescription(initialSettings.meta_description ?? "");
            setSiteUrl(initialSettings.site_url ?? "");
            setGoogleAnalyticsId(initialSettings.google_analytics_id ?? "");
            setOgImage(initialSettings.og_image ?? "");
            setFavicon(initialSettings.favicon ?? "");
            const hours = (initialSettings.opening_hours as OpeningHoursJson) ?? {};
            if (Object.keys(hours).length === 0) {
                const defaults: OpeningHoursJson = {};
                DAYS.forEach((d) => { defaults[d] = { open: "09:00", close: "17:00" }; });
                setOpeningHours(defaults);
            } else {
                setOpeningHours(hours);
            }
        }
    }, [initialSettings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            let finalLogoLight = logoLight;
            let finalLogoDark = logoDark;
            const client = await createSPASassClientAuthenticated();

            if (logoLightFile) {
                const { data, error: uploadErr } = await client.uploadSiteLogo("light", logoLightFile);
                if (uploadErr) throw uploadErr;
                finalLogoLight = data?.publicUrl ?? logoLight;
                setLogoLightFile(null);
                lightInputRef.current?.setAttribute("value", "");
            }
            if (logoDarkFile) {
                const { data, error: uploadErr } = await client.uploadSiteLogo("dark", logoDarkFile);
                if (uploadErr) throw uploadErr;
                finalLogoDark = data?.publicUrl ?? logoDark;
                setLogoDarkFile(null);
                darkInputRef.current?.setAttribute("value", "");
            }

            let finalOgImage: string = ogImage;
            if (ogImageFile) {
                const { data, error: uploadErr } = await client.uploadSiteOgImage(ogImageFile);
                if (uploadErr) throw uploadErr;
                finalOgImage = data?.publicUrl ?? ogImage;
                setOgImageFile(null);
                ogInputRef.current?.setAttribute("value", "");
            }

            let finalFavicon = favicon;
            if (faviconFile) {
                const { data, error: uploadErr } = await client.uploadSiteFavicon(faviconFile);
                if (uploadErr) throw uploadErr;
                finalFavicon = data?.publicUrl ?? favicon;
                setFaviconFile(null);
                faviconInputRef.current?.setAttribute("value", "");
            }

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business_name: businessName.trim() || null,
                    logo_light: finalLogoLight || null,
                    logo_dark: finalLogoDark || null,
                    instagram_url: instagramUrl || null,
                    facebook_url: facebookUrl || null,
                    twitter_url: twitterUrl || null,
                    opening_hours: Object.keys(openingHours).length ? openingHours : null,
                    meta_title: metaTitle.trim() || null,
                    meta_description: metaDescription.trim() || null,
                    site_url: siteUrl.trim() || null,
                    google_analytics_id: googleAnalyticsId.trim() || null,
                    og_image: finalOgImage?.trim() || null,
                    favicon: finalFavicon?.trim() || null,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error ?? "Failed to update settings");
            }
            setLogoLight(finalLogoLight || "");
            setLogoDark(finalLogoDark || "");
            setOgImage(finalOgImage || "");
            setFavicon(finalFavicon || "");
            setSuccess("Settings saved successfully");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    function LogoUploadField({
        label,
        hint,
        file,
        setFile,
        currentUrl,
        setCurrentUrl,
        inputRef,
        inputId,
        onFileChange,
    }: {
        label: string;
        hint: string;
        file: File | null;
        setFile: (f: File | null) => void;
        currentUrl: string;
        setCurrentUrl: (url: string) => void;
        inputRef: React.RefObject<HTMLInputElement | null>;
        inputId: string;
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) {
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
        useEffect(() => {
            if (file) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
            setPreviewUrl(currentUrl || null);
        }, [file, currentUrl]);
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="mt-1 flex items-center gap-4">
                    <div className="flex h-16 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        {previewUrl ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="" className="h-full w-full object-contain" />
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">No image</span>
                        )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                        <input
                            ref={inputRef}
                            type="file"
                            id={inputId}
                            accept="image/*"
                            onChange={onFileChange}
                            className="hidden"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <Upload className="h-4 w-4" />
                                Upload
                            </button>
                            {(file || currentUrl) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setCurrentUrl("");
                                        inputRef.current?.setAttribute("value", "");
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4" />
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
            </div>
        );
    }

    function FaviconUploadField({
        label,
        hint,
        file,
        setFile,
        currentUrl,
        setCurrentUrl,
        inputRef,
        inputId,
        onFileChange,
    }: {
        label: string;
        hint: string;
        file: File | null;
        setFile: (f: File | null) => void;
        currentUrl: string;
        setCurrentUrl: (url: string) => void;
        inputRef: React.RefObject<HTMLInputElement | null>;
        inputId: string;
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) {
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
        useEffect(() => {
            if (file) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
            setPreviewUrl(currentUrl || null);
        }, [file, currentUrl]);
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="mt-1 flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">
                        {previewUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={previewUrl} alt="" className="h-full w-full object-contain" />
                        ) : (
                            <Globe className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                        <input
                            ref={inputRef}
                            type="file"
                            id={inputId}
                            accept="image/x-icon,image/png,image/svg+xml,.ico,.png,.svg"
                            onChange={onFileChange}
                            className="hidden"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <Upload className="h-4 w-4" />
                                Upload
                            </button>
                            {(file || currentUrl) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setCurrentUrl("");
                                        inputRef.current?.setAttribute("value", "");
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4" />
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
                <p className="text-muted-foreground">
                    Configure logo and social media links for the public site
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Business Name, Logo &amp; Social Links
                    </CardTitle>
                    <CardDescription>
                        Upload logos and enter social media links. These appear in the navbar and footer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
                                Business Name
                            </label>
                            <input
                                type="text"
                                id="business-name"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="e.g. Pino Auto Pro"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                            <p className="mt-0.5 text-xs text-gray-500">Used in the navbar, page titles, and metadata</p>
                        </div>
                        <LogoUploadField
                            label="Logo Light"
                            hint="Used on dark backgrounds (e.g. navbar). Upload a light/white logo."
                            file={logoLightFile}
                            setFile={setLogoLightFile}
                            currentUrl={logoLight}
                            setCurrentUrl={setLogoLight}
                            inputRef={lightInputRef}
                            inputId="logo-light"
                            onFileChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setLogoLightFile(f);
                            }}
                        />
                        <LogoUploadField
                            label="Logo Dark"
                            hint="Used on light backgrounds (if different). Upload a dark logo."
                            file={logoDarkFile}
                            setFile={setLogoDarkFile}
                            currentUrl={logoDark}
                            setCurrentUrl={setLogoDark}
                            inputRef={darkInputRef}
                            inputId="logo-dark"
                            onFileChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setLogoDarkFile(f);
                            }}
                        />
                        <FaviconUploadField
                            label="Favicon"
                            hint="Browser tab icon. Use .ico, .png or .svg. Recommended 32×32 or 16×16."
                            file={faviconFile}
                            setFile={setFaviconFile}
                            currentUrl={favicon}
                            setCurrentUrl={setFavicon}
                            inputRef={faviconInputRef}
                            inputId="favicon"
                            onFileChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setFaviconFile(f);
                            }}
                        />
                        <div>
                            <label htmlFor="instagram-url" className="block text-sm font-medium text-gray-700">
                                Instagram URL
                            </label>
                            <input
                                type="url"
                                id="instagram-url"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                placeholder="https://instagram.com/..."
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="facebook-url" className="block text-sm font-medium text-gray-700">
                                Facebook URL
                            </label>
                            <input
                                type="url"
                                id="facebook-url"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter-url" className="block text-sm font-medium text-gray-700">
                                Twitter / X URL
                            </label>
                            <input
                                type="url"
                                id="twitter-url"
                                value={twitterUrl}
                                onChange={(e) => setTwitterUrl(e.target.value)}
                                placeholder="https://x.com/..."
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        SEO &amp; Social Sharing
                    </CardTitle>
                    <CardDescription>
                        These values are used for search results and for Open Graph (Facebook, LinkedIn) and Twitter Cards when your site is shared. Leave blank to use business name and default description.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                                Open Graph (Facebook, LinkedIn) &amp; Twitter Cards
                            </h3>
                        </div>
                        <div>
                            <label htmlFor="meta-title" className="block text-sm font-medium text-gray-700">
                                Title (og:title, twitter:title)
                            </label>
                            <input
                                type="text"
                                id="meta-title"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="e.g. Used Cars Montreal"
                                maxLength={70}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                            <p className="mt-0.5 text-xs text-gray-500">Page title for search and social. Recommended under 60 characters.</p>
                        </div>
                        <div>
                            <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700">
                                Description (og:description, twitter:description)
                            </label>
                            <textarea
                                id="meta-description"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="e.g. Browse our inventory of quality used vehicles."
                                maxLength={160}
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                            <p className="mt-0.5 text-xs text-gray-500">Short description for search and social. Recommended 150–160 characters.</p>
                        </div>
                        <div>
                            <label htmlFor="site-url" className="block text-sm font-medium text-gray-700">
                                Site URL (og:url)
                            </label>
                            <input
                                type="url"
                                id="site-url"
                                value={siteUrl}
                                onChange={(e) => setSiteUrl(e.target.value)}
                                placeholder="https://yoursite.com"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                            <p className="mt-0.5 text-xs text-gray-500">Canonical URL for the site. Used as og:url when sharing.</p>
                        </div>
                        <LogoUploadField
                            label="Image (og:image, twitter:image)"
                            hint="Image for social sharing. Recommended 1200×630 px. Used as og:image and twitter:image."
                            file={ogImageFile}
                            setFile={setOgImageFile}
                            currentUrl={ogImage}
                            setCurrentUrl={setOgImage}
                            inputRef={ogInputRef}
                            inputId="og-image"
                            onFileChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setOgImageFile(f);
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Google Analytics
                    </CardTitle>
                    <CardDescription>
                        Optional. Enter your Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX) to track traffic. Leave blank to disable or to use the environment variable.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="google-analytics-id" className="block text-sm font-medium text-gray-700">
                                Measurement ID
                            </label>
                            <input
                                type="text"
                                id="google-analytics-id"
                                value={googleAnalyticsId}
                                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                            />
                            <p className="mt-0.5 text-xs text-gray-500">Find this in Google Analytics under Admin → Data Streams → your stream → Measurement ID.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Opening Hours
                    </CardTitle>
                    <CardDescription>
                        Set your business hours for each day. Leave closed for days you are not open.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {DAYS.map((day) => {
                            const dayData = openingHours[day];
                            const closed = dayData && "closed" in dayData && dayData.closed;
                            const open = !closed && dayData && "open" in dayData ? dayData.open : "09:00";
                            const close = !closed && dayData && "close" in dayData ? dayData.close : "17:00";
                            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                            return (
                                <div key={day} className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3">
                                    <span className="w-24 text-sm font-medium text-gray-700">{dayLabel}</span>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!!closed}
                                            onChange={(e) => {
                                                setOpeningHours((prev) => ({
                                                    ...prev,
                                                    [day]: e.target.checked ? { closed: true } : { open: "09:00", close: "17:00" },
                                                }));
                                            }}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600">Closed</span>
                                    </label>
                                    {!closed && (
                                        <>
                                            <div className="flex items-center gap-1">
                                                <label htmlFor={`${day}-open`} className="sr-only">Open</label>
                                                <input
                                                    type="time"
                                                    id={`${day}-open`}
                                                    value={open}
                                                    onChange={(e) =>
                                                        setOpeningHours((prev) => ({
                                                            ...prev,
                                                            [day]: { open: e.target.value, close: close },
                                                        }))
                                                    }
                                                    className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                                                />
                                            </div>
                                            <span className="text-gray-400">–</span>
                                            <div className="flex items-center gap-1">
                                                <label htmlFor={`${day}-close`} className="sr-only">Close</label>
                                                <input
                                                    type="time"
                                                    id={`${day}-close`}
                                                    value={close}
                                                    onChange={(e) =>
                                                        setOpeningHours((prev) => ({
                                                            ...prev,
                                                            [day]: { open: open, close: e.target.value },
                                                        }))
                                                    }
                                                    className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
