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
  const store = useMemo(
    () => providedStore ?? createFormStatusStore(),
    [providedStore],
  );

  // Warum getrennt? Actions hängen logisch am final aufgelösten Store.
  const actions = useMemo(
    () => providedActions ?? createFormStatusActions(store),
    [providedActions, store],
  );

  const value = useMemo<FormStatusContextValue>(
    () => ({ store, actions }),
    [actions, store],
  );

  return (
    <FormStatusContext.Provider value={value}>{children}</FormStatusContext.Provider>
  );
}

export { FormStatusContext };
