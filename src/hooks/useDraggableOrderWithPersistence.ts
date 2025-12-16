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
  const { user } = useAuth();

  // Load saved order from database
  useEffect(() => {
    const loadOrder = async () => {
      if (!user?.id) {
        setOrderedItems(items);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("preference_value")
          .eq("user_id", user.id)
          .eq("preference_key", preferenceKey)
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
  }, [items, preferenceKey, getItemId, user?.id]);

  const updateOrder = useCallback(async (newItems: T[]) => {
    setOrderedItems(newItems);
    
    if (!user?.id) return;

    const orderIds = newItems.map(getItemId);
    
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          preference_key: preferenceKey,
          preference_value: orderIds,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,preference_key"
        });

      if (error) {
        console.error("Error saving preference:", error);
      }
    } catch (error) {
      console.error("Error saving preference:", error);
    }
  }, [preferenceKey, getItemId, user?.id]);

  const resetOrder = useCallback(async () => {
    setOrderedItems(items);
    
    if (!user?.id) return;

    try {
      await supabase
        .from("user_preferences")
        .delete()
        .eq("user_id", user.id)
        .eq("preference_key", preferenceKey);
    } catch (error) {
      console.error("Error resetting preference:", error);
    }
  }, [items, preferenceKey, user?.id]);

  return { orderedItems, updateOrder, resetOrder, isLoading };
}
