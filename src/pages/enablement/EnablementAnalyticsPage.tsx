import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnablementContentStatus, useEnablementReleases, useEnablementVideos, useEnablementDAPGuides } from "@/hooks/useEnablementData";

export default function EnablementAnalyticsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");

  const { contentItems } = useEnablementContentStatus();
  const { releases } = useEnablementReleases();
  const { videos } = useEnablementVideos();
  const { guides } = useEnablementDAPGuides();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.company_id) setCompanyId(data.company_id);
    };
    fetchCompany();
  }, [user]);

  const completedContent = contentItems.filter(c => c.workflow_status === 'published').length;
  const inProgressContent = contentItems.filter(c => c.workflow_status === 'in_progress' || c.workflow_status === 'review').length;
  const pendingContent = contentItems.filter(c => c.workflow_status === 'backlog').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/enablement">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Analytics</h1>
              <p className="text-muted-foreground">Track content creation metrics and team performance</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentItems.length}</div>
                  <p className="text-xs text-muted-foreground">Tracked features</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedContent}</div>
                  <p className="text-xs text-muted-foreground">Ready for release</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{inProgressContent}</div>
                  <p className="text-xs text-muted-foreground">Currently being worked on</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">{pendingContent}</div>
                  <p className="text-xs text-muted-foreground">Not yet started</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Releases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{releases.length}</div>
                  <p className="text-xs text-muted-foreground">Total releases tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{videos.length}</div>
                  <p className="text-xs text-muted-foreground">Linked training videos</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">DAP Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guides.length}</div>
                  <p className="text-xs text-muted-foreground">UserGuiding guides linked</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="enablement" reportType="banded" companyId={companyId || undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="enablement" reportType="bi" companyId={companyId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
