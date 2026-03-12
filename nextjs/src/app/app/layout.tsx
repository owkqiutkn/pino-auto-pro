// src/app/app/layout.tsx
import AppLayout from '@/components/AppLayout';
import { GlobalProvider } from '@/lib/context/GlobalContext';
import { getCachedSiteSettings } from "@/lib/supabase/cached";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const siteSettings = await getCachedSiteSettings();
    const businessName = siteSettings?.business_name || process.env.NEXT_PUBLIC_PRODUCTNAME;
    return (
        <GlobalProvider>
            <AppLayout businessName={businessName}>{children}</AppLayout>
        </GlobalProvider>
    );
}