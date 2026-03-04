import type { SupportedLocale } from './locale';

export const defaultNamespace = 'translation';

type DeepWiden<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? ReadonlyArray<DeepWiden<U>>
        : T extends object
          ? { [K in keyof T]: DeepWiden<T[K]> }
          : T;

export type TranslationResource = DeepWiden<
  typeof import('./locales/en-US/translation').enUSTranslation
>;

export const resources = {
  'de-DE': {
    translation: {} as TranslationResource,
  },
  'en-US': {
    translation: {} as TranslationResource,
  },
} as const satisfies Record<SupportedLocale, { translation: TranslationResource }>;

export const localeResourceLoaders: Record<
  SupportedLocale,
  () => Promise<TranslationResource>
> = {
  'de-DE': async () => {
    const localeModule = await import('./locales/de-DE/translation');
    return localeModule.deDETranslation;
  },
  'en-US': async () => {
    const localeModule = await import('./locales/en-US/translation');
    return localeModule.enUSTranslation;
  },
};
