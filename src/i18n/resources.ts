import { deDETranslation } from './locales/de-DE/translation';
import { enUSTranslation } from './locales/en-US/translation';

export const defaultNamespace = 'translation';

export const resources = {
  'de-DE': {
    translation: deDETranslation,
  },
  'en-US': {
    translation: enUSTranslation,
  },
} as const;
