"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { useTranslations } from "next-intl";

type Transmission = Database["public"]["Tables"]["transmissions"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
        return (error as { message: string }).message;
    }
    return fallback;
}

type TransmissionsPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function TransmissionsPage({ searchParams }: TransmissionsPageProps) {
    use(searchParams ?? Promise.resolve({}));
    const t = useTranslations("App.Transmissions");
    const [transmissions, setTransmissions] = useState<Transmission[]>([]);
    const [nameEn, setNameEn] = useState("");
    const [nameFr, setNameFr] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadTransmissions = useCallback(async () => {
        try {
            setLoading(true);
            const client = await createSPASassClient();
            const { data, error: transmissionsError } = await client.getTransmissions();
            if (transmissionsError) throw transmissionsError;
            setTransmissions(data || []);
            setError("");
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("loadError")));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadTransmissions();
    }, [loadTransmissions]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        if (!nameEn.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: createError } = await client.createTransmission(
                nameEn.trim(),
                nameFr.trim()
            );
            if (createError) throw createError;
            setNameEn("");
            setNameFr("");
            await loadTransmissions();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("createError")));
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (transmission: Transmission) => {
        setEditingId(transmission.id);
        setNameEn(transmission.name_en ?? transmission.name ?? "");
        setNameFr(transmission.name_fr ?? transmission.name ?? "");
    };

    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingId || !nameEn.trim() || !nameFr.trim()) return;
        try {
            setSaving(true);
            setError("");
            const client = await createSPASassClient();
            const { error: updateError } = await client.updateTransmission(
                editingId,
                nameEn.trim(),
                nameFr.trim()
            );
            if (updateError) throw updateError;
            setEditingId(null);
            setNameEn("");
            setNameFr("");
            await loadTransmissions();
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
            const { error: deleteError } = await client.deleteTransmission(id);
            if (deleteError) throw deleteError;
            await loadTransmissions();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, t("deleteError")));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>

            <form
                onSubmit={editingId ? handleUpdate : handleCreate}
                className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row"
            >
                <input
                    value={nameEn}
                    onChange={(event) => setNameEn(event.target.value)}
                    required
                    placeholder={t("nameEnPlaceholder")}
                    className="flex-1 rounded-md border px-3 py-2"
                />
                <input
                    value={nameFr}
                    onChange={(event) => setNameFr(event.target.value)}
                    required
                    placeholder={t("nameFrPlaceholder")}
                    className="flex-1 rounded-md border px-3 py-2"
                />
                <button
                    disabled={saving}
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-60"
                >
                    {editingId ? (
                        <>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("save")}
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            {t("add")}
                        </>
                    )}
                </button>
            </form>

            {error && <p className="text-red-600">{error}</p>}

            <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">{t("tableNameEn")}</th>
                            <th className="p-3 text-left">{t("tableNameFr")}</th>
                            <th className="p-3 text-left">{t("tableCreated")}</th>
                            <th className="p-3 text-left">{t("tableActions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transmissions.map((transmission) => (
                            <tr key={transmission.id} className="border-t">
                                <td className="p-3">{transmission.name_en ?? transmission.name}</td>
                                <td className="p-3">{transmission.name_fr ?? transmission.name}</td>
                                <td className="p-3">
                                    {new Date(transmission.created_at).toLocaleDateString()}
                                </td>
                                <td className="flex gap-2 p-3">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(transmission)}
                                        title={t("tableEdit")}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(transmission.id)}
                                        title={t("tableDelete")}
                                        className="inline-flex items-center text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transmissions.length === 0 ? (
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
