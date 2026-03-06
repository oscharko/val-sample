import { describe, expect, it } from 'vitest';
import {
  createFormStatusActions,
  createFormStatusStore,
} from './formStatusStore';

describe('formStatusStore factory and actions', () => {
  it('tracks submission flow and resets submission state without losing other slices', () => {
    const store = createFormStatusStore();
    const actions = createFormStatusActions(store);

    actions.startSubmission();
    expect(store.getState().submissionState).toBe('submitting');

    actions.completeSubmission('done');
    expect(store.getState().submissionState).toBe('success');
    expect(store.getState().lastSuccessMessage).toBe('done');

    actions.updateValidationSummary({ total: 26, errors: 3 });
    actions.setDirty(true);

    actions.resetSubmissionState();

    const snapshot = store.getState();
    expect(snapshot.submissionState).toBe('idle');
    expect(snapshot.lastSuccessMessage).toBeNull();
    expect(snapshot.lastError).toBeNull();
    expect(snapshot.validationSummary).toEqual({ total: 26, errors: 3 });
    expect(snapshot.isDirty).toBe(true);
  });

  it('stores error state and validation summary consistently', () => {
    const store = createFormStatusStore();
    const actions = createFormStatusActions(store);

    actions.failSubmission('network');
    actions.updateValidationSummary({ total: 26, errors: 2 });

    const snapshot = store.getState();
    expect(snapshot.submissionState).toBe('error');
    expect(snapshot.lastError).toBe('network');
    expect(snapshot.validationSummary.total).toBe(26);
    expect(snapshot.validationSummary.errors).toBe(2);
  });

  it('resets the full store snapshot to initial defaults', () => {
    const store = createFormStatusStore();
    const actions = createFormStatusActions(store);

    actions.failSubmission('boom');
    actions.updateValidationSummary({ total: 10, errors: 4 });
    actions.setDirty(true);

    actions.resetFormStatus();

    expect(store.getState()).toEqual({
      submissionState: 'idle',
      lastError: null,
      lastSuccessMessage: null,
      validationSummary: { total: 0, errors: 0 },
      isDirty: false,
    });
  });

  it('keeps independent snapshots across separate store instances', () => {
    const storeA = createFormStatusStore();
    const storeB = createFormStatusStore();

    const actionsA = createFormStatusActions(storeA);
    const actionsB = createFormStatusActions(storeB);

    actionsA.failSubmission('instance-a-error');
    actionsB.completeSubmission('instance-b-success');

    expect(storeA.getState().submissionState).toBe('error');
    expect(storeA.getState().lastError).toBe('instance-a-error');

    expect(storeB.getState().submissionState).toBe('success');
    expect(storeB.getState().lastSuccessMessage).toBe('instance-b-success');
  });
});
