"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil, ImagePlus, X } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { useTranslations } from "next-intl";

type Category = Database["public"]["Tables"]["categories"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

type CategoriesPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function CategoriesPage({ searchParams }: CategoriesPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const t = useTranslations("App.Categories");
    const [categories, setCategories] = useState<Category[]>([]);
    const [nameEn, setNameEn] = useState("");
    const [nameEs, setNameEs] = useState("");
    const [nameFr, setNameFr] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editingCategory = editingId ? categories.find((c) => c.id === editingId) : null;
    const currentImageUrl = editingCategory?.image_url && !removeImage ? editingCategory.image_url : null;

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(currentImageUrl ?? null);
    }, [imageFile, currentImageUrl]);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data, error: categoriesError } = await client.getCategories();
            if (categoriesError) throw categoriesError;
            setCategories(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("loadError")));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const resetForm = useCallback(() => {
        setNameEn("");
        setNameEs("");
        setNameFr("");
        setImageFile(null);
        setRemoveImage(false);
        setEditingId(null);
        fileInputRef.current?.setAttribute("value", "");
    }, []);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { data: created, error: createError } = await client.createCategory(nameEn.trim(), nameEs.trim(), nameFr.trim());
            if (createError) throw createError;
            if (created && imageFile) {
                const { data: uploadData, error: uploadError } = await client.uploadCategoryImage(created.id, imageFile.name, imageFile);
                if (uploadError) throw uploadError;
                if (uploadData?.publicUrl) {
                    await client.updateCategory(created.id, nameEn.trim(), nameEs.trim(), nameFr.trim(), uploadData.publicUrl);
                }
            }
            resetForm();
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("createError")));
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (cat: Category) => {
        setEditingId(cat.id);
        setNameEn(cat.name_en ?? cat.name ?? "");
        setNameEs(cat.name_es ?? cat.name ?? "");
        setNameFr(cat.name_fr ?? cat.name ?? "");
        setImageFile(null);
        setRemoveImage(false);
        fileInputRef.current?.setAttribute("value", "");
    };

    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingId || !nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            let imageUrl: string | null | undefined = undefined;
            if (removeImage) {
                imageUrl = null;
            } else if (imageFile) {
                const { data: uploadData, error: uploadError } = await client.uploadCategoryImage(editingId, imageFile.name, imageFile);
                if (uploadError) throw uploadError;
                imageUrl = uploadData?.publicUrl ?? null;
            }
            const { error: updateError } = await client.updateCategory(editingId, nameEn.trim(), nameEs.trim(), nameFr.trim(), imageUrl);
            if (updateError) throw updateError;
            resetForm();
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("updateError")));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t("deleteConfirm"))) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteCategory(id);
            if (deleteError) throw deleteError;
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("deleteError")));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageFile(file ?? null);
        setRemoveImage(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>

            <form
                onSubmit={editingId ? handleUpdate : handleCreate}
                className="bg-white border rounded-lg p-4 flex flex-col gap-3"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <input
                        value={nameEn}
                        onChange={(event) => setNameEn(event.target.value)}
                        required
                        placeholder={t("nameEnPlaceholder")}
                        className="flex-1 border rounded-md px-3 py-2"
                    />
                    <input
                        value={nameEs}
                        onChange={(event) => setNameEs(event.target.value)}
                        required
                        placeholder={t("nameEsPlaceholder")}
                        className="flex-1 border rounded-md px-3 py-2"
                    />
                    <input
                        value={nameFr}
                        onChange={(event) => setNameFr(event.target.value)}
                        required
                        placeholder={t("nameFrPlaceholder")}
                        className="flex-1 border rounded-md px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="text-sm font-medium text-gray-700">{t("imageLabel")}</label>
                    <div className="flex items-center gap-2 flex-wrap">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="category-image-input"
                        />
                        <label
                            htmlFor="category-image-input"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 text-sm"
                        >
                            <ImagePlus className="w-4 h-4" />
                            {t("imagePlaceholder")}
                        </label>
                        {(previewUrl || (editingCategory?.image_url && !removeImage)) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setImageFile(null);
                                    setRemoveImage(true);
                                    fileInputRef.current?.setAttribute("value", "");
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm"
                            >
                                <X className="w-4 h-4" />
                                {t("removeImage")}
                            </button>
                        )}
                        {previewUrl && (
                            <div className="h-12 w-16 rounded overflow-hidden border border-gray-200 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={saving}
                        type="submit"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                    >
                        {editingId ? (
                            <>
                                <Pencil className="w-4 h-4 mr-2" />
                                {t("save")}
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                {t("add")}
                            </>
                        )}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                            {t("cancel")}
                        </button>
                    )}
                </div>
            </form>

            {error && <p className="text-red-600">{error}</p>}

            <div className="overflow-x-auto border rounded-lg bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3">{t("tableImage")}</th>
                            <th className="text-left p-3">{t("tableNameEn")}</th>
                            <th className="text-left p-3">{t("tableNameEs")}</th>
                            <th className="text-left p-3">{t("tableNameFr")}</th>
                            <th className="text-left p-3">{t("tableCreated")}</th>
                            <th className="text-left p-3">{t("tableActions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-t">
                                <td className="p-3">
                                    {category.image_url ? (
                                        <div className="h-10 w-14 rounded overflow-hidden border border-gray-200 shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={category.image_url} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                    )}
                                </td>
                                <td className="p-3">{category.name_en ?? category.name}</td>
                                <td className="p-3">{category.name_es ?? category.name}</td>
                                <td className="p-3">{category.name_fr ?? category.name}</td>
                                <td className="p-3">{new Date(category.created_at).toLocaleDateString()}</td>
                                <td className="p-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(category)}
                                        title={t("tableEdit")}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(category.id)}
                                        title={t("tableDelete")}
                                        className="inline-flex items-center text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={6}>
                                    {t("empty")}
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
