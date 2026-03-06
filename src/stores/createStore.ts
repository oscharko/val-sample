/**
 * createStore — Generische Micro-State-Store-Factory.
 *
 * Implementiert das "Module State + Subscription"-Pattern
 * mit React 19's `useSyncExternalStore` für concurrent-safe Reads.
 */

import { useCallback, useSyncExternalStore } from 'react';

/** Micro-State-Store mit get/set/subscribe. */
export type Store<T> = {
  getState: () => T;
  setState: (action: T | ((prev: T) => T)) => void;
  subscribe: (callback: () => void) => () => void;
};

type StoreUpdater<T> = (prev: T) => T;
type StoreAction<T> = T | StoreUpdater<T>;

const isStoreUpdater = <T,>(action: StoreAction<T>): action is StoreUpdater<T> => {
  return typeof action === 'function';
};

/** Erzeugt einen neuen Store mit initialem Zustand. */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const callbacks = new Set<() => void>();

  const getState = () => state;

  const setState = (nextState: StoreAction<T>) => {
    const next = isStoreUpdater(nextState) ? nextState(state) : nextState;

    // Bail-out bei identischer Referenz (wie React.useState)
    if (Object.is(next, state)) {
      return;
    }

    state = next;

    // Snapshot: Listener-Set wird vor Iteration kopiert, damit Listener sich
    // während der Benachrichtigung sicher an-/abmelden können
    const listenerSnapshot = [...callbacks];
    for (const callback of listenerSnapshot) {
      callback();
    }
  };

  const subscribe = (callback: () => void) => {
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return { getState, setState, subscribe };
}

/**
 * Hook für selektiven Store-Zugriff (Re-Render-Optimierung).
 * Komponente rendert nur neu, wenn sich der selektierte Wert ändert.
 * Nutzt React 19's `useSyncExternalStore` für sichere State-Updates.
 *
 * WICHTIG: `selector` muss eine stabile Referenz sein (Modul-Konstante
 * oder useCallback), um unnötige Re-Renders zu vermeiden.
 */
export function useStoreSelector<T, S>(
  store: Store<T>,
  selector: (state: T) => S,
): S {
  const getSnapshot = useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
