/**
 * useFormStatus — Custom Hooks for Global Form Submission State
 */

import { useStoreSelector } from '../stores/createStore';
import {
  formStatusStore,
  startSubmission,
  completeSubmission,
  failSubmission,
  resetSubmissionState,
  resetFormStatus,
  updateValidationSummary,
  setDirty,
  type FormStatus,
} from '../stores/formStatusStore';

const selectSubmissionState = (state: FormStatus) => state.submissionState;
const selectLastError = (state: FormStatus) => state.lastError;
const selectLastSuccessMessage = (state: FormStatus) => state.lastSuccessMessage;
const selectValidationSummary = (state: FormStatus) => state.validationSummary;
const selectIsDirty = (state: FormStatus) => state.isDirty;

export function useSubmissionState() {
  const submissionState = useStoreSelector(formStatusStore, selectSubmissionState);

  return {
    submissionState,
    isSubmitting: submissionState === 'submitting',
    isSuccess: submissionState === 'success',
    isError: submissionState === 'error',
  } as const;
}

export function useSubmissionMessage() {
  const lastError = useStoreSelector(formStatusStore, selectLastError);
  const lastSuccessMessage = useStoreSelector(formStatusStore, selectLastSuccessMessage);

  return {
    lastError,
    lastSuccessMessage,
  } as const;
}

export function useValidationSummary() {
  return useStoreSelector(formStatusStore, selectValidationSummary);
}

export function useDirtyFlag() {
  return useStoreSelector(formStatusStore, selectIsDirty);
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
  return {
    startSubmission,
    completeSubmission,
    failSubmission,
    resetSubmissionState,
    resetFormStatus,
    updateValidationSummary,
    setDirty,
  } as const;
}
