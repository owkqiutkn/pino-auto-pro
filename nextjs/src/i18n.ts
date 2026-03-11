import {getRequestConfig} from "next-intl/server";

export const locales = ["en", "fr"] as const;

export default getRequestConfig(async ({locale}) => ({
  locale,
  messages: (await import(`./messages/${locale}.json`)).default
}));

