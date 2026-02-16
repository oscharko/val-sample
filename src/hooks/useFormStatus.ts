/**
 * useFormStatus — Custom Hook for Global Form Submission State
 *
 * Implements the "Custom hooks extract logic" pattern (Ch. 1):
 * > "We now have a clearer name. Component is independent of the
 * >  implementation. This is the benefit of extracting logic as
 * >  custom hooks."
 *
 * This hook hides the formStatusStore implementation and provides
 * a clean, purpose-specific API for components.
 *
 * Uses `useStoreSelector` (Ch. 4 selector pattern) to avoid
 * extra re-renders — each component only subscribes to the
 * specific slice of form status it needs.
 */

import { useCallback, useOptimistic } from 'react';
import { useStoreSelector } from '../stores/createStore';
import {
  formStatusStore,
  startSubmission,
  completeSubmission,
  failSubmission,
  resetSubmissionState,
  updateValidationSummary,
  setDirty,
  type FormStatus,
} from '../stores/formStatusStore';

/* ------------------------------------------------------------------ */
/*  Selector functions (defined outside component — Ch. 4 pattern)    */
/* ------------------------------------------------------------------ */

/**
 * Selectors defined outside the component avoid `useCallback`:
 * Book reference: Ch. 4 — "We define a selector function outside
 * the component to avoid useCallback this time."
 */
const selectSubmissionState = (s: FormStatus) => s.submissionState;
const selectLastError = (s: FormStatus) => s.lastError;
const selectLastSuccessMessage = (s: FormStatus) => s.lastSuccessMessage;
const selectValidationSummary = (s: FormStatus) => s.validationSummary;
const selectIsDirty = (s: FormStatus) => s.isDirty;

/* ------------------------------------------------------------------ */
/*  useFormStatus — read-only status hook                             */
/* ------------------------------------------------------------------ */

/**
 * Subscribe to the global form submission status.
 *
 * Each selector creates an independent subscription, so a component
 * that only reads `submissionState` won't re-render when `isDirty`
 * changes. This follows the "split state into pieces" principle (Ch. 3).
 */
export function useFormStatus() {
  const submissionState = useStoreSelector(formStatusStore, selectSubmissionState);
  const lastError = useStoreSelector(formStatusStore, selectLastError);
  const lastSuccessMessage = useStoreSelector(formStatusStore, selectLastSuccessMessage);
  const validationSummary = useStoreSelector(formStatusStore, selectValidationSummary);
  const isDirty = useStoreSelector(formStatusStore, selectIsDirty);

  return {
    submissionState,
    lastError,
    lastSuccessMessage,
    validationSummary,
    isDirty,
    /** Convenience: true while form is being submitted. */
    isSubmitting: submissionState === 'submitting',
    /** Convenience: true if the last submission succeeded. */
    isSuccess: submissionState === 'success',
    /** Convenience: true if the last submission failed. */
    isError: submissionState === 'error',
  } as const;
}

/* ------------------------------------------------------------------ */
/*  useSubmissionActions — write-only action hook                      */
/* ------------------------------------------------------------------ */

/**
 * Provides action functions to mutate the form status store.
 *
 * Separating read and write follows the book's Ch. 5 pattern:
 * > "useSetState is a simple hook to return the setState function."
 * This allows action-only components to avoid re-rendering on state reads.
 */
export function useSubmissionActions() {
  return {
    startSubmission,
    completeSubmission,
    failSubmission,
    resetSubmissionState,
    updateValidationSummary,
    setDirty,
  } as const;
}

/* ------------------------------------------------------------------ */
/*  useOptimisticSubmission — React 19 optimistic UI pattern          */
/* ------------------------------------------------------------------ */

/**
 * Provides optimistic UI feedback during async form submission.
 *
 * React 19's `useOptimistic` allows the UI to show "success" state
 * instantly while the actual network request is in flight.
 * If the request fails, the state reverts automatically.
 *
 * This goes beyond the book's patterns (published 2022, pre-React 19)
 * but follows the same micro state philosophy: a purpose-specific
 * hook for a specific UI concern.
 */
export function useOptimisticSubmission() {
  const submissionState = useStoreSelector(formStatusStore, selectSubmissionState);

  const [optimisticState, setOptimistic] = useOptimistic(
    submissionState,
    // Optimistic updater: immediately show the desired state
    (_current: FormStatus['submissionState'], newState: FormStatus['submissionState']) => newState,
  );

  /**
   * Trigger an optimistic state transition.
   * The actual store update should follow via startSubmission().
   */
  const optimisticallySubmit = useCallback(() => {
    setOptimistic('submitting');
  }, [setOptimistic]);

  return {
    /** The displayed state (may be optimistic or actual). */
    displayState: optimisticState,
    /** Call this to instantly show "submitting" in UI. */
    optimisticallySubmit,
  } as const;
}
