/**
 * useInvestmentFinancingSubmission — Encapsulates the submit lifecycle
 * for the investment financing form using React 19's useActionState.
 */

import { startTransition, useActionState, useCallback } from 'react';
import { type FieldErrors, type UseFormSetError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  toDTO,
  type InvestmentFinancingFormData,
} from '../schema';
import { submitInvestmentFinancing, type ApiResult } from '../api';
import type { SubmissionActionState } from '../types/formTypes';
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
  const { t } = useTranslation();
  const { isSubmitting } = useSubmissionState();
  const {
    startSubmission,
    completeSubmission,
    failSubmission,
    updateValidationSummary,
  } = useSubmissionActions();

  const totalFieldCount = INVESTMENT_FINANCING_FIELD_NAMES.length;

  const [, submitAction, isPending] = useActionState<
    SubmissionActionState,
    InvestmentFinancingFormData
  >(
    async (_previousState, formData) => {
      startSubmission();

      const dto = toDTO(formData);
      const result: ApiResult = await submitInvestmentFinancing(dto);

      if (result.success) {
        const message = result.data.message || t('submission.successDefault');
        completeSubmission(message);
        return { status: 'success' as const, message };
      }

      const typedFieldErrors = parseServerFieldErrors(result.error.fieldErrors);
      for (const [fieldName, message] of getKnownFieldErrorEntries(typedFieldErrors)) {
        setError(fieldName, {
          type: 'server',
          message,
        });
      }

      updateValidationSummary({
        total: totalFieldCount,
        errors: Object.keys(typedFieldErrors).length,
      });

      failSubmission(result.error.message);
      return { status: 'error' as const, message: result.error.message };
    },
    { status: 'idle', message: null },
  );

  const formPending = isPending || isSubmitting;

  const onValidSubmit = useCallback(
    (formData: InvestmentFinancingFormData) => {
      if (formPending) {
        return;
      }

      updateValidationSummary({
        total: totalFieldCount,
        errors: 0,
      });
      startTransition(() => {
        submitAction(formData);
      });
    },
    [formPending, submitAction, totalFieldCount, updateValidationSummary],
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
    formPending,
    onValidSubmit,
    onInvalidSubmit,
  };
}
