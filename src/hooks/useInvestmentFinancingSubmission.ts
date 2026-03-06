/**
 * useInvestmentFinancingSubmission — Kapselt den Submit-Lifecycle
 * mit Abort- und Stale-Response-Schutz.
 */

import { useCallback, useEffect, useRef } from 'react';
import { type FieldErrors, type UseFormSetError } from 'react-hook-form';
import {
  toDTO,
  type InvestmentFinancingFormData,
} from '../schema';
import {
  submitInvestmentFinancing,
  type ApiResult,
  CLIENT_ABORTED_ERROR_CODE,
} from '../api';
import { useSubmissionActions, useSubmissionState } from './useFormStatus';
import { parseServerFieldErrors, countErrorEntries } from '../utils/formFieldErrors';
import { INVESTMENT_FINANCING_FIELD_NAMES } from '../domain/investmentFinancingFields';

interface UseInvestmentFinancingSubmissionResult {
  formPending: boolean;
  onValidSubmit: (formData: InvestmentFinancingFormData) => void;
  onInvalidSubmit: (errors: FieldErrors<InvestmentFinancingFormData>) => void;
}

type InvestmentFinancingFieldName = (typeof INVESTMENT_FINANCING_FIELD_NAMES)[number];

/** Filtert nur bekannte Feldnamen mit nicht-leerer Fehlermeldung. */
const getKnownFieldErrorEntries = (
  fieldErrors: Partial<Record<InvestmentFinancingFieldName, string>>,
): ReadonlyArray<readonly [InvestmentFinancingFieldName, string]> =>
  INVESTMENT_FINANCING_FIELD_NAMES.flatMap((fieldName) => {
    const message = fieldErrors[fieldName];
    return message ? [[fieldName, message] as const] : [];
  });

export function useInvestmentFinancingSubmission(
  setError: UseFormSetError<InvestmentFinancingFormData>,
): UseInvestmentFinancingSubmissionResult {
  const { isSubmitting } = useSubmissionState();
  const {
    startSubmission,
    completeSubmission,
    failSubmission,
    resetSubmissionState,
    updateValidationSummary,
  } = useSubmissionActions();

  const totalFieldCount = INVESTMENT_FINANCING_FIELD_NAMES.length;

  // Stale-Response-Schutz: Nur der aktuellste Request darf State ändern
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // React 19: setState auf unmounted Components ist ein No-Op,
  // daher kein isMountedRef nötig. Abort bei Unmount reicht aus.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  const onValidSubmit = useCallback(
    (formData: InvestmentFinancingFormData) => {
      const nextRequestId = activeRequestIdRef.current + 1;
      activeRequestIdRef.current = nextRequestId;

      // Laufenden Request abbrechen, neuen starten
      abortControllerRef.current?.abort();
      const nextController = new AbortController();
      abortControllerRef.current = nextController;

      updateValidationSummary({ total: totalFieldCount, errors: 0 });
      startSubmission();

      void (async () => {
        const dto = toDTO(formData);
        const result: ApiResult = await submitInvestmentFinancing(dto, {
          signal: nextController.signal,
        });

        // Veraltete Responses ignorieren (Doppel-Submit-Schutz)
        if (nextRequestId !== activeRequestIdRef.current) {
          return;
        }

        if (result.success) {
          completeSubmission(result.data.message || 'Bedarf erfolgreich angelegt.');
          return;
        }

        if (result.error.code === CLIENT_ABORTED_ERROR_CODE) {
          resetSubmissionState();
          return;
        }

        // Server-Feldvalidierungsfehler auf React Hook Form übertragen
        const typedFieldErrors = parseServerFieldErrors(result.error.fieldErrors);
        for (const [fieldName, message] of getKnownFieldErrorEntries(typedFieldErrors)) {
          setError(fieldName, { type: 'server', message });
        }

        updateValidationSummary({
          total: totalFieldCount,
          errors: Object.keys(typedFieldErrors).length,
        });

        failSubmission(result.error.message);
      })()
        .finally(() => {
          // AbortController nur für den aktuellsten Request aufräumen
          if (nextRequestId === activeRequestIdRef.current) {
            abortControllerRef.current = null;
          }
        });
    },
    [
      completeSubmission,
      failSubmission,
      resetSubmissionState,
      setError,
      startSubmission,
      totalFieldCount,
      updateValidationSummary,
    ],
  );

  const onInvalidSubmit = useCallback(
    (invalidErrors: FieldErrors<InvestmentFinancingFormData>) => {
      updateValidationSummary({
        total: totalFieldCount,
        errors: countErrorEntries(invalidErrors),
      });
    },
    [totalFieldCount, updateValidationSummary],
  );

  return {
    formPending: isSubmitting,
    onValidSubmit,
    onInvalidSubmit,
  };
}
