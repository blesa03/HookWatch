import i18n from "i18next";
import {
  initReactI18next,
} from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";


export type AppLanguage =
  | "en"
  | "es";


export const LANGUAGE_STORAGE_KEY =
  "hookwatch.language";


export function normalizeLanguage(
  language:
    string
    | null
    | undefined,
): AppLanguage {
  return language
    ?.toLowerCase()
    .startsWith("es")
      ? "es"
      : "en";
}


function storedLanguage():
  AppLanguage {
  if (
    typeof window
    === "undefined"
  ) {
    return "en";
  }

  return normalizeLanguage(
    window.localStorage.getItem(
      LANGUAGE_STORAGE_KEY,
    ),
  );
}


void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },

      es: {
        translation: es,
      },
    },

    lng: storedLanguage(),

    fallbackLng: "en",

    supportedLngs: [
      "en",
      "es",
    ],

    load: "languageOnly",

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    initAsync: false,
  });


function syncLanguage(
  language: string,
) {
  const normalized =
    normalizeLanguage(
      language,
    );

  if (
    typeof document
    !== "undefined"
  ) {
    document.documentElement.lang =
      normalized;
  }

  if (
    typeof window
    !== "undefined"
  ) {
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      normalized,
    );
  }
}


syncLanguage(
  i18n.resolvedLanguage
  ?? i18n.language,
);


i18n.on(
  "languageChanged",
  syncLanguage,
);


export function getIntlLocale(
  language:
    string
    | null
    | undefined,
): string {
  return (
    normalizeLanguage(language)
    === "es"
      ? "es-ES"
      : "en-US"
  );
}


export default i18n;