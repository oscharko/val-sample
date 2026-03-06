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

const applyKnownServerFieldErrors = (
  rawFieldErrors: unknown,
  setError: UseFormSetError<InvestmentFinancingFormData>,
): number => {
  const knownFieldErrorEntries = getKnownFieldErrorEntries(
    parseServerFieldErrors(rawFieldErrors),
  );

  for (const [fieldName, message] of knownFieldErrorEntries) {
    setError(fieldName, { type: 'server', message });
  }

  return knownFieldErrorEntries.length;
};

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
  const successFallbackMessage = 'Bedarf erfolgreich angelegt.';
  const unexpectedErrorMessage =
    'Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';

  // Stale-Response-Schutz: Nur der aktuellste Request darf State ändern
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const isCurrentRequest = useCallback((requestId: number): boolean => {
    return isMountedRef.current && requestId === activeRequestIdRef.current;
  }, []);

  useEffect(() => {
    return () => {
      // Warum Request-ID erhöhen? So ignorieren wir späte Responses nach Unmount sicher.
      isMountedRef.current = false;
      activeRequestIdRef.current += 1;
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

      const runSubmission = async (): Promise<void> => {
        const dto = toDTO(formData);
        let result: ApiResult;
        try {
          result = await submitInvestmentFinancing(dto, {
            signal: nextController.signal,
          });
        } catch {
          if (!isCurrentRequest(nextRequestId)) {
            return;
          }

          failSubmission(unexpectedErrorMessage);
          return;
        }

        // Nur der aktive Request darf noch schreiben (Stale + Unmount Schutz).
        if (!isCurrentRequest(nextRequestId)) {
          return;
        }

        if (result.success) {
          completeSubmission(result.data.message || successFallbackMessage);
          return;
        }

        if (result.error.code === CLIENT_ABORTED_ERROR_CODE) {
          // Nur beim aktiven Request resetten; alte/entfernte Requests werden oben bereits gefiltert.
          resetSubmissionState();
          return;
        }

        // Server-Feldvalidierungsfehler auf React Hook Form übertragen
        const knownFieldErrorCount = applyKnownServerFieldErrors(
          result.error.fieldErrors,
          setError,
        );

        updateValidationSummary({
          total: totalFieldCount,
          errors: knownFieldErrorCount,
        });

        failSubmission(result.error.message);
      };

      void runSubmission()
        .finally(() => {
          // AbortController nur für den aktuellsten Request aufräumen
          if (isCurrentRequest(nextRequestId)) {
            abortControllerRef.current = null;
          }
        });
    },
    [
      completeSubmission,
      failSubmission,
      isCurrentRequest,
      resetSubmissionState,
      setError,
      successFallbackMessage,
      startSubmission,
      totalFieldCount,
      unexpectedErrorMessage,
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
