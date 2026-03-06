import { useEffect } from 'react';

const FIXED_LOCALE = 'de-DE';

const ensureDescriptionMetaTag = (): HTMLMetaElement => {
  const existingMeta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );

  if (existingMeta) {
    return existingMeta;
  }

  const createdMeta = document.createElement('meta');
  createdMeta.name = 'description';
  document.head.append(createdMeta);

  return createdMeta;
};

const upsertCanonicalLink = (href: string): void => {
  const selector = 'link[rel="canonical"]';
  const linkElement =
    document.head.querySelector<HTMLLinkElement>(selector) ??
    document.createElement('link');

  linkElement.rel = 'canonical';
  linkElement.href = href;

  if (!linkElement.parentNode) {
    document.head.append(linkElement);
  }
};

const createCanonicalHref = (): string => {
  const currentUrl = new URL(window.location.href);
  return new URL(currentUrl.pathname, currentUrl.origin).toString();
};

/** Setzt Locale, Meta-Tags und Canonical-Link einmalig beim Mount. */
export function AppLocaleManager() {
  useEffect(() => {
    // Sprache und Textrichtung
    document.documentElement.lang = FIXED_LOCALE;
    document.documentElement.dir = 'ltr';
    document.body.dir = 'ltr';

    // SEO-relevante Meta-Daten
    document.title = 'Bedarf hinzufügen | Investitionsfinanzierung';
    ensureDescriptionMetaTag().content =
      'Erfassen Sie Investitionsfinanzierungsbedarfe mit validierten Eingaben und transparenter Berechnung.';
    upsertCanonicalLink(createCanonicalHref());
  }, []);

  return null;
}
