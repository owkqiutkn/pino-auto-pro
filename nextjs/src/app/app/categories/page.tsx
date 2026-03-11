"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
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
    const [nameFr, setNameFr] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!nameEn.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createCategory(nameEn.trim(), nameFr.trim());
            if (createError) throw createError;
            setNameEn("");
            setNameFr("");
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
        setNameFr(cat.name_fr ?? cat.name ?? "");
    };

    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingId || !nameEn.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: updateError } = await client.updateCategory(editingId, nameEn.trim(), nameFr.trim());
            if (updateError) throw updateError;
            setEditingId(null);
            setNameEn("");
            setNameFr("");
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
                className="bg-white border rounded-lg p-4 flex flex-col gap-3 sm:flex-row"
            >
                <input
                    value={nameEn}
                    onChange={(event) => setNameEn(event.target.value)}
                    required
                    placeholder={t("nameEnPlaceholder")}
                    className="flex-1 border rounded-md px-3 py-2"
                />
                <input
                    value={nameFr}
                    onChange={(event) => setNameFr(event.target.value)}
                    required
                    placeholder={t("nameFrPlaceholder")}
                    className="flex-1 border rounded-md px-3 py-2"
                />
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
            </form>

            {error && <p className="text-red-600">{error}</p>}

            <div className="overflow-x-auto border rounded-lg bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3">{t("tableNameEn")}</th>
                            <th className="text-left p-3">{t("tableNameFr")}</th>
                            <th className="text-left p-3">{t("tableCreated")}</th>
                            <th className="text-left p-3">{t("tableActions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-t">
                                <td className="p-3">{category.name_en ?? category.name}</td>
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
                                <td className="p-3 text-gray-500" colSpan={4}>
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
