"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

export default function ExteriorColorsPage() {
    const [colors, setColors] = useState<ExteriorColor[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadColors = useCallback(async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data, error: colorsError } = await client.getExteriorColors();
            if (colorsError) throw colorsError;
            setColors(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to load exterior colors."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadColors();
    }, [loadColors]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createExteriorColor(name.trim());
            if (createError) throw createError;
            setName("");
            await loadColors();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create exterior color."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this exterior color?")) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteExteriorColor(id);
            if (deleteError) throw deleteError;
            await loadColors();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to delete exterior color."));
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
            <h1 className="text-2xl font-semibold">Exterior Colors</h1>

            <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 flex gap-2">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Exterior color"
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
                        {colors.map((color) => (
                            <tr key={color.id} className="border-t">
                                <td className="p-3">{color.name}</td>
                                <td className="p-3">{new Date(color.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(color.id)}
                                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {colors.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>
                                    No exterior colors yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

