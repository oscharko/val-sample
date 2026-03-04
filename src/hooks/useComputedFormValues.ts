/**
 * useComputedFormValues — Derived state for the investment financing form.
 */

import { useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import type {
  InvestmentFinancingFormData,
  PurchasePriceCaptureMode,
  VatRate,
} from '../schema';

const euroCurrencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const formatEuro = (value: number): string => {
  return euroCurrencyFormatter.format(value);
};

const roundToCents = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export function calculateFinancingDemand(
  purchasePrice: number | undefined,
  additionalCosts: number | undefined,
): number {
  const price = purchasePrice ?? 0;
  const costs = additionalCosts ?? 0;
  return roundToCents(price + costs);
}

export function calculateVatAmount(
  purchasePrice: number | undefined,
  vatRate: VatRate,
): number {
  const price = purchasePrice ?? 0;
  const rate = Number(vatRate) / 100;
  return roundToCents(price * rate);
}

export function calculateOperatingResourcesSuggestedAmount(
  mode: PurchasePriceCaptureMode,
  purchasePrice: number | undefined,
  vatRate: VatRate,
): number {
  if (mode === 'brutto') {
    return 0;
  }

  return calculateVatAmount(purchasePrice, vatRate);
}

export interface ComputedFormValues {
  vatAmount: number;
  financingDemand: number;
  operatingResourcesSuggestedAmount: number;
  purchasePriceLabel: string;
  vatInfoText: string;
  operatingResourcesInfoText: string;
  formattedFinancingDemand: string;
  formattedOperatingResourcesSuggestedAmount: string;
}

export function useComputedFormValues(
  control: Control<InvestmentFinancingFormData>,
): ComputedFormValues {
  const watchedValues = useWatch({
    control,
    name: [
      'purchasePriceCaptureMode',
      'purchasePrice',
      'additionalCosts',
      'vatRate',
    ] as const,
  });

  const [mode, purchasePrice, additionalCosts, vatRate] = watchedValues;

  return useMemo(() => {
    const normalizedMode = mode ?? 'netto';
    const normalizedVatRate = (vatRate ?? '19') as VatRate;

    const vatAmount = calculateVatAmount(purchasePrice, normalizedVatRate);
    const financingDemand = calculateFinancingDemand(purchasePrice, additionalCosts);
    const operatingResourcesSuggestedAmount =
      calculateOperatingResourcesSuggestedAmount(
        normalizedMode,
        purchasePrice,
        normalizedVatRate,
      );

    const isNetto = normalizedMode === 'netto';

    return {
      vatAmount,
      financingDemand,
      operatingResourcesSuggestedAmount,
      purchasePriceLabel: `Höhe des Kaufpreises (${isNetto ? 'Netto' : 'Brutto'})`,
      vatInfoText: isNetto
        ? 'Die MwSt. ist nicht Teil des Finanzierungsbedarfs.'
        : 'Die MwSt. ist im Finanzierungsbedarf enthalten.',
      operatingResourcesInfoText: isNetto
        ? 'Die Höhe der Betriebsmittel wurde automatisch aus der MwSt. des Kaufpreises ermittelt.'
        : 'Für Bruttokaufpreise werden Betriebsmittel initial mit 0,00 EUR vorbelegt.',
      formattedFinancingDemand: formatEuro(financingDemand),
      formattedOperatingResourcesSuggestedAmount: formatEuro(
        operatingResourcesSuggestedAmount,
      ),
    };
  }, [mode, purchasePrice, additionalCosts, vatRate]);
}
