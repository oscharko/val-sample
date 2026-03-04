export const SUPPORTED_LOCALES = ['de-DE', 'en-US'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleDirection = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: SupportedLocale = 'de-DE';

export const LANGUAGE_QUERY_PARAM = 'lang';

export const LANGUAGE_STORAGE_KEY = 'app.locale';

const RTL_LANGUAGE_PREFIXES = ['ar', 'he', 'fa', 'ur'] as const;

export const resolveSupportedLocale = (
  language: string | null | undefined,
): SupportedLocale => {
  if (!language) {
    return DEFAULT_LOCALE;
  }

  const directMatch = SUPPORTED_LOCALES.find((locale) => locale === language);
  if (directMatch) {
    return directMatch;
  }

  const normalized = language.toLowerCase();
  if (normalized.startsWith('de')) {
    return 'de-DE';
  }

  if (normalized.startsWith('en')) {
    return 'en-US';
  }

  return DEFAULT_LOCALE;
};

export const getLocaleDirection = (
  language: string | null | undefined,
): LocaleDirection => {
  if (!language) {
    return 'ltr';
  }

  const normalized = language.toLowerCase();

  const hasRtlPrefix = RTL_LANGUAGE_PREFIXES.some((prefix) => {
    return normalized === prefix || normalized.startsWith(`${prefix}-`);
  });

  return hasRtlPrefix ? 'rtl' : 'ltr';
};
