import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { tmpdir } from 'node:os';

const PROJECT_ROOT = process.cwd();

const OPENAPI_SNAPSHOT_PATH = path.resolve(
  PROJECT_ROOT,
  'src/contracts/generated/openapi.snapshot.json',
);
const GENERATED_SCHEMAS_PATH = path.resolve(
  PROJECT_ROOT,
  'src/contracts/generated/openapi.schemas.ts',
);
const GENERATED_BINDINGS_PATH = path.resolve(
  PROJECT_ROOT,
  'src/contracts/generated/investmentFinancingContract.generated.ts',
);
const TEMPLATE_PATH = path.resolve(PROJECT_ROOT, 'scripts/contracts/schemas-only.hbs');
const OPENAPI_ZOD_CLIENT_BIN_PATH = path.resolve(
  PROJECT_ROOT,
  'node_modules/openapi-zod-client/bin.js',
);

const CONTRACT_PATH = '/investment-financing';
const CONTRACT_METHOD = 'post';

const CHECK_MODE = process.argv.includes('--check');

const isObjectRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeText = (content) => content.replace(/\r\n/g, '\n');

const readJsonFile = (filePath) => {
  if (!existsSync(filePath)) {
    throw new Error(`OpenAPI snapshot not found: ${filePath}`);
  }

  const rawContent = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(rawContent);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${filePath}: ${errorMessage}`);
  }
};

const decodeJsonPointerToken = (token) => token.replace(/~1/g, '/').replace(/~0/g, '~');

const dereferenceLocalRef = ({ value, openapiDocument, contextLabel }) => {
  if (!isObjectRecord(value)) {
    throw new Error(`${contextLabel} must be an object.`);
  }

  if (typeof value.$ref !== 'string') {
    return value;
  }

  const { $ref: ref } = value;
  if (!ref.startsWith('#/')) {
    throw new Error(
      `${contextLabel} has unsupported $ref (${ref}). Only local refs (#/...) are supported.`,
    );
  }

  const pointerSegments = ref
    .slice(2)
    .split('/')
    .map((token) => decodeJsonPointerToken(token));

  let currentValue = openapiDocument;
  for (const pointerSegment of pointerSegments) {
    if (!isObjectRecord(currentValue) && !Array.isArray(currentValue)) {
      throw new Error(`Cannot resolve $ref ${ref} for ${contextLabel}.`);
    }

    const nextValue = currentValue[pointerSegment];
    if (nextValue === undefined) {
      throw new Error(`Cannot resolve $ref ${ref} for ${contextLabel}.`);
    }

    currentValue = nextValue;
  }

  if (!isObjectRecord(currentValue)) {
    throw new Error(`Resolved value for ${contextLabel} (${ref}) must be an object.`);
  }

  return currentValue;
};

const extractSchemaRefName = ({ schemaObject, contextLabel }) => {
  if (!isObjectRecord(schemaObject) || typeof schemaObject.$ref !== 'string') {
    throw new Error(
      `${contextLabel} must contain a schema with $ref to a component schema (found inline schema).`,
    );
  }

  const schemaRef = schemaObject.$ref;
  const schemaRefPrefix = '#/components/schemas/';
  if (!schemaRef.startsWith(schemaRefPrefix)) {
    throw new Error(
      `${contextLabel} must reference '#/components/schemas/*' (found ${schemaRef}).`,
    );
  }

  const schemaName = schemaRef.slice(schemaRefPrefix.length);
  if (!schemaName) {
    throw new Error(`${contextLabel} points to an empty schema name.`);
  }

  return schemaName;
};

const resolveContentSchema = ({ contentObject, contextLabel }) => {
  if (!isObjectRecord(contentObject)) {
    throw new Error(`${contextLabel} has no content object.`);
  }

  const preferredMediaTypes = ['application/json', 'application/problem+json'];

  for (const mediaType of preferredMediaTypes) {
    const mediaTypeObject = contentObject[mediaType];
    if (isObjectRecord(mediaTypeObject) && isObjectRecord(mediaTypeObject.schema)) {
      return mediaTypeObject.schema;
    }
  }

  for (const [mediaType, mediaTypeObject] of Object.entries(contentObject)) {
    if (isObjectRecord(mediaTypeObject) && isObjectRecord(mediaTypeObject.schema)) {
      return mediaTypeObject.schema;
    }

    if (isObjectRecord(mediaTypeObject) && typeof mediaTypeObject.schema?.$ref === 'string') {
      return mediaTypeObject.schema;
    }

    if (isObjectRecord(mediaTypeObject) && mediaTypeObject.schema !== undefined) {
      return mediaTypeObject.schema;
    }

    void mediaType;
  }

  throw new Error(`${contextLabel} does not expose a response/request schema in content.`);
};

