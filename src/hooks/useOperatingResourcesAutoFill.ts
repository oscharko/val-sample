/**
 * useOperatingResourcesAutoFill — Auto-Fill-Logik für Betriebsmittel.
 *
 * Bei Wechsel auf "ja": Auto-Fill mit MwSt.-basiertem Vorschlagswert.
 * Bei Wechsel weg von "ja": Feld wird geleert.
 * Manuelle Eingaben des Nutzers werden beibehalten (Ref trackt letzten Auto-Fill-Wert).
 */

import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { InvestmentFinancingFormData } from '../schema';
import { roundToCents } from '../utils/currency';

/** Vergleicht zwei Währungsbeträge auf Cent-genaue Gleichheit. */
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

