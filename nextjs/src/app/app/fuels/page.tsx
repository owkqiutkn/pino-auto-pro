"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { useTranslations } from "next-intl";

type Fuel = Database["public"]["Tables"]["fuels"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }
    return fallback;
}

type FuelsPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function FuelsPage({ searchParams }: FuelsPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const t = useTranslations("App.Fuels");
    const [fuels, setFuels] = useState<Fuel[]>([]);
    const [nameEn, setNameEn] = useState("");
    const [nameEs, setNameEs] = useState("");
    const [nameFr, setNameFr] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
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
            setError(getErrorMessage(err, t("loadError")));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadFuels();
    }, [loadFuels]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createFuel(nameEn.trim(), nameFr.trim());
            if (createError) throw createError;
            setNameEn("");
            setNameFr("");
            await loadFuels();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("createError")));
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (fuel: Fuel) => {
        setEditingId(fuel.id);
        setNameEn(fuel.name_en ?? fuel.name ?? "");
        setNameEs(fuel.name_es ?? fuel.name ?? "");
        setNameFr(fuel.name_fr ?? fuel.name ?? "");
    };

    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingId || !nameEn.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: updateError } = await client.updateFuel(editingId, nameEn.trim(), nameEs.trim(), nameFr.trim());
            if (updateError) throw updateError;
            setEditingId(null);
            setNameEn("");
            setNameEs("");
            setNameFr("");
            await loadFuels();
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
            const { error: deleteError } = await client.deleteFuel(id);
            if (deleteError) throw deleteError;
            await loadFuels();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("deleteError")));
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
                        {fuels.map((fuel) => (
                            <tr key={fuel.id} className="border-t">
                                <td className="p-3">{fuel.name_en ?? fuel.name}</td>
                                <td className="p-3">{fuel.name_es ?? fuel.name}</td>
                                <td className="p-3">{fuel.name_fr ?? fuel.name}</td>
                                <td className="p-3">{new Date(fuel.created_at).toLocaleDateString()}</td>
                                <td className="flex gap-2 p-3">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(fuel)}
                                        title={t("tableEdit")}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(fuel.id)}
                                        title={t("tableDelete")}
                                        className="inline-flex items-center text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {fuels.length === 0 ? (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={5}>
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
