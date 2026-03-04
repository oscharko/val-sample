import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_QUERY_PARAM,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  resolveSupportedLocale,
  type SupportedLocale,
} from '../../i18n/locale';

const syncLanguageInUrl = (language: SupportedLocale): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(LANGUAGE_QUERY_PARAM, language);

  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage write failures (e.g., privacy mode restrictions).
  }
};

const getLanguageOptionLabel = (
  language: SupportedLocale,
  translate: ReturnType<typeof useTranslation>['t'],
): string => {
  switch (language) {
    case 'de-DE':
      return translate('languageSwitcher.options.de-DE');
    case 'en-US':
      return translate('languageSwitcher.options.en-US');
    default:
      return language;
  }
};

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const labelId = useId();

  const activeLocale = resolveSupportedLocale(i18n.resolvedLanguage ?? i18n.language);

  const onLanguageChange = (event: SelectChangeEvent<string>) => {
    const nextLocale = resolveSupportedLocale(event.target.value);

    if (nextLocale === activeLocale) {
      return;
    }

    void i18n.changeLanguage(nextLocale);
    syncLanguageInUrl(nextLocale);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 190 }}>
      <InputLabel id={labelId}>{t('languageSwitcher.label')}</InputLabel>
      <Select
        labelId={labelId}
        value={activeLocale}
        label={t('languageSwitcher.label')}
        onChange={onLanguageChange}
        inputProps={{
          'aria-label': t('languageSwitcher.ariaLabel'),
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <MenuItem key={locale} value={locale}>
            {getLanguageOptionLabel(locale, t)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
