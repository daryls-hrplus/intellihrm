import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { GoalInterviewsList } from "@/components/goals/GoalInterviewsList";
import { useLanguage } from "@/hooks/useLanguage";

export default function EssGoalInterviewsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.ess", "Employee Self-Service"), href: "/ess" },
            { label: t("interviews.goalInterviews", "Goal Interviews") },
          ]}
        />

        <GoalInterviewsList userId={user.id} userRole="employee" />
      </div>
    </AppLayout>
  );
}
