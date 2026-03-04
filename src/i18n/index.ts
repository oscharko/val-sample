import i18n from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  LANGUAGE_QUERY_PARAM,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  resolveSupportedLocale,
  type SupportedLocale,
} from './locale';
import {
  defaultNamespace,
  localeResourceLoaders,
} from './resources';

type TranslationOptions = Record<string, unknown>;

interface ResolveInitialLocaleOptions {
  querySearch?: string;
  storageLanguage?: string | null;
  navigatorLanguage?: string | null;
}

const getQueryLanguage = (querySearch: string): string | null => {
  return new URLSearchParams(querySearch).get(LANGUAGE_QUERY_PARAM);
};

const getStorageLanguage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const getNavigatorLanguage = (): string | null => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return navigator.language;
};

const getCurrentSearch = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.search;
};

export const resolveInitialLocale = (
  options: ResolveInitialLocaleOptions = {},
): SupportedLocale => {
  const querySearch = 'querySearch' in options
    ? (options.querySearch ?? '')
    : getCurrentSearch();

  const queryLanguage = getQueryLanguage(querySearch);

  if (queryLanguage) {
    return resolveSupportedLocale(queryLanguage);
  }

  const storageLanguage = 'storageLanguage' in options
    ? options.storageLanguage
    : getStorageLanguage();
  if (storageLanguage) {
    return resolveSupportedLocale(storageLanguage);
  }

  const navigatorLanguage = 'navigatorLanguage' in options
    ? options.navigatorLanguage
    : getNavigatorLanguage();
  if (navigatorLanguage) {
    return resolveSupportedLocale(navigatorLanguage);
  }

  return DEFAULT_LOCALE;
};

export const i18nReady = i18n
  .use(
    resourcesToBackend(async (language: string, namespace: string) => {
      const normalizedLanguage = typeof language === 'string' ? language : DEFAULT_LOCALE;
      const normalizedNamespace =
        typeof namespace === 'string' ? namespace : defaultNamespace;

      if (normalizedNamespace !== defaultNamespace) {
        return {};
      }

      const locale = resolveSupportedLocale(normalizedLanguage);
      const loadLocale = localeResourceLoaders[locale];

      return loadLocale();
    }),
  )
  .use(initReactI18next)
  .init({
    lng: resolveInitialLocale(),
    supportedLngs: [...SUPPORTED_LOCALES],
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: defaultNamespace,
    ns: [defaultNamespace],
    load: 'currentOnly',
    nonExplicitSupportedLngs: false,
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
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
