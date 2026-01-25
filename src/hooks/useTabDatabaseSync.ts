import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTabContext } from "@/contexts/TabContext";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { Json } from "@/integrations/supabase/types";

interface SerializedTabForDB {
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  isPinned: boolean;
  iconName?: string;
  state?: Record<string, unknown>;
}

/**
 * Syncs workspace tabs with the database for cross-session persistence.
 * 
 * - On login: Restores tabs from database
 * - On tab change: Debounced save to database (2 second delay)
 * - Prioritizes database state over session storage for logged-in users
 */
export function useTabDatabaseSync() {
  const { user } = useAuth();
  const { tabs, activeTabId, restoreTabsFromDB } = useTabContext();
  const isInitialLoad = useRef(true);
  const lastSavedHash = useRef<string>("");

  // Load tabs from database on login
  useEffect(() => {
    if (!user?.id) {
      isInitialLoad.current = true;
      return;
    }

    const loadTabsFromDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from("workspace_tabs")
          .select("tabs, active_tab_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load workspace tabs:", error);
          return;
        }

        if (data?.tabs && Array.isArray(data.tabs) && data.tabs.length > 0) {
          // Restore tabs from database
          restoreTabsFromDB(
            data.tabs as unknown as SerializedTabForDB[],
            data.active_tab_id || undefined
          );
          
          // Set initial hash to prevent immediate re-save
          lastSavedHash.current = JSON.stringify({
            tabs: data.tabs,
            activeTabId: data.active_tab_id
          });
        }

        isInitialLoad.current = false;
      } catch (err) {
        console.error("Error loading workspace tabs:", err);
        isInitialLoad.current = false;
      }
    };

    loadTabsFromDatabase();
  }, [user?.id, restoreTabsFromDB]);

  // Create serializable tab data for database
  const serializeForDB = useCallback((): SerializedTabForDB[] => {
    return tabs.map(tab => ({
      id: tab.id,
      route: tab.route,
      title: tab.title,
      subtitle: tab.subtitle,
      moduleCode: tab.moduleCode,
      contextId: tab.contextId,
      contextType: tab.contextType,
      isPinned: tab.isPinned,
      iconName: tab.iconName,
      // Don't persist state to DB - too large, use session storage instead
    }));
  }, [tabs]);

  // Debounced save to database
  const saveToDatabase = useDebouncedCallback(async () => {
    if (!user?.id || isInitialLoad.current) return;

    const serializedTabs = serializeForDB();
    const currentHash = JSON.stringify({
      tabs: serializedTabs,
      activeTabId
    });

    // Skip if nothing changed
    if (currentHash === lastSavedHash.current) return;

    try {
      const { error } = await supabase
        .from("workspace_tabs")
        .upsert(
          {
            user_id: user.id,
            tabs: serializedTabs as unknown as Json,
            active_tab_id: activeTabId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Failed to save workspace tabs:", error);
      } else {
        lastSavedHash.current = currentHash;
      }
    } catch (err) {
      console.error("Error saving workspace tabs:", err);
    }
  }, 2000); // 2 second debounce

  // Save tabs when they change
  useEffect(() => {
    if (user?.id && !isInitialLoad.current) {
      saveToDatabase();
    }
  }, [tabs, activeTabId, user?.id, saveToDatabase]);
}
