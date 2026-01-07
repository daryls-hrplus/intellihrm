import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock } from "lucide-react";
import { StepCard } from "./StepCard";
import { ImportDrawer } from "./ImportDrawer";
import { useStepProgress } from "@/hooks/useStepProgress";
import { getStepMapping, getPhaseEstimatedTime, getRequiredStepsCount } from "@/data/implementationMappings";

interface PhaseItem {
  order: number;
  area: string;
  description: string;
}

interface Phase {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  prerequisite?: string;
  items: PhaseItem[];
}

interface WorkspaceTabProps {
  phases: Phase[];
  activePhase: string;
  onPhaseChange: (phaseId: string) => void;
}

export function WorkspaceTab({ phases, activePhase, onPhaseChange }: WorkspaceTabProps) {
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState<string | null>(null);
  const [importStepInfo, setImportStepInfo] = useState<{ phaseId: string; stepOrder: number } | null>(null);
  
  const { 
    isLoading, 
    toggleStepComplete, 
    updateStepNotes,
    isStepComplete, 
    getStepProgress,
    getPhaseProgress,
    getOverallProgress 
  } = useStepProgress();

  const currentPhase = phases.find(p => p.id === activePhase);
  
  const phasesWithItemCount = phases.map(p => ({ id: p.id, itemCount: p.items.length }));
  const overallProgress = getOverallProgress(phasesWithItemCount);
  const phaseProgress = currentPhase ? getPhaseProgress(currentPhase.id, currentPhase.items.length) : null;
  
  const estimatedTime = currentPhase ? getPhaseEstimatedTime(currentPhase.id) : 0;
  const requiredCount = currentPhase ? getRequiredStepsCount(currentPhase.id) : 0;

  const handleImportClick = (phaseId: string, stepOrder: number, importType: string) => {
    setSelectedImportType(importType);
    setImportStepInfo({ phaseId, stepOrder });
    setImportDrawerOpen(true);
  };

  const handleImportComplete = async () => {
    if (importStepInfo) {
      // Optionally mark step as complete after import
      await toggleStepComplete(importStepInfo.phaseId, importStepInfo.stepOrder, true);
    }
    setImportDrawerOpen(false);
    setSelectedImportType(null);
    setImportStepInfo(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Phase Navigation with Progress */}
      <div className="lg:col-span-1 space-y-4">
        {/* Overall Progress */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{overallProgress.percent}%</span>
          </div>
          <Progress value={overallProgress.percent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {overallProgress.completed} of {overallProgress.total} steps complete
          </p>
        </div>

        {/* Phase List */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 pr-4">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const progress = getPhaseProgress(phase.id, phase.items.length);
              const isComplete = progress.completedSteps === progress.totalSteps && progress.totalSteps > 0;
              
              return (
                <button
                  key={phase.id}
                  onClick={() => onPhaseChange(phase.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activePhase === phase.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isComplete 
                      ? "bg-green-500/20" 
                      : activePhase === phase.id 
                        ? "bg-primary-foreground/20" 
                        : "bg-muted"
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">Phase {index + 1}</p>
                      {progress.percentComplete > 0 && progress.percentComplete < 100 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {progress.percentComplete}%
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs truncate ${
                      activePhase === phase.id 
                        ? "text-primary-foreground/80" 
                        : "text-muted-foreground"
                    }`}>
                      {phase.title.replace(`Phase ${index + 1}: `, "")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Phase Content */}
      <div className="lg:col-span-3">
        {currentPhase && (
          <div className="space-y-4">
            {/* Phase Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <currentPhase.icon className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">{currentPhase.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentPhase.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>~{Math.round(estimatedTime / 60)}h {estimatedTime % 60}m</span>
                </div>
                <Badge variant="outline">
                  {requiredCount} required
                </Badge>
              </div>
            </div>

            {/* Phase Progress */}
            {phaseProgress && (
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Phase Progress</span>
                  <span className="text-sm">{phaseProgress.completedSteps}/{phaseProgress.totalSteps} steps</span>
                </div>
                <Progress value={phaseProgress.percentComplete} className="h-2" />
              </div>
            )}

            {currentPhase.prerequisite && (
              <Badge variant="outline" className="w-fit">
                Prerequisite: {currentPhase.prerequisite}
              </Badge>
            )}

            {/* Step Cards with Sub-Section Headers */}
            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-3">
                {currentPhase.items.map((item, index) => {
                  const mapping = getStepMapping(currentPhase.id, item.order);
                  const stepProgress = getStepProgress(currentPhase.id, item.order);
                  
                  // Check if this is the first item of a new sub-section
                  const previousMapping = index > 0 ? getStepMapping(currentPhase.id, currentPhase.items[index - 1].order) : null;
                  const showSubSectionHeader = mapping?.subSection && mapping.subSection !== previousMapping?.subSection;
                  
                  return (
                    <div key={item.order}>
                      {showSubSectionHeader && (
                        <div className="flex items-center gap-2 py-3 mt-2 first:mt-0">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                            {mapping.subSection}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      )}
                      <StepCard
                        phaseId={currentPhase.id}
                        step={item}
                        mapping={mapping}
                        stepProgress={stepProgress}
                        isComplete={isStepComplete(currentPhase.id, item.order)}
                        isLoading={isLoading}
                        onToggleComplete={(complete) => toggleStepComplete(currentPhase.id, item.order, complete)}
                        onUpdateNotes={(notes) => updateStepNotes(currentPhase.id, item.order, notes)}
                        onImportClick={mapping?.importType ? () => handleImportClick(currentPhase.id, item.order, mapping.importType!) : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Import Drawer */}
      <ImportDrawer
        open={importDrawerOpen}
        onOpenChange={setImportDrawerOpen}
        importType={selectedImportType}
        onComplete={handleImportComplete}
      />
    </div>
  );
}
