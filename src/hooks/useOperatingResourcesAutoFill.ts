/**
 * useOperatingResourcesAutoFill — Extracted auto-fill logic for operating resources.
 *
 * When `operatingResourcesRequired` changes to "ja", the hook auto-fills
 * `operatingResourcesAmount` with the VAT-derived suggested amount.
 * When it changes away from "ja", the field is cleared.
 *
 * The hook tracks the last auto-filled value via a ref so that manual
 * user edits are preserved (only auto-filled values get overwritten).
 */

import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { InvestmentFinancingFormData } from '../schema';
import { roundToCents } from '../utils/currency';

const areSameCurrencyValue = (
  leftValue: number | undefined,
  rightValue: number | undefined,
): boolean => {
  if (leftValue === undefined && rightValue === undefined) {
    return true;
  }

  if (leftValue === undefined || rightValue === undefined) {
    return false;
  }

  return roundToCents(leftValue) === roundToCents(rightValue);
};

export function useOperatingResourcesAutoFill(
  operatingResourcesSuggestedAmount: number,
): void {
  const { getValues, setValue, control } =
    useFormContext<InvestmentFinancingFormData>();

  const operatingResourcesRequired = useWatch({
    control,
    name: 'operatingResourcesRequired',
  });
  const operatingResourcesAmount = useWatch({
    control,
    name: 'operatingResourcesAmount',
  });

  const previousOperatingResourcesRequiredRef =
    useRef<InvestmentFinancingFormData['operatingResourcesRequired']>(undefined);
  const lastAutoFilledOperatingResourcesAmountRef = useRef<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const previousRequired = previousOperatingResourcesRequiredRef.current;
    const currentSuggestedAmount = roundToCents(
      operatingResourcesSuggestedAmount,
    );

    if (operatingResourcesRequired === 'ja') {
      const wasAutoFilledPreviously = areSameCurrencyValue(
        operatingResourcesAmount,
        lastAutoFilledOperatingResourcesAmountRef.current,
      );

      const shouldApplySuggestion =
        previousRequired !== 'ja' ||
        operatingResourcesAmount === undefined ||
        wasAutoFilledPreviously;

      if (
        shouldApplySuggestion &&
        !areSameCurrencyValue(operatingResourcesAmount, currentSuggestedAmount)
      ) {
        setValue('operatingResourcesAmount', currentSuggestedAmount, {
          shouldValidate: true,
          shouldDirty: previousRequired === 'ja',
        });
      }

      if (shouldApplySuggestion) {
        lastAutoFilledOperatingResourcesAmountRef.current =
          currentSuggestedAmount;
      }
    }

    if (operatingResourcesRequired !== 'ja') {
      if (
        previousRequired === 'ja' &&
        getValues('operatingResourcesAmount') !== undefined
      ) {
        setValue('operatingResourcesAmount', undefined, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      lastAutoFilledOperatingResourcesAmountRef.current = undefined;
    }

    previousOperatingResourcesRequiredRef.current = operatingResourcesRequired;
  }, [
    getValues,
    operatingResourcesAmount,
    operatingResourcesRequired,
    operatingResourcesSuggestedAmount,
    setValue,
  ]);
}

