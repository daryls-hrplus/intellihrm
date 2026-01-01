import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  PlayCircle,
  AlertCircle,
  ExternalLink,
  Hand,
  Zap,
  SkipForward,
  RefreshCw
} from "lucide-react";
import { 
  useClientProvisioning, 
  useProvisioningTasks,
  type DemoRegistration,
  type ProvisioningTask,
  type ProvisioningTaskStatus
} from "@/hooks/useClientProvisioning";
import { formatDistanceToNow } from "date-fns";

const TASK_STATUS_CONFIG: Record<ProvisioningTaskStatus, { 
  label: string; 
  color: string; 
  icon: React.ElementType;
  bgColor: string;
}> = {
  pending: { label: "Pending", color: "text-muted-foreground", icon: Clock, bgColor: "bg-muted" },
  in_progress: { label: "In Progress", color: "text-warning", icon: Loader2, bgColor: "bg-warning/10" },
  completed: { label: "Completed", color: "text-success", icon: CheckCircle2, bgColor: "bg-success/10" },
  failed: { label: "Failed", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  skipped: { label: "Skipped", color: "text-muted-foreground", icon: SkipForward, bgColor: "bg-muted" },
};

export default function ClientProvisioningPage() {
  const { id } = useParams<{ id: string }>();
  const { getRegistrationById, updateRegistration } = useClientProvisioning();
  const { tasks, isLoading: tasksLoading, executeAutomatedTask, completeManualTask, skipTask, getProgress } = useProvisioningTasks(id);
  
  const [registration, setRegistration] = useState<DemoRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [completeDialogTask, setCompleteDialogTask] = useState<ProvisioningTask | null>(null);
  const [skipDialogTask, setSkipDialogTask] = useState<ProvisioningTask | null>(null);
  const [projectId, setProjectId] = useState("");
  const [skipReason, setSkipReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await getRegistrationById(id);
      setRegistration(data);
      setIsLoading(false);
    };
    fetchData();
  }, [id, getRegistrationById]);

  const progress = getProgress();

  const handleExecuteAutomated = async (task: ProvisioningTask) => {
    setExecutingTaskId(task.id);
    try {
      await executeAutomatedTask(task);
    } finally {
      setExecutingTaskId(null);
    }
  };

  const handleCompleteManual = async () => {
    if (!completeDialogTask) return;
    
    const metadata: Record<string, unknown> = {};
    if (completeDialogTask.task_type === "create_project" && projectId) {
      metadata.lovable_project_id = projectId;
      // Also update registration
      if (registration) {
        await updateRegistration(registration.id, { lovable_project_id: projectId });
      }
    }
    
    await completeManualTask(completeDialogTask.id, JSON.stringify(metadata));
    setCompleteDialogTask(null);
    setProjectId("");
  };

  const handleSkip = async () => {
    if (!skipDialogTask || !skipReason) return;
    await skipTask(skipDialogTask.id, skipReason);
    setSkipDialogTask(null);
    setSkipReason("");
  };

  const getNextTask = () => {
    return tasks.find(t => t.status === "pending" || t.status === "in_progress");
  };

  const isAllComplete = tasks.length > 0 && tasks.every(t => t.status === "completed" || t.status === "skipped");

  if (isLoading || tasksLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!registration) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Registration Not Found</h2>
          <Button asChild>
            <NavLink to="/admin/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Registry
            </NavLink>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <NavLink to={`/admin/clients/${id}`}>
                <ArrowLeft className="h-4 w-4" />
              </NavLink>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Provision: {registration.company_name}</h1>
                <p className="text-muted-foreground">
                  Step-by-step client onboarding workflow
                </p>
              </div>
            </div>
          </div>
          {isAllComplete && (
            <Badge className="bg-success/10 text-success gap-1 text-sm py-1 px-3">
              <CheckCircle2 className="h-4 w-4" />
              Provisioning Complete
            </Badge>
          )}
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Progress: {progress.completed} of {progress.total} tasks completed
              </span>
              <span className="text-sm font-medium">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Provisioning Tasks</CardTitle>
            <CardDescription>
              Complete each task in order to provision the client's instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task, index) => {
                const statusConfig = TASK_STATUS_CONFIG[task.status];
                const StatusIcon = statusConfig.icon;
                const isCurrentTask = task === getNextTask();
                const canExecute = task.status === "pending" || task.status === "failed";
                const isExecuting = executingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`relative flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      isCurrentTask ? "border-primary bg-primary/5" : ""
                    } ${task.status === "completed" ? "bg-success/5" : ""}`}
                  >
                    {/* Step Number */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusConfig.bgColor}`}>
                      {task.status === "in_progress" ? (
                        <Loader2 className={`h-5 w-5 animate-spin ${statusConfig.color}`} />
                      ) : (
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{task.task_name}</h4>
                        {task.is_manual && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Hand className="h-3 w-3" />
                            Manual
                          </Badge>
                        )}
                        {!task.is_manual && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Zap className="h-3 w-3" />
                            Automated
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Step {task.task_order} of {tasks.length}
                      </p>

                      {task.error_message && (
                        <p className="mt-2 text-sm text-destructive bg-destructive/10 rounded px-2 py-1">
                          Error: {task.error_message}
                        </p>
                      )}

                      {task.completed_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Completed {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {canExecute && (
                        <>
                          {task.is_manual ? (
                            <Button
                              size="sm"
                              onClick={() => setCompleteDialogTask(task)}
                              disabled={isExecuting}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Complete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteAutomated(task)}
                              disabled={isExecuting}
                            >
                              {isExecuting ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : task.status === "failed" ? (
                                <RefreshCw className="mr-1 h-4 w-4" />
                              ) : (
                                <PlayCircle className="mr-1 h-4 w-4" />
                              )}
                              {task.status === "failed" ? "Retry" : "Run"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSkipDialogTask(task)}
                            disabled={isExecuting}
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < tasks.length - 1 && (
                      <div className="absolute left-9 top-14 h-4 w-0.5 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links */}
        <Card>
          <CardHeader>
            <CardTitle>Helpful Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="link" className="h-auto p-0" asChild>
              <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Lovable Dashboard (for project creation)
              </a>
            </Button>
            <br />
            <Button variant="link" className="h-auto p-0" asChild>
              <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Cloudflare Dashboard (for DNS verification)
              </a>
            </Button>
            <br />
            <Button variant="link" className="h-auto p-0" asChild>
              <NavLink to="/admin/implementation-handbook">
                <ExternalLink className="mr-2 h-4 w-4" />
                Implementation Handbook
              </NavLink>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Complete Manual Task Dialog */}
      <Dialog open={!!completeDialogTask} onOpenChange={() => setCompleteDialogTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task: {completeDialogTask?.task_name}</DialogTitle>
            <DialogDescription>
              Confirm that you have manually completed this task.
            </DialogDescription>
          </DialogHeader>
          
          {completeDialogTask?.task_type === "create_project" && (
            <div className="space-y-2">
              <Label htmlFor="projectId">Lovable Project ID</Label>
              <Input
                id="projectId"
                placeholder="e.g., abc123-client-name"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the project ID from the Lovable dashboard after creating the remix.
              </p>
            </div>
          )}

          {completeDialogTask?.task_type === "enable_cloud" && (
            <p className="text-sm text-muted-foreground">
              Ensure you have enabled Lovable Cloud in the project settings before marking complete.
            </p>
          )}

          {completeDialogTask?.task_type === "connect_domain" && (
            <p className="text-sm text-muted-foreground">
              Ensure you have connected the subdomain ({registration?.assigned_subdomain || registration?.preferred_subdomain}.intellihrm.com) 
              in the Lovable project's Domain settings.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteManual}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Task Dialog */}
      <Dialog open={!!skipDialogTask} onOpenChange={() => setSkipDialogTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Task: {skipDialogTask?.task_name}</DialogTitle>
            <DialogDescription>
              Please provide a reason for skipping this task.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="skipReason">Reason</Label>
            <Input
              id="skipReason"
              placeholder="e.g., Client will handle this themselves"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialogTask(null)}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSkip}
              disabled={!skipReason}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
