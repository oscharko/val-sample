import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distAssetsDir = join(process.cwd(), 'dist', 'assets');
const maxBytes = Number(process.env.MAX_BUNDLE_BYTES ?? 500 * 1024);
const maxFormVendorBytes = Number(
  process.env.MAX_FORM_VENDOR_BUNDLE_BYTES ?? 120 * 1024,
);

const assetFiles = readdirSync(distAssetsDir).filter(
  (fileName) => fileName.endsWith('.js') && !fileName.endsWith('.map'),
);

if (assetFiles.length === 0) {
  console.error('No JS assets found in dist/assets. Run the build first.');
  process.exit(1);
}

const offenders = assetFiles
  .map((fileName) => {
    const absolutePath = join(distAssetsDir, fileName);
    const size = statSync(absolutePath).size;

    return {
      fileName,
      size,
    };
  })
  .filter((asset) => asset.size > maxBytes)
  .sort((a, b) => b.size - a.size);

const formVendorOffenders = assetFiles
  .filter((fileName) => fileName.startsWith('form-vendor-'))
  .map((fileName) => {
    const absolutePath = join(distAssetsDir, fileName);
    const size = statSync(absolutePath).size;

    return {
      fileName,
      size,
    };
  })
  .filter((asset) => asset.size > maxFormVendorBytes)
  .sort((a, b) => b.size - a.size);

if (offenders.length > 0 || formVendorOffenders.length > 0) {
  console.error(`Bundle budget exceeded (${maxBytes} bytes).`);
  for (const offender of offenders) {
    console.error(`- ${offender.fileName}: ${offender.size} bytes`);
  }
  if (formVendorOffenders.length > 0) {
    console.error(
      `Form vendor budget exceeded (${maxFormVendorBytes} bytes).`,
    );
    for (const offender of formVendorOffenders) {
      console.error(`- ${offender.fileName}: ${offender.size} bytes`);
    }
  }
  process.exit(1);
}

console.log(`Bundle budget check passed (${maxBytes} bytes).`);
for (const fileName of assetFiles) {
  const size = statSync(join(distAssetsDir, fileName)).size;
  console.log(`- ${fileName}: ${size} bytes`);
}
