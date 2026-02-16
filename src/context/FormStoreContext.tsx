/**
 * FormStoreContext — Context + Subscription Pattern (Ch. 5)
 *
 * Combines React Context with the store subscription mechanism to
 * provide subtree-scoped form stores. This implements the book's
 * most advanced pattern:
 *
 * > "Using useContext together with useSubscription is the key
 * >  point of this pattern. This combination allows us the benefits
 * >  of both Context and Subscription."  — Ch. 5
 *
 * Benefits:
 * - Different form instances can have different stores (non-singleton)
 * - Selector-based subscriptions avoid extra re-renders
 * - Provider nesting works naturally with React's component tree
 *
 * This factory follows the "createStateContext" best practice (Ch. 3):
 * > "Creating a custom hook and a provider component is a somewhat
 * >  repetitive task; however, we can create a function that does
 * >  the task."
 */

import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from 'react';
import { createStore, type Store } from '../stores/createStore';

/* ------------------------------------------------------------------ */
/*  Factory: createFormStoreContext                                    */
/* ------------------------------------------------------------------ */

/**
 * Factory that creates a Context-based store with subscription support.
 *
 * Book reference: Ch. 3 — "Factory pattern with a custom hook"
 * Combined with Ch. 5 — "Implementing the Context and Subscription pattern"
 *
 * @param initialState — Default state for the store.
 * @returns A tuple of [Provider, useSelector, useSetState] — the three
 *          tools needed to work with the store in components.
 *
 * @example
 * ```tsx
 * const [FormProvider, useFormSelector, useFormSetState] =
 *   createFormStoreContext({ step: 1, isValid: false });
 *
 * // In App:
 * <FormProvider><MyForm /></FormProvider>
 *
 * // In component:
 * const step = useFormSelector((s) => s.step);
 * const setState = useFormSetState();
 * ```
 */
export function createFormStoreContext<T>(initialState: T) {
  /**
   * Context holds a Store<T>, not the state itself.
   * This is the key insight from Ch. 5:
   * > "We'll use createStore for the Context value."
   *
   * The default value is a real store (not null), so the hook works
   * even without a Provider — matching the book's recommendation:
   * > "Having a proper default value for Context is important."
   */
  const StoreContext = createContext<Store<T>>(createStore(initialState));

  /**
   * Provider component that creates a fresh store per subtree.
   *
   * Book reference: Ch. 5 — "StoreProvider, which is a tiny wrapper"
   * > "useRef is used to make sure that the store object is initialized
   * >  only once at the first render."
   */
  function StoreProvider({
    initialValue,
    children,
  }: {
    /** Optional override for the initial state of this provider's store. */
    initialValue?: T;
    children: ReactNode;
  }) {
    // useRef ensures the store is created exactly once (Ch. 5 pattern)
    const storeRef = useRef<Store<T> | null>(null);
    if (storeRef.current === null) {
      storeRef.current = createStore(initialValue ?? initialState);
    }

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  }

  /**
   * Hook to select a slice of state from the nearest Provider.
   *
   * Book reference: Ch. 5 — "useSelector doesn't take a store object
   * in its arguments. It takes a store object from StoreContext instead."
   *
   * @param selector — Pure function extracting a slice of state.
   */
  function useSelector<S>(selector: (state: T) => S): S {
    const store = useContext(StoreContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);

    return useSyncExternalStore(store.subscribe, getSnapshot);
  }

  /**
   * Hook to get the setState function from the nearest Provider.
   *
   * Book reference: Ch. 5 — "useSetState is a simple hook to return
   * the setState function in store."
   */
  function useSetState(): Store<T>['setState'] {
    const store = useContext(StoreContext);
    return store.setState;
  }

  /**
   * Hook to get the full store (for advanced use cases).
   */
  function useStoreRef(): Store<T> {
    return useContext(StoreContext);
  }

  // Return as const tuple — Ch. 3 factory pattern
  return [StoreProvider, useSelector, useSetState, useStoreRef] as const;
}

/* ------------------------------------------------------------------ */
/*  Pre-built form navigation context                                 */
/* ------------------------------------------------------------------ */

/**
 * Shared navigation/workflow state for multi-step forms.
 *
 * This is a concrete instance of createFormStoreContext,
 * demonstrating the Ch. 3 factory pattern in action.
 */
export interface FormNavigationState {
  /** Current step in a multi-step form (1-based). */
  currentStep: number;
  /** Total number of steps. */
  totalSteps: number;
  /** Whether the user can proceed to the next step. */
  canProceed: boolean;
  /** Whether the user can go back. */
  canGoBack: boolean;
}

export const [
  FormNavigationProvider,
  useFormNavigationSelector,
  useFormNavigationSetState,
] = createFormStoreContext<FormNavigationState>({
  currentStep: 1,
  totalSteps: 2,
  canProceed: false,
  canGoBack: false,
});
