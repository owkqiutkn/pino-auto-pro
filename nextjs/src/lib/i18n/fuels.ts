import {Database} from "@/lib/types";

export type FuelRow = Database["public"]["Tables"]["fuels"]["Row"];

export function getLocalizedFuelName(fuel: FuelRow, locale: string) {
  const baseLocale = locale.split("-")[0];

  if (baseLocale === "fr") {
    return fuel.name_fr ?? fuel.name_en ?? fuel.name;
  }
  if (baseLocale === "es") {
    return fuel.name_es ?? fuel.name_en ?? fuel.name;
  }

  return fuel.name_en ?? fuel.name_fr ?? fuel.name_es ?? fuel.name;
}
