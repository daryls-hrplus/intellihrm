import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Pause,
  Calendar,
  Clock,
  Settings2,
  FileText,
  ListChecks,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import type { ModuleImplementation, ImplementationStatus } from "@/types/implementation";
import { toast } from "sonner";

const statusConfig: Record<ImplementationStatus, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600 border-green-200" },
  on_hold: { label: "On Hold", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
};

export default function ImplementationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [implementation, setImplementation] = useState<ModuleImplementation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchImplementation();
    }
  }, [id]);

  const fetchImplementation = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("module_implementations")
        .select(`
          *,
          module:application_modules(
            module_code,
            module_name,
            description,
            icon_name,
            route_path
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setImplementation(data as unknown as ModuleImplementation);
    } catch (err) {
      console.error("Error fetching implementation:", err);
      toast.error("Failed to load implementation details");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: ImplementationStatus) => {
    if (!id) return;
    
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === "in_progress" && implementation?.status === "not_started") {
        updateData.started_at = new Date().toISOString();
      }
      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("module_implementations")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      
      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
      fetchImplementation();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!implementation) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Implementation Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The requested implementation could not be found.
              </p>
              <Button onClick={() => navigate("/enablement?tab=implementations")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Implementations
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const status = statusConfig[implementation.status];
  const module = implementation.module;
  const progress = implementation.status === "completed" ? 100 
    : implementation.status === "in_progress" ? 45 
    : 0;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Implementations", href: "/enablement?tab=implementations" },
            { label: module?.module_name || "Details" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/enablement?tab=implementations")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {module?.module_name || "Unknown Module"}
                </h1>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {module?.description || "No description available"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {implementation.status === "not_started" && (
              <Button onClick={() => updateStatus("in_progress")}>
                <Play className="h-4 w-4 mr-2" />
                Start Implementation
              </Button>
            )}
            {implementation.status === "in_progress" && (
              <>
                <Button variant="outline" onClick={() => updateStatus("on_hold")}>
                  <Pause className="h-4 w-4 mr-2" />
                  Put On Hold
                </Button>
                <Button onClick={() => updateStatus("completed")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </>
            )}
            {implementation.status === "on_hold" && (
              <Button onClick={() => updateStatus("in_progress")}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <ListChecks className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Features</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {implementation.started_at 
                      ? formatDateForDisplay(implementation.started_at, "MMM d") 
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Started</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {implementation.target_go_live 
                      ? formatDateForDisplay(implementation.target_go_live, "MMM d") 
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Target Go-Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Implementation Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <FileText className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Details</CardTitle>
                <CardDescription>
                  Key information about this module implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Module Code</p>
                    <p className="font-medium">{module?.module_code || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Implementation Order</p>
                    <p className="font-medium">{implementation.implementation_order}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {formatDateForDisplay(implementation.created_at, "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {formatDateForDisplay(implementation.updated_at, "PPP")}
                    </p>
                  </div>
                </div>
                {implementation.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{implementation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Feature Tracking Coming Soon</h3>
                <p className="text-muted-foreground text-center">
                  Track individual feature implementations within this module.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Task Management Coming Soon</h3>
                <p className="text-muted-foreground text-center">
                  Manage implementation tasks and track consultant progress.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
