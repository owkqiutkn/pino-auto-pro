"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandModel = Database["public"]["Tables"]["brand_models"]["Row"];
type ModelTrim = Database["public"]["Tables"]["model_trims"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

type ModelTrimsPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function ModelTrimsPage({ searchParams }: ModelTrimsPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<BrandModel[]>([]);
    const [trims, setTrims] = useState<ModelTrim[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedModelId, setSelectedModelId] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [nameEs, setNameEs] = useState("");
    const [nameFr, setNameFr] = useState("");
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
            setSelectedModelId("");
            return;
        }
        const client = await createSPASassClient();
        const { data, error: modelsError } = await client.getBrandModels(brandId);
        if (modelsError) throw modelsError;
        const loadedModels = data || [];
        setModels(loadedModels);
        setSelectedModelId((prev) => (loadedModels.some((m) => m.id === prev) ? prev : loadedModels[0]?.id ?? ""));
    }, []);

    const loadTrims = useCallback(async (modelId: string) => {
        if (!modelId) {
            setTrims([]);
            return;
        }
        const client = await createSPASassClient();
        const { data, error: trimsError } = await client.getModelTrims(modelId);
        if (trimsError) throw trimsError;
        setTrims(data || []);
    }, []);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                setLoading(true);
                setError("");
                await loadBrands();
            } catch (err) {
                console.error(err);
                setError(getErrorMessage(err, "Failed to load model trims."));
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

    useEffect(() => {
        const loadForModel = async () => {
            try {
                setError("");
                await loadTrims(selectedModelId);
            } catch (err) {
                console.error(err);
                setError(getErrorMessage(err, "Failed to load trims."));
            }
        };
        loadForModel();
    }, [selectedModelId, loadTrims]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedModelId || !nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createModelTrim(
                selectedModelId,
                nameEn.trim(),
                nameEs.trim(),
                nameFr.trim()
            );
            if (createError) throw createError;
            setNameEn("");
            setNameEs("");
            setNameFr("");
            await loadTrims(selectedModelId);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create trim."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this trim?")) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteModelTrim(id);
            if (deleteError) throw deleteError;
            await loadTrims(selectedModelId);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to delete trim."));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#b91c1c]" />
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl">
            <h1 className="text-2xl font-semibold">Model Trims</h1>

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

                <label className="block text-sm font-medium">Model</label>
                <select
                    value={selectedModelId}
                    onChange={(event) => setSelectedModelId(event.target.value)}
                    className="border rounded-md px-3 py-2 w-full"
                    disabled={models.length === 0}
                >
                    {models.length === 0 ? (
                        <option value="">No models for this brand</option>
                    ) : (
                        models.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))
                    )}
                </select>
            </div>

            <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 grid sm:grid-cols-4 gap-2">
                <input
                    value={nameEn}
                    onChange={(event) => setNameEn(event.target.value)}
                    required
                    placeholder="Trim name (EN)"
                    className="border rounded-md px-3 py-2"
                />
                <input
                    value={nameEs}
                    onChange={(event) => setNameEs(event.target.value)}
                    required
                    placeholder="Nombre versión (ES)"
                    className="border rounded-md px-3 py-2"
                />
                <input
                    value={nameFr}
                    onChange={(event) => setNameFr(event.target.value)}
                    required
                    placeholder="Nom version (FR)"
                    className="border rounded-md px-3 py-2"
                />
                <button
                    disabled={saving || !selectedModelId}
                    type="submit"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-[#b91c1c] text-white hover:bg-[#7f1d1d] disabled:opacity-60"
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
                            <th className="text-left p-3">Name (EN)</th>
                            <th className="text-left p-3">Name (ES)</th>
                            <th className="text-left p-3">Name (FR)</th>
                            <th className="text-left p-3">Created</th>
                            <th className="text-left p-3">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trims.map((trim) => (
                            <tr key={trim.id} className="border-t">
                                <td className="p-3">{trim.name_en}</td>
                                <td className="p-3">{trim.name_es}</td>
                                <td className="p-3">{trim.name_fr}</td>
                                <td className="p-3">{new Date(trim.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(trim.id)}
                                        title="Delete"
                                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {trims.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={5}>
                                    No trims for this model yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
