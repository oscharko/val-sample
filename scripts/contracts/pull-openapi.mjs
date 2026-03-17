import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = process.cwd();
const OPENAPI_URL = process.env.OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs';
const OPENAPI_SNAPSHOT_PATH = path.resolve(
  PROJECT_ROOT,
  'src/contracts/generated/openapi.snapshot.json',
);
const REQUEST_TIMEOUT_MS = Number(process.env.OPENAPI_REQUEST_TIMEOUT_MS ?? 15000);

const normalizeTimeoutMs = (timeoutMs) => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return 15000;
  }

  return Math.trunc(timeoutMs);
};

const ensureObjectRecord = (value) => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value;
  }

  throw new Error('OpenAPI endpoint returned a non-object JSON payload.');
};

const run = async () => {
  const timeoutMs = normalizeTimeoutMs(REQUEST_TIMEOUT_MS);
  const response = await fetch(OPENAPI_URL, {
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download OpenAPI from ${OPENAPI_URL}: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const responseBody = await response.json();
  const openapiDocument = ensureObjectRecord(responseBody);

  mkdirSync(path.dirname(OPENAPI_SNAPSHOT_PATH), { recursive: true });
  writeFileSync(
    OPENAPI_SNAPSHOT_PATH,
    `${JSON.stringify(openapiDocument, null, 2)}\n`,
    'utf8',
  );

  const openapiVersion =
    typeof openapiDocument.info?.version === 'string'
      ? openapiDocument.info.version
      : 'unknown';

  console.log(`Downloaded OpenAPI snapshot (${openapiVersion}) to:`);
  console.log(`- ${path.relative(PROJECT_ROOT, OPENAPI_SNAPSHOT_PATH)}`);
};

run().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
  process.exit(1);
});
