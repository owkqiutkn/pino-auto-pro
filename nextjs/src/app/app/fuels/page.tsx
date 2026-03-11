"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Fuel = Database["public"]["Tables"]["fuels"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

export default function FuelsPage() {
    const [fuels, setFuels] = useState<Fuel[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadFuels = useCallback(async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data, error: fuelsError } = await client.getFuels();
            if (fuelsError) throw fuelsError;
            setFuels(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to load fuels."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFuels();
    }, [loadFuels]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createFuel(name.trim());
            if (createError) throw createError;
            setName("");
            await loadFuels();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create fuel."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this fuel?")) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteFuel(id);
            if (deleteError) throw deleteError;
            await loadFuels();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to delete fuel."));
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
            <h1 className="text-2xl font-semibold">Fuels</h1>

            <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 flex gap-2">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Fuel"
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
                        {fuels.map((fuel) => (
                            <tr key={fuel.id} className="border-t">
                                <td className="p-3">{fuel.name}</td>
                                <td className="p-3">{new Date(fuel.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(fuel.id)}
                                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {fuels.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>
                                    No fuels yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

