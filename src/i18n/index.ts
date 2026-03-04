import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  LANGUAGE_QUERY_PARAM,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  resolveSupportedLocale,
  type SupportedLocale,
} from './locale';
import { defaultNamespace, resources } from './resources';

type TranslationOptions = Record<string, unknown>;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...SUPPORTED_LOCALES],
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: defaultNamespace,
    ns: [defaultNamespace],
    load: 'currentOnly',
    nonExplicitSupportedLngs: false,
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage'],
      lookupQuerystring: LANGUAGE_QUERY_PARAM,
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export const translate = (
  key: string,
  options?: TranslationOptions,
): string => {
  const translated = i18n.t(key as never, options as never);

  if (typeof translated === 'string') {
    return translated;
  }

  return key;
};

export const getCurrentLocale = (): SupportedLocale => {
  return resolveSupportedLocale(i18n.resolvedLanguage ?? i18n.language);
};

export default i18n;
