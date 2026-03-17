import { FormProvider, useForm } from 'react-hook-form';
import type { PropsWithChildren } from 'react';
import type { InvestmentFinancingFormData } from './schema';

export const Test = ({ children }: PropsWithChildren) => {
  const methods = useForm<InvestmentFinancingFormData>();
  return <FormProvider {...methods}>{children}</FormProvider>;
};
