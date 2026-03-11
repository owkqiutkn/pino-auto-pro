"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { storagePathFromPublicUrl } from "@/lib/cars";
import { getLocalizedExteriorColorName } from "@/lib/i18n/colors";
import { useLocale } from "next-intl";

type Car = Database["public"]["Tables"]["cars"]["Row"];
type CarImage = Database["public"]["Tables"]["car_images"]["Row"];
type CarStatus = "available" | "sold" | "hidden";
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];
type Engine = Database["public"]["Tables"]["engines"]["Row"];
type Fuel = Database["public"]["Tables"]["fuels"]["Row"];
type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

export default function EditCarPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const locale = useLocale();

    const [car, setCar] = useState<Car | null>(null);
    const [images, setImages] = useState<CarImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [category, setCategory] = useState("");
    const [year, setYear] = useState<number | "">("");
    const [km, setKm] = useState<number | "">("");
    const [price, setPrice] = useState<number | "">("");
    const [discountedPrice, setDiscountedPrice] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<CarStatus>("available");
    const [featured, setFeatured] = useState(false);
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
            setCategory(carData.category ?? "");
            setYear(carData.year);
            setKm(carData.km);
            setPrice(carData.price);
            setDiscountedPrice(carData.discounted_price ?? "");
            setDescription(carData.description || "");
            setStatus(carData.status as CarStatus);
            setFeatured(carData.featured ?? false);
            setExteriorColor(carData.exterior_color ?? "");
            setEngine(carData.engine ?? "");
            setFuel(carData.fuel ?? "");
            setTransmission(carData.transmission ?? "");
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
                category: category || null,
                exterior_color: exteriorColor || null,
                engine: engine || null,
                fuel: fuel || null,
                transmission: transmission || null,
                year: Number(year),
                km: Number(km),
                price: parsedPrice,
                discounted_price: parsedDiscountedPrice,
                description: description || null,
                status,
                featured,
            });
            if (updateError) throw updateError;
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
                const upload = await client.uploadCarImage(id, file.name, file);
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
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit Car</h1>
                <Link href="/app/cars" className="text-primary-600 hover:text-primary-700">
                    Back to list
                </Link>
            </div>
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSave} className="bg-white border rounded-lg p-5 space-y-4">
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className="w-full border rounded-md px-3 py-2" />
                <div className="grid sm:grid-cols-3 gap-3">
                    <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} required className="border rounded-md px-3 py-2">
                        <option value="">Select brand</option>
                        {brands.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-md px-3 py-2">
                        <option value="">Select category (optional)</option>
                        {categories.map((item) => (
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
                <div className="grid sm:grid-cols-4 gap-3">
                    <select
                        value={exteriorColor}
                        onChange={(e) => setExteriorColor(e.target.value)}
                        className="border rounded-md px-3 py-2"
                    >
                        <option value="">Exterior color (optional)</option>
                        {exteriorColors.map((item) => (
                            <option key={item.id} value={item.name_en ?? item.name}>
                                {getLocalizedExteriorColorName(item as never, locale)}
                            </option>
                        ))}
                    </select>
                    <select value={engine} onChange={(e) => setEngine(e.target.value)} className="border rounded-md px-3 py-2">
                        <option value="">Engine (optional)</option>
                        {engines.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="border rounded-md px-3 py-2">
                        <option value="">Fuel (optional)</option>
                        {fuels.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="border rounded-md px-3 py-2"
                    >
                        <option value="">Transmission (optional)</option>
                        {transmissions.map((item) => (
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
                <div className="flex flex-wrap items-center gap-3">
                    <select value={status} onChange={(e) => setStatus(e.target.value as CarStatus)} className="border rounded-md px-3 py-2">
                        <option value="available">available</option>
                        <option value="sold">sold</option>
                        <option value="hidden">hidden</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">Featured</span>
                    </label>
                    <button type="button" onClick={handleMarkSold} className="px-3 py-2 rounded-md border hover:bg-gray-50">
                        Mark sold
                    </button>
                </div>
                <button disabled={saving} type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </form>

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
                                <div className="aspect-[4/3] bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={coverImage.image_url} alt={`${car.title} main image`} className="w-full h-full object-cover" />
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
                                        <div className="aspect-[4/3] bg-gray-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={image.image_url} alt={car.title} className="w-full h-full object-cover" />
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
        </div>
    );
}
