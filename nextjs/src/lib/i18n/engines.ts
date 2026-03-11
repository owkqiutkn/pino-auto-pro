export type EngineLike = { name?: string; name_en?: string | null; name_fr?: string | null };

export function getLocalizedEngineName(engine: EngineLike, locale: string): string {
  const baseLocale = locale.split("-")[0];

  if (baseLocale === "fr") {
    return engine.name_fr ?? engine.name_en ?? engine.name ?? "";
  }

  return engine.name_en ?? engine.name_fr ?? engine.name ?? "";
}
