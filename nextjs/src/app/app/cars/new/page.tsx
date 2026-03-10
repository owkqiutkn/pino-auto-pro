"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { slugifyCar } from "@/lib/cars";
import { Database } from "@/lib/types";

type CarStatus = "available" | "sold" | "hidden";
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];
type BodyType = Database["public"]["Tables"]["body_types"]["Row"];

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

export default function NewCarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [year, setYear] = useState<number | "">("");
    const [km, setKm] = useState<number | "">("");
    const [price, setPrice] = useState<number | "">("");
    const [discountedPrice, setDiscountedPrice] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<CarStatus>("available");
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandModels, setBrandModels] = useState<BrandModel[]>([]);
    const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);

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
        const loadBodyTypes = async () => {
            try {
                const client = await createSPASassClient();
                const { data, error: bodyTypesError } = await client.getBodyTypes();
                if (bodyTypesError) throw bodyTypesError;
                setBodyTypes(data || []);
            } catch (err) {
                console.error("Load body types failed:", err);
                setError("Failed to load body types.");
            }
        };
        loadBodyTypes();
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
                    body_type: bodyType || null,
                    year: Number(year),
                    km: Number(km),
                    price: parsedPrice,
                    discounted_price: parsedDiscountedPrice,
                    description: description || null,
                    status,
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
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className="w-full border rounded-md px-3 py-2" />
                <div className="grid sm:grid-cols-3 gap-3">
                    <select value={brand} onChange={(e) => setBrand(e.target.value)} required className="border rounded-md px-3 py-2">
                        <option value="">Select brand</option>
                        {brands.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="border rounded-md px-3 py-2">
                        <option value="">Select body type (optional)</option>
                        {bodyTypes.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select value={model} onChange={(e) => setModel(e.target.value)} required disabled={!brand} className="border rounded-md px-3 py-2 disabled:bg-gray-100">
                        <option value="">{brand ? "Select model" : "Select brand first"}</option>
                        {brandModels.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                    <select value={year === "" ? "" : String(year)} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} required className="border rounded-md px-3 py-2">
                        <option value="">Select year</option>
                        {yearOptions.map((optionYear) => (
                            <option key={optionYear} value={optionYear}>
                                {optionYear}
                            </option>
                        ))}
                    </select>
                    <input value={km} onChange={(e) => setKm(Number(e.target.value))} type="number" required placeholder="KM" className="border rounded-md px-3 py-2" />
                    <input value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" required placeholder="Price" className="border rounded-md px-3 py-2" />
                </div>
                <input
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : "")}
                    type="number"
                    min={0}
                    max={price === "" ? undefined : Number(price)}
                    placeholder="Discounted price (optional)"
                    className="w-full border rounded-md px-3 py-2"
                />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Description" className="w-full border rounded-md px-3 py-2" />
                <select value={status} onChange={(e) => setStatus(e.target.value as CarStatus)} className="border rounded-md px-3 py-2">
                    <option value="available">available</option>
                    <option value="sold">sold</option>
                    <option value="hidden">hidden</option>
                </select>
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
