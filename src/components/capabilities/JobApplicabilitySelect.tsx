import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Briefcase, X, Loader2 } from "lucide-react";
import { useJobs, Job } from "@/hooks/useCapabilityJobApplicability";

interface JobApplicabilitySelectProps {
  selectedJobIds: string[];
  onSelectionChange: (jobIds: string[]) => void;
  companyId?: string | null;
}

export function JobApplicabilitySelect({
  selectedJobIds,
  onSelectionChange,
  companyId,
}: JobApplicabilitySelectProps) {
  const { loading, jobs, fetchJobs } = useJobs();
  const [search, setSearch] = useState("");

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

  const toggleJob = (jobId: string) => {
    if (selectedJobIds.includes(jobId)) {
      onSelectionChange(selectedJobIds.filter((id) => id !== jobId));
    } else {
      onSelectionChange([...selectedJobIds, jobId]);
    }
  };

  const removeJob = (jobId: string) => {
    onSelectionChange(selectedJobIds.filter((id) => id !== jobId));
  };

  const selectedJobs = jobs.filter((job) => selectedJobIds.includes(job.id));

  return (
    <div className="space-y-3">
      <Label>Applicable Jobs</Label>
      
      {/* Selected jobs display */}
      {selectedJobs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedJobs.map((job) => (
            <Badge key={job.id} variant="secondary" className="gap-1 pr-1">
              <Briefcase className="h-3 w-3" />
              {job.name}
              <button
                type="button"
                onClick={() => removeJob(job.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
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
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                onClick={() => toggleJob(job.id)}
              >
                <Checkbox
                  checked={selectedJobIds.includes(job.id)}
                  onCheckedChange={() => toggleJob(job.id)}
                />
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">{job.name}</span>
                <Badge variant="outline" className="text-xs">
                  {job.code}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {selectedJobIds.length} job(s) selected
      </p>
    </div>
  );
}
