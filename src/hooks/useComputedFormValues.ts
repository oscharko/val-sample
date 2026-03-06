/**
 * useComputedFormValues — Abgeleiteter Zustand für das Investitionsfinanzierungs-Formular.
 * Berechnet reaktiv: MwSt., Finanzierungsbedarf, Betriebsmittel-Vorschlag.
 */

import { useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import type {
  InvestmentFinancingFormData,
  PurchasePriceCaptureMode,
  VatRate,
} from '../schema';
import {
  calculateVatAmount as calculateVatAmountFromRate,
  roundToCents,
} from '../utils/currency';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_VAT_RATE: VatRate = '19';

const isVatRate = (value: unknown): value is VatRate => {
  return value === '19' || value === '7' || value === '0';
};

/**
 * Berechnet den Finanzierungsbedarf: Kaufpreis + Nebenkosten.
 * Netto/Brutto-Handling obliegt der vorgeschalteten Logik.
 */
export function calculateFinancingDemand(
  purchasePrice: number | undefined,
  additionalCosts: number | undefined,
): number {
  const price = purchasePrice ?? 0;
  const costs = additionalCosts ?? 0;
  return roundToCents(price + costs);
}

/** MwSt.-Betrag basierend auf Kaufpreis und Steuersatz. */
export function calculateVatAmount(
  purchasePrice: number | undefined,
  vatRate: VatRate,
): number {
  const price = purchasePrice ?? 0;
  return calculateVatAmountFromRate({
    purchasePrice: price,
    vatRate: Number(vatRate),
  });
}

/**
 * Ermittelt den automatischen Vorschlagswert für erforderliche Betriebsmittel.
 * Bei Netto-Erfassung: Vorgeschlagener Wert entspricht der berechneten MwSt.
 * Bei Brutto-Erfassung: Initial 0 (keine automatische Ableitung aus MwSt. sinnvoll).
 */
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

/** Abgeleitete Formularwerte zur Anzeige in der UI */
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

  // React Hook Form Werte bereinigen (Fallback auf Defaults falls undefiniert)
  return useMemo(() => {
    const normalizedMode = mode ?? 'netto';
    const normalizedVatRate = isVatRate(vatRate) ? vatRate : DEFAULT_VAT_RATE;

    const vatAmount = calculateVatAmount(purchasePrice, normalizedVatRate);
    const financingDemand = calculateFinancingDemand(purchasePrice, additionalCosts);
    const operatingResourcesSuggestedAmount =
      calculateOperatingResourcesSuggestedAmount(
        normalizedMode,
        purchasePrice,
        normalizedVatRate,
      );

    const captureModeLabel =
      normalizedMode === 'netto' ? 'Netto' : 'Brutto';

    return {
      vatAmount,
      financingDemand,
      operatingResourcesSuggestedAmount,
      purchasePriceLabel: `Höhe des Kaufpreises (${captureModeLabel})`,
      vatInfoText:
        normalizedMode === 'netto'
          ? 'Die MwSt. ist nicht Teil des Finanzierungsbedarfs.'
          : 'Die MwSt. ist im Finanzierungsbedarf enthalten.',
      operatingResourcesInfoText:
        normalizedMode === 'netto'
          ? 'Die Höhe der Betriebsmittel wurde automatisch aus der MwSt. des Kaufpreises ermittelt.'
          : `Für Bruttokaufpreise werden Betriebsmittel initial mit ${formatCurrency({ value: 0 })} vorbelegt.`,
      formattedFinancingDemand: formatCurrency({
        value: financingDemand,
      }),
      formattedOperatingResourcesSuggestedAmount: formatCurrency({
        value: operatingResourcesSuggestedAmount,
      }),
    };
  }, [additionalCosts, mode, purchasePrice, vatRate]);
}
