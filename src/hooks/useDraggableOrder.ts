import { useState, useEffect, useCallback } from "react";

interface UseDraggableOrderOptions<T> {
  items: T[];
  storageKey: string;
  getItemId: (item: T) => string;
}

export function useDraggableOrder<T>({ items, storageKey, getItemId }: UseDraggableOrderOptions<T>) {
  const [orderedItems, setOrderedItems] = useState<T[]>(items);

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem(storageKey);
    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
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
      } catch {
        setOrderedItems(items);
      }
    } else {
      setOrderedItems(items);
    }
  }, [items, storageKey, getItemId]);

  const updateOrder = useCallback((newItems: T[]) => {
    setOrderedItems(newItems);
    const orderIds = newItems.map(getItemId);
    localStorage.setItem(storageKey, JSON.stringify(orderIds));
  }, [storageKey, getItemId]);

  const resetOrder = useCallback(() => {
    localStorage.removeItem(storageKey);
    setOrderedItems(items);
  }, [items, storageKey]);

  return { orderedItems, updateOrder, resetOrder };
}
