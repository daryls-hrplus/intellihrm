import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { GoalInterviewsList } from "@/components/goals/GoalInterviewsList";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function MssGoalInterviewsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <NavLink
          to="/mss"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Manager Self-Service
        </NavLink>

        <GoalInterviewsList userId={user.id} userRole="manager" />
      </div>
    </AppLayout>
  );
}
