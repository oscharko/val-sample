import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getLocaleDirection,
  resolveSupportedLocale,
  type LocaleDirection,
  type SupportedLocale,
} from './locale';

export interface ActiveLocale {
  locale: SupportedLocale;
  direction: LocaleDirection;
}

export const useLocale = (): ActiveLocale => {
  const { i18n } = useTranslation();

  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(() => {
    return {
      locale: resolveSupportedLocale(activeLanguage),
      direction: getLocaleDirection(activeLanguage),
    };
  }, [activeLanguage]);
};
