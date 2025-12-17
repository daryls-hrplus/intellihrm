import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, MessageSquare, HelpCircle, Newspaper } from "lucide-react";
import { VirtualClock } from "./VirtualClock";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AIAssistantButton } from "./AIAssistantButton";
import { NotificationBell } from "./NotificationBell";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import defaultGroupLogo from "@/assets/default-group-logo.png";
import defaultCompanyLogo from "@/assets/default-company-logo.png";

export function AppHeader() {
  const { t } = useTranslation();
  const { isAdmin, profile, user, company } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [intranetCount, setIntranetCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const groupLogoUrl = company?.company_group?.logo_url || (company?.company_group ? defaultGroupLogo : null);
  const companyLogoUrl = company?.logo_url || defaultCompanyLogo;

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        // Get channels user is member of
        const { data: memberships } = await supabase
          .from("messaging_channel_members")
          .select("channel_id, last_read_at")
          .eq("user_id", user.id);

        if (!memberships || memberships.length === 0) {
          setUnreadMessages(0);
          return;
        }

        let totalUnread = 0;
        for (const membership of memberships) {
          if (membership.last_read_at) {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("channel_id", membership.channel_id)
              .eq("is_deleted", false)
              .neq("sender_id", user.id)
              .gt("created_at", membership.last_read_at);
            
            totalUnread += count || 0;
          }
        }
        setUnreadMessages(totalUnread);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel("header-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch intranet announcement count
  useEffect(() => {
    if (!user) return;

    const fetchIntranetCount = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count, error } = await supabase
        .from("intranet_announcements")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("created_at", sevenDaysAgo.toISOString());

      if (!error && count !== null) {
        setIntranetCount(count);
      }
    };

    fetchIntranetCount();

    const channel = supabase
      .channel("intranet-header-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intranet_announcements",
        },
        () => fetchIntranetCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 -mt-2">
      {/* Company Logos - Left Side */}
      {company && (
        <div className="flex items-center gap-3">
          {groupLogoUrl && (
            <img 
              src={groupLogoUrl} 
              alt={company.company_group?.name || "Group"}
              className="h-14 w-14 rounded-lg border bg-background object-contain p-1.5 shadow-sm"
            />
          )}
          <img 
            src={companyLogoUrl} 
            alt={company.name}
            className="h-14 w-14 rounded-lg border bg-background object-contain p-1.5 shadow-sm"
          />
        </div>
      )}
      
      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
      {/* Trial Banner */}
      <TrialBanner />
      
      {/* AI Assistant */}
      <AIAssistantButton />
      
      {/* Language Switcher */}
      <LanguageSwitcher />
      
      {/* Virtual Clock */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <VirtualClock />
          </div>
        </TooltipTrigger>
        <TooltipContent>{t('navigation.virtualClock')}</TooltipContent>
      </Tooltip>
      
      {/* Intranet Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to="/intranet">
            <Button variant="ghost" size="icon" className="relative">
              <Newspaper className="h-5 w-5" />
              {intranetCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] font-bold"
                >
                  {intranetCount > 9 ? "9+" : intranetCount}
                </Badge>
              )}
            </Button>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent>{t("navigation.intranet")}</TooltipContent>
      </Tooltip>
      
      {/* Notifications Bell */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <NotificationBell />
          </div>
        </TooltipTrigger>
        <TooltipContent>{t("navigation.notifications")}</TooltipContent>
      </Tooltip>
      
      {/* Help Center Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to="/help">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent>{t("navigation.helpCenter")}</TooltipContent>
      </Tooltip>
      
      {/* Messages Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] font-bold"
                >
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </Badge>
              )}
            </Button>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent>{t("navigation.messages")}</TooltipContent>
      </Tooltip>
      
      {/* User Avatar */}
      <NavLink to="/profile">
        <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
      </NavLink>
      
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
              <h4 className="font-semibold text-sm">{t("navigation.accessRequests")}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
                    <UserPlus className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t("navigation.pendingRequests")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("navigation.requestsAwaiting", { count: pendingCount })}
                    </p>
                  </div>
                </div>
                <NavLink
                  to="/admin/access-requests"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    {t("navigation.reviewRequests")}
                  </Button>
                </NavLink>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      </div>
    </div>
  );
}
