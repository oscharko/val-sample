import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { AppLocaleManager } from './AppLocaleManager';

const removeManagedHeadNodes = () => {
  document.head
    .querySelectorAll('[data-i18n-managed]')
    .forEach((node) => {
      node.remove();
    });
};

describe('AppLocaleManager', () => {
  beforeEach(async () => {
    removeManagedHeadNodes();
    window.history.replaceState({}, '', '/offers?utm_source=ad&lang=en-US#quote');
    await i18n.changeLanguage('de-DE');
  });

  it('sets canonical URL without query string or hash fragments', async () => {
    render(<AppLocaleManager />);

    const origin = new URL(window.location.href).origin;

    await waitFor(() => {
      const canonical = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"][data-i18n-managed="canonical"]',
      );

      expect(canonical).not.toBeNull();
      expect(canonical?.href).toBe(`${origin}/offers`);
    });
  });

  it('creates alternate URLs with lang parameter only', async () => {
    render(<AppLocaleManager />);

    const origin = new URL(window.location.href).origin;

    await waitFor(() => {
      const deAlternate = document.head.querySelector<HTMLLinkElement>(
        'link[rel="alternate"][hreflang="de-DE"][data-i18n-managed="alternate"]',
      );
      const enAlternate = document.head.querySelector<HTMLLinkElement>(
        'link[rel="alternate"][hreflang="en-US"][data-i18n-managed="alternate"]',
      );
      const defaultAlternate = document.head.querySelector<HTMLLinkElement>(
        'link[rel="alternate"][hreflang="x-default"][data-i18n-managed="alternate"]',
      );

      expect(deAlternate?.href).toBe(`${origin}/offers?lang=de-DE`);
      expect(enAlternate?.href).toBe(`${origin}/offers?lang=en-US`);
      expect(defaultAlternate?.href).toBe(`${origin}/offers?lang=de-DE`);
    });
  });
});
