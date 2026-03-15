import {getRequestConfig} from "next-intl/server";

export const locales = ["en", "fr"] as const;

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? "en";
  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});

