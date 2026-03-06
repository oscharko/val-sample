/**
 * useInvestmentFinancingSubmission — Kapselt den Submit-Lifecycle
 * mit Abort- und Stale-Response-Schutz.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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

const getKnownFieldErrorEntries = (
  fieldErrors: Partial<Record<InvestmentFinancingFieldName, string>>,
): ReadonlyArray<readonly [InvestmentFinancingFieldName, string]> => {
  return INVESTMENT_FINANCING_FIELD_NAMES.flatMap((fieldName) => {
    const message = fieldErrors[fieldName];
    if (!message) {
      return [];
    }

    return [[fieldName, message] as const];
  });
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

  const [isPending, setIsPending] = useState(false);

  const totalFieldCount = INVESTMENT_FINANCING_FIELD_NAMES.length;

  /** Request-ID schützt vor veralteten Responses bei Doppel-Submits. */
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  /** Verhindert State-Updates nach Unmount. */
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  /** Bereinigt den Request-Zustand nur für den aktuellsten Request. */
  const finalizeRequest = useCallback((requestId: number) => {
    if (requestId !== activeRequestIdRef.current) {
      return;
    }

    abortControllerRef.current = null;

    if (isMountedRef.current) {
      setIsPending(false);
    }
  }, []);

  const onValidSubmit = useCallback(
    (formData: InvestmentFinancingFormData) => {
      const nextRequestId = activeRequestIdRef.current + 1;
      activeRequestIdRef.current = nextRequestId;

      abortControllerRef.current?.abort();
      const nextController = new AbortController();
      abortControllerRef.current = nextController;

      // Status für Validation-Summary vorübergehend zurücksetzen
      updateValidationSummary({
        total: totalFieldCount,
        errors: 0,
      });

      startSubmission();
      setIsPending(true);

      void (async () => {
        const dto = toDTO(formData);
        const result: ApiResult = await submitInvestmentFinancing(dto, {
          signal: nextController.signal,
        });

        if (!isMountedRef.current || nextRequestId !== activeRequestIdRef.current) {
          return;
        }

        if (result.success) {
          const message = result.data.message || 'Bedarf erfolgreich angelegt.';
          completeSubmission(message);
          return;
        }

        if (result.error.code === CLIENT_ABORTED_ERROR_CODE) {
          resetSubmissionState();
          return;
        }

        // Field-Errors auf die React-Hook-Form Instanz applizieren
        const typedFieldErrors = parseServerFieldErrors(result.error.fieldErrors);
        for (const [fieldName, message] of getKnownFieldErrorEntries(typedFieldErrors)) {
          setError(fieldName, {
            type: 'server',
            message,
          });
        }

        // Globale Error-Summary aktualisieren (wichtig für Screenreader & UX)
        updateValidationSummary({
          total: totalFieldCount,
          errors: Object.keys(typedFieldErrors).length,
        });

        failSubmission(result.error.message);
      })()
        .finally(() => {
          finalizeRequest(nextRequestId);
        });
    },
    [
      completeSubmission,
      failSubmission,
      finalizeRequest,
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

  const formPending = isPending || isSubmitting;

  return {
    formPending,
    onValidSubmit,
    onInvalidSubmit,
  };
}
