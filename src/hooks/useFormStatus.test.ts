import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { INVESTMENT_FINANCING_FIELD_NAMES } from '../domain/investmentFinancingFields';
import { FormStatusProvider } from '../stores/formStatusContext';
import {
  useDirtyFlag,
  useFormStatus,
  useSubmissionActions,
  useSubmissionMessage,
  useSubmissionState,
  useValidationSummary,
} from './useFormStatus';

const wrapper = ({ children }: { children: ReactNode }) => {
  return createElement(FormStatusProvider, null, children);
};

describe('useFormStatus hooks', () => {
  it('derives submission lifecycle flags from store transitions', () => {
    const { result } = renderHook(
      () => {
        const submissionState = useSubmissionState();
        const actions = useSubmissionActions();

        return {
          submissionState,
          actions,
        };
      },
      { wrapper },
    );

    expect(result.current.submissionState).toEqual({
      submissionState: 'idle',
      isSubmitting: false,
      isSuccess: false,
      isError: false,
    });

    act(() => {
      result.current.actions.startSubmission();
    });

    expect(result.current.submissionState).toEqual({
      submissionState: 'submitting',
      isSubmitting: true,
      isSuccess: false,
      isError: false,
    });

    act(() => {
      result.current.actions.completeSubmission('saved');
    });

    expect(result.current.submissionState).toEqual({
      submissionState: 'success',
      isSubmitting: false,
      isSuccess: true,
      isError: false,
    });

    act(() => {
      result.current.actions.failSubmission('boom');
    });

    expect(result.current.submissionState).toEqual({
      submissionState: 'error',
      isSubmitting: false,
      isSuccess: false,
      isError: true,
    });
  });

  it('exposes submission messages and clears them on reset', () => {
    const { result } = renderHook(
      () => {
        const message = useSubmissionMessage();
        const actions = useSubmissionActions();

        return {
          message,
          actions,
        };
      },
      { wrapper },
    );

    expect(result.current.message).toEqual({
      lastError: null,
      lastSuccessMessage: null,
    });

    act(() => {
      result.current.actions.completeSubmission('saved');
    });

    expect(result.current.message).toEqual({
      lastError: null,
      lastSuccessMessage: 'saved',
    });

    act(() => {
      result.current.actions.failSubmission('network');
    });

    expect(result.current.message).toEqual({
      lastError: 'network',
      lastSuccessMessage: 'saved',
    });

    act(() => {
      result.current.actions.resetSubmissionState();
    });

    expect(result.current.message).toEqual({
      lastError: null,
      lastSuccessMessage: null,
    });
  });

  it('tracks validation summary and dirty flag updates', () => {
    const { result } = renderHook(
      () => {
        const validationSummary = useValidationSummary();
        const isDirty = useDirtyFlag();
        const actions = useSubmissionActions();

        return {
          validationSummary,
          isDirty,
          actions,
        };
      },
      { wrapper },
    );

    expect(result.current.validationSummary).toEqual({ total: 0, errors: 0 });
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.actions.updateValidationSummary({
        total: INVESTMENT_FINANCING_FIELD_NAMES.length,
        errors: 3,
      });
      result.current.actions.setDirty(true);
    });

    expect(result.current.validationSummary).toEqual({
      total: INVESTMENT_FINANCING_FIELD_NAMES.length,
      errors: 3,
    });
    expect(result.current.isDirty).toBe(true);
  });

  it('aggregates store slices consistently via useFormStatus', () => {
    const { result } = renderHook(
      () => {
        const status = useFormStatus();
        const actions = useSubmissionActions();

        return {
          status,
          actions,
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.actions.startSubmission();
      result.current.actions.updateValidationSummary({
        total: INVESTMENT_FINANCING_FIELD_NAMES.length,
        errors: 1,
      });
      result.current.actions.setDirty(true);
    });

    expect(result.current.status.submissionState).toBe('submitting');
    expect(result.current.status.validationSummary).toEqual({
      total: INVESTMENT_FINANCING_FIELD_NAMES.length,
      errors: 1,
    });
    expect(result.current.status.isDirty).toBe(true);
    expect(result.current.status.isSubmitting).toBe(true);
    expect(result.current.status.isSuccess).toBe(false);
    expect(result.current.status.isError).toBe(false);
  });

  it('isolates state across two provider instances', () => {
    const hookA = renderHook(
      () => {
        return {
          status: useFormStatus(),
          actions: useSubmissionActions(),
        };
      },
      { wrapper },
    );

    const hookB = renderHook(
      () => {
        return {
          status: useFormStatus(),
          actions: useSubmissionActions(),
        };
      },
      { wrapper },
    );

    act(() => {
      hookA.result.current.actions.failSubmission('instance-a');
    });

    expect(hookA.result.current.status.submissionState).toBe('error');
    expect(hookA.result.current.status.lastError).toBe('instance-a');

    expect(hookB.result.current.status.submissionState).toBe('idle');
    expect(hookB.result.current.status.lastError).toBeNull();
  });
});
