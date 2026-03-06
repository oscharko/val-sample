import { useEffect } from 'react';

const FIXED_LOCALE = 'de-DE';

const queryOrCreateHeadElement = <T extends Element>({
  selector,
  createElement,
}: {
  selector: string;
  createElement: () => T;
}): T => {
  const existingElement = document.head.querySelector<T>(selector);
  if (existingElement) {
    return existingElement;
  }

  const createdElement = createElement();
  document.head.append(createdElement);
  return createdElement;
};

const ensureDescriptionMetaTag = (): HTMLMetaElement => {
  const descriptionMeta = queryOrCreateHeadElement<HTMLMetaElement>({
    selector: 'meta[name="description"]',
    createElement: () => document.createElement('meta'),
  });
  descriptionMeta.name = 'description';
  return descriptionMeta;
};

const upsertCanonicalLink = (href: string): void => {
  const linkElement = queryOrCreateHeadElement<HTMLLinkElement>({
    selector: 'link[rel="canonical"]',
    createElement: () => document.createElement('link'),
  });

  linkElement.rel = 'canonical';
  linkElement.href = href;
};

const createCanonicalHref = (): string => {
  const currentUrl = new URL(window.location.href);
  return new URL(currentUrl.pathname, currentUrl.origin).toString();
};

/** Setzt Locale, Meta-Tags und Canonical-Link einmalig beim Mount. */
export function AppLocaleManager() {
  useEffect(() => {
    // Idempotent: wiederholtes Mounten überschreibt nur Zielattribute ohne Duplikate.
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
