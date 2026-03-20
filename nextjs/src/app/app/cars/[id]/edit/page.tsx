"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState, use } from "react";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { compressImageForUpload } from "@/lib/image-compression";
import { Database } from "@/lib/types";
import { storagePathFromPublicUrl } from "@/lib/cars";
import { getTransformedStorageUrl } from "@/lib/storage";
import { getLocalizedExteriorColorName } from "@/lib/i18n/colors";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";
import { getLocalizedTrimName } from "@/lib/i18n/trims";
import { useLocale } from "next-intl";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];
type CarStatus = "available" | "sold" | "hidden";
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];
type ModelTrim = Database["public"]["Tables"]["model_trims"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];
type FeatureCategory = Database["public"]["Tables"]["feature_categories"]["Row"];
type Feature = Database["public"]["Tables"]["features"]["Row"];

type EditCarPageProps = {
    params?: Promise<Record<string, string | string[]>>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
export default function EditCarPage({ params, searchParams }: EditCarPageProps) {
    use(params ?? Promise.resolve({})); // Unwrap to satisfy Next.js 15 async dynamic APIs
    use(searchParams ?? Promise.resolve({}));
    const { id } = useParams<{ id: string }>();
    const locale = useLocale();

    const [car, setCar] = useState<Car | null>(null);
    const [images, setImages] = useState<CarImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [trim, setTrim] = useState("");
    const [category, setCategory] = useState("");
    const [year, setYear] = useState<number | "">("");
    const [km, setKm] = useState<number | "">("");
    const [price, setPrice] = useState<number | "">("");
    const [discountedPrice, setDiscountedPrice] = useState<number | "">("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionEs, setDescriptionEs] = useState("");
    const [descriptionFr, setDescriptionFr] = useState("");
    const [status, setStatus] = useState<CarStatus>("available");
    const [featured, setFeatured] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandModels, setBrandModels] = useState<BrandModel[]>([]);
    const [modelTrims, setModelTrims] = useState<ModelTrim[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
    const [engines, setEngines] = useState<Engine[]>([]);
    const [fuels, setFuels] = useState<Fuel[]>([]);
    const [transmissions, setTransmissions] = useState<Transmission[]>([]);
    const [exteriorColor, setExteriorColor] = useState("");
    const [engine, setEngine] = useState("");
    const [fuel, setFuel] = useState("");
    const [transmission, setTransmission] = useState("");
    const [vin, setVin] = useState("");
    const [carfaxUrl, setCarfaxUrl] = useState("");
    const [cargurusUrl, setCargurusUrl] = useState("");
    const [warranty, setWarranty] = useState(false);
    const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>([]);
    const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());

    const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(
        () => Array.from({ length: currentYear - 1980 + 1 }, (_, index) => currentYear - index),
        [currentYear]
    );
    const orderedImages = useMemo(
        () => [...images].sort((a, b) => a.sort_order - b.sort_order),
        [images]
    );
    const coverImage = useMemo(
        () => orderedImages.find((image) => image.is_cover) || null,
        [orderedImages]
    );
    const extraImages = useMemo(
        () => orderedImages.filter((image) => !image.is_cover),
        [orderedImages]
    );
    const featuresByCategory = useMemo(() => {
        const byCat = new Map<string, Feature[]>();
        for (const f of allFeatures) {
            const list = byCat.get(f.feature_category_id) ?? [];
            list.push(f);
            byCat.set(f.feature_category_id, list);
        }
        return featureCategories
            .filter((cat) => byCat.has(cat.id))
            .map((cat) => ({ category: cat, features: byCat.get(cat.id) ?? [] }));
    }, [featureCategories, allFeatures]);
    const toggleFeature = (featureId: string) => {
        setSelectedFeatureIds((prev) => {
            const next = new Set(prev);
            if (next.has(featureId)) next.delete(featureId);
            else next.add(featureId);
            return next;
        });
    };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data: carData, error: carError } = await client.getCarById(id);
            if (carError || !carData) throw carError || new Error("Car not found");
            const { data: imagesData, error: imagesError } = await client.getCarImages(id);
            if (imagesError) throw imagesError;

            setCar(carData);
            setImages(imagesData || []);
            setTitle(carData.title);
            setBrand(carData.brand);
            setModel(carData.model);
            setTrim(carData.trim ?? "");
            setCategory(carData.category ?? "");
            setYear(carData.year);
            setKm(carData.km);
            setPrice(carData.price);
            setDiscountedPrice(carData.discounted_price ?? "");
            setDescriptionEn(carData.description_en ?? carData.description ?? "");
            setDescriptionEs(carData.description_es ?? "");
            setDescriptionFr(carData.description_fr ?? "");
            setStatus(carData.status as CarStatus);
            setFeatured(carData.featured ?? false);
            setExteriorColor(carData.exterior_color ?? "");
            setEngine(carData.engine ?? "");
            setFuel(carData.fuel ?? "");
            setTransmission(carData.transmission ?? "");
            setVin(carData.vin ?? "");
            setCarfaxUrl(carData.carfax_url ?? "");
            setCargurusUrl(carData.cargurus_url ?? "");
            setWarranty(carData.warranty ?? false);
            const { data: carFeaturesData } = await client.getCarFeatures(id);
            setSelectedFeatureIds(
                new Set((carFeaturesData || []).map((cf) => cf.feature_id))
            );
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load car.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadBrands = useCallback(async () => {
        try {
            const client = await createSPASassClient();
            const { data, error: brandsError } = await client.getBrands();
            if (brandsError) throw brandsError;
            setBrands(data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load brands.");
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const client = await createSPASassClient();
            const { data, error: categoriesError } = await client.getCategories();
            if (categoriesError) throw categoriesError;
            setCategories(data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load categories.");
        }
    }, []);

    const loadAttributes = useCallback(async () => {
        try {
            const client = await createSPASassClient();
            const [
                { data: exteriorColorData, error: exteriorError },
                { data: engineData, error: engineError },
                { data: fuelData, error: fuelError },
                { data: transmissionData, error: transmissionError },
                { data: categoryData, error: categoryError },
                { data: featureData, error: featureError },
            ] = await Promise.all([
                client.getExteriorColors(),
                client.getEngines(),
                client.getFuels(),
                client.getTransmissions(),
                client.getFeatureCategories(),
                client.getFeatures(),
            ]);
            if (exteriorError) throw exteriorError;
            if (engineError) throw engineError;
            if (fuelError) throw fuelError;
            if (transmissionError) throw transmissionError;
            if (categoryError) throw categoryError;
            if (featureError) throw featureError;
            setExteriorColors(exteriorColorData || []);
            setEngines(engineData || []);
            setFuels(fuelData || []);
            setTransmissions(transmissionData || []);
            setFeatureCategories(categoryData || []);
            setAllFeatures(featureData || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load car attributes.");
        }
    }, []);

    useEffect(() => {
        if (id) {
            loadData();
            loadBrands();
            loadCategories();
            loadAttributes();
        }
    }, [id, loadAttributes, loadCategories, loadData, loadBrands]);

    useEffect(() => {
        const loadModels = async () => {
            if (!brand) {
                setBrandModels([]);
                setModel("");
                return;
            }
            const selectedBrand = brands.find((item) => item.name === brand);
            if (!selectedBrand) {
                setBrandModels([]);
                setModel("");
                return;
            }
            try {
                const client = await createSPASassClient();
                const { data, error: modelsError } = await client.getBrandModels(selectedBrand.id);
                if (modelsError) throw modelsError;
                setBrandModels(data || []);
                setModel((prev) => ((data || []).some((item) => item.name === prev) ? prev : ""));
            } catch (err) {
                console.error(err);
                setError("Failed to load brand models.");
                setBrandModels([]);
                setModel("");
            }
        };
        loadModels();
    }, [brand, brands]);

    useEffect(() => {
        const loadTrims = async () => {
            if (!model) {
                setModelTrims([]);
                setTrim("");
                return;
            }
            const selectedModel = brandModels.find((item) => item.name === model);
            if (!selectedModel) {
                setModelTrims([]);
                setTrim("");
                return;
            }
            try {
                const client = await createSPASassClient();
                const { data, error: trimsError } = await client.getModelTrims(selectedModel.id);
                if (trimsError) throw trimsError;
                setModelTrims(data || []);
                setTrim((prev) => ((data || []).some((item) => (item.name_en ?? item.name) === prev) ? prev : ""));
            } catch (err) {
                console.error(err);
                setError("Failed to load model trims.");
                setModelTrims([]);
                setTrim("");
            }
        };
        loadTrims();
    }, [model, brandModels]);

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const parsedPrice = Number(price);
            const parsedDiscountedPrice = discountedPrice === "" ? null : Number(discountedPrice);
            if (parsedDiscountedPrice !== null && parsedDiscountedPrice > parsedPrice) {
                throw new Error("Discounted price must be less than or equal to price.");
            }
            if (parsedDiscountedPrice !== null && parsedDiscountedPrice < 0) {
                throw new Error("Discounted price must be at least 0.");
            }

            const client = await createSPASassClient();
            const { error: updateError } = await client.updateCar(id, {
                title,
                brand,
                model,
                trim: trim || null,
                category: category || null,
                exterior_color: exteriorColor || null,
                engine: engine || null,
                fuel: fuel || null,
                transmission: transmission || null,
                vin: vin || null,
                carfax_url: carfaxUrl || null,
                cargurus_url: cargurusUrl || null,
                warranty: warranty,
                year: Number(year),
                km: Number(km),
                price: parsedPrice,
                discounted_price: parsedDiscountedPrice,
                description_en: descriptionEn || null,
                description_es: descriptionEs || null,
                description_fr: descriptionFr || null,
                status,
                featured,
            });
            if (updateError) throw updateError;
            const { error: featuresError } = await client.setCarFeatures(
                id,
                Array.from(selectedFeatureIds)
            );
            if (featuresError) throw featuresError;
            await loadData();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to save car.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddImages = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;
        try {
            const client = await createSPASassClient();
            const hasCoverImage = images.some((image) => image.is_cover);
            let sortOrder = images.reduce((max, image) => Math.max(max, image.sort_order), 0) + 1;
            for (let index = 0; index < files.length; index += 1) {
                const file = files[index];
                const compressed = await compressImageForUpload(file);
                const upload = await client.uploadCarImage(id, compressed.name, compressed);
                if (upload.error) throw upload.error;
                const { error: createImageError } = await client.createCarImage({
                    car_id: id,
                    image_url: upload.data.publicUrl,
                    sort_order: sortOrder,
                    is_cover: !hasCoverImage && index === 0,
                });
                if (createImageError) throw createImageError;
                sortOrder += 1;
            }
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Failed to upload images.");
        } finally {
            event.target.value = "";
        }
    };

    const handleDeleteImage = async (image: CarImage) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            const client = await createSPASassClient();
            const storagePath = storagePathFromPublicUrl(image.image_url);
            if (storagePath) {
                await client.deleteCarImageFromStorage(storagePath);
            }
            const { error: deleteError } = await client.deleteCarImage(image.id);
            if (deleteError) throw deleteError;
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Failed to delete image.");
        }
    };

    const handleMoveExtraImage = async (imageId: string, direction: "up" | "down") => {
        const currentIndex = extraImages.findIndex((img) => img.id === imageId);
        if (currentIndex < 0) return;
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= extraImages.length) return;
        const updatedExtras = [...extraImages];
        const [picked] = updatedExtras.splice(currentIndex, 1);
        updatedExtras.splice(targetIndex, 0, picked);
        const updatedOrder = coverImage ? [coverImage, ...updatedExtras] : updatedExtras;
        setImages(updatedOrder);
        try {
            const client = await createSPASassClient();
            await client.updateCarImageOrder(id, updatedOrder.map((img) => img.id));
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Failed to reorder images.");
        }
    };

    const handleSetCover = async (imageId: string) => {
        try {
            const client = await createSPASassClient();
            const { error: coverError } = await client.setCoverImage(id, imageId);
            if (coverError) throw coverError;
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Failed to set cover image.");
        }
    };

    const handleDeleteMainImage = async () => {
        if (!coverImage) return;
        await handleDeleteImage(coverImage);
    };

    const handlePromoteExtraToMain = async (imageId: string) => {
        await handleSetCover(imageId);
    };

    const handleDeleteExtraImage = async (image: CarImage) => {
        await handleDeleteImage(image);
    };

    const handleMarkSold = async () => {
        try {
            const client = await createSPASassClient();
            const { error: soldError } = await client.updateCar(id, { status: "sold" });
            if (soldError) throw soldError;
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Failed to mark vehicle as sold.");
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!car) {
        return <div className="p-6">Car not found.</div>;
    }

    return (
        <div className="max-w-4xl space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit Car</h1>
                <Link href="/app/cars" className="text-[#b91c1c] hover:text-[#7f1d1d]">
                    Back to list
                </Link>
            </div>
            {error && <p className="text-red-600">{error}</p>}

            <form id="edit-car-form" onSubmit={handleSave} className="bg-white border rounded-lg p-5 space-y-4">
                <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. BMW 320i 2020" className="w-full border rounded-md px-3 py-2" />
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                        <label htmlFor="edit-brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                        <select id="edit-brand" value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} required className="border rounded-md px-3 py-2 w-full">
                        <option value="">Select brand</option>
                        {brands.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedTrimName(item as never, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-md px-3 py-2 w-full">
                        <option value="">Select category (optional)</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedCategoryName(item, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <select id="edit-model" value={model} onChange={(e) => setModel(e.target.value)} required disabled={!brand} className="border rounded-md px-3 py-2 w-full disabled:bg-gray-100">
                        <option value="">{brand ? "Select model" : "Select brand first"}</option>
                        {brandModels.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-trim" className="block text-sm font-medium text-gray-700 mb-1">Trim</label>
                        <select id="edit-trim" value={trim} onChange={(e) => setTrim(e.target.value)} disabled={!model} className="border rounded-md px-3 py-2 w-full disabled:bg-gray-100">
                        <option value="">{model ? "Select trim (optional)" : "Select model first"}</option>
                        {modelTrims.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                        <label htmlFor="edit-exterior-color" className="block text-sm font-medium text-gray-700 mb-1">Exterior Color</label>
                        <select
                            id="edit-exterior-color"
                            value={exteriorColor}
                            onChange={(e) => setExteriorColor(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        >
                        <option value="">Select (optional)</option>
                        {exteriorColors.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedExteriorColorName(item as never, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-engine" className="block text-sm font-medium text-gray-700 mb-1">Engine</label>
                        <select id="edit-engine" value={engine} onChange={(e) => setEngine(e.target.value)} className="border rounded-md px-3 py-2 w-full">
                        <option value="">Select (optional)</option>
                        {engines.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedEngineName(item, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-fuel" className="block text-sm font-medium text-gray-700 mb-1">Fuel</label>
                        <select id="edit-fuel" value={fuel} onChange={(e) => setFuel(e.target.value)} className="border rounded-md px-3 py-2 w-full">
                        <option value="">Select (optional)</option>
                        {fuels.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedFuelName(item, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-transmission" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                        <select
                            id="edit-transmission"
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        >
                        <option value="">Select (optional)</option>
                        {transmissions.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedTransmissionName(item as never, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="edit-year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select id="edit-year" value={year === "" ? "" : String(year)} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} required className="border rounded-md px-3 py-2 w-full">
                        <option value="">Select year</option>
                        {yearOptions.map((optionYear) => (
                            <option key={optionYear} value={optionYear}>
                                {optionYear}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="edit-km" className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
                        <input id="edit-km" value={km} onChange={(e) => setKm(Number(e.target.value))} type="number" required placeholder="e.g. 50000" className="border rounded-md px-3 py-2 w-full" />
                    </div>
                    <div>
                        <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input id="edit-price" value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" required placeholder="e.g. 25000" className="border rounded-md px-3 py-2 w-full" />
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="edit-vin" className="block text-sm font-medium text-gray-700 mb-1">VIN (optional)</label>
                        <input
                            id="edit-vin"
                            value={vin}
                            onChange={(e) => setVin(e.target.value)}
                            placeholder="e.g. 1HGBH41JXMN109186"
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-warranty" className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                        <select
                            id="edit-warranty"
                            value={warranty ? "yes" : "no"}
                            onChange={(e) => setWarranty(e.target.value === "yes")}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="edit-carfax-url" className="block text-sm font-medium text-gray-700 mb-1">Carfax URL (optional)</label>
                        <input
                            id="edit-carfax-url"
                            type="url"
                            value={carfaxUrl}
                            onChange={(e) => setCarfaxUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-cargurus-url" className="block text-sm font-medium text-gray-700 mb-1">CarGurus URL (optional)</label>
                        <input
                            id="edit-cargurus-url"
                            type="url"
                            value={cargurusUrl}
                            onChange={(e) => setCargurusUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="edit-discounted-price" className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (optional)</label>
                    <input
                        id="edit-discounted-price"
                        value={discountedPrice}
                        onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : "")}
                        type="number"
                        min={0}
                        max={price === "" ? undefined : Number(price)}
                        placeholder="Leave empty for no discount"
                        className="w-full border rounded-md px-3 py-2"
                    />
                </div>
                <div>
                    <label htmlFor="edit-description-en" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">Description (English)<Image src="/icons/ai.png" alt="AI" width={16} height={16} className="w-4 h-4" /></label>
                    <textarea id="edit-description-en" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={5} placeholder="Vehicle description, features, condition..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                    <label htmlFor="edit-description-es" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">Description (Spanish)</label>
                    <textarea id="edit-description-es" value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} rows={5} placeholder="Descripción del vehículo, equipamiento, estado..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                    <label htmlFor="edit-description-fr" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">Description (French)<Image src="/icons/ai.png" alt="AI" width={16} height={16} className="w-4 h-4" /></label>
                    <textarea id="edit-description-fr" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} rows={5} placeholder="Description du véhicule, équipements, état..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value as CarStatus)} className="border rounded-md px-3 py-2">
                        <option value="available">available</option>
                        <option value="sold">sold</option>
                        <option value="hidden">hidden</option>
                    </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">Featured</span>
                    </label>
                    <button type="button" onClick={handleMarkSold} className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium">
                        Mark sold
                    </button>
                </div>
            </form>
            <div className="fixed bottom-6 right-6 z-50">
                <button form="edit-car-form" disabled={saving} type="submit" className="px-5 py-2.5 rounded-md bg-[#b91c1c] text-white hover:bg-[#7f1d1d] disabled:opacity-60 shadow-lg font-medium">
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>

            <section className="bg-white border rounded-lg p-5 space-y-4">
                <h2 className="text-lg font-semibold">Images</h2>
                <div className="space-y-5">
                    <section className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Main Image</h3>
                            {coverImage && (
                                <button
                                    type="button"
                                    onClick={handleDeleteMainImage}
                                    className="inline-flex items-center gap-1 px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                            )}
                        </div>
                        {coverImage ? (
                            <div className="max-w-sm border rounded-lg overflow-hidden">
                                <div className="relative aspect-[4/3] bg-gray-100">
                                    <Image
                                        src={getTransformedStorageUrl(coverImage.image_url)}
                                        alt={`${car.title} main image`}
                                        fill
                                        className="object-cover"
                                        sizes="384px"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-2 text-xs text-gray-600 flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500" />
                                    Cover image
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">No main image set.</p>
                        )}
                        <p className="text-xs text-gray-600">
                            To replace the main image, use the Make main action on an image in the extra images section.
                        </p>
                    </section>

                    <section className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium">Extra Images</h3>
                            <input type="file" multiple accept="image/*" onChange={handleAddImages} />
                        </div>
                        {extraImages.length === 0 ? (
                            <p className="text-sm text-gray-600">No extra images.</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {extraImages.map((image, index) => (
                                    <div key={image.id} className="border rounded-lg overflow-hidden">
                                        <div className="relative aspect-[4/3] bg-gray-100">
                                            <Image
                                                src={getTransformedStorageUrl(image.image_url)}
                                                alt={car.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, 33vw"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="p-3 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveExtraImage(image.id, "up")}
                                                    disabled={index === 0}
                                                    className="p-1 border rounded disabled:opacity-40"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveExtraImage(image.id, "down")}
                                                    disabled={index === extraImages.length - 1}
                                                    className="p-1 border rounded disabled:opacity-40"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePromoteExtraToMain(image.id)}
                                                    className="p-1 border rounded hover:bg-gray-50"
                                                    title="Make main image"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExtraImage(image)}
                                                    className="p-1 border rounded text-red-600"
                                                    title="Remove image"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section>

            <section className="bg-white border rounded-lg p-5 space-y-4">
                <h2 className="text-lg font-semibold">Features</h2>
                <p className="text-sm text-gray-600">
                    Select the features this vehicle has. Grouped by category.
                </p>
                <div className="space-y-4">
                    {featuresByCategory.map(({ category, features }) => (
                        <div key={category.id} className="border rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">
                                {locale.startsWith("fr")
                                    ? category.name_fr
                                    : category.name_en}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {features.map((f) => (
                                    <label
                                        key={f.id}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFeatureIds.has(f.id)}
                                            onChange={() => toggleFeature(f.id)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">
                                            {locale.startsWith("fr")
                                                ? f.name_fr
                                                : f.name_en}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    {featuresByCategory.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No features defined yet. Add feature categories and features in the Features menu.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
