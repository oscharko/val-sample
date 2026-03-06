import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createElement,
  type ReactNode,
} from 'react';
import {
  useForm,
  type FieldErrors,
  type UseFormReturn,
} from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CLIENT_ABORTED_ERROR_CODE,
  submitInvestmentFinancing,
} from '../api';
import { defaultValues } from '../config/formConfig';
import { INVESTMENT_FINANCING_FIELD_NAMES } from '../domain/investmentFinancingFields';
import { type InvestmentFinancingFormData } from '../schema';
import { useFormStatus } from './useFormStatus';
import { useInvestmentFinancingSubmission } from './useInvestmentFinancingSubmission';
import {
  createFormStatusActions,
  createFormStatusStore,
  type FormStatus,
} from '../stores/formStatusStore';
import { FormStatusProvider } from '../stores/formStatusContext';

vi.mock('../api', () => ({
  submitInvestmentFinancing: vi.fn(),
  CLIENT_ABORTED_ERROR_CODE: 'CLIENT_ABORTED',
}));

const createValidFormData = (
  overrides: Partial<InvestmentFinancingFormData> = {},
): InvestmentFinancingFormData => ({
  ...defaultValues,
  person: 'Meyer Technologies GmbH',
  investmentObjectName: 'Volkswagen ID.3',
  investmentObjectType: 'kfz',
  purchasePriceCaptureMode: 'netto',
  purchasePrice: 45_000,
  vatRate: '19',
  ...overrides,
});

const createDeferredResult = () => {
  let resolve:
    | ((value: Awaited<ReturnType<typeof submitInvestmentFinancing>>) => void)
    | undefined;

  const promise = new Promise<Awaited<ReturnType<typeof submitInvestmentFinancing>>>(
    (promiseResolve) => {
      resolve = promiseResolve;
    },
  );

  return {
    promise,
    resolve: (value: Awaited<ReturnType<typeof submitInvestmentFinancing>>) => {
      resolve?.(value);
    },
  };
};

const createProviderWrapper = () => {
  const store = createFormStatusStore();
  const actions = createFormStatusActions(store);

  const wrapper = ({ children }: { children: ReactNode }) => {
    return createElement(FormStatusProvider, { store, actions }, children);
  };

  return {
    wrapper,
    store,
  };
};

