import { WorkflowColumn, isReadyForEnablement } from "@/types/enablement";

export interface EnablementGateResult {
  canCreateArtifacts: boolean;
  reason?: string;
  currentStage: string;
  requiredStages: string[];
}

/**
 * Check if a feature is eligible for enablement artifact creation
 * Features must be in 'documentation', 'ready_for_enablement', or 'published' stage
 */
export function checkEnablementGate(workflowStatus: string): EnablementGateResult {
  const status = workflowStatus as WorkflowColumn;
  const canCreate = isReadyForEnablement(status);
  
  const stageLabels: Record<WorkflowColumn, string> = {
    development_backlog: "Development Backlog",
    in_development: "In Development",
    testing_review: "Testing/Review",
    documentation: "Documentation",
    ready_for_enablement: "Ready for Enablement",
    published: "Published",
    maintenance: "Maintenance",
    archived: "Archived",
  };

  const eligibleStages = ["documentation", "ready_for_enablement", "published"];

  if (canCreate) {
    return {
      canCreateArtifacts: true,
      currentStage: stageLabels[status] || status,
      requiredStages: eligibleStages.map(s => stageLabels[s as WorkflowColumn]),
    };
  }

  return {
    canCreateArtifacts: false,
    reason: `Feature must progress to Documentation stage before enablement artifacts can be created.`,
    currentStage: stageLabels[status] || status,
    requiredStages: eligibleStages.map(s => stageLabels[s as WorkflowColumn]),
  };
}

/**
 * Get workflow stage progression info
 */
export function getWorkflowProgression(currentStatus: string): {
  currentIndex: number;
  totalStages: number;
  stagesRemaining: number;
  nextStage: string | null;
  progressPercentage: number;
} {
  const stages: WorkflowColumn[] = [
    "development_backlog",
    "in_development",
    "testing_review",
    "documentation",
    "ready_for_enablement",
    "published",
  ];

  const stageLabels: Record<string, string> = {
    development_backlog: "Development Backlog",
    in_development: "In Development",
    testing_review: "Testing/Review",
    documentation: "Documentation",
    ready_for_enablement: "Ready for Enablement",
    published: "Published",
  };

  const currentIndex = stages.indexOf(currentStatus as WorkflowColumn);
  const totalStages = stages.length;
  const stagesRemaining = currentIndex >= 0 ? totalStages - currentIndex - 1 : totalStages;
  const nextStage = currentIndex >= 0 && currentIndex < totalStages - 1 
    ? stageLabels[stages[currentIndex + 1]] 
    : null;
  const progressPercentage = currentIndex >= 0 
    ? Math.round(((currentIndex + 1) / totalStages) * 100) 
    : 0;

  return {
    currentIndex,
    totalStages,
    stagesRemaining,
    nextStage,
    progressPercentage,
  };
}
