import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  Briefcase,
  Trash2,
  Plus,
  Loader2,
  Link2,
  AlertCircle,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface LinkedJob {
  id: string;
  job_id: string;
  job_name: string;
  job_code: string;
  weighting: number;
  start_date: string;
  end_date: string | null;
}

interface AvailableJob {
  id: string;
  name: string;
  code: string;
  job_family_name?: string;
}

interface ResponsibilityJobsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responsibilityId: string;
  responsibilityName: string;
  companyId: string;
  linkedJobs: LinkedJob[];
  onUpdate: () => void;
}

export function ResponsibilityJobsDialog({
  open,
  onOpenChange,
  responsibilityId,
  responsibilityName,
  companyId,
  linkedJobs,
  onUpdate,
}: ResponsibilityJobsDialogProps) {
  const [activeTab, setActiveTab] = useState<"linked" | "assign">("linked");
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [defaultWeight, setDefaultWeight] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && activeTab === "assign") {
      fetchAvailableJobs();
    }
  }, [open, activeTab, companyId]);

  const fetchAvailableJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          name,
          code,
          job_families (name)
        `)
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      // Filter out jobs that already have this responsibility
      const linkedJobIds = new Set(linkedJobs.map((lj) => lj.job_id));
      const available = (data || [])
        .filter((job: any) => !linkedJobIds.has(job.id))
        .map((job: any) => ({
          id: job.id,
          name: job.name,
          code: job.code,
          job_family_name: job.job_families?.name,
        }));

      setAvailableJobs(available);
    } catch (error) {
      console.error("Error fetching available jobs:", error);
      toast.error("Failed to load available jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("job_responsibilities")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Removed from job");
      onUpdate();
    } catch (error) {
      console.error("Error removing link:", error);
      toast.error("Failed to remove from job");
    }
  };

  const handleBulkAssign = async () => {
    if (selectedJobs.size === 0) {
      toast.error("Please select at least one job");
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const inserts = Array.from(selectedJobs).map((jobId) => ({
        job_id: jobId,
        responsibility_id: responsibilityId,
        weighting: defaultWeight,
        start_date: today,
        end_date: null,
      }));

      const { error } = await supabase
        .from("job_responsibilities")
        .insert(inserts);

      if (error) {
        if (error.code === "23505") {
          toast.error("Some jobs already have this responsibility assigned");
        } else {
          throw error;
        }
      } else {
        toast.success(`Assigned to ${selectedJobs.size} job(s)`);
        setSelectedJobs(new Set());
        setActiveTab("linked");
        onUpdate();
      }
    } catch (error) {
      console.error("Error bulk assigning:", error);
      toast.error("Failed to assign to jobs");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAvailableJobs = availableJobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (selectedJobs.size === filteredAvailableJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredAvailableJobs.map((j) => j.id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Jobs Using: {responsibilityName}
          </DialogTitle>
          <DialogDescription>
            View and manage which jobs have this responsibility assigned
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linked" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Linked Jobs ({linkedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="assign" className="gap-2">
              <Plus className="h-4 w-4" />
              Assign to Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linked" className="mt-4">
            {linkedJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>This responsibility is not assigned to any jobs yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setActiveTab("assign")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Assign to Jobs
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{job.job_name}</span>
                            <p className="text-xs text-muted-foreground">
                              {job.job_code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.weighting}%</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateForDisplay(job.start_date)} →{" "}
                          {job.end_date
                            ? formatDateForDisplay(job.end_date)
                            : "Ongoing"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLink(job.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="assign" className="mt-4 space-y-4">
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
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Default Weight:</Label>
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

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAvailableJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available jobs to assign</p>
                <p className="text-xs mt-1">
                  All jobs already have this responsibility or no jobs exist
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={
                      selectedJobs.size === filteredAvailableJobs.length &&
                      filteredAvailableJobs.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <span>
                    Select all ({filteredAvailableJobs.length} jobs)
                  </span>
                  {selectedJobs.size > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedJobs.size} selected
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-[300px] border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredAvailableJobs.map((job) => (
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {job.name}
                            </span>
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
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "assign" && selectedJobs.size > 0 && (
            <Button onClick={handleBulkAssign} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Assign to {selectedJobs.size} Job(s)
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
