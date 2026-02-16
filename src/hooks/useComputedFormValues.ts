/**
 * useComputedFormValues — Derived State Hook
 *
 * Implements the micro state principle of "purpose-specific" hooks (Ch. 1):
 * > "Micro state management is more purpose-oriented and used with
 * >  specific coding patterns."
 *
 * This hook derives computed values from the form's watched fields,
 * keeping calculation logic out of the component. It also serves as
 * an example of the "Additional requirements: Derived state" concept
 * from Ch. 1.
 *
 * Works alongside React Hook Form's `watch()` — the book explicitly
 * recommends keeping form state separate:
 * > "Form state should be treated separately from a global state."
 *
 * @example
 * ```tsx
 * const { watch } = useForm(...);
 * const { totalCost, vatAmount, showOperatingResources } =
 *   useComputedFormValues(watch);
 * ```
 */

import { useMemo } from 'react';
import type { UseFormWatch } from 'react-hook-form';
import type { InvestmentFinancingFormData } from '../schema';

/* ------------------------------------------------------------------ */
/*  Pure computation functions (testable, no React dependency)        */
/* ------------------------------------------------------------------ */

/**
 * Calculate total acquisition cost (net + additional costs).
 * External pure function — follows the book's reducer pattern of
 * keeping logic outside hooks for testability (Ch. 1).
 */
export function calculateTotalCost(
  netPurchasePrice: number,
  additionalCosts: number,
): number {
  return netPurchasePrice + additionalCosts;
}

/**
 * Calculate VAT amount based on net price and rate.
 */
export function calculateVatAmount(
  netPurchasePrice: number,
  vatRate: string,
): number {
  const rate = parseFloat(vatRate) / 100;
  return netPurchasePrice * rate;
}

/**
 * Calculate gross total (net + additional + VAT).
 */
export function calculateGrossTotal(
  netPurchasePrice: number,
  additionalCosts: number,
  vatRate: string,
  grossPrice: boolean,
): number {
  const totalNet = netPurchasePrice + additionalCosts;
  if (grossPrice) {
    // Already a gross price — no VAT to add
    return totalNet;
  }
  const vatAmount = calculateVatAmount(netPurchasePrice, vatRate);
  return totalNet + vatAmount;
}

/* ------------------------------------------------------------------ */
/*  Computed form values type                                         */
/* ------------------------------------------------------------------ */

export interface ComputedFormValues {
  /** Net + additional costs. */
  totalCost: number;

  /** VAT amount on the net purchase price. */
  vatAmount: number;

  /** Full total including VAT (or just net if grossPrice is on). */
  grossTotal: number;

  /** Whether operating resources section should be visible. */
  showOperatingResources: boolean;

  /** Whether the form has any conditionally visible fields active. */
  hasConditionalFields: boolean;

  /** Formatted total cost string with € symbol. */
  formattedTotalCost: string;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

/**
 * Derives computed values from watched form fields.
 *
 * Uses `useMemo` to avoid recalculating on every render.
 * Only recalculates when the watched values actually change.
 *
 * @param watch — React Hook Form's watch function.
 */
export function useComputedFormValues(
  watch: UseFormWatch<InvestmentFinancingFormData>,
): ComputedFormValues {
  // Watch specific fields that drive computations
  const netPurchasePrice = watch('netPurchasePrice');
  const additionalCosts = watch('additionalCosts');
  const vatRate = watch('vatRate');
  const grossPrice = watch('grossPrice');
  const operatingResourcesNeeded = watch('operatingResourcesNeeded');

  return useMemo(() => {
    const totalCost = calculateTotalCost(netPurchasePrice, additionalCosts);
    const vatAmount = calculateVatAmount(netPurchasePrice, vatRate);
    const grossTotal = calculateGrossTotal(
      netPurchasePrice,
      additionalCosts,
      vatRate,
      grossPrice,
    );
    const showOperatingResources = operatingResourcesNeeded === 'ja';

    return {
      totalCost,
      vatAmount,
      grossTotal,
      showOperatingResources,
      hasConditionalFields: showOperatingResources,
      formattedTotalCost: new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(totalCost),
    };
  }, [netPurchasePrice, additionalCosts, vatRate, grossPrice, operatingResourcesNeeded]);
}
