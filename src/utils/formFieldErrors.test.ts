import { describe, expect, it } from 'vitest';
import { parseServerFieldErrors } from './formFieldErrors';

describe('parseServerFieldErrors', () => {
  it('returns only known field names with string messages', () => {
    const result = parseServerFieldErrors({
      person: 'Bitte Person auswählen',
      purchasePrice: 'Ungültiger Betrag',
      unknownField: 'ignored',
      internalNote: 123,
    });

    expect(result).toEqual({
      person: 'Bitte Person auswählen',
      purchasePrice: 'Ungültiger Betrag',
    });
  });

  it('returns empty object for invalid payloads', () => {
    expect(parseServerFieldErrors(null)).toEqual({});
    expect(parseServerFieldErrors('invalid')).toEqual({});
    expect(parseServerFieldErrors(['invalid'])).toEqual({});
  });
});
