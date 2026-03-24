"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { useTranslations } from "next-intl";

type ExteriorColor = Database["public"]["Tables"]["exterior_colors"]["Row"];

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

type ColorsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function ColorsPage({ searchParams }: ColorsPageProps) {
  use(searchParams ?? Promise.resolve({})); // Unwrap to satisfy Next.js 15 async dynamic APIs
  const t = useTranslations("App.ExteriorColors");
  const [colors, setColors] = useState<ExteriorColor[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
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
      setError(getErrorMessage(err, t("loadError")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadColors();
  }, [loadColors]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
    try {
      setSaving(true);
      setError("");
      const client = await createSPASassClient();
      const { error: createError } = await client.createExteriorColor(
        nameEn.trim(),
        nameEs.trim(),
        nameFr.trim()
      );
      if (createError) throw createError;
      setNameEn("");
      setNameEs("");
      setNameFr("");
      await loadColors();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, t("createError")));
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (color: ExteriorColor) => {
    setEditingId(color.id);
    setNameEn(color.name_en ?? color.name ?? "");
    setNameEs(color.name_es ?? color.name ?? "");
    setNameFr(color.name_fr ?? color.name ?? "");
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId || !nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
    try {
      setSaving(true);
      setError("");
      const client = await createSPASassClient();
      const { error: updateError } = await client.updateExteriorColor(
        editingId,
        nameEn.trim(),
        nameEs.trim(),
        nameFr.trim()
      );
      if (updateError) throw updateError;
      setEditingId(null);
      setNameEn("");
      setNameEs("");
      setNameFr("");
      await loadColors();
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
      const { error: deleteError } = await client.deleteExteriorColor(id);
      if (deleteError) throw deleteError;
      await loadColors();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, t("deleteError")));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#b91c1c]" />
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
          value={nameEs}
          onChange={(event) => setNameEs(event.target.value)}
          required
          placeholder={t("nameEsPlaceholder")}
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
          className="inline-flex items-center justify-center rounded-md bg-[#b91c1c] px-4 py-2 text-white hover:bg-[#7f1d1d] disabled:opacity-60"
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
              <th className="p-3 text-left">{t("tableNameEs")}</th>
              <th className="p-3 text-left">{t("tableNameFr")}</th>
              <th className="p-3 text-left">{t("tableCreated")}</th>
              <th className="p-3 text-left">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr key={color.id} className="border-t">
                <td className="p-3">{color.name_en ?? color.name}</td>
                <td className="p-3">{color.name_es ?? color.name}</td>
                <td className="p-3">{color.name_fr ?? color.name}</td>
                <td className="p-3">
                  {new Date(color.created_at).toLocaleDateString()}
                </td>
                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(color)}
                    title={t("tableEdit")}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(color.id)}
                    title={t("tableDelete")}
                    className="inline-flex items-center text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {colors.length === 0 ? (
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
