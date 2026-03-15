import { Database } from "@/lib/types";

export type TransmissionRow = Database["public"]["Tables"]["transmissions"]["Row"];

export function getLocalizedTransmissionName(
  transmission: TransmissionRow,
  locale: string
) {
  const baseLocale = locale.split("-")[0];

  if (baseLocale === "fr") {
    return transmission.name_fr ?? transmission.name_en ?? transmission.name;
  }
  if (baseLocale === "es") {
    return transmission.name_es ?? transmission.name_en ?? transmission.name;
  }

  return transmission.name_en ?? transmission.name_fr ?? transmission.name_es ?? transmission.name;
}
