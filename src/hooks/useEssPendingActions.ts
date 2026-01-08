import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SectionBadge {
  count: number;
  label: string;
  variant: "default" | "warning" | "destructive";
}

export interface EssSectionBadges {
  [sectionKey: string]: SectionBadge | null;
}

export function useEssPendingActions() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["ess-pending-actions", user?.id, profile?.company_id],
    queryFn: async (): Promise<EssSectionBadges> => {
      if (!user?.id) return {};

      const badges: EssSectionBadges = {};

      // Fetch pending leave requests
      const { count: pendingLeaveCount } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .eq("status", "pending");

      if (pendingLeaveCount && pendingLeaveCount > 0) {
        badges["Time & Absence"] = {
          count: pendingLeaveCount,
          label: `${pendingLeaveCount} pending`,
          variant: "default",
        };
      }

      // Fetch pending expense claims
      const { count: pendingExpensesCount } = await supabase
        .from("expense_claims")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .eq("status", "submitted");

      if (pendingExpensesCount && pendingExpensesCount > 0) {
        badges["Pay & Benefits"] = {
          count: pendingExpensesCount,
          label: `${pendingExpensesCount} pending`,
          variant: "default",
        };
      }

      // Fetch expiring documents (within 30 days)
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

      const { count: expiringDocsCount } = await supabase
        .from("employee_documents")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .lte("expiry_date", thirtyDaysStr)
        .gte("expiry_date", today);

      if (expiringDocsCount && expiringDocsCount > 0) {
        badges["My Profile"] = {
          count: expiringDocsCount,
          label: `${expiringDocsCount} expiring`,
          variant: "warning",
        };
      }

      // Fetch pending appraisals
      const { count: pendingAppraisalsCount } = await supabase
        .from("appraisal_participants")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .in("status", ["pending", "in_progress"]);

      // Fetch pending review responses (Employee Voice)
      const { count: pendingResponseCount } = await supabase
        .from("appraisal_participants")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .eq("employee_response_status", "pending");

      const totalPerformance = (pendingAppraisalsCount || 0) + (pendingResponseCount || 0);
      
      if (totalPerformance > 0) {
        // Prioritize response required badge if any
        if (pendingResponseCount && pendingResponseCount > 0) {
          badges["Performance"] = {
            count: pendingResponseCount,
            label: `${pendingResponseCount} response${pendingResponseCount > 1 ? 's' : ''} required`,
            variant: "warning",
          };
        } else if (pendingAppraisalsCount && pendingAppraisalsCount > 0) {
          badges["Performance"] = {
            count: pendingAppraisalsCount,
            label: `${pendingAppraisalsCount} active`,
            variant: "default",
          };
        }
      }

      // Fetch pending idp items
      const { count: pendingIdpCount } = await supabase
        .from("individual_development_plans")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .in("status", ["draft", "active"]);

      if (pendingIdpCount && pendingIdpCount > 0) {
        badges["Learning & Development"] = {
          count: pendingIdpCount,
          label: `${pendingIdpCount} active`,
          variant: "default",
        };
      }

      // Fetch pending ESS change requests
      const { count: pendingChangeRequests } = await supabase
        .from("employee_data_change_requests")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .eq("status", "pending");

      const { count: infoRequiredRequests } = await supabase
        .from("employee_data_change_requests")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", user.id)
        .eq("status", "info_required");

      const totalChangeRequests = (pendingChangeRequests || 0) + (infoRequiredRequests || 0);

      if (totalChangeRequests > 0) {
        if (infoRequiredRequests && infoRequiredRequests > 0) {
          badges["Tasks & Approvals"] = {
            count: infoRequiredRequests,
            label: `${infoRequiredRequests} response required`,
            variant: "warning",
          };
        } else {
          badges["Tasks & Approvals"] = {
            count: pendingChangeRequests || 0,
            label: `${pendingChangeRequests} pending`,
            variant: "default",
          };
        }
      }

      // NEW: Fetch unread/unacknowledged announcements for Help & Settings badge
      if (profile?.company_id) {
        const now = new Date().toISOString();
        
        const { data: announcements } = await supabase
          .from("company_announcements")
          .select("id, requires_acknowledgement")
          .eq("company_id", profile.company_id)
          .eq("is_active", true)
          .or(`publish_at.is.null,publish_at.lte.${now}`)
          .or(`expire_at.is.null,expire_at.gte.${now}`);

        const { data: reads } = await supabase
          .from("announcement_reads")
          .select("announcement_id, acknowledged_at")
          .eq("user_id", user.id);

        const readMap = new Map((reads || []).map(r => [r.announcement_id, r]));
        const announcementsList = announcements || [];
        
        // Count unread announcements
        const unreadCount = announcementsList.filter(a => !readMap.has(a.id)).length;
        
        // Count announcements requiring acknowledgement but not yet acknowledged
        const needsAckCount = announcementsList.filter(a => 
          a.requires_acknowledgement && (!readMap.get(a.id)?.acknowledged_at)
        ).length;

        if (needsAckCount > 0) {
          badges["Help & Settings"] = {
            count: needsAckCount,
            label: `${needsAckCount} action required`,
            variant: "warning",
          };
        } else if (unreadCount > 0) {
          badges["Help & Settings"] = {
            count: unreadCount,
            label: `${unreadCount} unread`,
            variant: "default",
          };
        }
      }

      return badges;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
