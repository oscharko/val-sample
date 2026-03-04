import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildTranslationKeysSourceText,
  extractTranslationKeysFromSourceText,
  generateTranslationKeys,
} from './generate-translation-keys.mjs';

const temporaryDirectories = [];

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    const currentDirectory = temporaryDirectories.pop();
    if (currentDirectory) {
      rmSync(currentDirectory, { recursive: true, force: true });
    }
  }
});

describe('extractTranslationKeysFromSourceText', () => {
  it('extracts nested dot keys, including string-literal property names', () => {
    const sourceText = `
      export const enUSTranslation = {
        common: {
          yes: 'Yes',
          no: 'No',
        },
        languageSwitcher: {
          options: {
            'de-DE': 'Deutsch',
          },
        },
        listExample: ['a', 'b'],
      } as const;
    `;

    const keys = extractTranslationKeysFromSourceText({
      sourceText,
      sourceFilePath: 'translation.ts',
    });

    expect(keys).toEqual([
      'common.no',
      'common.yes',
      'languageSwitcher.options.de-DE',
      'listExample',
    ]);
  });

  it('throws for unsupported syntax such as spread assignments', () => {
    const sourceText = `
      const nested = { yes: 'Yes' };
      export const enUSTranslation = {
        ...nested,
      } as const;
    `;

    expect(() =>
      extractTranslationKeysFromSourceText({
        sourceText,
        sourceFilePath: 'translation.ts',
      }),
    ).toThrowError('spread properties');
  });
});

describe('buildTranslationKeysSourceText', () => {
  it('renders deterministic sorted output with required exports', () => {
    const output = buildTranslationKeysSourceText({
      keys: ['z.last', 'a.first', 'a.first'],
      generatorScriptRelativePath: 'scripts/generate-translation-keys.mjs',
      sourceTranslationRelativePath: 'src/i18n/locales/en-US/translation.ts',
    });

    const firstKeyIndex = output.indexOf("'a.first': 'a.first'");
    const secondKeyIndex = output.indexOf("'z.last': 'z.last'");

    expect(firstKeyIndex).toBeGreaterThan(-1);
    expect(secondKeyIndex).toBeGreaterThan(firstKeyIndex);
    expect(output).toContain('export const TRANSLATION_KEYS = {');
    expect(output).toContain('export type TranslationKey =');
    expect(output).toContain('export const createTranslationKey =');
  });
});

describe('generateTranslationKeys', () => {
  it('writes output once and reports unchanged on second execution', () => {
    const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'translation-keys-'));
    temporaryDirectories.push(temporaryRoot);

    const sourceDirectory = path.join(
      temporaryRoot,
      'src',
      'i18n',
      'locales',
      'en-US',
    );
    mkdirSync(sourceDirectory, { recursive: true });

    const outputDirectory = path.join(temporaryRoot, 'src', 'i18n');
    mkdirSync(outputDirectory, { recursive: true });

    const translationSourcePath = path.join(sourceDirectory, 'translation.ts');
    writeFileSync(
      translationSourcePath,
      `export const enUSTranslation = {
        form: {
          fields: {
            person: 'Person',
          },
        },
        api: {
          errors: {
            timeout: 'Timeout',
          },
        },
      } as const;
`,
      'utf8',
    );

    const firstRun = generateTranslationKeys({
      projectRoot: temporaryRoot,
    });

    expect(firstRun.changed).toBe(true);
    expect(firstRun.keyCount).toBe(2);

    const outputText = readFileSync(firstRun.outputFilePath, 'utf8');
    expect(outputText).toContain("'form.fields.person': 'form.fields.person'");
    expect(outputText).toContain("'api.errors.timeout': 'api.errors.timeout'");

    const secondRun = generateTranslationKeys({
      projectRoot: temporaryRoot,
    });

    expect(secondRun.changed).toBe(false);
    expect(secondRun.keyCount).toBe(2);
  });
});
