import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { InvestmentFinancingFormData } from './schema';

export const Test = () => {
  const methods = useForm<InvestmentFinancingFormData>();
  return <FormProvider
      watch={methods.watch}
      getValues={methods.getValues}
      getFieldState={methods.getFieldState}
      setError={methods.setError}
      clearErrors={methods.clearErrors}
      setValue={methods.setValue}
      trigger={methods.trigger}
      formState={methods.formState}
      resetField={methods.resetField}
      reset={methods.reset}
      handleSubmit={methods.handleSubmit}
      unregister={methods.unregister}
      control={methods.control}
      register={methods.register}
      setFocus={methods.setFocus}
      subscribe={methods.subscribe}
  />;
}
