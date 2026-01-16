import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Briefcase,
  Plus,
  Loader2,
  CheckCircle2,
  Target,
} from "lucide-react";
import { ResponsibilityCategoryBadge, ResponsibilityCategory } from "../ResponsibilityCategoryBadge";

interface Responsibility {
  id: string;
  name: string;
  code: string;
  category: ResponsibilityCategory | null;
}

interface Job {
  id: string;
  name: string;
  code: string;
  job_family_name?: string;
}

interface JobFamily {
  id: string;
  name: string;
}

interface BulkAssignToJobsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  selectedResponsibilities: Responsibility[];
  onComplete: () => void;
}

export function BulkAssignToJobsDialog({
  open,
  onOpenChange,
  companyId,
  selectedResponsibilities,
  onComplete,
}: BulkAssignToJobsDialogProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [defaultWeight, setDefaultWeight] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [existingAssignments, setExistingAssignments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, companyId, selectedResponsibilities]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          id,
          name,
          code,
          job_family_id,
          job_families (name)
        `)
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (jobsError) throw jobsError;

      // Fetch job families
      const { data: familiesData, error: familiesError } = await supabase
        .from("job_families")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (familiesError) throw familiesError;

      // Fetch existing assignments for selected responsibilities
      const responsibilityIds = selectedResponsibilities.map((r) => r.id);
      const { data: existingData, error: existingError } = await supabase
        .from("job_responsibilities")
        .select("job_id, responsibility_id")
        .in("responsibility_id", responsibilityIds);

      if (existingError) throw existingError;

      // Create a set of "jobId-responsibilityId" pairs for quick lookup
      const existingSet = new Set(
        (existingData || []).map(
          (e: any) => `${e.job_id}-${e.responsibility_id}`
        )
      );
      setExistingAssignments(existingSet);

      setJobs(
        (jobsData || []).map((job: any) => ({
          id: job.id,
          name: job.name,
          code: job.code,
          job_family_name: job.job_families?.name,
          job_family_id: job.job_family_id,
        }))
      );
      setJobFamilies(familiesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedJobs.size === 0) {
      toast.error("Please select at least one job");
      return;
    }

    setIsAssigning(true);
    setProgress(0);

    try {
      const today = new Date().toISOString().split("T")[0];
      const inserts: any[] = [];

      // Create insert records, skipping existing assignments
      for (const jobId of selectedJobs) {
        for (const resp of selectedResponsibilities) {
          const key = `${jobId}-${resp.id}`;
          if (!existingAssignments.has(key)) {
            inserts.push({
              job_id: jobId,
              responsibility_id: resp.id,
              weighting: defaultWeight,
              start_date: today,
              end_date: null,
            });
          }
        }
      }

      if (inserts.length === 0) {
        toast.info("All selected combinations already exist");
        setIsAssigning(false);
        return;
      }

      // Insert in batches
      const batchSize = 50;
      let completed = 0;

      for (let i = 0; i < inserts.length; i += batchSize) {
        const batch = inserts.slice(i, i + batchSize);
        const { error } = await supabase
          .from("job_responsibilities")
          .insert(batch);

        if (error) {
          console.error("Batch error:", error);
        }

        completed += batch.length;
        setProgress((completed / inserts.length) * 100);
      }

      toast.success(
        `Assigned ${selectedResponsibilities.length} responsibility(s) to ${selectedJobs.size} job(s)`
      );
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning responsibilities:", error);
      toast.error("Failed to assign responsibilities");
    } finally {
      setIsAssigning(false);
      setProgress(0);
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch =
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily =
      familyFilter === "all" || job.job_family_id === familyFilter;
    return matchesSearch && matchesFamily;
  });

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map((j) => j.id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Bulk Assign Responsibilities to Jobs
          </DialogTitle>
          <DialogDescription>
            Assign {selectedResponsibilities.length} responsibility(s) to
            multiple jobs at once
          </DialogDescription>
        </DialogHeader>

        {/* Selected Responsibilities Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Selected Responsibilities:
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md max-h-[100px] overflow-y-auto">
            {selectedResponsibilities.map((resp) => (
              <Badge key={resp.id} variant="secondary" className="gap-1">
                <ResponsibilityCategoryBadge
                  category={resp.category}
                  size="sm"
                  showIcon={false}
                />
                {resp.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={familyFilter} onValueChange={setFamilyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Families" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Families</SelectItem>
              {jobFamilies.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Weight:</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={defaultWeight}
              onChange={(e) => setDefaultWeight(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={
                  selectedJobs.size === filteredJobs.length &&
                  filteredJobs.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
              <span>Select all ({filteredJobs.length} jobs)</span>
              {selectedJobs.size > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedJobs.size} selected
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[280px] border rounded-md">
              <div className="p-2 space-y-1">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 ${
                      selectedJobs.has(job.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => toggleJobSelection(job.id)}
                  >
                    <Checkbox
                      checked={selectedJobs.has(job.id)}
                      onCheckedChange={() => toggleJobSelection(job.id)}
                    />
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{job.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {job.code}
                        </Badge>
                      </div>
                      {job.job_family_name && (
                        <p className="text-xs text-muted-foreground">
                          {job.job_family_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Progress */}
        {isAssigning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Assigning responsibilities...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isAssigning || selectedJobs.size === 0}
          >
            {isAssigning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Assign to {selectedJobs.size} Job(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
