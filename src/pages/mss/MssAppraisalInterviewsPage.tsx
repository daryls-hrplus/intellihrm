import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AppraisalInterviewsList } from "@/components/appraisals/AppraisalInterviewsList";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useLanguage } from "@/hooks/useLanguage";

export default function MssAppraisalInterviewsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { navigateToList } = useWorkspaceNavigation();

  if (!user) return null;

  const handleBackToMss = () => {
    navigateToList({
      route: "/mss",
      title: t("mss.title"),
      moduleCode: "mss",
      icon: LayoutGrid,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToMss}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('mss.backToMss')}
        </Button>

        <AppraisalInterviewsList userId={user.id} userRole="manager" />
      </div>
    </AppLayout>
  );
}