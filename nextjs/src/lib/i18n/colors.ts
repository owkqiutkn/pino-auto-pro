import {Database} from "@/lib/types";

export type ExteriorColorRow = Database["public"]["Tables"]["exterior_colors"]["Row"];

export function getLocalizedExteriorColorName(color: ExteriorColorRow, locale: string) {
  const baseLocale = locale.split("-")[0];

  if (baseLocale === "fr") {
    return color.name_fr ?? color.name_en ?? color.name;
  }

  return color.name_en ?? color.name_fr ?? color.name;
}

