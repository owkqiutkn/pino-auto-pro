"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, CheckCircle, Upload, X } from "lucide-react";
import { createSPASassClientAuthenticated } from "@/lib/supabase/client";
import type { Database } from "@/lib/types";

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

interface SiteSettingsFormProps {
    initialSettings: SiteSettingsRow | null;
}

export default function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
    const [logoLight, setLogoLight] = useState("");
    const [logoDark, setLogoDark] = useState("");
    const [logoLightFile, setLogoLightFile] = useState<File | null>(null);
    const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
    const [instagramUrl, setInstagramUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const lightInputRef = useRef<HTMLInputElement>(null);
    const darkInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialSettings) {
            setLogoLight(initialSettings.logo_light ?? "");
            setLogoDark(initialSettings.logo_dark ?? "");
            setInstagramUrl(initialSettings.instagram_url ?? "");
            setFacebookUrl(initialSettings.facebook_url ?? "");
            setTwitterUrl(initialSettings.twitter_url ?? "");
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

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    logo_light: finalLogoLight || null,
                    logo_dark: finalLogoDark || null,
                    instagram_url: instagramUrl || null,
                    facebook_url: facebookUrl || null,
                    twitter_url: twitterUrl || null,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error ?? "Failed to update settings");
            }
            setLogoLight(finalLogoLight || "");
            setLogoDark(finalLogoDark || "");
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
                            <img src={previewUrl} alt="" className="h-full w-full object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400">No logo</span>
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
                        Logo &amp; Social Links
                    </CardTitle>
                    <CardDescription>
                        Upload logos and enter social media links. These appear in the navbar and footer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>
    );
}
