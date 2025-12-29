import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  RecognitionAnalyticsDashboard, 
  RecognitionLeaderboard 
} from "@/components/recognition";
import { Award, Loader2 } from "lucide-react";

export default function RecognitionAnalyticsPage() {
  const { t } = useLanguage();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs 
          items={[
            { label: t("hrHub.title"), href: "/hr-hub" },
            { label: "Recognition Analytics" },
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Recognition Analytics</h1>
              <p className="text-muted-foreground">
                Insights into employee recognition and engagement
              </p>
            </div>
          </div>
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompanyId ? (
          <div className="space-y-6">
            <RecognitionAnalyticsDashboard companyId={selectedCompanyId} />
            
            <div className="grid gap-6 lg:grid-cols-2">
              <RecognitionLeaderboard companyId={selectedCompanyId} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recognition Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Weekly trend data coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
