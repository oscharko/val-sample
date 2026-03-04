/**
 * useFormStatus — Custom hooks for instance-scoped form submission state.
 */

import { useStoreSelector } from '../stores/createStore';
import { useFormStatusContext } from '../stores/useFormStatusContext';
import type { FormStatus } from '../stores/formStatusStore';

const selectSubmissionState = (state: FormStatus) => state.submissionState;
const selectLastError = (state: FormStatus) => state.lastError;
const selectLastSuccessMessage = (state: FormStatus) => state.lastSuccessMessage;
const selectValidationSummary = (state: FormStatus) => state.validationSummary;
const selectIsDirty = (state: FormStatus) => state.isDirty;

export function useSubmissionState() {
  const { store } = useFormStatusContext();
  const submissionState = useStoreSelector(store, selectSubmissionState);

  return {
    submissionState,
    isSubmitting: submissionState === 'submitting',
    isSuccess: submissionState === 'success',
    isError: submissionState === 'error',
  } as const;
}

export function useSubmissionMessage() {
  const { store } = useFormStatusContext();
  const lastError = useStoreSelector(store, selectLastError);
  const lastSuccessMessage = useStoreSelector(store, selectLastSuccessMessage);

  return {
    lastError,
    lastSuccessMessage,
  } as const;
}

export function useValidationSummary() {
  const { store } = useFormStatusContext();
  return useStoreSelector(store, selectValidationSummary);
}

export function useDirtyFlag() {
  const { store } = useFormStatusContext();
  return useStoreSelector(store, selectIsDirty);
}

export function useFormStatus() {
  const { submissionState, isSubmitting, isSuccess, isError } = useSubmissionState();
  const { lastError, lastSuccessMessage } = useSubmissionMessage();
  const validationSummary = useValidationSummary();
  const isDirty = useDirtyFlag();

  return {
    submissionState,
    lastError,
    lastSuccessMessage,
    validationSummary,
    isDirty,
    isSubmitting,
    isSuccess,
    isError,
  } as const;
}

export function useSubmissionActions() {
  const { actions } = useFormStatusContext();
  return actions;
}
