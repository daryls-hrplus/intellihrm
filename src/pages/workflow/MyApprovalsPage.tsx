import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Inbox, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WorkflowApprovalCard } from "@/components/workflow/WorkflowApprovalCard";
import { WorkflowStatusBadge } from "@/components/workflow/WorkflowStatusBadge";
import type { WorkflowInstance, WorkflowStep, WorkflowStepAction } from "@/hooks/useWorkflow";

export default function MyApprovalsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isFromMss = searchParams.get('from') === 'mss';
  const [pendingWorkflows, setPendingWorkflows] = useState<WorkflowInstance[]>([]);
  const [completedWorkflows, setCompletedWorkflows] = useState<WorkflowInstance[]>([]);
  const [allSteps, setAllSteps] = useState<Record<string, WorkflowStep[]>>({});
  const [allActions, setAllActions] = useState<Record<string, WorkflowStepAction[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, [user]);

  const fetchWorkflows = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch pending workflows with origin company info
      const { data: pending } = await supabase
        .from("workflow_instances")
        .select(`
          *,
          template:workflow_templates(name, code, category, allow_return_to_previous, department_id, section_id),
          current_step:workflow_steps(*),
          initiator:profiles!workflow_instances_initiated_by_fkey(full_name, email),
          origin_company:companies!workflow_instances_origin_company_id_fkey(name, code)
        `)
        .in("status", ["pending", "in_progress", "escalated", "returned"])
        .order("created_at", { ascending: false });

      // Fetch completed workflows with origin company info
      const { data: completed } = await supabase
        .from("workflow_instances")
        .select(`
          *,
          template:workflow_templates(name, code, category),
          current_step:workflow_steps(*),
          initiator:profiles!workflow_instances_initiated_by_fkey(full_name, email),
          origin_company:companies!workflow_instances_origin_company_id_fkey(name, code)
        `)
        .in("status", ["approved", "rejected", "cancelled", "auto_terminated"])
        .order("completed_at", { ascending: false })
        .limit(50);

      if (pending) setPendingWorkflows(pending as unknown as WorkflowInstance[]);
      if (completed) setCompletedWorkflows(completed as unknown as WorkflowInstance[]);

      // Fetch steps and actions for all workflows
      const allWorkflows = [...(pending || []), ...(completed || [])];
      const templateIds = [...new Set(allWorkflows.map((w) => w.template_id))];
      const instanceIds = allWorkflows.map((w) => w.id);

      if (templateIds.length > 0) {
        const { data: steps } = await supabase
          .from("workflow_steps")
          .select("*")
          .in("template_id", templateIds)
          .eq("is_active", true)
          .order("step_order");

        if (steps) {
          const stepsByTemplate: Record<string, WorkflowStep[]> = {};
          steps.forEach((step) => {
            if (!stepsByTemplate[step.template_id]) {
              stepsByTemplate[step.template_id] = [];
            }
            stepsByTemplate[step.template_id].push(step as WorkflowStep);
          });
          setAllSteps(stepsByTemplate);
        }
      }

      if (instanceIds.length > 0) {
        const { data: actions } = await supabase
          .from("workflow_step_actions")
          .select(`
            *,
            actor:profiles!workflow_step_actions_actor_id_fkey(full_name, email)
          `)
          .in("instance_id", instanceIds)
          .order("acted_at", { ascending: true });

        if (actions) {
          const actionsByInstance: Record<string, WorkflowStepAction[]> = {};
          actions.forEach((action) => {
            if (!actionsByInstance[action.instance_id]) {
              actionsByInstance[action.instance_id] = [];
            }
            actionsByInstance[action.instance_id].push(action as unknown as WorkflowStepAction);
          });
          setAllActions(actionsByInstance);
        }
      }
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={isFromMss ? [
            { label: "Manager Self-Service", href: "/mss" },
            { label: "My Approvals" },
          ] : [
            { label: "Home", href: "/" },
            { label: "My Approvals" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold">My Approvals</h1>
          <p className="text-muted-foreground">
            Review and action pending workflow requests
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingWorkflows.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingWorkflows.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : pendingWorkflows.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No pending approvals</p>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingWorkflows.map((workflow) => (
                  <WorkflowApprovalCard
                    key={workflow.id}
                    instance={workflow}
                    currentStep={workflow.current_step as WorkflowStep | null}
                    allSteps={allSteps[workflow.template_id] || []}
                    actions={allActions[workflow.id] || []}
                    canAct={true}
                    onActionComplete={fetchWorkflows}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : completedWorkflows.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No completed workflows</p>
                  <p className="text-sm text-muted-foreground">
                    Completed approvals will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedWorkflows.map((workflow) => (
                  <WorkflowApprovalCard
                    key={workflow.id}
                    instance={workflow}
                    currentStep={workflow.current_step as WorkflowStep | null}
                    allSteps={allSteps[workflow.template_id] || []}
                    actions={allActions[workflow.id] || []}
                    canAct={false}
                    showDetails={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
