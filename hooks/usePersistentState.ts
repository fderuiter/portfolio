"use client";

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";

/**
 * A custom hook that works like useState but persists the state to localStorage.
 * Automatically hydrates on mount to prevent SSR hydration mismatches.
 * 
 * @param key The localStorage key to use for this state
 * @param initialValue The default value if nothing is found in localStorage
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);

  // Hydrate from localStorage on initial client render
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Custom setter that updates both React state and localStorage
  const setPersistentState = useCallback(
    (value: SetStateAction<T>) => {
      setState((prevState) => {
        // Resolve the new value, allowing for functional updates
        const newValue = typeof value === "function" ? (value as Function)(prevState) : value;
        
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          }
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
        
        return newValue;
      });
    },
    [key]
  );

  return [state, setPersistentState];
}
