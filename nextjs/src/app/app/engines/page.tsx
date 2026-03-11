"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Engine = Database["public"]["Tables"]["engines"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

type EnginesPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function EnginesPage({ searchParams }: EnginesPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const [engines, setEngines] = useState<Engine[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadEngines = useCallback(async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data, error: enginesError } = await client.getEngines();
            if (enginesError) throw enginesError;
            setEngines(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to load engines."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEngines();
    }, [loadEngines]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createEngine(name.trim());
            if (createError) throw createError;
            setName("");
            await loadEngines();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create engine."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this engine?")) return;
        try {
            setError("");
            const client = await createSPASassClient();
            const { error: deleteError } = await client.deleteEngine(id);
            if (deleteError) throw deleteError;
            await loadEngines();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to delete engine."));
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
            <h1 className="text-2xl font-semibold">Engines</h1>

            <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 flex gap-2">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Engine"
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
                        {engines.map((engine) => (
                            <tr key={engine.id} className="border-t">
                                <td className="p-3">{engine.name}</td>
                                <td className="p-3">{new Date(engine.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(engine.id)}
                                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {engines.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>
                                    No engines yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