describe('useInvestmentFinancingSubmission', () => {
  const mockedSubmitInvestmentFinancing = vi.mocked(submitInvestmentFinancing);

  beforeEach(() => {
    vi.restoreAllMocks();
    mockedSubmitInvestmentFinancing.mockReset();
  });

  it('tracks pending state through the full submit lifecycle', async () => {
    const deferred = createDeferredResult();

    mockedSubmitInvestmentFinancing.mockImplementation(() => deferred.promise);

    let methodsRef: UseFormReturn<InvestmentFinancingFormData> | undefined;
    const { wrapper, store } = createProviderWrapper();

    const { result } = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });
        methodsRef = methods;

        const submission = useInvestmentFinancingSubmission(methods.setError);
        const status = useFormStatus();

        return {
          submission,
          status,
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.submission.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(result.current.submission.formPending).toBe(true);
      expect(store.getState().submissionState).toBe('submitting');
    });

    act(() => {
      deferred.resolve({
        success: true,
        data: {
          id: 'request-1',
          message: 'ok',
        },
      });
    });

    await waitFor(() => {
      expect(result.current.submission.formPending).toBe(false);
      expect(store.getState().submissionState).toBe('success');
    });

    expect(methodsRef?.getFieldState('purchasePrice').error).toBeUndefined();
    expect(result.current.status.lastSuccessMessage).toBe('ok');
  });

  it('maps only known server field errors into React Hook Form state', async () => {
    mockedSubmitInvestmentFinancing.mockResolvedValue({
      success: false,
      error: {
        status: 422,
        message: 'Validation failed',
        fieldErrors: {
          purchasePrice: 'Ungültiger Betrag',
          unknownField: 'ignored',
        },
      },
    });

    let methodsRef: UseFormReturn<InvestmentFinancingFormData> | undefined;
    const { wrapper, store } = createProviderWrapper();

    const { result } = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });
        methodsRef = methods;

        const submission = useInvestmentFinancingSubmission(methods.setError);
        const status = useFormStatus();

        return {
          submission,
          status,
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.submission.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(methodsRef?.getFieldState('purchasePrice').error?.message).toBe(
        'Ungültiger Betrag',
      );
    });

    expect(store.getState().validationSummary.errors).toBe(1);
    expect(store.getState().submissionState).toBe('error');
  });

  it('replaces an active request with a new one and ignores stale responses', async () => {
    const firstRequest = createDeferredResult();
    const secondRequest = createDeferredResult();

    mockedSubmitInvestmentFinancing
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise);

    const { wrapper, store } = createProviderWrapper();

    const { result } = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });

        return useInvestmentFinancingSubmission(methods.setError);
      },
      { wrapper },
    );

    act(() => {
      result.current.onValidSubmit(createValidFormData({ investmentObjectName: 'first' }));
    });

    act(() => {
      result.current.onValidSubmit(createValidFormData({ investmentObjectName: 'second' }));
    });

    expect(mockedSubmitInvestmentFinancing).toHaveBeenCalledTimes(2);

    act(() => {
      secondRequest.resolve({
        success: true,
        data: {
          id: 'request-2',
          message: 'second-result',
        },
      });
    });

    await waitFor(() => {
      expect(store.getState().submissionState).toBe('success');
      expect(store.getState().lastSuccessMessage).toBe('second-result');
    });

    act(() => {
      firstRequest.resolve({
        success: true,
        data: {
          id: 'request-1',
          message: 'first-result',
        },
      });
    });

    await waitFor(() => {
      expect(store.getState().lastSuccessMessage).toBe('second-result');
    });
  });

  it('counts nested invalid form errors and updates validation summary without API call', () => {
    const { wrapper, store } = createProviderWrapper();

    const { result } = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });

        return useInvestmentFinancingSubmission(methods.setError);
      },
      { wrapper },
    );

    const invalidErrors = {
      person: {
        type: 'required',
        message: 'Bitte wählen Sie eine Person aus.',
      },
      grouped: {
        purchasePrice: {
          type: 'min',
          message: 'Ungültiger Betrag',
        },
      },
    } as unknown as FieldErrors<InvestmentFinancingFormData>;

    act(() => {
      result.current.onInvalidSubmit(invalidErrors);
    });

    expect(mockedSubmitInvestmentFinancing).not.toHaveBeenCalled();
    expect(store.getState().validationSummary).toEqual({
      total: INVESTMENT_FINANCING_FIELD_NAMES.length,
      errors: 2,
    });
  });

  it('resets submission state when the active request is aborted by client', async () => {
    mockedSubmitInvestmentFinancing.mockResolvedValue({
      success: false,
      error: {
        status: 0,
        message: 'aborted',
        code: CLIENT_ABORTED_ERROR_CODE,
      },
    });

    const { wrapper, store } = createProviderWrapper();

    const { result } = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });

        return useInvestmentFinancingSubmission(methods.setError);
      },
      { wrapper },
    );

    act(() => {
      result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      const snapshot = store.getState();
      expect(snapshot.submissionState).toBe('idle');
      expect(snapshot.lastError).toBeNull();
      expect(snapshot.lastSuccessMessage).toBeNull();
    });
  });

  it('sets a generic technical error when the submit function throws unexpectedly', async () => {
    mockedSubmitInvestmentFinancing.mockRejectedValue(new Error('boom'));

    const { wrapper, store } = createProviderWrapper();

    const { result } = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });

        return useInvestmentFinancingSubmission(methods.setError);
      },
      { wrapper },
    );

    act(() => {
      result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      const snapshot = store.getState();
      expect(snapshot.submissionState).toBe('error');
      expect(snapshot.lastError).toBe(
        'Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      );
    });
  });

  it('aborts in-flight submit on unmount without writing final error/success state', async () => {
    mockedSubmitInvestmentFinancing.mockImplementation((_dto, options) => {
      return new Promise((resolve) => {
        options?.signal?.addEventListener('abort', () => {
          resolve({
            success: false,
            error: {
              status: 0,
              message: 'aborted',
              code: CLIENT_ABORTED_ERROR_CODE,
            },
          });
        });
      });
    });

    const { wrapper, store } = createProviderWrapper();

    const hook = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });

        return useInvestmentFinancingSubmission(methods.setError);
      },
      { wrapper },
    );

    act(() => {
      hook.result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(store.getState().submissionState).toBe('submitting');
    });

    hook.unmount();

    await waitFor(() => {
      const snapshot: FormStatus = store.getState();
      expect(snapshot.submissionState).toBe('submitting');
      expect(snapshot.lastError).toBeNull();
      expect(snapshot.lastSuccessMessage).toBeNull();
    });
  });

  it('ignores delayed success responses after unmount', async () => {
    const deferred = createDeferredResult();
    mockedSubmitInvestmentFinancing.mockImplementation(() => deferred.promise);

    const { wrapper, store } = createProviderWrapper();

    const hook = renderHook(
      () => {
        const methods = useForm<InvestmentFinancingFormData>({
          defaultValues: { ...defaultValues },
        });

        return useInvestmentFinancingSubmission(methods.setError);
      },
      { wrapper },
    );

    act(() => {
      hook.result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(store.getState().submissionState).toBe('submitting');
    });

    hook.unmount();

    act(() => {
      deferred.resolve({
        success: true,
        data: {
          id: 'late-result',
          message: 'should-be-ignored',
        },
      });
    });

    await waitFor(() => {
      const snapshot = store.getState();
      expect(snapshot.submissionState).toBe('submitting');
      expect(snapshot.lastSuccessMessage).toBeNull();
    });
  });
});
