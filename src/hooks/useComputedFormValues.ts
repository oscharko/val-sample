/**
 * useComputedFormValues — Derived State Hook
 *
 * Isolates form subscriptions via useWatch to avoid broad re-renders.
 */

import { useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import type { InvestmentFinancingFormData } from '../schema';

/* ------------------------------------------------------------------ */
/*  Pure computation functions (testable, no React dependency)        */
/* ------------------------------------------------------------------ */

export function calculateTotalCost(
  netPurchasePrice: number | undefined,
  additionalCosts: number | undefined,
): number {
  return (netPurchasePrice ?? 0) + (additionalCosts ?? 0);
}

export function calculateVatAmount(
  netPurchasePrice: number | undefined,
  vatRate: string,
): number {
  const price = netPurchasePrice ?? 0;
  const rate = parseFloat(vatRate) / 100;
  return price * rate;
}

export function calculateGrossTotal(
  netPurchasePrice: number | undefined,
  additionalCosts: number | undefined,
  vatRate: string,
  grossPrice: boolean,
): number {
  const price = netPurchasePrice ?? 0;
  const costs = additionalCosts ?? 0;
  const totalNet = price + costs;

  if (grossPrice) {
    return totalNet;
  }

  const vatAmount = calculateVatAmount(price, vatRate);
  return totalNet + vatAmount;
}

/* ------------------------------------------------------------------ */
/*  Computed form values type                                         */
/* ------------------------------------------------------------------ */

export interface ComputedFormValues {
  totalCost: number;
  vatAmount: number;
  grossTotal: number;
  formattedTotalCost: string;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useComputedFormValues(
  control: Control<InvestmentFinancingFormData>,
): ComputedFormValues {
  const watchedValues = useWatch({
    control,
    name: ['netPurchasePrice', 'additionalCosts', 'vatRate', 'grossPrice'] as const,
  });

  const [netPurchasePrice, additionalCosts, vatRate, grossPrice] = watchedValues;

  return useMemo(() => {
    const normalizedVatRate = vatRate ?? '19';
    const normalizedGrossPrice = grossPrice ?? false;

    const totalCost = calculateTotalCost(netPurchasePrice, additionalCosts);
    const vatAmount = calculateVatAmount(netPurchasePrice, normalizedVatRate);
    const grossTotal = calculateGrossTotal(
      netPurchasePrice,
      additionalCosts,
      normalizedVatRate,
      normalizedGrossPrice,
    );

    return {
      totalCost,
      vatAmount,
      grossTotal,
      formattedTotalCost: new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(totalCost),
    };
  }, [netPurchasePrice, additionalCosts, vatRate, grossPrice]);
}
