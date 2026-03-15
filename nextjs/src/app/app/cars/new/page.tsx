"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState, use } from "react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { slugifyCar } from "@/lib/cars";
import { Database } from "@/lib/types";
import { getLocalizedExteriorColorName } from "@/lib/i18n/colors";
import { getLocalizedCategoryName } from "@/lib/i18n/categories";
import { getLocalizedEngineName } from "@/lib/i18n/engines";
import { getLocalizedFuelName } from "@/lib/i18n/fuels";
import { getLocalizedTransmissionName } from "@/lib/i18n/transmissions";
import { useLocale } from "next-intl";

type CarStatus = "available" | "sold" | "hidden";
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

function getErrorMessage(err: unknown) {
    if (err instanceof Error) {
        return err.message;
    }
    if (err && typeof err === "object") {
        const maybe = err as {
            message?: unknown;
            code?: unknown;
            details?: unknown;
            hint?: unknown;
        };
        const baseMessage = typeof maybe.message === "string" && maybe.message.length > 0
            ? maybe.message
            : "Failed to create car.";
        const suffix = [maybe.code, maybe.details, maybe.hint]
            .filter((part): part is string => typeof part === "string" && part.length > 0)
            .join(" | ");
        return suffix ? `${baseMessage} (${suffix})` : baseMessage;
    }
    return "Failed to create car.";
}

type NewCarPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function NewCarPage({ searchParams }: NewCarPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const router = useRouter();
    const locale = useLocale();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
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
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandModels, setBrandModels] = useState<BrandModel[]>([]);
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

    const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(
        () => Array.from({ length: currentYear - 1980 + 1 }, (_, index) => currentYear - index),
        [currentYear]
    );
    const mainImagePreviewUrl = useMemo(
        () => (mainImageFile ? URL.createObjectURL(mainImageFile) : null),
        [mainImageFile]
    );
    const extraImagePreviews = useMemo(
        () =>
            extraImageFiles.map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        [extraImageFiles]
    );

    useEffect(() => {
        return () => {
            if (mainImagePreviewUrl) {
                URL.revokeObjectURL(mainImagePreviewUrl);
            }
        };
    }, [mainImagePreviewUrl]);

    useEffect(() => {
        return () => {
            extraImagePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [extraImagePreviews]);

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const client = await createSPASassClient();
                const { data, error: brandsError } = await client.getBrands();
                if (brandsError) throw brandsError;
                setBrands(data || []);
            } catch (err) {
                console.error("Load brands failed:", err);
                setError("Failed to load brands.");
            }
        };
        loadBrands();
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const client = await createSPASassClient();
                const { data, error: categoriesError } = await client.getCategories();
                if (categoriesError) throw categoriesError;
                setCategories(data || []);
            } catch (err) {
                console.error("Load categories failed:", err);
                setError("Failed to load categories.");
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadAttributes = async () => {
            try {
                const client = await createSPASassClient();
                const [{ data: exteriorColorData, error: exteriorError }, { data: engineData, error: engineError }, { data: fuelData, error: fuelError }, { data: transmissionData, error: transmissionError }] =
                    await Promise.all([
                        client.getExteriorColors(),
                        client.getEngines(),
                        client.getFuels(),
                        client.getTransmissions(),
                    ]);
                if (exteriorError) throw exteriorError;
                if (engineError) throw engineError;
                if (fuelError) throw fuelError;
                if (transmissionError) throw transmissionError;
                setExteriorColors(exteriorColorData || []);
                setEngines(engineData || []);
                setFuels(fuelData || []);
                setTransmissions(transmissionData || []);
            } catch (err) {
                console.error("Load car attributes failed:", err);
                setError("Failed to load car attributes.");
            }
        };
        loadAttributes();
    }, []);

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
                console.error("Load brand models failed:", err);
                setBrandModels([]);
                setModel("");
                setError("Failed to load brand models.");
            }
        };
        loadModels();
    }, [brand, brands]);

    const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setMainImageFile(selectedFile);
    };

    const handleExtraImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        setExtraImageFiles(selectedFiles);
    };

    const handleRemoveMainImage = () => {
        setMainImageFile(null);
    };

    const handleRemoveExtraImage = (indexToRemove: number) => {
        setExtraImageFiles((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
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
            if (extraImageFiles.length > 0 && !mainImageFile) {
                throw new Error("Select a main image when uploading extra images.");
            }

            const client = await createSPASassClient();
            const baseSlug = slugifyCar(title, Number(year), brand, model) || `car-${Date.now()}`;
            let createdCar: { id: string } | null = null;
            let createFailure: unknown = null;

            for (let attempt = 0; attempt < 5; attempt += 1) {
                const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
                const { data, error: createError } = await client.createCar({
                    slug,
                    title,
                    brand,
                    model,
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

                if (!createError && data) {
                    createdCar = data;
                    createFailure = null;
                    break;
                }

                createFailure = createError || new Error("Car creation returned no data.");
                const code = (createError as { code?: string } | null)?.code;
                if (code !== "23505") {
                    break;
                }
            }

            if (!createdCar) {
                throw createFailure || new Error("Failed to create car.");
            }

            if (mainImageFile) {
                const mainUpload = await client.uploadCarImage(createdCar.id, mainImageFile.name, mainImageFile);
                if (mainUpload.error) {
                    throw mainUpload.error;
                }
                const { error: createMainImageError } = await client.createCarImage({
                    car_id: createdCar.id,
                    image_url: mainUpload.data.publicUrl,
                    sort_order: 1,
                    is_cover: true,
                });
                if (createMainImageError) {
                    throw createMainImageError;
                }
            }

            for (let index = 0; index < extraImageFiles.length; index += 1) {
                const file = extraImageFiles[index];
                const upload = await client.uploadCarImage(createdCar.id, file.name, file);
                if (upload.error) {
                    throw upload.error;
                }
                const { error: createExtraImageError } = await client.createCarImage({
                    car_id: createdCar.id,
                    image_url: upload.data.publicUrl,
                    sort_order: index + 2,
                    is_cover: false,
                });
                if (createExtraImageError) {
                    throw createExtraImageError;
                }
            }

            router.push("/app/cars");
        } catch (err: unknown) {
            console.error("Create car failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Add Car</h1>
                <Link href="/app/cars" className="text-primary-600 hover:text-primary-700">
                    Back to list
                </Link>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-5 space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className="w-full border rounded-md px-3 py-2" />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                        <select id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required className="w-full border rounded-md px-3 py-2">
                        <option value="">Select brand</option>
                        {brands.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-md px-3 py-2">
                        <option value="">Select category (optional)</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedCategoryName(item, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <select id="model" value={model} onChange={(e) => setModel(e.target.value)} required disabled={!brand} className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100">
                        <option value="">{brand ? "Select model" : "Select brand first"}</option>
                        {brandModels.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                        <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-700 mb-1">Exterior color</label>
                        <select
                            id="exteriorColor"
                            value={exteriorColor}
                            onChange={(e) => setExteriorColor(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        >
                        <option value="">Exterior color (optional)</option>
                        {exteriorColors.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedExteriorColorName(item as never, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">Engine</label>
                        <select id="engine" value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full border rounded-md px-3 py-2">
                        <option value="">Engine (optional)</option>
                        {engines.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedEngineName(item, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">Fuel</label>
                        <select id="fuel" value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full border rounded-md px-3 py-2">
                        <option value="">Fuel (optional)</option>
                        {fuels.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedFuelName(item, locale)}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                        <select
                            id="transmission"
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        >
                        <option value="">Transmission (optional)</option>
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
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select id="year" value={year === "" ? "" : String(year)} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} required className="w-full border rounded-md px-3 py-2">
                        <option value="">Select year</option>
                        {yearOptions.map((optionYear) => (
                            <option key={optionYear} value={optionYear}>
                                {optionYear}
                            </option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <label htmlFor="km" className="block text-sm font-medium text-gray-700 mb-1">Kilometers (KM)</label>
                        <input id="km" value={km} onChange={(e) => setKm(Number(e.target.value))} type="number" required placeholder="KM" className="w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" required placeholder="Price" className="w-full border rounded-md px-3 py-2" />
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">VIN (optional)</label>
                        <input
                            id="vin"
                            value={vin}
                            onChange={(e) => setVin(e.target.value)}
                            placeholder="e.g. 1HGBH41JXMN109186"
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="warranty" className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                        <select
                            id="warranty"
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
                        <label htmlFor="carfaxUrl" className="block text-sm font-medium text-gray-700 mb-1">Carfax URL (optional)</label>
                        <input
                            id="carfaxUrl"
                            type="url"
                            value={carfaxUrl}
                            onChange={(e) => setCarfaxUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="cargurusUrl" className="block text-sm font-medium text-gray-700 mb-1">CarGurus URL (optional)</label>
                        <input
                            id="cargurusUrl"
                            type="url"
                            value={cargurusUrl}
                            onChange={(e) => setCargurusUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">Discounted price (optional)</label>
                    <input
                        id="discountedPrice"
                        value={discountedPrice}
                        onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : "")}
                        type="number"
                        min={0}
                        max={price === "" ? undefined : Number(price)}
                        placeholder="Discounted price (optional)"
                        className="w-full border rounded-md px-3 py-2"
                    />
                </div>
                <div>
                    <label htmlFor="descriptionEn" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">Description (English)<Image src="/icons/ai.png" alt="AI" width={16} height={16} className="w-4 h-4" /></label>
                    <textarea id="descriptionEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={5} placeholder="Vehicle description, features, condition..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                    <label htmlFor="descriptionEs" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">Description (Spanish)</label>
                    <textarea id="descriptionEs" value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} rows={5} placeholder="Descripción del vehículo, equipamiento, estado..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                    <label htmlFor="descriptionFr" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">Description (French)<Image src="/icons/ai.png" alt="AI" width={16} height={16} className="w-4 h-4" /></label>
                    <textarea id="descriptionFr" value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} rows={5} placeholder="Description du véhicule, équipements, état..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value as CarStatus)} className="border rounded-md px-3 py-2">
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
                <div className="space-y-4">
                    <div className="border rounded-md p-3 space-y-2">
                        <label className="block text-sm font-medium">Main Image</label>
                        <input type="file" accept="image/*" onChange={handleMainImageChange} />
                        <p className="text-xs text-gray-600">
                            Optional. Required when adding extra images.
                        </p>
                        {mainImageFile && mainImagePreviewUrl && (
                            <div className="max-w-sm border rounded-lg overflow-hidden">
                                <div className="aspect-[4/3] bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={mainImagePreviewUrl} alt="Main image preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-2 flex items-center justify-between gap-2">
                                    <p className="text-sm text-gray-700 truncate">{mainImageFile.name}</p>
                                    <button
                                        type="button"
                                        onClick={handleRemoveMainImage}
                                        className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="border rounded-md p-3 space-y-2">
                        <label className="block text-sm font-medium">Extra Images</label>
                        <input type="file" multiple accept="image/*" onChange={handleExtraImagesChange} />
                        {extraImagePreviews.length > 0 && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {extraImagePreviews.map((item, index) => (
                                    <div key={`${item.file.name}-${index}`} className="border rounded-lg overflow-hidden">
                                        <div className="aspect-[4/3] bg-gray-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.previewUrl} alt={`Extra image preview ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-2 flex items-center justify-between gap-2">
                                            <p className="text-sm text-gray-700 truncate">{item.file.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExtraImage(index)}
                                                className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button disabled={loading} type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
                    {loading ? "Saving..." : "Save car"}
                </button>
            </form>
        </div>
    );
}
