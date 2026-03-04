import { createStore, type Store } from './createStore';

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
): FormStatus => {
  const validationSummary = {
    total: initialState.validationSummary?.total ?? 0,
    errors: initialState.validationSummary?.errors ?? 0,
  };

  return {
    submissionState: initialState.submissionState ?? 'idle',
    lastError: initialState.lastError ?? null,
    lastSuccessMessage: initialState.lastSuccessMessage ?? null,
    validationSummary,
    isDirty: initialState.isDirty ?? false,
  };
};

export function createFormStatusStore(
  initialState: Partial<FormStatus> = {},
): Store<FormStatus> {
  return createStore(getInitialFormStatus(initialState));
}

export function createFormStatusActions(
  store: Store<FormStatus>,
): FormStatusActions {
  return {
    startSubmission() {
      store.setState((previous) => {
        if (
          previous.submissionState === 'submitting' &&
          previous.lastError === null &&
          previous.lastSuccessMessage === null
        ) {
          return previous;
        }

        return {
          ...previous,
          submissionState: 'submitting',
          lastError: null,
          lastSuccessMessage: null,
        };
      });
    },

    completeSubmission(message: string) {
      store.setState((previous) => {
        return {
          ...previous,
          submissionState: 'success',
          lastSuccessMessage: message,
          isDirty: false,
        };
      });
    },

    failSubmission(error: string) {
      store.setState((previous) => {
        return {
          ...previous,
          submissionState: 'error',
          lastError: error,
        };
      });
    },

    resetSubmissionState() {
      store.setState((previous) => {
        return {
          ...previous,
          submissionState: 'idle',
          lastError: null,
          lastSuccessMessage: null,
        };
      });
    },

    resetFormStatus() {
      store.setState(getInitialFormStatus());
    },

    updateValidationSummary(summary: { total: number; errors: number }) {
      store.setState((previous) => {
        if (
          previous.validationSummary.total === summary.total &&
          previous.validationSummary.errors === summary.errors
        ) {
          return previous;
        }

        return {
          ...previous,
          validationSummary: {
            total: summary.total,
            errors: summary.errors,
          },
        };
      });
    },

    setDirty(dirty: boolean) {
      store.setState((previous) => {
        if (previous.isDirty === dirty) {
          return previous;
        }

        return {
          ...previous,
          isDirty: dirty,
        };
      });
    },
  };
}

/**
 * Legacy singleton exports kept for compatibility during migration.
 * New code should use FormStatusProvider + useFormStatusContext.
 */
export const formStatusStore = createFormStatusStore();

const legacyActions = createFormStatusActions(formStatusStore);

export const {
  startSubmission,
  completeSubmission,
  failSubmission,
  resetSubmissionState,
  resetFormStatus,
  updateValidationSummary,
  setDirty,
} = legacyActions;
