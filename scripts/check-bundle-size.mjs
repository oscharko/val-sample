import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const distAssetsDir = join(distDir, 'assets');
const manifestPath = join(distDir, '.vite', 'manifest.json');

const maxAssetBytes = Number(process.env.MAX_ASSET_BYTES ?? 500 * 1024);
const maxFormVendorGzipBytes = Number(
  process.env.MAX_FORM_VENDOR_GZIP_BYTES ?? 40 * 1024,
);
const maxInitialJsGzipBytes = Number(
  process.env.MAX_INITIAL_JS_GZIP_BYTES ?? 170 * 1024,
);

const assetFiles = readdirSync(distAssetsDir).filter(
  (fileName) => fileName.endsWith('.js') && !fileName.endsWith('.map'),
);

if (assetFiles.length === 0) {
  console.error('No JS assets found in dist/assets. Run the build first.');
  process.exit(1);
}

const assetMetrics = assetFiles
  .map((fileName) => {
    const absolutePath = join(distAssetsDir, fileName);
    const rawSize = statSync(absolutePath).size;
    const gzipSize = gzipSync(readFileSync(absolutePath)).length;

    return {
      fileName,
      rawSize,
      gzipSize,
    };
  })
  .sort((left, right) => right.rawSize - left.rawSize);

const rawSizeOffenders = assetMetrics.filter((asset) => asset.rawSize > maxAssetBytes);
const formVendorGzipOffenders = assetMetrics.filter(
  (asset) => asset.fileName.startsWith('form-vendor-') && asset.gzipSize > maxFormVendorGzipBytes,
);

const collectInitialChunkFileNames = () => {
  if (!existsSync(manifestPath)) {
    return null;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const entryKey = Object.keys(manifest).find((key) => manifest[key]?.isEntry === true);

  if (!entryKey) {
    return null;
  }

  const visited = new Set();
  const fileNames = new Set();

  const visit = (chunkKey) => {
    if (visited.has(chunkKey)) {
      return;
    }

    visited.add(chunkKey);

    const chunk = manifest[chunkKey];
    if (!chunk) {
      return;
    }

    if (typeof chunk.file === 'string' && chunk.file.endsWith('.js')) {
      const fileName = chunk.file.split('/').pop();
      if (fileName) {
        fileNames.add(fileName);
      }
    }

    for (const importedChunkKey of chunk.imports ?? []) {
      visit(importedChunkKey);
    }
  };

  visit(entryKey);

  return fileNames;
};

const initialChunkFileNames = collectInitialChunkFileNames();
const initialChunkMetrics =
  initialChunkFileNames === null
    ? assetMetrics
    : assetMetrics.filter((asset) => initialChunkFileNames.has(asset.fileName));

const totalInitialJsGzip = initialChunkMetrics.reduce(
  (total, asset) => total + asset.gzipSize,
  0,
);

const hasTotalGzipViolation = totalInitialJsGzip > maxInitialJsGzipBytes;

if (
  rawSizeOffenders.length > 0 ||
  formVendorGzipOffenders.length > 0 ||
  hasTotalGzipViolation
) {
  console.error('Bundle budget exceeded.');

  if (rawSizeOffenders.length > 0) {
    console.error(`Max asset raw size: ${maxAssetBytes} bytes`);
    for (const offender of rawSizeOffenders) {
      console.error(`- ${offender.fileName}: ${offender.rawSize} bytes raw`);
    }
  }

  if (formVendorGzipOffenders.length > 0) {
    console.error(`Max form-vendor gzip size: ${maxFormVendorGzipBytes} bytes`);
    for (const offender of formVendorGzipOffenders) {
      console.error(`- ${offender.fileName}: ${offender.gzipSize} bytes gzip`);
    }
  }

  if (hasTotalGzipViolation) {
    console.error(
      `Max initial JS gzip size: ${maxInitialJsGzipBytes} bytes, actual: ${totalInitialJsGzip} bytes`,
    );
  }

  process.exit(1);
}

console.log('Bundle budget check passed.');
console.log(`- total-initial-js-gzip: ${totalInitialJsGzip} bytes`);
for (const asset of assetMetrics) {
  console.log(`- ${asset.fileName}: ${asset.rawSize} bytes raw, ${asset.gzipSize} bytes gzip`);
}
