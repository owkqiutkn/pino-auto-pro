import { getCachedSiteSettings } from "@/lib/supabase/cached";
import SiteSettingsForm from "@/components/SiteSettingsForm";

export default async function SettingsPage() {
    const settings = await getCachedSiteSettings();
    return <SiteSettingsForm initialSettings={settings} />;
}
