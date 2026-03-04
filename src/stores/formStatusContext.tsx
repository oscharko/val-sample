import { createContext, useMemo, type ReactNode } from 'react';
import type { Store } from './createStore';
import {
  createFormStatusActions,
  createFormStatusStore,
  type FormStatus,
  type FormStatusActions,
} from './formStatusStore';

export interface FormStatusContextValue {
  store: Store<FormStatus>;
  actions: FormStatusActions;
}

const FormStatusContext = createContext<FormStatusContextValue | undefined>(undefined);

interface FormStatusProviderProps {
  children?: ReactNode;
  store?: Store<FormStatus>;
  actions?: FormStatusActions;
}

export function FormStatusProvider({
  children,
  store: providedStore,
  actions: providedActions,
}: FormStatusProviderProps) {
  const value = useMemo<FormStatusContextValue>(() => {
    const store = providedStore ?? createFormStatusStore();
    const actions = providedActions ?? createFormStatusActions(store);

    return {
      store,
      actions,
    };
  }, [providedActions, providedStore]);

  return (
    <FormStatusContext.Provider value={value}>{children}</FormStatusContext.Provider>
  );
}

export { FormStatusContext };
