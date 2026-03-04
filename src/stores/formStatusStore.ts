/**
 * formStatusStore — Singleton Module State for Global Form Status
 *
 * Implements the "Module State" pattern from Ch. 4:
 * > "Module state is a variable defined at the module level."
 *
 * This is a singleton because form submission status is truly
 * application-wide — there's only one form being submitted at a time.
 *
 * Separated from React Hook Form's field-level state following the
 * book's micro state principle (Ch. 1):
 * > "Form state should be treated separately from a global state."
 */

import { createStore, type Store } from './createStore';

/* ------------------------------------------------------------------ */
/*  State shape                                                       */
/* ------------------------------------------------------------------ */

/**
 * Global form status — tracks submission lifecycle and validation summary.
 *
 * This state is intentionally kept small to avoid the "object Context"
 * limitation (Ch. 3): each piece is a primitive or small object,
 * so selector-based subscriptions work efficiently.
 */
export interface FormStatus {
  /** Current phase of the submission lifecycle. */
  submissionState: 'idle' | 'submitting' | 'success' | 'error';

  /** Last error message from server or network failure. */
  lastError: string | null;

  /** Success message from the last successful submission. */
  lastSuccessMessage: string | null;

  /** Summary of validation state (field-level error count). */
  validationSummary: {
    total: number;
    errors: number;
  };

  /** Whether the form has been modified since last save. */
  isDirty: boolean;
}

/* ------------------------------------------------------------------ */
/*  Initial state                                                     */
/* ------------------------------------------------------------------ */

const initialFormStatus: FormStatus = getInitialFormStatus();

/* ------------------------------------------------------------------ */
/*  Store instance (singleton — Ch. 4 module state)                   */
/* ------------------------------------------------------------------ */

/**
 * The singleton form status store.
 *
 * Book reference: Ch. 4 — "Using a module state as a global state"
 * > "If what you need is a global state for an entire tree,
 * >  a module state might fit better."
 */
export const formStatusStore: Store<FormStatus> = createStore(initialFormStatus);

function getInitialFormStatus(): FormStatus {
  return {
    submissionState: 'idle',
    lastError: null,
    lastSuccessMessage: null,
    validationSummary: { total: 0, errors: 0 },
    isDirty: false,
  };
}

/* ------------------------------------------------------------------ */
/*  Action creators (pure functions that update the store)            */
/* ------------------------------------------------------------------ */

/**
 * Action creators follow the book's pattern of defining update
 * functions alongside the store (Ch. 4, "Exploring the module state"):
 * > "Let's define functions to access this module state."
 *
 * These are NOT reducers — they directly call setState, which is
 * simpler and fits the micro state philosophy.
 */

/** Mark submission as in-progress. */
export function startSubmission(): void {
  formStatusStore.setState((prev) => {
    if (
      prev.submissionState === 'submitting' &&
      prev.lastError === null &&
      prev.lastSuccessMessage === null
    ) {
      return prev;
    }

    return {
      ...prev,
      submissionState: 'submitting',
      lastError: null,
      lastSuccessMessage: null,
    };
  });
}

/** Mark submission as successfully completed. */
export function completeSubmission(message: string): void {
  formStatusStore.setState((prev) => ({
    ...prev,
    submissionState: 'success',
    lastSuccessMessage: message,
    isDirty: false,
  }));
}

/** Mark submission as failed with an error message. */
export function failSubmission(error: string): void {
  formStatusStore.setState((prev) => ({
    ...prev,
    submissionState: 'error',
    lastError: error,
  }));
}

/** Reset submission state back to idle (e.g., after snackbar closes). */
export function resetSubmissionState(): void {
  formStatusStore.setState((prev) => ({
    ...prev,
    submissionState: 'idle',
    lastError: null,
    lastSuccessMessage: null,
  }));
}

/** Reset the whole form status store to a clean initial snapshot. */
export function resetFormStatus(): void {
  formStatusStore.setState(getInitialFormStatus());
}

/** Update the validation summary (called from form validation). */
export function updateValidationSummary(summary: {
  total: number;
  errors: number;
}): void {
  formStatusStore.setState((prev) => {
    if (
      prev.validationSummary.total === summary.total &&
      prev.validationSummary.errors === summary.errors
    ) {
      return prev;
    }

    return {
      ...prev,
      validationSummary: {
        total: summary.total,
        errors: summary.errors,
      },
    };
  });
}

/** Mark form as modified / clean. */
export function setDirty(dirty: boolean): void {
  formStatusStore.setState((prev) => {
    if (prev.isDirty === dirty) {
      return prev;
    }

    return {
      ...prev,
      isDirty: dirty,
    };
  });
}
