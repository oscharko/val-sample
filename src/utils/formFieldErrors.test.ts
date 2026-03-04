import { describe, expect, it } from 'vitest';
import { countErrorEntries, parseServerFieldErrors } from './formFieldErrors';

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

describe('countErrorEntries', () => {
  it('counts nested field errors deterministically', () => {
    const nestedErrors = {
      person: { type: 'required', message: 'Bitte Person auswählen' },
      nested: {
        purchasePrice: { type: 'min', message: 'Ungültiger Betrag' },
      },
      list: [
        { type: 'validate', message: 'Fehler 1' },
        { type: 'validate', message: 'Fehler 2' },
      ],
    };

    const count = countErrorEntries(
      nestedErrors as unknown as Parameters<typeof countErrorEntries>[0],
    );
    expect(count).toBe(4);
  });

  it('returns 0 for empty or non-error shaped nodes', () => {
    const count = countErrorEntries(
      {
        person: { message: 'no type means no field error marker' },
        nested: {
          untouched: {},
        },
      } as unknown as Parameters<typeof countErrorEntries>[0],
    );
    expect(count).toBe(0);
  });
});
