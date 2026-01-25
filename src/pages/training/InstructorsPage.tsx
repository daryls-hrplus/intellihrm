import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { InstructorsTab } from "@/components/training/InstructorsTab";
import { Users, ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

export default function InstructorsPage() {
  const { user, company } = useAuth();
  const { t } = useLanguage();
  const { navigateToList } = useWorkspaceNavigation();

  const [tabState, setTabState] = useTabState({
    defaultState: { companyId: "" },
  });
  const { companyId } = tabState;

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      if (companyId) return;
      if (company?.id) {
        setTabState({ companyId: company.id });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (data?.company_id) setTabState({ companyId: data.company_id });
    };
    fetchCompany();
  }, [user, company?.id, companyId, setTabState]);

  const breadcrumbItems = [
    { label: t("training.dashboard.title"), href: "/training" },
    { label: t("training.modules.instructors.title") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateToList({
              route: "/training",
              title: t("training.dashboard.title"),
              moduleCode: "training",
              icon: GraduationCap,
            })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("training.modules.instructors.title")}</h1>
              <p className="text-muted-foreground">{t("training.modules.instructors.description")}</p>
            </div>
          </div>
        </div>
        {companyId && <InstructorsTab companyId={companyId} />}
      </div>
    </AppLayout>
  );
}
