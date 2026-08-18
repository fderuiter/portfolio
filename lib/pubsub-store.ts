"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface Store<T> {
  get: () => T;
  set: (nextState: Partial<T> | ((prev: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
}

/**
 * Creates a zero-dependency external pub-sub store.
 * Allows components to subscribe to fine-grained state updates
 * without causing top-down React re-render cascades across parent trees.
 */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener>();

  return {
    get: () => state,
    set: (nextState: Partial<T> | ((prev: T) => T)) => {
      state =
        typeof nextState === "function"
          ? (nextState as (prev: T) => T)(state)
          : { ...state, ...nextState };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * React hook to subscribe to an external store using built-in useSyncExternalStore.
 */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/**
 * React hook to subscribe to a selected slice of an external store.
 */
export function useStoreSelector<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get())
  );
}
