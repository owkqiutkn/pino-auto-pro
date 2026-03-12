import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import CookieConsent from "@/components/Cookies";
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getCachedSiteSettings } from "@/lib/supabase/cached";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const title = settings?.business_name || process.env.NEXT_PUBLIC_PRODUCTNAME || "Auto Dealership";
  return {
    title,
    description: "The best way to build your SaaS product.",
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
  const gaID = process.env.NEXT_PUBLIC_GOOGLE_TAG;
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={theme}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <CookieConsent />
        {gaID && <GoogleAnalytics gaId={gaID} />}
      </body>
    </html>
  );
}

