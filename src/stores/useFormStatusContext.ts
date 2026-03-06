import { useContext } from 'react';
import { FormStatusContext, type FormStatusContextValue } from './formStatusContext';

export function useFormStatusContext(): FormStatusContextValue {
  const context = useContext(FormStatusContext);

  if (!context) {
    throw new Error('useFormStatusContext muss innerhalb von FormStatusProvider verwendet werden.');
  }

  return context;
}
