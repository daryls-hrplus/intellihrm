import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { RecertificationTab } from "@/components/training/RecertificationTab";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

export default function RecertificationPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (data?.company_id) setCompanyId(data.company_id);
    };
    fetchCompany();
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/training">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <RefreshCw className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("training.modules.recertification.title")}</h1>
              <p className="text-muted-foreground">{t("training.modules.recertification.description")}</p>
            </div>
          </div>
        </div>
        {companyId && <RecertificationTab companyId={companyId} />}
      </div>
    </AppLayout>
  );
}
