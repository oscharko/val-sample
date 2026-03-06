import type { PurchasePriceCaptureMode, VatRate } from '../schema';
import { formatCurrency } from '../utils/formatters';

export const DEFAULT_VAT_RATE: VatRate = '19';

export const PURCHASE_PRICE_CAPTURE_MODE_LABELS: Record<
  PurchasePriceCaptureMode,
  string
> = {
  netto: 'Netto',
  brutto: 'Brutto',
};

export const VAT_INFO_TEXT_BY_MODE: Record<PurchasePriceCaptureMode, string> = {
  netto: 'Die MwSt. ist nicht Teil des Finanzierungsbedarfs.',
  brutto: 'Die MwSt. ist im Finanzierungsbedarf enthalten.',
};

const BRUTTO_OPERATING_RESOURCES_DEFAULT = formatCurrency({ value: 0 });

export const getPurchasePriceLabel = (mode: PurchasePriceCaptureMode): string => {
  return `Höhe des Kaufpreises (${PURCHASE_PRICE_CAPTURE_MODE_LABELS[mode]})`;
};

export const getOperatingResourcesInfoText = (mode: PurchasePriceCaptureMode): string => {
  if (mode === 'netto') {
    return 'Die Höhe der Betriebsmittel wurde automatisch aus der MwSt. des Kaufpreises ermittelt.';
  }

  return `Für Bruttokaufpreise werden Betriebsmittel initial mit ${BRUTTO_OPERATING_RESOURCES_DEFAULT} vorbelegt.`;
};

export const isVatRate = (value: unknown): value is VatRate =>
  value === '19' || value === '7' || value === '0';
