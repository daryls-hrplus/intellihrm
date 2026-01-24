import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTabContext } from "@/contexts/TabContext";

interface UseTabStateOptions<T extends Record<string, unknown>> {
  /**
   * Default state values when no persisted state exists
   */
  defaultState: T;
  /**
   * Keys to synchronize with URL search parameters for bookmarkability
   */
  syncToUrl?: (keyof T)[];
}

/**
 * Hook for managing tab-scoped state that persists across tab switches.
 * 
 * This replaces useState for page-level state that should survive when
 * users switch between tabs and return.
 * 
 * Features:
 * - State persists when tab becomes inactive
 * - Optional URL parameter sync for bookmarkable filters
 * - Automatic cleanup when tab is closed
 * 
 * @example
 * ```typescript
 * const [tabState, setTabState] = useTabState({
 *   defaultState: {
 *     searchTerm: "",
 *     selectedCompanyId: "",
 *     expandedRowId: null as string | null,
 *   },
 *   syncToUrl: ["selectedCompanyId", "searchTerm"],
 * });
 * 
 * // Access state
 * const { searchTerm, selectedCompanyId } = tabState;
 * 
 * // Update state
 * setTabState({ searchTerm: "new value" });
 * ```
 */
export function useTabState<T extends Record<string, unknown>>(
  options: UseTabStateOptions<T>
): [T, (updates: Partial<T>) => void, () => void] {
  const { activeTabId, getTabState, updateTabState, setTabState: setFullTabState } = useTabContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitializedRef = useRef(false);
  const { defaultState, syncToUrl = [] } = options;

  // Get current state - merge defaults with persisted state
  const persistedState = activeTabId ? getTabState<T>(activeTabId) : undefined;
  const currentState: T = { ...defaultState, ...persistedState };

  // Initialize from URL on first mount
  useEffect(() => {
    if (!activeTabId || isInitializedRef.current) return;
    
    const urlState: Partial<T> = {};
    let hasUrlState = false;

    syncToUrl.forEach((key) => {
      const urlValue = searchParams.get(String(key));
      if (urlValue !== null) {
        // Attempt to parse as JSON for complex types, fallback to string
        try {
          const parsed = JSON.parse(urlValue);
          urlState[key] = parsed;
        } catch {
          urlState[key] = urlValue as T[keyof T];
        }
        hasUrlState = true;
      }
    });

    if (hasUrlState) {
      updateTabState(activeTabId, urlState as Record<string, unknown>);
    }
    
    isInitializedRef.current = true;
  }, [activeTabId, searchParams, syncToUrl, updateTabState]);

  // Sync state changes to URL
  useEffect(() => {
    if (!isInitializedRef.current || syncToUrl.length === 0) return;

    const newParams = new URLSearchParams(searchParams);
    let hasChanges = false;

    syncToUrl.forEach((key) => {
      const value = currentState[key];
      const currentUrlValue = searchParams.get(String(key));
      
      if (value !== undefined && value !== null && value !== "") {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        if (currentUrlValue !== stringValue) {
          newParams.set(String(key), stringValue);
          hasChanges = true;
        }
      } else if (currentUrlValue !== null) {
        newParams.delete(String(key));
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSearchParams(newParams, { replace: true });
    }
  }, [currentState, syncToUrl, searchParams, setSearchParams]);

  // Update function - merges partial updates
  const setState = useCallback((updates: Partial<T>) => {
    if (activeTabId) {
      updateTabState(activeTabId, updates as Record<string, unknown>);
    }
  }, [activeTabId, updateTabState]);

  // Reset function - clears to defaults
  const resetState = useCallback(() => {
    if (activeTabId) {
      setFullTabState(activeTabId, defaultState as Record<string, unknown>);
      
      // Also clear URL params
      if (syncToUrl.length > 0) {
        const newParams = new URLSearchParams(searchParams);
        syncToUrl.forEach((key) => {
          newParams.delete(String(key));
        });
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [activeTabId, setFullTabState, defaultState, syncToUrl, searchParams, setSearchParams]);

  return [currentState, setState, resetState];
}
