import {cookies} from "next/headers";
import {getRequestConfig} from "next-intl/server";

export const locales = ["en", "fr", "es"] as const;

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const fallbackLocale: (typeof locales)[number] = "en";
  const locale = (locales as readonly string[]).includes(cookieLocale ?? "")
    ? (cookieLocale as (typeof locales)[number])
    : fallbackLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

