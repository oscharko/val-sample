/**
 * createStore — Generic Micro State Store Factory
 *
 * Implements the "Module State + Subscription" pattern from
 * "Micro State Management with React Hooks" (Ch. 4, Daishi Kato).
 *
 * Uses React 19's built-in `useSyncExternalStore` instead of the
 * book's custom `useSubscription` hook, providing:
 *   - Automatic SSR compatibility
 *   - No tearing in concurrent rendering
 *   - Selector-based re-render optimization (Ch. 4, "Working with a selector")
 *
 * @example
 * ```ts
 * const counterStore = createStore({ count: 0 });
 * // In a component:
 * const count = useStoreSelector(counterStore, (s) => s.count);
 * counterStore.setState((prev) => ({ ...prev, count: prev.count + 1 }));
 * ```
 */

import { useSyncExternalStore, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Store type                                                        */
/* ------------------------------------------------------------------ */

/**
 * A micro state store with get/set/subscribe capabilities.
 * Mirrors the `Store<T>` type from Ch. 4 of the book.
 */
export type Store<T> = {
  /** Read the current state snapshot (pure, no side effects). */
  getState: () => T;

  /**
   * Update state — accepts either a new value or an updater function.
   * Immutability is required (same as React's setState convention).
   */
  setState: (action: T | ((prev: T) => T)) => void;

  /**
   * Subscribe to state changes. Returns an unsubscribe function.
   * This is the "Subscription" mechanism from Ch. 4.
   */
  subscribe: (callback: () => void) => () => void;
};

/* ------------------------------------------------------------------ */
/*  createStore factory                                                */
/* ------------------------------------------------------------------ */

/**
 * Creates a micro state store with subscription support.
 *
 * Book reference: Ch. 4 — "Adding a basic Subscription"
 * > "createStore has the subscribe method and the setState method,
 * >  which invokes callbacks."
 *
 * @param initialState — The initial state value.
 * @returns A Store<T> object with getState, setState, and subscribe.
 */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const callbacks = new Set<() => void>();

  const getState = () => state;

  const setState = (nextState: T | ((prev: T) => T)) => {
    // Support both value and function updates (Ch. 1 pattern)
    state =
      typeof nextState === 'function'
        ? (nextState as (prev: T) => T)(state)
        : nextState;

    // Notify all subscribers — the core subscription mechanism
    callbacks.forEach((callback) => callback());
  };

  const subscribe = (callback: () => void) => {
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return { getState, setState, subscribe };
}

/* ------------------------------------------------------------------ */
/*  useStore — full state hook                                        */
/* ------------------------------------------------------------------ */

/**
 * React hook that subscribes to the entire store state.
 *
 * Book reference: Ch. 4 — "We define a new hook, useStore"
 * Upgraded to use `useSyncExternalStore` (React 18+/19) instead of
 * the book's manual useEffect + useState subscription.
 *
 * @param store — A store created with createStore().
 * @returns A tuple [state, setState] similar to useState.
 */
export function useStore<T>(store: Store<T>): [T, Store<T>['setState']] {
  const state = useSyncExternalStore(store.subscribe, store.getState);
  return [state, store.setState];
}

/* ------------------------------------------------------------------ */
/*  useStoreSelector — scoped state hook (re-render optimization)     */
/* ------------------------------------------------------------------ */

/**
 * React hook that subscribes to a *selected slice* of store state.
 *
 * Book reference: Ch. 4 — "Working with a selector and useSubscription"
 * > "To avoid extra re-renders, we can introduce a selector to return
 * >  the only part of the state that a component is interested in."
 *
 * The component only re-renders when the selected value changes.
 *
 * @param store — A store created with createStore().
 * @param selector — A pure function that extracts a slice of state.
 * @returns The selected slice of state.
 */
export function useStoreSelector<T, S>(
  store: Store<T>,
  selector: (state: T) => S,
): S {
  // Wrap selector in getSnapshot for useSyncExternalStore
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}
