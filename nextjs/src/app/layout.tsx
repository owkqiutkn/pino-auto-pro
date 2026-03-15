import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getCachedSiteSettings } from "@/lib/supabase/cached";
import { CookieManagerProvider } from "@/components/CookieManagerProvider";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const title =
    settings?.meta_title ||
    settings?.business_name ||
    process.env.NEXT_PUBLIC_PRODUCTNAME ||
    "Auto Dealership";
  const description =
    settings?.meta_description || "Quality pre-owned vehicles. Browse inventory and get approved fast.";
  const siteUrl = settings?.site_url?.replace(/\/$/, "") || undefined;
  const ogImage = settings?.og_image
    ? [{ url: settings.og_image, width: 1200, height: 630, alt: title }]
    : undefined;
  const openGraph = {
    title,
    description,
    type: "website" as const,
    ...(siteUrl && { url: siteUrl }),
    ...(ogImage && { images: ogImage }),
  };
  const twitter = {
    card: "summary_large_image" as const,
    title,
    description,
    ...(ogImage && { images: [settings!.og_image!] }),
  };
  return {
    title,
    description,
    openGraph,
    twitter,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme = process.env.NEXT_PUBLIC_THEME;
  if (!theme) {
    theme = "theme-sass3";
  }
  const settings = await getCachedSiteSettings();
  const gaID = settings?.google_analytics_id?.trim() || process.env.NEXT_PUBLIC_GOOGLE_TAG;
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={theme}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CookieManagerProvider>
            {children}
          </CookieManagerProvider>
        </NextIntlClientProvider>
        <Analytics />
        {gaID && <GoogleAnalytics gaId={gaID} />}
      </body>
    </html>
  );
}

