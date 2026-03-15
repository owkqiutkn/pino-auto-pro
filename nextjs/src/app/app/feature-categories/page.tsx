"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { useTranslations } from "next-intl";

type FeatureCategory = Database["public"]["Tables"]["feature_categories"]["Row"];

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

type FeatureCategoriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function FeatureCategoriesPage({ searchParams }: FeatureCategoriesPageProps) {
  use(searchParams ?? Promise.resolve({}));
  const t = useTranslations("App.FeatureCategories");

  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const client = await createSPASassClient();
      const { data, error: err } = await client.getFeatureCategories();
      if (err) throw err;
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
    if (!nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
    try {
      setSaving(true);
      setError("");
      const client = await createSPASassClient();
      const { error: createError } = await client.createFeatureCategory(
        nameEn.trim(),
        nameEs.trim(),
        nameFr.trim()
      );
      if (createError) throw createError;
      setNameEn("");
      setNameEs("");
      setNameFr("");
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, t("createError")));
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (cat: FeatureCategory) => {
    setEditingId(cat.id);
    setNameEn(cat.name_en ?? cat.name ?? "");
    setNameEs(cat.name_es ?? cat.name ?? "");
    setNameFr(cat.name_fr ?? cat.name ?? "");
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId || !nameEn.trim() || !nameEs.trim() || !nameFr.trim()) return;
    try {
      setSaving(true);
      setError("");
      const client = await createSPASassClient();
      const { error: updateError } = await client.updateFeatureCategory(
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
      const { error: deleteError } = await client.deleteFeatureCategory(id);
      if (deleteError) throw deleteError;
      await loadCategories();
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

      {error && <p className="text-red-600">{error}</p>}

      <form
        onSubmit={editingId ? handleUpdate : handleCreate}
        className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row"
      >
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          required
          placeholder={t("nameEnPlaceholder")}
          className="flex-1 rounded-md border px-3 py-2"
        />
        <input
          value={nameEs}
          onChange={(e) => setNameEs(e.target.value)}
          required
          placeholder={t("nameEsPlaceholder")}
          className="flex-1 rounded-md border px-3 py-2"
        />
        <input
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
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
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="p-3">{cat.name_en ?? cat.name}</td>
                <td className="p-3">{cat.name_es ?? cat.name}</td>
                <td className="p-3">{cat.name_fr ?? cat.name}</td>
                <td className="p-3">{new Date(cat.created_at).toLocaleDateString()}</td>
                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    title={t("tableEdit")}
                    className="inline-flex text-blue-600 hover:text-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    title={t("tableDelete")}
                    className="inline-flex text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={5}>
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
