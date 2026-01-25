import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { GoalInterviewsList } from "@/components/goals/GoalInterviewsList";
import { useLanguage } from "@/hooks/useLanguage";

export default function MssGoalInterviewsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title"), href: "/mss" },
            { label: t("mss.modules.goalInterviews.title", "Goal Interviews") },
          ]}
        />

        <GoalInterviewsList userId={user.id} userRole="manager" />
      </div>
    </AppLayout>
  );
}