const toStatusOrder = (statusCode) => {
  if (statusCode === 'default') {
    return Number.POSITIVE_INFINITY;
  }

  const statusAsNumber = Number(statusCode);
  if (!Number.isFinite(statusAsNumber)) {
    return Number.POSITIVE_INFINITY;
  }

  return statusAsNumber;
};

const isSuccessStatus = (statusCode) => /^2\d\d$/.test(statusCode);
const isErrorStatus = (statusCode) => {
  if (!/^\d{3}$/.test(statusCode)) {
    return statusCode === 'default';
  }

  const numericStatus = Number(statusCode);
  return numericStatus >= 400;
};

const resolveContractSchemaNames = (openapiDocument) => {
  const pathsObject = openapiDocument.paths;
  if (!isObjectRecord(pathsObject)) {
    throw new Error('OpenAPI document is missing `paths`.');
  }

  const pathItem = pathsObject[CONTRACT_PATH];
  if (!isObjectRecord(pathItem)) {
    throw new Error(`OpenAPI path '${CONTRACT_PATH}' is missing.`);
  }

  const operationObject = pathItem[CONTRACT_METHOD];
  if (!isObjectRecord(operationObject)) {
    throw new Error(
      `OpenAPI operation '${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}' is missing.`,
    );
  }

  const requestBodyObject = dereferenceLocalRef({
    value: operationObject.requestBody,
    openapiDocument,
    contextLabel: `requestBody of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const requestSchemaObject = resolveContentSchema({
    contentObject: requestBodyObject.content,
    contextLabel: `requestBody of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const requestSchemaName = extractSchemaRefName({
    schemaObject: requestSchemaObject,
    contextLabel: `requestBody of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const responsesObject = operationObject.responses;
  if (!isObjectRecord(responsesObject)) {
    throw new Error(
      `Operation '${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}' is missing responses.`,
    );
  }

  const sortedStatusCodes = Object.keys(responsesObject).sort(
    (leftStatus, rightStatus) => toStatusOrder(leftStatus) - toStatusOrder(rightStatus),
  );

  const successStatusCode = sortedStatusCodes.find((statusCode) =>
    isSuccessStatus(statusCode),
  );

  if (!successStatusCode) {
    throw new Error(
      `No 2xx success response found for '${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}'.`,
    );
  }

  const successResponseObject = dereferenceLocalRef({
    value: responsesObject[successStatusCode],
    openapiDocument,
    contextLabel: `response ${successStatusCode} of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const successSchemaObject = resolveContentSchema({
    contentObject: successResponseObject.content,
    contextLabel: `response ${successStatusCode} of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const successSchemaName = extractSchemaRefName({
    schemaObject: successSchemaObject,
    contextLabel: `response ${successStatusCode} of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const preferredErrorStatuses = ['400', '422', 'default'];
  const preferredErrorStatusCode = preferredErrorStatuses.find((statusCode) =>
    Object.hasOwn(responsesObject, statusCode),
  );

  const fallbackErrorStatusCode = sortedStatusCodes.find((statusCode) =>
    isErrorStatus(statusCode),
  );

  const errorStatusCode = preferredErrorStatusCode ?? fallbackErrorStatusCode;

  if (!errorStatusCode) {
    throw new Error(
      `No error response found for '${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}'.`,
    );
  }

  const errorResponseObject = dereferenceLocalRef({
    value: responsesObject[errorStatusCode],
    openapiDocument,
    contextLabel: `response ${errorStatusCode} of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const errorSchemaObject = resolveContentSchema({
    contentObject: errorResponseObject.content,
    contextLabel: `response ${errorStatusCode} of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  const errorSchemaName = extractSchemaRefName({
    schemaObject: errorSchemaObject,
    contextLabel: `response ${errorStatusCode} of ${CONTRACT_METHOD.toUpperCase()} ${CONTRACT_PATH}`,
  });

  return {
    requestSchemaName,
    successSchemaName,
    errorSchemaName,
  };
};

const runOpenApiZodClient = ({ inputPath, outputPath }) => {
  if (!existsSync(OPENAPI_ZOD_CLIENT_BIN_PATH)) {
    throw new Error(
      `openapi-zod-client binary not found at ${OPENAPI_ZOD_CLIENT_BIN_PATH}. Run 'yarn install'.`,
    );
  }

  if (!existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template file not found: ${TEMPLATE_PATH}`);
  }

  execFileSync(
    process.execPath,
    [
      OPENAPI_ZOD_CLIENT_BIN_PATH,
      inputPath,
      '-o',
      outputPath,
      '-t',
      TEMPLATE_PATH,
      '--export-schemas',
      '--strict-objects',
      '--additional-props-default-value',
      'false',
    ],
    {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    },
  );
};

const hasTopLevelComma = (value) => {
  let parenthesisDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (const character of value) {
    if (inSingleQuote || inDoubleQuote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (inSingleQuote && character === '\'') {
        inSingleQuote = false;
      } else if (inDoubleQuote && character === '"') {
        inDoubleQuote = false;
      }

      continue;
    }

    if (character === '\'') {
      inSingleQuote = true;
      continue;
    }

    if (character === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (character === '(') {
      parenthesisDepth += 1;
      continue;
    }

    if (character === ')') {
      parenthesisDepth = Math.max(parenthesisDepth - 1, 0);
      continue;
    }

    if (character === '[') {
      bracketDepth += 1;
      continue;
    }

    if (character === ']') {
      bracketDepth = Math.max(bracketDepth - 1, 0);
      continue;
    }

    if (character === '{') {
      braceDepth += 1;
      continue;
    }

    if (character === '}') {
      braceDepth = Math.max(braceDepth - 1, 0);
      continue;
    }

    if (
      character === ',' &&
      parenthesisDepth === 0 &&
      bracketDepth === 0 &&
      braceDepth === 0
    ) {
      return true;
    }
  }

  return false;
};

const toZodV4CompatibleRecords = (content) => {
  const token = 'z.record(';
  let cursor = 0;
  let transformedContent = '';

  while (cursor < content.length) {
    const tokenIndex = content.indexOf(token, cursor);
    if (tokenIndex === -1) {
      transformedContent += content.slice(cursor);
      break;
    }

    transformedContent += content.slice(cursor, tokenIndex);
    transformedContent += token;

    const innerStartIndex = tokenIndex + token.length;

    let currentIndex = innerStartIndex;
    let parenthesisDepth = 1;

    while (currentIndex < content.length && parenthesisDepth > 0) {
      const character = content[currentIndex];
      if (character === '(') {
        parenthesisDepth += 1;
      } else if (character === ')') {
        parenthesisDepth -= 1;
      }
      currentIndex += 1;
    }

    if (parenthesisDepth !== 0) {
      throw new Error('Cannot parse generated z.record(...) expression.');
    }

    const innerContent = content.slice(innerStartIndex, currentIndex - 1);
    if (hasTopLevelComma(innerContent)) {
      transformedContent += `${innerContent})`;
    } else {
      transformedContent += `z.string(), ${innerContent})`;
    }

    cursor = currentIndex;
  }

  return transformedContent;
};

const withGeneratedHeader = (content) => {
  const normalizedContent = normalizeText(content).trim();
  return [
    '/* istanbul ignore file */',
    '// Generated by scripts/contracts/generate-contracts.mjs. Do not edit manually.',
    '',
    normalizedContent,
    '',
  ].join('\n');
};

const createBindingFileContent = ({ openapiVersion, schemaNames }) => {
  const serializedOpenApiVersion = JSON.stringify(openapiVersion ?? 'unknown');
  const serializedRequestSchemaName = JSON.stringify(schemaNames.requestSchemaName);
  const serializedSuccessSchemaName = JSON.stringify(schemaNames.successSchemaName);
  const serializedErrorSchemaName = JSON.stringify(schemaNames.errorSchemaName);

  return [
    '/* istanbul ignore file */',
    '// Generated by scripts/contracts/generate-contracts.mjs. Do not edit manually.',
    '',
    "import { z } from 'zod';",
    "import { schemas } from './openapi.schemas';",
    '',
    `export const OPENAPI_CONTRACT_VERSION = ${serializedOpenApiVersion} as const;`,
    '',
    `export const INVESTMENT_FINANCING_REQUEST_SCHEMA_NAME = ${serializedRequestSchemaName} as const;`,
    `export const INVESTMENT_FINANCING_SUCCESS_SCHEMA_NAME = ${serializedSuccessSchemaName} as const;`,
    `export const INVESTMENT_FINANCING_ERROR_SCHEMA_NAME = ${serializedErrorSchemaName} as const;`,
    '',
    'export const InvestmentFinancingRequestSchema =',
    '  schemas[INVESTMENT_FINANCING_REQUEST_SCHEMA_NAME];',
    'export const InvestmentFinancingSuccessResponseSchema =',
    '  schemas[INVESTMENT_FINANCING_SUCCESS_SCHEMA_NAME];',
    'export const InvestmentFinancingErrorResponseSchema =',
    '  schemas[INVESTMENT_FINANCING_ERROR_SCHEMA_NAME];',
    '',
    'export type InvestmentFinancingRequest = z.infer<',
    '  typeof InvestmentFinancingRequestSchema',
    '>;',
    '',
    'export type InvestmentFinancingSuccessResponse = z.infer<',
    '  typeof InvestmentFinancingSuccessResponseSchema',
    '>;',
    '',
    'export type InvestmentFinancingErrorResponse = z.infer<',
    '  typeof InvestmentFinancingErrorResponseSchema',
    '>;',
    '',
  ].join('\n');
};

const collectDifferences = ({ targetPath, nextContent }) => {
  if (!existsSync(targetPath)) {
    return `missing (${path.relative(PROJECT_ROOT, targetPath)})`;
  }

  const currentContent = normalizeText(readFileSync(targetPath, 'utf8'));
  if (currentContent === nextContent) {
    return null;
  }

  return `changed (${path.relative(PROJECT_ROOT, targetPath)})`;
};

const writeIfChanged = ({ targetPath, nextContent }) => {
  if (existsSync(targetPath)) {
    const currentContent = normalizeText(readFileSync(targetPath, 'utf8'));
    if (currentContent === nextContent) {
      return false;
    }
  }

  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, nextContent, 'utf8');
  return true;
};

const run = () => {
  const openapiDocument = readJsonFile(OPENAPI_SNAPSHOT_PATH);

  const schemaNames = resolveContractSchemaNames(openapiDocument);

  const tempDirectoryPath = mkdtempSync(path.join(tmpdir(), 'val-sample-contracts-'));
  const tempSchemasPath = path.join(tempDirectoryPath, 'openapi.schemas.ts');

  try {
    runOpenApiZodClient({
      inputPath: OPENAPI_SNAPSHOT_PATH,
      outputPath: tempSchemasPath,
    });

    const generatedSchemasFileContent = withGeneratedHeader(
      toZodV4CompatibleRecords(readFileSync(tempSchemasPath, 'utf8')),
    );

    const generatedBindingsFileContent = createBindingFileContent({
      openapiVersion: openapiDocument?.info?.version,
      schemaNames,
    });

    if (CHECK_MODE) {
      const differences = [
        collectDifferences({
          targetPath: GENERATED_SCHEMAS_PATH,
          nextContent: generatedSchemasFileContent,
        }),
        collectDifferences({
          targetPath: GENERATED_BINDINGS_PATH,
          nextContent: generatedBindingsFileContent,
        }),
      ].filter(Boolean);

      if (differences.length > 0) {
        console.error('Contract artifacts are out of date. Run `yarn contracts:generate`.');
        for (const difference of differences) {
          console.error(`- ${difference}`);
        }
        process.exit(1);
      }

      console.log('Contract artifacts are up to date.');
      return;
    }

    const changedFiles = [
      writeIfChanged({
        targetPath: GENERATED_SCHEMAS_PATH,
        nextContent: generatedSchemasFileContent,
      })
        ? path.relative(PROJECT_ROOT, GENERATED_SCHEMAS_PATH)
        : null,
      writeIfChanged({
        targetPath: GENERATED_BINDINGS_PATH,
        nextContent: generatedBindingsFileContent,
      })
        ? path.relative(PROJECT_ROOT, GENERATED_BINDINGS_PATH)
        : null,
    ].filter(Boolean);

    if (changedFiles.length === 0) {
      console.log('Contract artifacts already up to date.');
      return;
    }

    console.log('Generated contract artifacts:');
    for (const changedFile of changedFiles) {
      console.log(`- ${changedFile}`);
    }
  } finally {
    rmSync(tempDirectoryPath, { recursive: true, force: true });
  }
};

run();
