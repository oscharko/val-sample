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

/** Cent-genaue Gleichheit — undefined === undefined, sonst gerundeter Vergleich. */
const areSameCurrencyValue = (a: number | undefined, b: number | undefined): boolean => {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return roundToCents(a) === roundToCents(b);
};

const shouldApplySuggestedAmount = ({
  prevRequired,
  currentAmount,
  lastAutoFilledAmount,
}: {
  prevRequired: InvestmentFinancingFormData['operatingResourcesRequired'];
  currentAmount: number | undefined;
  lastAutoFilledAmount: number | undefined;
}): boolean => {
  if (prevRequired !== 'ja') {
    return true;
  }

  if (currentAmount === undefined) {
    return true;
  }

  return areSameCurrencyValue(currentAmount, lastAutoFilledAmount);
};

const shouldClearOperatingResourcesAmount = ({
  prevRequired,
  currentRequired,
  currentAmount,
}: {
  prevRequired: InvestmentFinancingFormData['operatingResourcesRequired'];
  currentRequired: InvestmentFinancingFormData['operatingResourcesRequired'];
  currentAmount: number | undefined;
}): boolean => {
  return prevRequired === 'ja' && currentRequired !== 'ja' && currentAmount !== undefined;
};

export function useOperatingResourcesAutoFill(
  operatingResourcesSuggestedAmount: number,
): void {
  const { setValue, control } = useFormContext<InvestmentFinancingFormData>();

  const operatingResourcesRequired = useWatch({ control, name: 'operatingResourcesRequired' });
  const operatingResourcesAmount = useWatch({ control, name: 'operatingResourcesAmount' });

  const prevRequiredRef = useRef<InvestmentFinancingFormData['operatingResourcesRequired']>(undefined);
  const lastAutoFilledRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prevRequired = prevRequiredRef.current;

    if (shouldClearOperatingResourcesAmount({
      prevRequired,
      currentRequired: operatingResourcesRequired,
      currentAmount: operatingResourcesAmount,
    })) {
      // Warum always dirty? Das Leeren ist eine echte Nutzer-intendierte Zustandsänderung.
      setValue('operatingResourcesAmount', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
      lastAutoFilledRef.current = undefined;
      prevRequiredRef.current = operatingResourcesRequired;
      return;
    }

    if (operatingResourcesRequired !== 'ja') {
      lastAutoFilledRef.current = undefined;
      prevRequiredRef.current = operatingResourcesRequired;
      return;
    }

    const suggested = roundToCents(operatingResourcesSuggestedAmount);
    const shouldApply = shouldApplySuggestedAmount({
      prevRequired,
      currentAmount: operatingResourcesAmount,
      lastAutoFilledAmount: lastAutoFilledRef.current,
    });

    if (shouldApply && !areSameCurrencyValue(operatingResourcesAmount, suggested)) {
      setValue('operatingResourcesAmount', suggested, {
        shouldValidate: true,
        // Warum nur nach Erstwahl nicht dirty? Erstbefüllung soll wie Default wirken.
        shouldDirty: prevRequired === 'ja',
      });
    }

    if (shouldApply) {
      lastAutoFilledRef.current = suggested;
    }

    prevRequiredRef.current = operatingResourcesRequired;
  }, [
    operatingResourcesAmount,
    operatingResourcesRequired,
    operatingResourcesSuggestedAmount,
    setValue,
  ]);
}
