import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppLocaleManager } from './AppLocaleManager';

describe('AppLocaleManager', () => {
  it('sets canonical URL from current pathname', async () => {
    window.history.replaceState({}, '', '/offers?utm_source=ad#quote');

    render(<AppLocaleManager />);

    const origin = new URL(window.location.href).origin;

    await waitFor(() => {
      const canonical = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );

      expect(canonical).not.toBeNull();
      expect(canonical?.href).toBe(`${origin}/offers`);
    });
  });

  it('sets html lang to de-DE and direction to ltr', async () => {
    render(<AppLocaleManager />);

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('de-DE');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.body.dir).toBe('ltr');
    });
  });

  it('sets document title and meta description', async () => {
    render(<AppLocaleManager />);

    await waitFor(() => {
      expect(document.title).toBe('Bedarf hinzufügen | Investitionsfinanzierung');

      const descriptionMeta = document.head.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      expect(descriptionMeta?.content).toBe(
        'Erfassen Sie Investitionsfinanzierungsbedarfe mit validierten Eingaben und transparenter Berechnung.',
      );
    });
  });
});
