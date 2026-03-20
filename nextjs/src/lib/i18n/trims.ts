import { Database } from "@/lib/types";

export type TrimRow = Database["public"]["Tables"]["model_trims"]["Row"];

export function getLocalizedTrimName(trim: TrimRow, locale: string) {
    const baseLocale = locale.split("-")[0];

    if (baseLocale === "fr") {
        return trim.name_fr ?? trim.name_en ?? trim.name_es ?? trim.name;
    }
    if (baseLocale === "es") {
        return trim.name_es ?? trim.name_en ?? trim.name_fr ?? trim.name;
    }

    return trim.name_en ?? trim.name_fr ?? trim.name_es ?? trim.name;
}
