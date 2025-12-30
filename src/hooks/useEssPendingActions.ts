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
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ess-pending-actions", user?.id],
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

      return badges;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
