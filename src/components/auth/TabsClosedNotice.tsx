import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook for showing notification when tabs are closed due to permission changes.
 */
export function useTabsClosedNotice() {
  const showTabsClosedNotice = (closedTabNames: string[]) => {
    if (closedTabNames.length === 0) return;

    const tabList = closedTabNames.length <= 3
      ? closedTabNames.join(", ")
      : `${closedTabNames.slice(0, 3).join(", ")} and ${closedTabNames.length - 3} more`;

    toast.info("Tabs Closed", {
      description: `Some tabs were closed due to role permissions: ${tabList}`,
      duration: 5000,
    });
  };

  return { showTabsClosedNotice };
}
