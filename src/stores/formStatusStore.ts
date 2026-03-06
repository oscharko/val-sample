import { createStore, type Store } from './createStore';

/** Globaler Formular-Zustand für die Submission-Lifecycle-Verwaltung. */
export interface FormStatus {
  submissionState: 'idle' | 'submitting' | 'success' | 'error';
  lastError: string | null;
  lastSuccessMessage: string | null;
  validationSummary: {
    total: number;
    errors: number;
  };
  isDirty: boolean;
}

export interface FormStatusActions {
  startSubmission: () => void;
  completeSubmission: (message: string) => void;
  failSubmission: (error: string) => void;
  resetSubmissionState: () => void;
  resetFormStatus: () => void;
  updateValidationSummary: (summary: { total: number; errors: number }) => void;
  setDirty: (dirty: boolean) => void;
}

const getInitialFormStatus = (
  initialState: Partial<FormStatus> = {},
): FormStatus => ({
  submissionState: initialState.submissionState ?? 'idle',
  lastError: initialState.lastError ?? null,
  lastSuccessMessage: initialState.lastSuccessMessage ?? null,
  validationSummary: {
    total: initialState.validationSummary?.total ?? 0,
    errors: initialState.validationSummary?.errors ?? 0,
  },
  isDirty: initialState.isDirty ?? false,
});

export function createFormStatusStore(
  initialState: Partial<FormStatus> = {},
): Store<FormStatus> {
  return createStore(getInitialFormStatus(initialState));
}

/** Erzeugt typsichere Actions für einen FormStatus-Store. */
export function createFormStatusActions(
  store: Store<FormStatus>,
): FormStatusActions {
  return {
    startSubmission() {
      store.setState((prev) => ({
        ...prev,
        submissionState: 'submitting',
        lastError: null,
        lastSuccessMessage: null,
      }));
    },

    completeSubmission(message: string) {
      store.setState((prev) => ({
        ...prev,
        submissionState: 'success',
        lastSuccessMessage: message,
        isDirty: false,
      }));
    },

    failSubmission(error: string) {
      store.setState((prev) => ({
        ...prev,
        submissionState: 'error',
        lastError: error,
      }));
    },

    resetSubmissionState() {
      store.setState((prev) => ({
        ...prev,
        submissionState: 'idle',
        lastError: null,
        lastSuccessMessage: null,
      }));
    },

    resetFormStatus() {
      store.setState(getInitialFormStatus());
    },

    /** Aktualisiert nur bei tatsächlicher Änderung (Referenzstabilität). */
    updateValidationSummary(summary: { total: number; errors: number }) {
      store.setState((prev) => {
        if (
          prev.validationSummary.total === summary.total &&
          prev.validationSummary.errors === summary.errors
        ) {
          return prev;
        }

        return { ...prev, validationSummary: summary };
      });
    },

    /** Aktualisiert nur bei tatsächlicher Änderung (Referenzstabilität). */
    setDirty(dirty: boolean) {
      store.setState((prev) => {
        if (prev.isDirty === dirty) {
          return prev;
        }

        return { ...prev, isDirty: dirty };
      });
    },
  };
}
