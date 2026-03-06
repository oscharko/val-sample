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

export function useOperatingResourcesAutoFill(
  operatingResourcesSuggestedAmount: number,
): void {
  const { getValues, setValue, control } =
    useFormContext<InvestmentFinancingFormData>();

  const operatingResourcesRequired = useWatch({ control, name: 'operatingResourcesRequired' });
  const operatingResourcesAmount = useWatch({ control, name: 'operatingResourcesAmount' });

  const prevRequiredRef = useRef<InvestmentFinancingFormData['operatingResourcesRequired']>(undefined);
  const lastAutoFilledRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prevRequired = prevRequiredRef.current;
    const suggested = roundToCents(operatingResourcesSuggestedAmount);

    // Betriebsmittel aktiv → ggf. Vorschlagswert setzen
    if (operatingResourcesRequired === 'ja') {
      const wasAutoFilled = areSameCurrencyValue(operatingResourcesAmount, lastAutoFilledRef.current);

      // Vorschlag anwenden bei: Erstwahl, leerem Feld oder unverändertem Auto-Fill-Wert
      const shouldApply =
        prevRequired !== 'ja' ||
        operatingResourcesAmount === undefined ||
        wasAutoFilled;

      if (shouldApply && !areSameCurrencyValue(operatingResourcesAmount, suggested)) {
        setValue('operatingResourcesAmount', suggested, {
          shouldValidate: true,
          shouldDirty: prevRequired === 'ja',
        });
      }

      if (shouldApply) {
        lastAutoFilledRef.current = suggested;
      }
    } else {
      // Betriebsmittel deaktiviert → Feld leeren
      if (prevRequired === 'ja' && getValues('operatingResourcesAmount') !== undefined) {
        setValue('operatingResourcesAmount', undefined, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      lastAutoFilledRef.current = undefined;
    }

    prevRequiredRef.current = operatingResourcesRequired;
  }, [
    getValues,
    operatingResourcesAmount,
    operatingResourcesRequired,
    operatingResourcesSuggestedAmount,
    setValue,
  ]);
}

