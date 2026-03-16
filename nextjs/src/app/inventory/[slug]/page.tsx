import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createSSRSassClient } from "@/lib/supabase/server";
import {
    getCachedCategories,
    getCachedEngines,
    getCachedFuels,
    getCachedTransmissions,
    getCachedSiteSettings,
} from "@/lib/supabase/cached";
import { Database } from "@/lib/types";
import { getTranslations, getLocale } from "next-intl/server";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import InventoryHero from "@/components/InventoryHero";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import CarDetailGallery from "@/components/CarDetailGallery";
import CarDetailSpecs from "@/components/CarDetailSpecs";
import CarDetailRequestForm from "@/components/CarDetailRequestForm";
import CarDetailAccordion from "@/components/CarDetailAccordion";
import PaymentCalculator from "@/components/PaymentCalculator";
import SimilarVehiclesCarousel from "@/components/SimilarVehiclesCarousel";
import VehicleShareButtons from "@/components/VehicleShareButtons";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];

interface CarPageProps {
    params: Promise<{ slug: string }>;
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
}

const getAvailableCarWithImages = cache(async (slug: string) => {
    const client = await createSSRSassClient();
    const { data: car, error } = await client.getAvailableCarBySlug(slug);
    if (error || !car) {
        return { car: null, images: [] as CarImage[] };
    }
    const { data: images = [] } = await client.getCarImages(car.id);
    return { car: car as Car, images: images as CarImage[] };
});

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
    const { slug } = await params;
    const [{ car, images }, siteSettings] = await Promise.all([
        getAvailableCarWithImages(slug),
        getCachedSiteSettings(),
    ]);
    if (!car) {
        return {
            title: "Vehicle Not Found",
            description: "This vehicle is not available.",
        };
    }

    const businessName = siteSettings?.business_name || "Pino Auto Pro";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const cover = images.find((img) => img.is_cover) || images[0];
    const title = `${car.year} ${car.brand} ${car.model} | ${businessName}`;
    const description =
        `Used ${car.year} ${car.brand} ${car.model} with ${car.km.toLocaleString()} km available now.`;
    const canonicalUrl = `${siteUrl}/inventory/${car.slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: cover ? [{ url: cover.image_url }] : [],
        },
    };
}

export default async function CarDetailPage({ params }: CarPageProps) {
    const { slug } = await params;

    const [carResult, categories, enginesData, fuelsData, transmissionsData, siteSettings] =
        await Promise.all([
            getAvailableCarWithImages(slug),
            getCachedCategories(),
            getCachedEngines(),
            getCachedFuels(),
            getCachedTransmissions(),
            getCachedSiteSettings(),
        ]);

    const { car, images } = carResult;
    if (!car) {
        notFound();
    }

    const client = await createSSRSassClient();
    const [t, locale, similarResult, carFeaturesResult] = await Promise.all([
        getTranslations("Inventory.carDetail"),
        getLocale(),
        client.getSimilarCars(car.id, car.brand, 6),
        client.getCarFeatures(car.id),
    ]);
    let similarCars = (similarResult.data ?? []) as Car[];
    if (similarCars.length === 0) {
        const fallback = await client.getOtherAvailableCars(car.id, 6);
        similarCars = (fallback.data ?? []) as Car[];
    }

    const similarCarIds = similarCars.map((c) => c.id);
    const { data: similarImages = [] } =
        similarCarIds.length > 0
            ? await client.getCarImagesForCars(similarCarIds)
            : { data: [] };

    const imagesByCar = new Map<string, CarImage[]>();
    for (const img of similarImages as CarImage[]) {
        const bucket = imagesByCar.get(img.car_id) || [];
        bucket.push(img);
        imagesByCar.set(img.car_id, bucket);
    }

    const categoryRow = categories.find((c) => c.name_en === car.category || c.name_es === car.category || c.name_fr === car.category || c.name === car.category);
    const bodyStyleDisplay = categoryRow ? getLocalizedCategoryName(categoryRow, locale) : car.category ?? t("na");

    const price = car.discounted_price ?? car.price;

    const carFeaturesByCategory = (() => {
        const data = carFeaturesResult.data ?? [];
        const byCat = new Map<string, { categoryId: string; categoryName: string; features: { name_en: string; name_es: string; name_fr: string }[] }>();
        for (const item of data) {
            const catId = item.feature_category.id;
            const catName = locale.startsWith("fr") ? item.feature_category.name_fr : locale.startsWith("es") ? item.feature_category.name_es : item.feature_category.name_en;
            const entry = byCat.get(catId);
            const featNames = { name_en: item.feature.name_en, name_es: item.feature.name_es, name_fr: item.feature.name_fr };
            if (entry) {
                entry.features.push(featNames);
            } else {
                byCat.set(catId, { categoryId: catId, categoryName: catName, features: [featNames] });
            }
        }
        const getFeatName = (f: { name_en: string; name_es: string; name_fr: string }) =>
            locale.startsWith("fr") ? f.name_fr : locale.startsWith("es") ? f.name_es : f.name_en;
        return Array.from(byCat.values()).map((v) => ({
            categoryId: v.categoryId,
            categoryName: v.categoryName,
            features: v.features.map((f) => getFeatName(f)),
        }));
    })();

    return (
        <div className="min-h-screen bg-white">
            <InventoryHero title={`${car.year} ${car.brand} ${car.model}`} />

            <div className="mx-auto max-w-6xl px-4 pt-8 pb-16">
                {/* Two-column layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* Left: Gallery (larger) */}
                    <div className="lg:col-span-3">
                        <CarDetailGallery images={images} title={car.title} businessName={siteSettings?.business_name ?? "Pino Auto Pro"} />
                    </div>

                    {/* Right: Details (smaller) */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="space-y-4">
                            {/* Share this vehicle */}
                            <VehicleShareButtons
                                shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/inventory/${car.slug}`}
                                vehicleTitle={`${car.year} ${car.brand} ${car.model}`}
                                label={t("shareThisVehicle")}
                            />

                            {/* Red banner */}
                        <div className="min-h-[75vw] lg:min-h-[18rem] overflow-hidden rounded-xl border border-blue-400/30 bg-[#071d38] px-6 py-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out hover:-translate-y-2">
                            <h1 className="text-2xl font-bold md:text-3xl">
                                {car.year} {car.brand} {car.model}
                            </h1>
                            {car.vin && (
                                <p className="text-sm text-white/90">
                                    {t("vin")}: {car.vin}
                                </p>
                            )}
                            <p className="text-sm text-white/90">
                                {t("doorBodyStyle")}: {bodyStyleDisplay}
                            </p>
                            <p className="mt-3 text-2xl font-bold">{formatPrice(price)}</p>
                            {car.discounted_price != null && (
                                <p className="text-sm text-white/80 line-through">{formatPrice(car.price)}</p>
                            )}
                            <div className="mt-4 space-y-2">
                                <a
                                    href="#car-detail-form"
                                    className="flex w-full items-center justify-center gap-2 rounded bg-white/20 py-2.5 text-sm font-bold text-white hover:bg-white/30"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {t("requestEprice")}
                                </a>
                                <a
                                    href="#car-detail-form"
                                    className="flex w-full items-center justify-center gap-2 rounded bg-white/20 py-2.5 text-sm font-bold text-white hover:bg-white/30"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {t("bookTestDrive")}
                                </a>
                            </div>
                        </div>
                        </div>

                        {/* Fair Deal + Warranty + Carfax + CarGurus */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-800">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t("fairDealBadge")}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-semibold ${
                                    car.warranty ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {t("warrantyBadge")}
                            </span>
                            {car.carfax_url && (
                                <a
                                    href={car.carfax_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t("viewCarfax")}
                                </a>
                            )}
                            {car.cargurus_url && (
                                <a
                                    href={car.cargurus_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    CarGurus
                                </a>
                            )}
                        </div>

                        {/* Key Specs */}
                        <CarDetailSpecs
                            car={car}
                            categories={categories}
                            engines={enginesData as Database["public"]["Tables"]["engines"]["Row"][]}
                            fuels={fuelsData as Database["public"]["Tables"]["fuels"]["Row"][]}
                            transmissions={transmissionsData as Database["public"]["Tables"]["transmissions"]["Row"][]}
                        />

                        {/* Car Description */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {t("carDescription")}
                            </h2>
                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                                {locale.startsWith("fr")
                                    ? (car.description_fr ?? car.description_en ?? car.description) || "No description provided."
                                    : locale.startsWith("es")
                                    ? (car.description_es ?? car.description_en ?? car.description) || "No description provided."
                                    : (car.description_en ?? car.description_fr ?? car.description_es ?? car.description) || "No description provided."}
                            </p>
                            <p className="mt-3 text-xs text-gray-500">
                                Information is subject to verification. Contact us for the most current details.
                            </p>
                        </div>

                        {/* Vehicle Features - only show categories that have at least one checked feature */}
                        {carFeaturesByCategory.length > 0 && (
                            <>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{t("vehicleFeaturesTitle")}</h2>
                                    <p className="mt-2 text-sm text-gray-600">
                                        {t("vehicleFeaturesIntro")}
                                    </p>
                                </div>
                                <div className="space-y-0">
                                    {carFeaturesByCategory.map((group) => (
                                        <CarDetailAccordion key={group.categoryId} title={group.categoryName} features={group.features} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Payment Calculator - above form, below features */}
                        <PaymentCalculator vehiclePrice={price} />

                        {/* Request Information form */}
                        <div id="car-detail-form" className="rounded-lg border border-gray-200 scroll-mt-4">
                            <div className="rounded-t-lg bg-[#1d4ed8] px-4 py-3">
                                <h2 className="font-bold text-white">{t("requestInfo")}</h2>
                            </div>
                            <div className="p-4">
                                <CarDetailRequestForm />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Vehicles */}
                <div className="mt-8">
                    <SimilarVehiclesCarousel
                        cars={similarCars as Car[]}
                        imagesByCar={imagesByCar}
                        currentSlug={slug}
                        categories={categories as Database["public"]["Tables"]["categories"]["Row"][]}
                        engines={enginesData as Database["public"]["Tables"]["engines"]["Row"][]}
                        fuels={fuelsData as Database["public"]["Tables"]["fuels"]["Row"][]}
                        transmissions={transmissionsData as Database["public"]["Tables"]["transmissions"]["Row"][]}
                        locale={locale}
                    />
                </div>
            </div>

            <SiteFooter />
            <ScrollToTopButton />
        </div>
    );
}
