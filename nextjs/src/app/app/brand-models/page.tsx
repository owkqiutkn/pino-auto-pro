"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

type BrandModelsPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function BrandModelsPage({ searchParams }: BrandModelsPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<BrandModel[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadBrands = useCallback(async () => {
        const client = await createSPASassClient();
        const { data, error: brandsError } = await client.getBrands();
        if (brandsError) throw brandsError;
        const loadedBrands = data || [];
        setBrands(loadedBrands);
        if (!selectedBrandId && loadedBrands.length > 0) {
            setSelectedBrandId(loadedBrands[0].id);
        }
    }, [selectedBrandId]);

    const loadModels = useCallback(async (brandId: string) => {
        if (!brandId) {
            setModels([]);
            return;
        }
        const client = await createSPASassClient();
        const { data, error: modelsError } = await client.getBrandModels(brandId);
        if (modelsError) throw modelsError;
        setModels(data || []);
    }, []);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                setLoading(true);
                setError("");
                await loadBrands();
            } catch (err) {
                console.error(err);
                setError(getErrorMessage(err, "Failed to load brand models."));
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, [loadBrands]);

    useEffect(() => {
        const loadForBrand = async () => {
            try {
                setError("");
                await loadModels(selectedBrandId);
            } catch (err) {
                console.error(err);
                setError(getErrorMessage(err, "Failed to load models."));
            }
        };
        loadForBrand();
    }, [selectedBrandId, loadModels]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedBrandId || !name.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createBrandModel(selectedBrandId, name.trim());
            if (createError) throw createError;
            setName("");
            await loadModels(selectedBrandId);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create model."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this model?")) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteBrandModel(id);
            if (deleteError) throw deleteError;
            await loadModels(selectedBrandId);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to delete model."));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl">
            <h1 className="text-2xl font-semibold">Brand Models</h1>

            <div className="bg-white border rounded-lg p-4 space-y-3">
                <label className="block text-sm font-medium">Brand</label>
                <select
                    value={selectedBrandId}
                    onChange={(event) => setSelectedBrandId(event.target.value)}
                    className="border rounded-md px-3 py-2 w-full"
                >
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
            </div>

            <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 flex gap-2">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Model name"
                    className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                    disabled={saving || !selectedBrandId}
                    type="submit"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                </button>
            </form>

            {error && <p className="text-red-600">{error}</p>}

            <div className="overflow-x-auto border rounded-lg bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Created</th>
                            <th className="text-left p-3">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model) => (
                            <tr key={model.id} className="border-t">
                                <td className="p-3">{model.name}</td>
                                <td className="p-3">{new Date(model.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(model.id)}
                                        title="Delete"
                                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {models.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>
                                    No models for this brand yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
