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

      // Subscribe to real-time updates for both tables
      const companyChannel = supabase
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

      const intranetChannel = supabase
        .channel("intranet-announcements-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "intranet_announcements",
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(companyChannel);
        supabase.removeChannel(intranetChannel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    // Get announcements from the last 7 days from both tables
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const now = new Date().toISOString();

    // Query company_announcements
    const { count: companyCount, error: companyError } = await supabase
      .from("company_announcements")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", sevenDaysAgo.toISOString())
      .or(`publish_at.is.null,publish_at.lte.${now}`)
      .or(`expire_at.is.null,expire_at.gte.${now}`);

    // Query intranet_announcements
    const { count: intranetCount, error: intranetError } = await supabase
      .from("intranet_announcements")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", sevenDaysAgo.toISOString());

    const total = (companyCount || 0) + (intranetCount || 0);
    setUnreadCount(total);
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
