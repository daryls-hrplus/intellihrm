import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AppraisalInterviewsList } from "@/components/appraisals/AppraisalInterviewsList";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function MssAppraisalInterviewsPage() {
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

        <AppraisalInterviewsList userId={user.id} userRole="manager" />
      </div>
    </AppLayout>
  );
}
