"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
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
            setError(getErrorMessage(err, "Failed to load categories."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createCategory(name.trim());
            if (createError) throw createError;
            setName("");
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create category."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteCategory(id);
            if (deleteError) throw deleteError;
            await loadCategories();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to delete category."));
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
            <h1 className="text-2xl font-semibold">Categories</h1>

            <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 flex gap-2">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Category name"
                    className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                    disabled={saving}
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
                        {categories.map((category) => (
                            <tr key={category.id} className="border-t">
                                <td className="p-3">{category.name}</td>
                                <td className="p-3">{new Date(category.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>
                                    No categories yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
