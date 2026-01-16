import { useState, useMemo, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Award,
  ListChecks,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobCapabilityRequirementsManager } from "@/components/workforce/JobCapabilityRequirementsManager";
import { JobSkillsManager } from "@/components/workforce/JobSkillsManager";
import { JobResponsibilitiesManager } from "@/components/workforce/JobResponsibilitiesManager";
import { JobGoalsManager } from "@/components/workforce/JobGoalsManager";

interface JobConfigStats {
  jobId: string;
  jobName: string;
  jobCode: string;
  isActive: boolean;
  hasCompetencies: boolean;
  hasResponsibilities: boolean;
  hasGoals: boolean;
  hasSkills: boolean;
  competencyCount: number;
  responsibilityCount: number;
  goalCount: number;
  skillCount: number;
  isFullyConfigured: boolean;
}

interface JobQuickConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incompleteJobs: JobConfigStats[];
  companyId: string;
  onConfigurationChanged: () => void;
}

type ConfigTab = "competencies" | "skills" | "responsibilities" | "goals";

export function JobQuickConfigSheet({
  open,
  onOpenChange,
  incompleteJobs,
  companyId,
  onConfigurationChanged,
}: JobQuickConfigSheetProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ConfigTab>("competencies");

  // Auto-select first job when sheet opens or jobs change
  useMemo(() => {
    if (incompleteJobs.length > 0 && (!selectedJobId || !incompleteJobs.find(j => j.jobId === selectedJobId))) {
      setSelectedJobId(incompleteJobs[0].jobId);
    }
  }, [incompleteJobs, selectedJobId]);

  const selectedJob = useMemo(
    () => incompleteJobs.find((j) => j.jobId === selectedJobId),
    [incompleteJobs, selectedJobId]
  );

  const currentIndex = useMemo(
    () => incompleteJobs.findIndex((j) => j.jobId === selectedJobId),
    [incompleteJobs, selectedJobId]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedJobId(incompleteJobs[currentIndex - 1].jobId);
    }
  }, [currentIndex, incompleteJobs]);

  const handleNext = useCallback(() => {
    if (currentIndex < incompleteJobs.length - 1) {
      setSelectedJobId(incompleteJobs[currentIndex + 1].jobId);
    }
  }, [currentIndex, incompleteJobs]);

  // Find the first missing configuration
  const getFirstMissingTab = useCallback((job: JobConfigStats | undefined): ConfigTab => {
    if (!job) return "competencies";
    if (!job.hasCompetencies) return "competencies";
    if (!job.hasSkills) return "skills";
    if (!job.hasResponsibilities) return "responsibilities";
    if (!job.hasGoals) return "goals";
    return "competencies";
  }, []);

  // Auto-select the first missing tab when job changes
  useMemo(() => {
    if (selectedJob) {
      setActiveTab(getFirstMissingTab(selectedJob));
    }
  }, [selectedJob, getFirstMissingTab]);

  const getMissingCount = useCallback((job: JobConfigStats | undefined): number => {
    if (!job) return 4;
    let count = 0;
    if (!job.hasCompetencies) count++;
    if (!job.hasSkills) count++;
    if (!job.hasResponsibilities) count++;
    if (!job.hasGoals) count++;
    return count;
  }, []);

  const handleSheetClose = useCallback(() => {
    onConfigurationChanged();
    onOpenChange(false);
  }, [onConfigurationChanged, onOpenChange]);

  if (incompleteJobs.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[600px] md:w-[700px] lg:w-[800px] xl:w-[900px] p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">
                Configure Job
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {incompleteJobs.length} job{incompleteJobs.length !== 1 ? "s" : ""} need configuration
              </SheetDescription>
            </div>
          </div>

          {/* Job Selector */}
          <div className="mt-4">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select a job to configure" />
              </SelectTrigger>
              <SelectContent>
                {incompleteJobs.map((job) => (
                  <SelectItem key={job.jobId} value={job.jobId}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.jobName}</span>
                      <span className="text-muted-foreground text-xs">
                        ({job.jobCode})
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-2 text-xs",
                          getMissingCount(job) > 2
                            ? "border-destructive/50 text-destructive"
                            : "border-amber-500/50 text-amber-600"
                        )}
                      >
                        {getMissingCount(job)} missing
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Badges */}
          {selectedJob && (
            <div className="flex flex-wrap gap-2 mt-3">
              <StatusBadge
                label="Competencies"
                hasConfig={selectedJob.hasCompetencies}
                count={selectedJob.competencyCount}
              />
              <StatusBadge
                label="Skills"
                hasConfig={selectedJob.hasSkills}
                count={selectedJob.skillCount}
              />
              <StatusBadge
                label="Responsibilities"
                hasConfig={selectedJob.hasResponsibilities}
                count={selectedJob.responsibilityCount}
              />
              <StatusBadge
                label="Goals"
                hasConfig={selectedJob.hasGoals}
                count={selectedJob.goalCount}
              />
            </div>
          )}
        </SheetHeader>

        {/* Tabs Content */}
        {selectedJob && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ConfigTab)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b px-6 py-2 bg-background">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="competencies" className="text-xs sm:text-sm">
                  <Award className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
                  Competencies
                  {!selectedJob.hasCompetencies && (
                    <AlertCircle className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs sm:text-sm">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
                  Skills
                  {!selectedJob.hasSkills && (
                    <AlertCircle className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="responsibilities" className="text-xs sm:text-sm">
                  <ListChecks className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
                  Responsibilities
                  {!selectedJob.hasResponsibilities && (
                    <AlertCircle className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="goals" className="text-xs sm:text-sm">
                  <Target className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
                  Goals
                  {!selectedJob.hasGoals && (
                    <AlertCircle className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="competencies" className="mt-0">
                  <JobCapabilityRequirementsManager
                    jobId={selectedJob.jobId}
                    companyId={companyId}
                  />
                </TabsContent>
                <TabsContent value="skills" className="mt-0">
                  <JobSkillsManager
                    jobId={selectedJob.jobId}
                    companyId={companyId}
                  />
                </TabsContent>
                <TabsContent value="responsibilities" className="mt-0">
                  <JobResponsibilitiesManager
                    jobId={selectedJob.jobId}
                    companyId={companyId}
                  />
                </TabsContent>
                <TabsContent value="goals" className="mt-0">
                  <JobGoalsManager
                    jobId={selectedJob.jobId}
                    companyId={companyId}
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        )}

        {/* Navigation Footer */}
        <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {incompleteJobs.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex >= incompleteJobs.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface StatusBadgeProps {
  label: string;
  hasConfig: boolean;
  count: number;
}

function StatusBadge({ label, hasConfig, count }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 text-xs",
        hasConfig
          ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/5"
          : "border-amber-500/50 text-amber-600 bg-amber-500/5"
      )}
    >
      {hasConfig ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {label}
      {hasConfig && <span className="text-muted-foreground">({count})</span>}
    </Badge>
  );
}
