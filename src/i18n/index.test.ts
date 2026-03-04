import { describe, expect, it } from 'vitest';
import { resolveInitialLocale } from './index';

describe('resolveInitialLocale', () => {
  it('prefers language from query parameter over storage and navigator', () => {
    const locale = resolveInitialLocale({
      querySearch: '?lang=en-US',
      storageLanguage: 'de-DE',
      navigatorLanguage: 'de-DE',
    });

    expect(locale).toBe('en-US');
  });

  it('falls back to storage when query parameter is absent', () => {
    const locale = resolveInitialLocale({
      querySearch: '',
      storageLanguage: 'en-US',
      navigatorLanguage: 'de-DE',
    });

    expect(locale).toBe('en-US');
  });

  it('falls back to navigator language when query and storage are absent', () => {
    const locale = resolveInitialLocale({
      querySearch: '',
      storageLanguage: null,
      navigatorLanguage: 'en-GB',
    });

    expect(locale).toBe('en-US');
  });

  it('returns default locale when no source is available', () => {
    const locale = resolveInitialLocale({
      querySearch: '',
      storageLanguage: null,
      navigatorLanguage: null,
    });

    expect(locale).toBe('de-DE');
  });
});
