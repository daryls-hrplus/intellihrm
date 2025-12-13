import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { GoalInterviewsList } from "@/components/goals/GoalInterviewsList";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function EssGoalInterviewsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <NavLink
          to="/ess"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employee Self-Service
        </NavLink>

        <GoalInterviewsList userId={user.id} userRole="employee" />
      </div>
    </AppLayout>
  );
}
