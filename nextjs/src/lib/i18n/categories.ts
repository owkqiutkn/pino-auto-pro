import {Database} from "@/lib/types";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export function getLocalizedCategoryName(category: CategoryRow, locale: string) {
  const baseLocale = locale.split("-")[0];

  if (baseLocale === "fr") {
    return category.name_fr ?? category.name_en ?? category.name;
  }
  if (baseLocale === "es") {
    return category.name_es ?? category.name_en ?? category.name;
  }

  return category.name_en ?? category.name_fr ?? category.name_es ?? category.name;
}
