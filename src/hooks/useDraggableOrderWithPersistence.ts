import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UseDraggableOrderOptions<T> {
  items: T[];
  preferenceKey: string;
  getItemId: (item: T) => string;
}

export function useDraggableOrderWithPersistence<T>({ 
  items, 
  preferenceKey, 
  getItemId 
}: UseDraggableOrderOptions<T>) {
  const [orderedItems, setOrderedItems] = useState<T[]>(items);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Load shared order from database (not per-user, shared across all users)
  useEffect(() => {
    const loadOrder = async () => {
      try {
        // Load shared preference (no user_id filter - shared for all users)
        const { data, error } = await (supabase as any)
          .from("user_preferences")
          .select("preference_value")
          .eq("preference_key", preferenceKey)
          .is("user_id", null)
          .maybeSingle();

        if (error) {
          console.error("Error loading preference:", error);
          setOrderedItems(items);
          setIsLoading(false);
          return;
        }

        if (data?.preference_value) {
          const orderIds: string[] = data.preference_value as string[];
          const itemMap = new Map(items.map(item => [getItemId(item), item]));
          
          // Reorder based on saved order, add any new items at the end
          const reordered: T[] = [];
          const usedIds = new Set<string>();
          
          for (const id of orderIds) {
            const item = itemMap.get(id);
            if (item) {
              reordered.push(item);
              usedIds.add(id);
            }
          }
          
          // Add any items not in saved order
          for (const item of items) {
            if (!usedIds.has(getItemId(item))) {
              reordered.push(item);
            }
          }
          
          setOrderedItems(reordered);
        } else {
          setOrderedItems(items);
        }
      } catch (error) {
        console.error("Error loading preference:", error);
        setOrderedItems(items);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [items, preferenceKey, getItemId]);

  const updateOrder = useCallback(async (newItems: T[]) => {
    if (!isAdmin) return; // Only admins can update

    setOrderedItems(newItems);
    
    const orderIds = newItems.map(getItemId);
    
    try {
      // Check if shared preference exists
      const { data: existing } = await (supabase as any)
        .from("user_preferences")
        .select("id")
        .eq("preference_key", preferenceKey)
        .is("user_id", null)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await (supabase as any)
          .from("user_preferences")
          .update({
            preference_value: orderIds,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) {
          console.error("Error updating preference:", error);
        }
      } else {
        // Insert new
        const { error } = await (supabase as any)
          .from("user_preferences")
          .insert({
            user_id: null,
            preference_key: preferenceKey,
            preference_value: orderIds,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error inserting preference:", error);
        }
      }
    } catch (error) {
      console.error("Error saving preference:", error);
    }
  }, [preferenceKey, getItemId, isAdmin]);

  const resetOrder = useCallback(async () => {
    if (!isAdmin) return; // Only admins can reset

    setOrderedItems(items);
    
    try {
      await (supabase as any)
        .from("user_preferences")
        .delete()
        .is("user_id", null)
        .eq("preference_key", preferenceKey);
    } catch (error) {
      console.error("Error resetting preference:", error);
    }
  }, [items, preferenceKey, isAdmin]);

  return { orderedItems, updateOrder, resetOrder, isLoading, canEdit: isAdmin };
}
