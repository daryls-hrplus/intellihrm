import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeGovernmentIds } from "@/components/employee/EmployeeGovernmentIds";
import { IdCard, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function MyGovernmentIdsPage() {
  const { t } = useTranslation();
  const { user, company } = useAuth();

  // Fetch company details including country code
  const { data: companyDetails, isLoading } = useQuery({
    queryKey: ["company-details", company?.id],
    queryFn: async () => {
      if (!company?.id) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("id, country")
        .eq("id", company.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  if (!user?.id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please log in to view your government IDs.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("ess.modules.governmentIds.title", "My Government IDs") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.governmentIds.title", "My Government IDs")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.governmentIds.description", "View and manage your identification documents")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              Identification Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <EmployeeGovernmentIds 
                employeeId={user.id} 
                companyCountryCode={companyDetails?.country || undefined}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
