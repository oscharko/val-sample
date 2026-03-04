import { beforeEach, describe, expect, it } from 'vitest';
import {
  completeSubmission,
  failSubmission,
  formStatusStore,
  resetFormStatus,
  resetSubmissionState,
  setDirty,
  startSubmission,
  updateValidationSummary,
} from './formStatusStore';

describe('formStatusStore', () => {
  beforeEach(() => {
    resetFormStatus();
  });

  it('tracks submission flow and resets submission state without losing other slices', () => {
    startSubmission();
    expect(formStatusStore.getState().submissionState).toBe('submitting');

    completeSubmission('done');
    expect(formStatusStore.getState().submissionState).toBe('success');
    expect(formStatusStore.getState().lastSuccessMessage).toBe('done');

    updateValidationSummary({ total: 26, errors: 3 });
    setDirty(true);

    resetSubmissionState();

    const snapshot = formStatusStore.getState();
    expect(snapshot.submissionState).toBe('idle');
    expect(snapshot.lastSuccessMessage).toBeNull();
    expect(snapshot.lastError).toBeNull();
    expect(snapshot.validationSummary).toEqual({ total: 26, errors: 3 });
    expect(snapshot.isDirty).toBe(true);
  });

  it('stores error state and validation summary consistently', () => {
    failSubmission('network');
    updateValidationSummary({ total: 26, errors: 2 });

    const snapshot = formStatusStore.getState();
    expect(snapshot.submissionState).toBe('error');
    expect(snapshot.lastError).toBe('network');
    expect(snapshot.validationSummary.total).toBe(26);
    expect(snapshot.validationSummary.errors).toBe(2);
  });

  it('resets the full store snapshot to initial defaults', () => {
    failSubmission('boom');
    updateValidationSummary({ total: 10, errors: 4 });
    setDirty(true);

    resetFormStatus();

    expect(formStatusStore.getState()).toEqual({
      submissionState: 'idle',
      lastError: null,
      lastSuccessMessage: null,
      validationSummary: { total: 0, errors: 0 },
      isDirty: false,
    });
  });
});
