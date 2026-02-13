import { useState, useCallback } from "react";
import type { UserPreferences } from "../types";
import { STORAGE_KEY, DEFAULT_PREFERENCES } from "../utils/constants";

export function useLocalStorage(): {
  preferences: UserPreferences;
  updatePreferences: (update: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
} {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreferences = useCallback(
    (update: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...update };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return { preferences, updatePreferences, clearPreferences };
}
