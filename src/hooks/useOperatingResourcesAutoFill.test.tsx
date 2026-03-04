import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect, useRef } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
  type UseFormReturn,
} from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { defaultValues } from '../config/formConfig';
import type { InvestmentFinancingFormData } from '../schema';
import { useOperatingResourcesAutoFill } from './useOperatingResourcesAutoFill';

const createWrapper = () => {
  const methodsRef: { current: UseFormReturn<InvestmentFinancingFormData> | null } = {
    current: null,
  };

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const initialDefaultsRef = useRef({ ...defaultValues });
    const formMethods = useForm<InvestmentFinancingFormData>({
      defaultValues: initialDefaultsRef.current,
    });

    useEffect(() => {
      methodsRef.current = formMethods;
    }, [formMethods]);

    return <FormProvider {...formMethods}>{children}</FormProvider>;
  };

  const getMethods = (): UseFormReturn<InvestmentFinancingFormData> => {
    if (!methodsRef.current) {
      throw new Error('Form methods are not available yet.');
    }

    return methodsRef.current;
  };

  return { Wrapper, getMethods };
};

describe('useOperatingResourcesAutoFill', () => {
  it('auto-fills and updates the amount while the value is still auto-managed', async () => {
    const { Wrapper, getMethods } = createWrapper();

    const { result, rerender } = renderHook(
      ({ suggestedAmount }: { suggestedAmount: number }) => {
        useOperatingResourcesAutoFill(suggestedAmount);
        const { control } = useFormContext<InvestmentFinancingFormData>();
        return useWatch({
          control,
          name: 'operatingResourcesAmount',
        });
      },
      {
        wrapper: Wrapper,
        initialProps: { suggestedAmount: 8_550 },
      },
    );

    const methods = getMethods();

    act(() => {
      methods.setValue('operatingResourcesRequired', 'ja', { shouldDirty: true });
    });

    await waitFor(() => {
      expect(result.current).toBe(8_550);
    });

    rerender({ suggestedAmount: 9_000 });

    await waitFor(() => {
      expect(result.current).toBe(9_000);
    });
  });

  it('does not overwrite manual user edits after auto-fill', async () => {
    const { Wrapper, getMethods } = createWrapper();

    const { result, rerender } = renderHook(
      ({ suggestedAmount }: { suggestedAmount: number }) => {
        useOperatingResourcesAutoFill(suggestedAmount);
        const { control } = useFormContext<InvestmentFinancingFormData>();
        return useWatch({
          control,
          name: 'operatingResourcesAmount',
        });
      },
      {
        wrapper: Wrapper,
        initialProps: { suggestedAmount: 8_550 },
      },
    );

    const methods = getMethods();

    act(() => {
      methods.setValue('operatingResourcesRequired', 'ja', { shouldDirty: true });
    });

    await waitFor(() => {
      expect(result.current).toBe(8_550);
    });

    act(() => {
      methods.setValue('operatingResourcesAmount', 5_000, { shouldDirty: true });
    });

    rerender({ suggestedAmount: 9_000 });

    await waitFor(() => {
      expect(result.current).toBe(5_000);
    });
  });

  it('clears the amount when operating resources are no longer required', async () => {
    const { Wrapper, getMethods } = createWrapper();

    const { result } = renderHook(() => {
      useOperatingResourcesAutoFill(8_550);
      const { control } = useFormContext<InvestmentFinancingFormData>();
      return useWatch({
        control,
        name: 'operatingResourcesAmount',
      });
    }, { wrapper: Wrapper });

    const methods = getMethods();

    act(() => {
      methods.setValue('operatingResourcesRequired', 'ja', { shouldDirty: true });
    });

    await waitFor(() => {
      expect(result.current).toBe(8_550);
    });

    act(() => {
      methods.setValue('operatingResourcesRequired', 'nein', { shouldDirty: true });
    });

    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });
});
