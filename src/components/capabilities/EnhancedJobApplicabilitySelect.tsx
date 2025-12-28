import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Briefcase, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useJobs, Job, JobRequirementInput } from "@/hooks/useCapabilityJobApplicability";
import { cn } from "@/lib/utils";

interface EnhancedJobApplicabilitySelectProps {
  selectedRequirements: JobRequirementInput[];
  onSelectionChange: (requirements: JobRequirementInput[]) => void;
  companyId?: string | null;
  existingRequirements?: { job_id: string; required_proficiency_level: number; weighting: number | null; is_required: boolean }[];
}

const PROFICIENCY_LEVELS = [
  { value: 1, label: "1 - Basic" },
  { value: 2, label: "2 - Developing" },
  { value: 3, label: "3 - Proficient" },
  { value: 4, label: "4 - Advanced" },
  { value: 5, label: "5 - Expert" },
];

export function EnhancedJobApplicabilitySelect({
  selectedRequirements,
  onSelectionChange,
  companyId,
  existingRequirements = [],
}: EnhancedJobApplicabilitySelectProps) {
  const { loading, jobs, fetchJobs } = useJobs();
  const [search, setSearch] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs(companyId || undefined);
  }, [fetchJobs, companyId]);

  const filteredJobs = jobs.filter((job) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      job.name.toLowerCase().includes(searchLower) ||
      job.code.toLowerCase().includes(searchLower)
    );
  });

  const isJobSelected = (jobId: string) => {
    return selectedRequirements.some((r) => r.job_id === jobId);
  };

  const getJobRequirement = (jobId: string): JobRequirementInput | undefined => {
    return selectedRequirements.find((r) => r.job_id === jobId);
  };

  const getExistingRequirement = (jobId: string) => {
    return existingRequirements.find((r) => r.job_id === jobId);
  };

  const toggleJob = (jobId: string) => {
    if (isJobSelected(jobId)) {
      onSelectionChange(selectedRequirements.filter((r) => r.job_id !== jobId));
      if (expandedJobId === jobId) setExpandedJobId(null);
    } else {
      // Use existing values if available, otherwise defaults
      const existing = getExistingRequirement(jobId);
      onSelectionChange([
        ...selectedRequirements,
        {
          job_id: jobId,
          required_proficiency_level: existing?.required_proficiency_level ?? 3,
          weighting: existing?.weighting ?? 10,
          is_required: existing?.is_required ?? true,
          is_preferred: false,
        },
      ]);
      setExpandedJobId(jobId);
    }
  };

  const updateRequirement = (jobId: string, updates: Partial<JobRequirementInput>) => {
    onSelectionChange(
      selectedRequirements.map((r) =>
        r.job_id === jobId ? { ...r, ...updates } : r
      )
    );
  };

  const removeJob = (jobId: string) => {
    onSelectionChange(selectedRequirements.filter((r) => r.job_id !== jobId));
    if (expandedJobId === jobId) setExpandedJobId(null);
  };

  const selectedJobs = jobs.filter((job) => isJobSelected(job.id));

  return (
    <div className="space-y-3">
      <Label>Applicable Jobs</Label>

      {/* Selected jobs with details */}
      {selectedJobs.length > 0 && (
        <div className="space-y-2 mb-3">
          {selectedJobs.map((job) => {
            const req = getJobRequirement(job.id);
            const isExpanded = expandedJobId === job.id;

            return (
              <div
                key={job.id}
                className="border rounded-md p-2 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{job.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {job.code}
                    </Badge>
                    {req?.is_required ? (
                      <Badge variant="default" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Preferred</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJob(job.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && req && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Proficiency Level</Label>
                      <Select
                        value={String(req.required_proficiency_level ?? 3)}
                        onValueChange={(v) =>
                          updateRequirement(job.id, { required_proficiency_level: parseInt(v) })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFICIENCY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={String(level.value)}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Weighting (%)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        className="h-8"
                        value={req.weighting ?? 10}
                        onChange={(e) =>
                          updateRequirement(job.id, {
                            weighting: parseInt(e.target.value) || 10,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Required</Label>
                      <div className="flex items-center h-8">
                        <Switch
                          checked={req.is_required ?? true}
                          onCheckedChange={(checked) =>
                            updateRequirement(job.id, {
                              is_required: checked,
                              is_preferred: !checked,
                            })
                          }
                        />
                        <span className="ml-2 text-xs text-muted-foreground">
                          {req.is_required ? "Required" : "Preferred"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="pl-9"
        />
      </div>

      {/* Job list */}
      <ScrollArea className="h-[180px] border rounded-md p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No jobs found
          </div>
        ) : (
          <div className="space-y-1">
            {filteredJobs.map((job) => {
              const isSelected = isJobSelected(job.id);
              const existingReq = getExistingRequirement(job.id);

              return (
                <div
                  key={job.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer",
                    isSelected && "bg-primary/10"
                  )}
                  onClick={() => toggleJob(job.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleJob(job.id)}
                  />
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">{job.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {job.code}
                  </Badge>
                  {existingReq && !isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Linked on Jobs
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {selectedRequirements.length} job(s) selected
      </p>
    </div>
  );
}
