import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  LANGUAGE_QUERY_PARAM,
  SUPPORTED_LOCALES,
} from '../../i18n/locale';
import { useLocale } from '../../i18n/useLocale';

const I18N_MANAGED_ATTR = 'data-i18n-managed';

const ensureDescriptionMetaTag = (): HTMLMetaElement => {
  const existingMeta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );

  if (existingMeta) {
    existingMeta.setAttribute(I18N_MANAGED_ATTR, 'description');
    return existingMeta;
  }

  const createdMeta = document.createElement('meta');
  createdMeta.name = 'description';
  createdMeta.setAttribute(I18N_MANAGED_ATTR, 'description');
  document.head.append(createdMeta);

  return createdMeta;
};

const ensurePropertyMetaTag = (
  property: string,
  marker: string,
): HTMLMetaElement => {
  const selector = `meta[property="${property}"][${I18N_MANAGED_ATTR}="${marker}"]`;
  const existingMeta = document.head.querySelector<HTMLMetaElement>(selector);

  if (existingMeta) {
    return existingMeta;
  }

  const createdMeta = document.createElement('meta');
  createdMeta.setAttribute('property', property);
  createdMeta.setAttribute(I18N_MANAGED_ATTR, marker);
  document.head.append(createdMeta);

  return createdMeta;
};

const upsertHeadLink = ({
  rel,
  href,
  hreflang,
  marker,
}: {
  rel: string;
  href: string;
  hreflang?: string;
  marker: string;
}): void => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"][${I18N_MANAGED_ATTR}="${marker}"]`
    : `link[rel="${rel}"][${I18N_MANAGED_ATTR}="${marker}"]`;

  const linkElement =
    document.head.querySelector<HTMLLinkElement>(selector) ??
    document.createElement('link');

  linkElement.rel = rel;
  linkElement.href = href;
  linkElement.setAttribute(I18N_MANAGED_ATTR, marker);

  if (hreflang) {
    linkElement.hreflang = hreflang;
  }

  if (!linkElement.parentNode) {
    document.head.append(linkElement);
  }
};

const createBaseHref = (): URL => {
  const currentUrl = new URL(window.location.href);
  return new URL(currentUrl.pathname, currentUrl.origin);
};

const createLocalizedHref = (locale: string): string => {
  const url = createBaseHref();
  url.searchParams.set(LANGUAGE_QUERY_PARAM, locale);
  return url.toString();
};

const createCanonicalHref = (): string => {
  return createBaseHref().toString();
};

export function AppLocaleManager() {
  const { t } = useTranslation();
  const { locale, direction } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [direction, locale]);

  useEffect(() => {
    document.title = t('seo.title');

    const descriptionTag = ensureDescriptionMetaTag();
    descriptionTag.content = t('seo.description');

    const openGraphLocaleTag = ensurePropertyMetaTag('og:locale', 'og-locale');
    openGraphLocaleTag.content = locale;

    document.head
      .querySelectorAll<HTMLMetaElement>(`meta[${I18N_MANAGED_ATTR}="og-locale-alternate"]`)
      .forEach((node) => {
        node.remove();
      });

    SUPPORTED_LOCALES.filter((supportedLocale) => supportedLocale !== locale).forEach(
      (supportedLocale) => {
        const alternateLocaleMeta = document.createElement('meta');
        alternateLocaleMeta.setAttribute('property', 'og:locale:alternate');
        alternateLocaleMeta.setAttribute(I18N_MANAGED_ATTR, 'og-locale-alternate');
        alternateLocaleMeta.content = supportedLocale;
        document.head.append(alternateLocaleMeta);
      },
    );

    document.head
      .querySelectorAll<HTMLLinkElement>(`link[${I18N_MANAGED_ATTR}="alternate"]`)
      .forEach((node) => {
        node.remove();
      });

    SUPPORTED_LOCALES.forEach((supportedLocale) => {
      upsertHeadLink({
        rel: 'alternate',
        hreflang: supportedLocale,
        href: createLocalizedHref(supportedLocale),
        marker: 'alternate',
      });
    });

    upsertHeadLink({
      rel: 'alternate',
      hreflang: 'x-default',
      href: createLocalizedHref(DEFAULT_LOCALE),
      marker: 'alternate',
    });

    upsertHeadLink({
      rel: 'canonical',
      href: createCanonicalHref(),
      marker: 'canonical',
    });
  }, [locale, t]);

  return null;
}
