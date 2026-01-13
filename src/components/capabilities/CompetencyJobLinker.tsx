import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Search, 
  Briefcase, 
  X, 
  Loader2, 
  Plus, 
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useJobs, useCapabilityJobApplicability, JobCapabilityRequirement } from "@/hooks/useCapabilityJobApplicability";
import { ProficiencyLevelBadge } from "@/components/capabilities/ProficiencyLevelPicker";
import { NavLink } from "react-router-dom";

interface CompetencyJobLinkerProps {
  capabilityId: string;
  capabilityName: string;
  companyId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function CompetencyJobLinker({
  capabilityId,
  capabilityName,
  companyId,
  open,
  onOpenChange,
  onComplete,
}: CompetencyJobLinkerProps) {
  const { loading: loadingJobs, jobs, fetchJobs } = useJobs();
  const { 
    loading: loadingRequirements, 
    requirements, 
    fetchApplicability, 
    addJobRequirement, 
    removeApplicability 
  } = useCapabilityJobApplicability();
  
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchJobs(companyId || undefined);
      fetchApplicability(capabilityId);
    }
  }, [open, capabilityId, companyId, fetchJobs, fetchApplicability]);

  const linkedJobIds = requirements.map((r) => r.job_id);

  const filteredJobs = jobs.filter((job) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      job.name.toLowerCase().includes(searchLower) ||
      job.code.toLowerCase().includes(searchLower)
    );
  });

  const unlinkedJobs = filteredJobs.filter((job) => !linkedJobIds.includes(job.id));

  const handleAddJob = async (jobId: string) => {
    setIsAdding(true);
    const success = await addJobRequirement(capabilityId, {
      job_id: jobId,
      required_proficiency_level: 3,
      weighting: 10,
      is_required: true,
    });
    if (success) {
      await fetchApplicability(capabilityId);
      onComplete?.();
    }
    setIsAdding(false);
  };

  const handleRemoveJob = async (requirementId: string) => {
    setRemovingId(requirementId);
    const success = await removeApplicability(requirementId);
    if (success) {
      await fetchApplicability(capabilityId);
      onComplete?.();
    }
    setRemovingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Manage Job Associations
          </DialogTitle>
          <DialogDescription>
            Link "{capabilityName}" to jobs where this competency is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Currently Linked Jobs */}
          <div>
            <Label className="text-sm font-medium">Linked Jobs ({requirements.length})</Label>
            {loadingRequirements ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : requirements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border rounded-md mt-2">
                <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
                <p className="text-sm">No jobs linked yet</p>
                <p className="text-xs">Add jobs below to link this competency</p>
              </div>
            ) : (
              <ScrollArea className="h-[160px] border rounded-md mt-2 p-2">
                <div className="space-y-2">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{req.job?.name || "Unknown Job"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ProficiencyLevelBadge level={req.required_proficiency_level} size="sm" />
                            <span>Weight: {req.weighting}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <NavLink to={`/workforce/jobs?job=${req.job_id}`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent>View Job</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveJob(req.id)}
                                disabled={removingId === req.id}
                              >
                                {removingId === req.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove from Job</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Add New Jobs */}
          <div>
            <Label className="text-sm font-medium">Add to Jobs</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search available jobs..."
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[160px] border rounded-md mt-2 p-2">
              {loadingJobs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : unlinkedJobs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {search ? "No matching jobs found" : "All jobs are already linked"}
                </div>
              ) : (
                <div className="space-y-1">
                  {unlinkedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{job.name}</span>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {job.code}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleAddJob(job.id)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
