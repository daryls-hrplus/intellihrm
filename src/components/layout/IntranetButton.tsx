import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function IntranetButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      // Subscribe to real-time updates
      const channel = supabase
        .channel("company-announcements-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "company_announcements",
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    // Get active announcements from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const now = new Date().toISOString();

    const { count, error } = await supabase
      .from("company_announcements")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", sevenDaysAgo.toISOString())
      .or(`publish_at.is.null,publish_at.lte.${now}`)
      .or(`expire_at.is.null,expire_at.gte.${now}`);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  return (
    <button
      onClick={() => navigate("/intranet")}
      className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-accent"
    >
      <Newspaper className="h-4 w-4" />
      Intranet
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
