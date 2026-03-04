import { act, renderHook, waitFor } from '@testing-library/react';
import {
  useForm,
  type FieldErrors,
  type UseFormReturn,
} from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitInvestmentFinancing } from '../api';
import { defaultValues } from '../config/formConfig';
import { INVESTMENT_FINANCING_FIELD_NAMES } from '../domain/investmentFinancingFields';
import { type InvestmentFinancingFormData } from '../schema';
import { formStatusStore, resetFormStatus } from '../stores/formStatusStore';
import { useInvestmentFinancingSubmission } from './useInvestmentFinancingSubmission';

vi.mock('../api', () => ({
  submitInvestmentFinancing: vi.fn(),
}));

const createValidFormData = (): InvestmentFinancingFormData => ({
  ...defaultValues,
  person: 'Meyer Technologies GmbH',
  investmentObjectName: 'Volkswagen ID.3',
  investmentObjectType: 'kfz',
  purchasePriceCaptureMode: 'netto',
  purchasePrice: 45_000,
  vatRate: '19',
});

describe('useInvestmentFinancingSubmission', () => {
  const mockedSubmitInvestmentFinancing = vi.mocked(submitInvestmentFinancing);

  beforeEach(() => {
    resetFormStatus();
    vi.restoreAllMocks();
    mockedSubmitInvestmentFinancing.mockReset();
  });

  it('tracks pending state through the full submit lifecycle', async () => {
    let resolveResult: ((value: Awaited<ReturnType<typeof submitInvestmentFinancing>>) => void) | undefined;

    mockedSubmitInvestmentFinancing.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveResult = resolve;
        }),
    );

    let methodsRef: UseFormReturn<InvestmentFinancingFormData> | undefined;

    const { result } = renderHook(() => {
      const methods = useForm<InvestmentFinancingFormData>({
        defaultValues: { ...defaultValues },
      });
      methodsRef = methods;

      return useInvestmentFinancingSubmission(methods.setError);
    });

    act(() => {
      result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(result.current.formPending).toBe(true);
      expect(formStatusStore.getState().submissionState).toBe('submitting');
    });

    act(() => {
      resolveResult?.({
        success: true,
        data: {
          id: 'request-1',
          message: 'ok',
        },
      });
    });

    await waitFor(() => {
      expect(result.current.formPending).toBe(false);
      expect(formStatusStore.getState().submissionState).toBe('success');
    });

    expect(methodsRef?.getFieldState('purchasePrice').error).toBeUndefined();
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

    const { result } = renderHook(() => {
      const methods = useForm<InvestmentFinancingFormData>({
        defaultValues: { ...defaultValues },
      });
      methodsRef = methods;

      return useInvestmentFinancingSubmission(methods.setError);
    });

    act(() => {
      result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(methodsRef?.getFieldState('purchasePrice').error?.message).toBe(
        'Ungültiger Betrag',
      );
    });

    expect(formStatusStore.getState().validationSummary.errors).toBe(1);
    expect(formStatusStore.getState().submissionState).toBe('error');
  });

  it('prevents duplicate submits while a submission is pending', async () => {
    let resolveResult:
      | ((value: Awaited<ReturnType<typeof submitInvestmentFinancing>>) => void)
      | undefined;

    mockedSubmitInvestmentFinancing.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveResult = resolve;
        }),
    );

    const { result } = renderHook(() => {
      const methods = useForm<InvestmentFinancingFormData>({
        defaultValues: { ...defaultValues },
      });

      return useInvestmentFinancingSubmission(methods.setError);
    });

    act(() => {
      result.current.onValidSubmit(createValidFormData());
    });

    await waitFor(() => {
      expect(result.current.formPending).toBe(true);
    });

    act(() => {
      result.current.onValidSubmit(createValidFormData());
    });

    expect(mockedSubmitInvestmentFinancing).toHaveBeenCalledTimes(1);

    act(() => {
      resolveResult?.({
        success: true,
        data: {
          id: 'request-1',
          message: 'ok',
        },
      });
    });

    await waitFor(() => {
      expect(result.current.formPending).toBe(false);
      expect(formStatusStore.getState().submissionState).toBe('success');
    });
  });

  it('counts nested invalid form errors and updates validation summary without API call', () => {
    const { result } = renderHook(() => {
      const methods = useForm<InvestmentFinancingFormData>({
        defaultValues: { ...defaultValues },
      });

      return useInvestmentFinancingSubmission(methods.setError);
    });

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
    expect(formStatusStore.getState().validationSummary).toEqual({
      total: INVESTMENT_FINANCING_FIELD_NAMES.length,
      errors: 2,
    });
  });
});
