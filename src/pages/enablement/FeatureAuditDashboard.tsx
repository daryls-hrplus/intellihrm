import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Package,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  MousePointer,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnablementContentStatus } from "@/hooks/useEnablementData";
import { isReadyForEnablement } from "@/types/enablement";

interface ModuleAuditStats {
  module_code: string;
  module_name: string;
  total_features: number;
  with_enablement_status: number;
  in_development: number;
  in_testing: number;
  in_documentation: number;
  ready_for_enablement: number;
  published: number;
  doc_coverage: number;
  video_coverage: number;
  scorm_coverage: number;
}

export default function FeatureAuditDashboard() {
  const navigate = useNavigate();
  const { contentItems } = useEnablementContentStatus();

  // Fetch all features grouped by module
  const { data: moduleStats, isLoading } = useQuery({
    queryKey: ["feature-audit-stats"],
    queryFn: async () => {
      // Get all features with module info
      const { data: features, error: featuresError } = await supabase
        .from("application_features")
        .select(`
          id,
          feature_code,
          module_code,
          application_modules!inner(module_name)
        `)
        .eq("is_active", true);

      if (featuresError) throw featuresError;

      // Get all enablement statuses
      const { data: statuses, error: statusError } = await supabase
        .from("enablement_content_status")
        .select("*");

      if (statusError) throw statusError;

      // Create status map
      const statusMap = new Map(
        (statuses || []).map((s) => [s.feature_code, s])
      );

      // Group by module
      const moduleMap = new Map<string, ModuleAuditStats>();

      for (const feature of features || []) {
        const moduleCode = feature.module_code || "unknown";
        const moduleName = (feature.application_modules as any)?.module_name || moduleCode;
        const status = statusMap.get(feature.feature_code);

        if (!moduleMap.has(moduleCode)) {
          moduleMap.set(moduleCode, {
            module_code: moduleCode,
            module_name: moduleName,
            total_features: 0,
            with_enablement_status: 0,
            in_development: 0,
            in_testing: 0,
            in_documentation: 0,
            ready_for_enablement: 0,
            published: 0,
            doc_coverage: 0,
            video_coverage: 0,
            scorm_coverage: 0,
          });
        }

        const stats = moduleMap.get(moduleCode)!;
        stats.total_features++;

        if (status) {
          stats.with_enablement_status++;
          
          // Workflow status tracking
          if (status.workflow_status === "in_development" || status.workflow_status === "development_backlog") {
            stats.in_development++;
          } else if (status.workflow_status === "testing_review") {
            stats.in_testing++;
          } else if (status.workflow_status === "documentation") {
            stats.in_documentation++;
          } else if (status.workflow_status === "ready_for_enablement") {
            stats.ready_for_enablement++;
          } else if (status.workflow_status === "published") {
            stats.published++;
          }

          // Artifact coverage
          if (status.documentation_status === "completed") stats.doc_coverage++;
          if (status.video_status === "completed") stats.video_coverage++;
          if (status.scorm_lite_status === "completed" || status.rise_course_status === "completed") {
            stats.scorm_coverage++;
          }
        }
      }

      return Array.from(moduleMap.values()).sort((a, b) => b.total_features - a.total_features);
    },
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!moduleStats) return null;
    
    return moduleStats.reduce(
      (acc, m) => ({
        total_features: acc.total_features + m.total_features,
        with_enablement_status: acc.with_enablement_status + m.with_enablement_status,
        in_development: acc.in_development + m.in_development,
        in_testing: acc.in_testing + m.in_testing,
        in_documentation: acc.in_documentation + m.in_documentation,
        ready_for_enablement: acc.ready_for_enablement + m.ready_for_enablement,
        published: acc.published + m.published,
        doc_coverage: acc.doc_coverage + m.doc_coverage,
        video_coverage: acc.video_coverage + m.video_coverage,
        scorm_coverage: acc.scorm_coverage + m.scorm_coverage,
      }),
      {
        total_features: 0,
        with_enablement_status: 0,
        in_development: 0,
        in_testing: 0,
        in_documentation: 0,
        ready_for_enablement: 0,
        published: 0,
        doc_coverage: 0,
        video_coverage: 0,
        scorm_coverage: 0,
      }
    );
  }, [moduleStats]);

  // Features ready for enablement artifacts
  const readyForArtifacts = useMemo(() => {
    return contentItems.filter((item) => 
      isReadyForEnablement(item.workflow_status as any)
    );
  }, [contentItems]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const trackingPercentage = totals
    ? Math.round((totals.with_enablement_status / totals.total_features) * 100)
    : 0;

  const docCoveragePercentage = totals
    ? Math.round((totals.doc_coverage / totals.total_features) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Feature Audit Dashboard" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Feature Audit Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track feature coverage, workflow status, and documentation gaps
            </p>
          </div>
          <Button onClick={() => navigate("/enablement/feature-database")}>
            View Feature Database
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals?.total_features || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Features</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trackingPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals?.in_development || 0}</p>
                  <p className="text-xs text-muted-foreground">In Development</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals?.in_documentation || 0}</p>
                  <p className="text-xs text-muted-foreground">Documentation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals?.ready_for_enablement || 0}</p>
                  <p className="text-xs text-muted-foreground">Ready for Artifacts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals?.published || 0}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coverage Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Documentation Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{totals?.doc_coverage || 0} / {totals?.total_features || 0}</span>
                  <span className="font-medium">{docCoveragePercentage}%</span>
                </div>
                <Progress value={docCoveragePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-4 w-4 text-rose-500" />
                Video Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{totals?.video_coverage || 0} / {totals?.total_features || 0}</span>
                  <span className="font-medium">
                    {totals ? Math.round((totals.video_coverage / totals.total_features) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={totals ? (totals.video_coverage / totals.total_features) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                SCORM/Rise Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{totals?.scorm_coverage || 0} / {totals?.total_features || 0}</span>
                  <span className="font-medium">
                    {totals ? Math.round((totals.scorm_coverage / totals.total_features) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={totals ? (totals.scorm_coverage / totals.total_features) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ready for Enablement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              Ready for Enablement Artifacts
            </CardTitle>
            <CardDescription>
              Features in Documentation or Ready for Enablement stages - can have artifacts created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {readyForArtifacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No features are ready for enablement artifacts yet</p>
                <p className="text-sm">Features must progress through Testing/Review → Documentation first</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {readyForArtifacts.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/enablement/artifacts?feature=${item.feature_code}`)}
                    >
                      <div>
                        <p className="font-medium">{item.feature_code}</p>
                        <p className="text-xs text-muted-foreground">{item.module_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.workflow_status}</Badge>
                        <Button variant="ghost" size="sm">
                          Create Artifacts
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Module Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Module Breakdown</CardTitle>
            <CardDescription>
              Feature tracking and coverage status by module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead className="text-center">Features</TableHead>
                  <TableHead className="text-center">Tracked</TableHead>
                  <TableHead className="text-center">In Dev</TableHead>
                  <TableHead className="text-center">Testing</TableHead>
                  <TableHead className="text-center">Docs</TableHead>
                  <TableHead className="text-center">Ready</TableHead>
                  <TableHead className="text-center">Published</TableHead>
                  <TableHead className="text-center">Doc %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moduleStats?.map((module) => {
                  const docPct = module.total_features > 0
                    ? Math.round((module.doc_coverage / module.total_features) * 100)
                    : 0;
                  const trackPct = module.total_features > 0
                    ? Math.round((module.with_enablement_status / module.total_features) * 100)
                    : 0;

                  return (
                    <TableRow key={module.module_code}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{module.module_name}</p>
                          <p className="text-xs text-muted-foreground">{module.module_code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{module.total_features}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={trackPct === 100 ? "default" : "secondary"}>
                          {trackPct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{module.in_development}</TableCell>
                      <TableCell className="text-center">{module.in_testing}</TableCell>
                      <TableCell className="text-center">{module.in_documentation}</TableCell>
                      <TableCell className="text-center">{module.ready_for_enablement}</TableCell>
                      <TableCell className="text-center">{module.published}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <Progress value={docPct} className="h-2 w-16" />
                          <span className="text-xs">{docPct}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
