import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalTrainingTab } from "@/components/training/ExternalTrainingTab";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

export default function ExternalTrainingPage() {
  const { user } = useAuth();
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <ExternalLink className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">External Training</h1>
              <p className="text-muted-foreground">Track external training records</p>
            </div>
          </div>
        </div>
        {companyId && <ExternalTrainingTab companyId={companyId} />}
      </div>
    </AppLayout>
  );
}
