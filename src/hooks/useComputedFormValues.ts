/**
 * useComputedFormValues — Derived state for the investment financing form.
 */

import { useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  InvestmentFinancingFormData,
  PurchasePriceCaptureMode,
  VatRate,
} from '../schema';
import {
  calculateVatAmount as calculateVatAmountFromRate,
  roundToCents,
} from '../utils/currency';
import { formatCurrency } from '../i18n/formatters';
import { useLocale } from '../i18n/useLocale';

const DEFAULT_VAT_RATE: VatRate = '19';

const isVatRate = (value: unknown): value is VatRate => {
  return value === '19' || value === '7' || value === '0';
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
  return calculateVatAmountFromRate({
    purchasePrice: price,
    vatRate: Number(vatRate),
  });
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
  const { t } = useTranslation();
  const { locale } = useLocale();
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
      normalizedMode === 'netto'
        ? t('form.options.purchasePriceCaptureMode.netto')
        : t('form.options.purchasePriceCaptureMode.brutto');

    return {
      vatAmount,
      financingDemand,
      operatingResourcesSuggestedAmount,
      purchasePriceLabel: t('form.fields.purchasePriceLabel', {
        mode: captureModeLabel,
      }),
      vatInfoText:
        normalizedMode === 'netto'
          ? t('form.options.vatInfo.net')
          : t('form.options.vatInfo.gross'),
      operatingResourcesInfoText:
        normalizedMode === 'netto'
          ? t('form.options.operatingResourcesInfo.net')
          : t('form.options.operatingResourcesInfo.gross', {
              amount: formatCurrency({ locale, value: 0 }),
            }),
      formattedFinancingDemand: formatCurrency({
        locale,
        value: financingDemand,
      }),
      formattedOperatingResourcesSuggestedAmount: formatCurrency({
        locale,
        value: operatingResourcesSuggestedAmount,
      }),
    };
  }, [additionalCosts, locale, mode, purchasePrice, t, vatRate]);
}
