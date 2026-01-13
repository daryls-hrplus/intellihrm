import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronsUpDown, Check, Briefcase } from "lucide-react";
import { ProficiencyLevelPicker } from "@/components/capabilities/ProficiencyLevelPicker";
import { cn } from "@/lib/utils";

export interface LinkedJobConfig {
  job_id: string;
  job_name: string;
  required_proficiency_level: number;
  weighting: number;
  is_required: boolean;
  is_preferred: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface AvailableJob {
  id: string;
  name: string;
  job_level?: string | null;
}

interface JobLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableJobs: AvailableJob[];
  existingJobIds: string[];
  editingLink?: LinkedJobConfig | null;
  onSave: (config: LinkedJobConfig) => void;
  isSkill?: boolean;
}

export function JobLinkDialog({
  open,
  onOpenChange,
  availableJobs,
  existingJobIds,
  editingLink,
  onSave,
  isSkill = false,
}: JobLinkDialogProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [formData, setFormData] = useState<{
    job_id: string;
    job_name: string;
    required_proficiency_level: number;
    weighting: string;
    is_required: boolean;
    is_preferred: boolean;
    start_date: string;
    end_date: string;
    notes: string;
  }>({
    job_id: "",
    job_name: "",
    required_proficiency_level: 3,
    weighting: "10",
    is_required: true,
    is_preferred: false,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  });

  // Reset form when dialog opens or editingLink changes
  useEffect(() => {
    if (open) {
      if (editingLink) {
        setFormData({
          job_id: editingLink.job_id,
          job_name: editingLink.job_name,
          required_proficiency_level: editingLink.required_proficiency_level,
          weighting: editingLink.weighting.toString(),
          is_required: editingLink.is_required,
          is_preferred: editingLink.is_preferred,
          start_date: editingLink.start_date,
          end_date: editingLink.end_date || "",
          notes: editingLink.notes || "",
        });
      } else {
        setFormData({
          job_id: "",
          job_name: "",
          required_proficiency_level: 3,
          weighting: "10",
          is_required: true,
          is_preferred: false,
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          notes: "",
        });
      }
    }
  }, [open, editingLink]);

  const selectedJob = availableJobs.find((j) => j.id === formData.job_id);

  // Group jobs by job level
  const groupedJobs = useMemo(() => {
    const groups: Record<string, AvailableJob[]> = {};
    availableJobs.forEach((job) => {
      const level = job.job_level || "Other";
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(job);
    });
    return groups;
  }, [availableJobs]);

  const handleSave = () => {
    if (!formData.job_id) return;

    const weighting = parseFloat(formData.weighting);
    if (isNaN(weighting) || weighting < 0 || weighting > 100) {
      return;
    }

    onSave({
      job_id: formData.job_id,
      job_name: formData.job_name,
      required_proficiency_level: formData.required_proficiency_level,
      weighting,
      is_required: formData.is_required,
      is_preferred: formData.is_preferred,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      notes: formData.notes.trim() || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {editingLink ? "Edit Job Link" : "Link to Job"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Selection */}
          <div className="space-y-2">
            <Label>Job *</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                  disabled={!!editingLink}
                >
                  {selectedJob ? (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {selectedJob.name}
                    </div>
                  ) : (
                    "Select job..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search jobs..." />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No job found.</CommandEmpty>
                    {Object.entries(groupedJobs).map(([level, jobs]) => (
                      <CommandGroup key={level} heading={level}>
                        {jobs.map((job) => {
                          const isAlreadyLinked = existingJobIds.includes(job.id) && 
                            job.id !== editingLink?.job_id;
                          return (
                            <CommandItem
                              key={job.id}
                              value={job.name}
                              disabled={isAlreadyLinked}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  job_id: job.id,
                                  job_name: job.name,
                                });
                                setComboboxOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-2",
                                isAlreadyLinked && "opacity-50"
                              )}
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  formData.job_id === job.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>{job.name}</span>
                              {isAlreadyLinked && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Already linked
                                </Badge>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Proficiency Level */}
          <div className="space-y-2">
            <Label>Required {isSkill ? "Proficiency" : "Competency"} Level *</Label>
            <ProficiencyLevelPicker
              value={formData.required_proficiency_level}
              onChange={(value) =>
                setFormData({ ...formData, required_proficiency_level: value || 3 })
              }
              allowNone={false}
              showDescription
              showAppraisalContext
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Weighting */}
          <div className="space-y-2">
            <Label>Weighting (0-100%) *</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.weighting}
              onChange={(e) => setFormData({ ...formData, weighting: e.target.value })}
              placeholder="e.g., 20"
            />
            <p className="text-xs text-muted-foreground">
              Importance of this {isSkill ? "skill" : "competency"} for the job
            </p>
          </div>

          {/* Requirement Type */}
          <div className="space-y-3">
            <Label>Requirement Type</Label>
            <RadioGroup
              value={formData.is_required ? "required" : formData.is_preferred ? "preferred" : "optional"}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  is_required: value === "required",
                  is_preferred: value === "preferred",
                });
              }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="required" id="link-required" className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="link-required" className="font-medium cursor-pointer">
                    Required
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Must-have for the role
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="preferred" id="link-preferred" className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="link-preferred" className="font-medium cursor-pointer">
                    Preferred
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Nice-to-have but not essential
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="optional" id="link-optional" className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="link-optional" className="font-medium cursor-pointer">
                    Optional
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Tracked for development purposes
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional context..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.job_id}>
            {editingLink ? "Save Changes" : "Add Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
