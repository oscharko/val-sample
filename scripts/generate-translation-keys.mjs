#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const TRANSLATION_EXPORT_NAME = 'enUSTranslation';
export const DEFAULT_INPUT_RELATIVE_PATH = 'src/i18n/locales/en-US/translation.ts';
export const DEFAULT_OUTPUT_RELATIVE_PATH = 'src/i18n/translationKeys.ts';

const thisFilePath = fileURLToPath(import.meta.url);
const thisDirPath = path.dirname(thisFilePath);
const projectRootPath = path.resolve(thisDirPath, '..');

const normalizePathForComment = (value) => value.split(path.sep).join('/');

const unwrapExpression = (expression) => {
  let current = expression;

  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current)
  ) {
    current = current.expression;
  }

  return current;
};

const getPropertyName = (propertyName) => {
  if (ts.isIdentifier(propertyName)) {
    return propertyName.text;
  }

  if (ts.isStringLiteral(propertyName) || ts.isNumericLiteral(propertyName)) {
    return propertyName.text;
  }

  throw new Error('Translation object contains unsupported non-static property names.');
};

export const extractLeafTranslationKeysFromObjectLiteral = (
  objectLiteral,
  prefix = '',
) => {
  const collectedKeys = [];

  for (const property of objectLiteral.properties) {
    if (ts.isSpreadAssignment(property)) {
      throw new Error('Translation object cannot contain spread properties.');
    }

    if (!ts.isPropertyAssignment(property)) {
      throw new Error('Translation object cannot contain methods, getters, or setters.');
    }

    const propertyName = getPropertyName(property.name);
    const fullKey = prefix === '' ? propertyName : `${prefix}.${propertyName}`;
    const initializer = unwrapExpression(property.initializer);

    if (ts.isObjectLiteralExpression(initializer)) {
      collectedKeys.push(
        ...extractLeafTranslationKeysFromObjectLiteral(initializer, fullKey),
      );
      continue;
    }

    collectedKeys.push(fullKey);
  }

  return collectedKeys;
};

const sortAndDedupeKeys = (keys) => {
  return [...new Set(keys)].sort((left, right) => left.localeCompare(right));
};

const findTranslationDeclaration = (sourceFile, exportName) => {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) {
        continue;
      }

      if (declaration.name.text !== exportName) {
        continue;
      }

      return declaration;
    }
  }

  return null;
};

export const extractTranslationKeysFromSourceText = ({
  sourceText,
  sourceFilePath,
  exportName = TRANSLATION_EXPORT_NAME,
}) => {
  const sourceFile = ts.createSourceFile(
    sourceFilePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const translationDeclaration = findTranslationDeclaration(sourceFile, exportName);

  if (!translationDeclaration) {
    throw new Error(
      `Could not find exported translation object '${exportName}' in ${sourceFilePath}.`,
    );
  }

  if (!translationDeclaration.initializer) {
    throw new Error(
      `Translation export '${exportName}' in ${sourceFilePath} has no initializer.`,
    );
  }

  const translationInitializer = unwrapExpression(translationDeclaration.initializer);

  if (!ts.isObjectLiteralExpression(translationInitializer)) {
    throw new Error(
      `Translation export '${exportName}' in ${sourceFilePath} must be an object literal.`,
    );
  }

  const keys = extractLeafTranslationKeysFromObjectLiteral(translationInitializer);

  if (keys.length === 0) {
    throw new Error(`No translation keys found in ${sourceFilePath}.`);
  }

  return sortAndDedupeKeys(keys);
};

const escapeForSingleQuotedLiteral = (value) => {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
};

export const buildTranslationKeysSourceText = ({
  keys,
  generatorScriptRelativePath = 'scripts/generate-translation-keys.mjs',
  sourceTranslationRelativePath = DEFAULT_INPUT_RELATIVE_PATH,
}) => {
  const sortedKeys = sortAndDedupeKeys(keys);
  const keyLines = sortedKeys.map((key) => {
    const escapedKey = escapeForSingleQuotedLiteral(key);
    return `  '${escapedKey}': '${escapedKey}',`;
  });

  const normalizedGeneratorPath = normalizePathForComment(generatorScriptRelativePath);
  const normalizedSourcePath = normalizePathForComment(sourceTranslationRelativePath);

  return `/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * Source: ${normalizedSourcePath}
 * Generator: ${normalizedGeneratorPath}
 * Regenerate with: yarn generate:i18n-keys
 */

export const TRANSLATION_KEYS = {
${keyLines.join('\n')}
} as const;

export type TranslationKey = typeof TRANSLATION_KEYS[keyof typeof TRANSLATION_KEYS];

export const createTranslationKey = <K extends TranslationKey>(key: K): K => key;
`;
};

export const generateTranslationKeys = ({
  projectRoot = projectRootPath,
  inputRelativePath = DEFAULT_INPUT_RELATIVE_PATH,
  outputRelativePath = DEFAULT_OUTPUT_RELATIVE_PATH,
  exportName = TRANSLATION_EXPORT_NAME,
} = {}) => {
  const inputFilePath = path.resolve(projectRoot, inputRelativePath);
  const outputFilePath = path.resolve(projectRoot, outputRelativePath);

  if (!existsSync(inputFilePath)) {
    throw new Error(`Translation source file not found: ${inputFilePath}`);
  }

  const sourceText = readFileSync(inputFilePath, 'utf8');
  const keys = extractTranslationKeysFromSourceText({
    sourceText,
    sourceFilePath: inputFilePath,
    exportName,
  });

  const outputSourceText = buildTranslationKeysSourceText({
    keys,
    generatorScriptRelativePath: path.relative(projectRoot, thisFilePath),
    sourceTranslationRelativePath: path.relative(projectRoot, inputFilePath),
  });

  const hasExistingOutput = existsSync(outputFilePath);
  const existingOutput = hasExistingOutput ? readFileSync(outputFilePath, 'utf8') : null;

  if (existingOutput !== outputSourceText) {
    writeFileSync(outputFilePath, outputSourceText, 'utf8');
  }

  return {
    changed: existingOutput !== outputSourceText,
    keyCount: keys.length,
    inputFilePath,
    outputFilePath,
  };
};

export const runCli = () => {
  try {
    const result = generateTranslationKeys();
    const updateStatus = result.changed ? 'updated' : 'unchanged';
    console.log(`Generated ${result.keyCount} translation keys (${updateStatus}).`);
    console.log(`Output: ${result.outputFilePath}`);
  } catch (error) {
    console.error('Failed to generate translation keys.');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    process.exitCode = 1;
  }
};

const isDirectExecution =
  typeof process.argv[1] === 'string' && path.resolve(process.argv[1]) === thisFilePath;

if (isDirectExecution) {
  runCli();
}
