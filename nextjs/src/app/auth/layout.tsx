import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getCachedSiteSettings } from "@/lib/supabase/cached";

const REVIEW_KEYS = ["james", "sarah", "mike"] as const;

export default async function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [siteSettings, t] = await Promise.all([
        getCachedSiteSettings(),
        getTranslations("NewLanding.reviews"),
    ]);
    const productName = siteSettings?.business_name || process.env.NEXT_PUBLIC_PRODUCTNAME;

    return (
        <div className="flex min-h-screen">
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative">
                <Link
                    href="/"
                    className="absolute left-8 top-8 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Homepage
                </Link>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                        {productName}
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800">
                <div className="w-full flex items-center justify-center p-12">
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-white text-2xl font-bold mb-8">
                            {t("title")}
                        </h3>
                        {REVIEW_KEYS.map((key) => (
                            <div
                                key={key}
                                className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary-400/30 flex items-center justify-center text-white font-semibold">
                                            {t(`items.${key}.name`).charAt(0)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/90 mb-2 font-light leading-relaxed">
                                            &#34;{t(`items.${key}.text`)}&#34;
                                        </p>
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-white">
                                                {t(`items.${key}.name`)}
                                            </p>
                                            <p className="text-sm text-primary-200">
                                                {t(`items.${key}.role`)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 text-center">
                            <p className="text-primary-100 text-sm">
                                {t("summary")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}