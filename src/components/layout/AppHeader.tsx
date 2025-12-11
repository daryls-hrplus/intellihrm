import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Bell, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "./NotificationBell";

export function AppHeader() {
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel("access-requests-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "access_requests",
          },
          () => {
            fetchPendingCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchPendingCount = async () => {
    const { count, error } = await supabase
      .from("access_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (!error && count !== null) {
      setPendingCount(count);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 mb-4">
      {/* User Notifications Bell */}
      <NotificationBell />
      
      {/* Admin Access Requests (separate indicator) */}
      {isAdmin && pendingCount > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <UserPlus className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 bg-popover border shadow-lg z-50">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Access Requests</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
                    <UserPlus className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pending Requests</p>
                    <p className="text-xs text-muted-foreground">
                      {pendingCount} request{pendingCount !== 1 ? "s" : ""} awaiting review
                    </p>
                  </div>
                </div>
                <NavLink
                  to="/admin/access-requests"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Review Requests
                  </Button>
                </NavLink>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
