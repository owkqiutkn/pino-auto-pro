"use client";

import { FormEvent, useCallback, useEffect, useState, use } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { createSPASassClientAuthenticated as createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";
import { useTranslations, useLocale } from "next-intl";

type FeatureCategory = Database["public"]["Tables"]["feature_categories"]["Row"];
type Feature = Database["public"]["Tables"]["features"]["Row"];

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

function getLocalizedName(
  row: { name_en: string; name_es?: string; name_fr: string },
  locale: string
) {
  if (locale.startsWith("fr")) return row.name_fr;
  if (locale.startsWith("es")) return row.name_es ?? row.name_en;
  return row.name_en;
}

type FeaturesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function FeaturesPage({ searchParams }: FeaturesPageProps) {
  use(searchParams ?? Promise.resolve({}));
  const t = useTranslations("App.Features");
  const locale = useLocale();

  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [featNameEn, setFeatNameEn] = useState("");
  const [featNameEs, setFeatNameEs] = useState("");
  const [featNameFr, setFeatNameFr] = useState("");
  const [featCategoryId, setFeatCategoryId] = useState("");
  const [featEditingId, setFeatEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    const client = await createSPASassClient();
    const { data, error: err } = await client.getFeatureCategories();
    if (err) throw err;
    setCategories(data || []);
  }, []);

  const loadFeatures = useCallback(async () => {
    const client = await createSPASassClient();
    const { data, error: err } = await client.getFeatures(categoryFilter || undefined);
    if (err) throw err;
    setFeatures(data || []);
  }, [categoryFilter]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      await loadCategories();
      await loadFeatures();
      setError("");
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, t("loadError")));
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadFeatures, t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!loading) loadFeatures();
  }, [loadFeatures, loading]);

  const handleCreateFeature = async (event: FormEvent) => {
    event.preventDefault();
    if (!featNameEn.trim() || !featNameEs.trim() || !featNameFr.trim() || !featCategoryId) return;
    try {
      setSaving(true);
      setError("");
      const client = await createSPASassClient();
      const { error: createError } = await client.createFeature(
        featCategoryId,
        featNameEn.trim(),
        featNameEs.trim(),
        featNameFr.trim()
      );
      if (createError) throw createError;
      setFeatNameEn("");
      setFeatNameEs("");
      setFeatNameFr("");
      setFeatCategoryId("");
      await loadFeatures();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, t("createError")));
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditFeature = (feat: Feature) => {
    setFeatEditingId(feat.id);
    setFeatNameEn(feat.name_en ?? feat.name ?? "");
    setFeatNameEs(feat.name_es ?? feat.name ?? "");
    setFeatNameFr(feat.name_fr ?? feat.name ?? "");
    setFeatCategoryId(feat.feature_category_id);
  };

  const handleUpdateFeature = async (event: FormEvent) => {
    event.preventDefault();
    if (!featEditingId || !featNameEn.trim() || !featNameEs.trim() || !featNameFr.trim() || !featCategoryId) return;
    try {
      setSaving(true);
      setError("");
      const client = await createSPASassClient();
      const { error: updateError } = await client.updateFeature(
        featEditingId,
        featNameEn.trim(),
        featNameEs.trim(),
        featNameFr.trim()
      );
      if (updateError) throw updateError;
      setFeatEditingId(null);
      setFeatNameEn("");
      setFeatNameEs("");
      setFeatNameFr("");
      setFeatCategoryId("");
      await loadFeatures();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, t("updateError")));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      setError("");
      const client = await createSPASassClient();
      const { error: deleteError } = await client.deleteFeature(id);
      if (deleteError) throw deleteError;
      await loadFeatures();
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
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">{t("filterByCategory")}</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getLocalizedName(cat, locale)}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={featEditingId ? handleUpdateFeature : handleCreateFeature}
        className="flex flex-wrap gap-3 rounded-lg border bg-white p-4"
      >
        <input
          value={featNameEn}
          onChange={(e) => setFeatNameEn(e.target.value)}
          required
          placeholder={t("nameEnPlaceholder")}
          className="min-w-[140px] flex-1 rounded-md border px-3 py-2"
        />
        <input
          value={featNameEs}
          onChange={(e) => setFeatNameEs(e.target.value)}
          required
          placeholder={t("nameEsPlaceholder")}
          className="min-w-[140px] flex-1 rounded-md border px-3 py-2"
        />
        <input
          value={featNameFr}
          onChange={(e) => setFeatNameFr(e.target.value)}
          required
          placeholder={t("nameFrPlaceholder")}
          className="min-w-[140px] flex-1 rounded-md border px-3 py-2"
        />
        <select
          value={featCategoryId}
          onChange={(e) => setFeatCategoryId(e.target.value)}
          required
          className="min-w-[160px] rounded-md border px-3 py-2"
        >
          <option value="">{t("selectCategory")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getLocalizedName(cat, locale)}
            </option>
          ))}
        </select>
        <button
          disabled={saving}
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-[#b91c1c] px-4 py-2 text-white hover:bg-[#7f1d1d] disabled:opacity-60"
        >
          {featEditingId ? (
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
              <th className="p-3 text-left">{t("tableCategory")}</th>
              <th className="p-3 text-left">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feat) => {
              const cat = categories.find((c) => c.id === feat.feature_category_id);
              return (
                <tr key={feat.id} className="border-t">
                  <td className="p-3">{feat.name_en ?? feat.name}</td>
                  <td className="p-3">{feat.name_es ?? feat.name}</td>
                  <td className="p-3">{feat.name_fr ?? feat.name}</td>
                  <td className="p-3">
                    {cat ? getLocalizedName(cat, locale) : "-"}
                  </td>
                  <td className="flex gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => handleStartEditFeature(feat)}
                      title={t("tableEdit")}
                      className="inline-flex text-blue-600 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeature(feat.id)}
                      title={t("tableDelete")}
                      className="inline-flex text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {features.length === 0 && (
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
