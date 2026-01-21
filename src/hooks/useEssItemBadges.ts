import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ActionBadge } from "@/components/ui/GroupedModuleCards";

export interface EssItemBadges {
  [moduleKey: string]: ActionBadge | null;
}

export function useEssItemBadges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ess-item-badges", user?.id],
    queryFn: async (): Promise<EssItemBadges> => {
      if (!user?.id) return {};

      const badges: EssItemBadges = {};

      // Parallel fetch all item-level counts
      const [
        appraisalsResult,
        feedbackResult,
        expensesResult,
        leaveResult,
        documentsResult,
        developmentResult,
      ] = await Promise.all([
        // My Appraisals - pending/in_progress
        supabase
          .from("appraisal_participants")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", user.id)
          .in("status", ["pending", "in_progress"]),

        // My Feedback - pending responses
        supabase
          .from("appraisal_participants")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", user.id)
          .eq("employee_response_status", "pending"),

        // Expenses - pending
        supabase
          .from("expense_claims")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", user.id)
          .eq("status", "submitted"),

        // Leave - pending
        supabase
          .from("leave_requests")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", user.id)
          .eq("status", "pending"),

        // Documents - expiring within 30 days
        (() => {
          const today = new Date().toISOString().split("T")[0];
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

          return supabase
            .from("employee_documents")
            .select("*", { count: "exact", head: true })
            .eq("employee_id", user.id)
            .lte("expiry_date", thirtyDaysStr)
            .gte("expiry_date", today);
        })(),

        // Development plans - active
        supabase
          .from("individual_development_plans")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", user.id)
          .in("status", ["draft", "active"]),
      ]);

      // My Appraisals
      if (appraisalsResult.count && appraisalsResult.count > 0) {
        badges["ess-my-appraisals"] = {
          count: appraisalsResult.count,
          label: `${appraisalsResult.count} active`,
          variant: "default",
        };
      }

      // My Feedback - response required
      if (feedbackResult.count && feedbackResult.count > 0) {
        badges["ess-feedback"] = {
          count: feedbackResult.count,
          label: `${feedbackResult.count} response${feedbackResult.count > 1 ? 's' : ''} required`,
          variant: "warning",
        };
      }

      // Expenses
      if (expensesResult.count && expensesResult.count > 0) {
        badges["ess-expenses"] = {
          count: expensesResult.count,
          label: `${expensesResult.count} pending`,
          variant: "default",
        };
      }

      // Leave
      if (leaveResult.count && leaveResult.count > 0) {
        badges["ess-leave"] = {
          count: leaveResult.count,
          label: `${leaveResult.count} pending`,
          variant: "default",
        };
      }

      // Documents
      if (documentsResult.count && documentsResult.count > 0) {
        badges["ess-documents"] = {
          count: documentsResult.count,
          label: `${documentsResult.count} expiring`,
          variant: "warning",
        };
      }

      // Development
      if (developmentResult.count && developmentResult.count > 0) {
        badges["ess-development"] = {
          count: developmentResult.count,
          label: `${developmentResult.count} active`,
          variant: "default",
        };
      }

      return badges;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
