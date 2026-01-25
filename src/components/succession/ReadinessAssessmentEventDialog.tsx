import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, User, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReadinessAssessment, ReadinessAssessmentForm } from "@/hooks/succession/useReadinessAssessment";
import { supabase } from "@/integrations/supabase/client";

interface ReadinessAssessmentEventDialogProps {
  companyId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface SuccessionCandidate {
  id: string;
  employee_id: string;
  employee?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  succession_plan?: {
    id: string;
    position?: {
      title: string;
    };
  };
}

export function ReadinessAssessmentEventDialog({
  companyId,
  trigger,
  onSuccess,
}: ReadinessAssessmentEventDialogProps) {
  const { fetchForms, createEvent } = useReadinessAssessment(companyId);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<ReadinessAssessmentForm[]>([]);
  const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
  
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsData, candidatesData] = await Promise.all([
        fetchForms(),
        fetchCandidates(),
      ]);
      setForms(formsData.filter(f => f.is_active));
      setCandidates(candidatesData);
      
      // Auto-select first form if only one exists
      if (formsData.length === 1) {
        setSelectedFormId(formsData[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (): Promise<SuccessionCandidate[]> => {
    try {
      const { data, error } = await (supabase
        .from("succession_candidates" as any)
        .select(`
          id,
          employee_id,
          employee:profiles!succession_candidates_employee_id_fkey(id, full_name, avatar_url),
          succession_plan:succession_plans(id, position:positions(title))
        `)
        .eq("status", "active") as any);

      if (error) throw error;
      return (data || []) as SuccessionCandidate[];
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!selectedCandidateId) {
      toast.error("Please select a candidate");
      return;
    }

    setLoading(true);
    try {
      const result = await createEvent({
        candidate_id: selectedCandidateId,
        form_id: selectedFormId || undefined,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      });

      if (result) {
        toast.success("Readiness assessment initiated");
        setOpen(false);
        resetForm();
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCandidateId("");
    setSelectedFormId("");
    setDueDate(undefined);
    setNotes("");
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Initiate Assessment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate Readiness Assessment</DialogTitle>
          <DialogDescription>
            Start a readiness assessment for a succession candidate. Assigned assessors will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Candidate Selection */}
          <div className="space-y-2">
            <Label>Succession Candidate *</Label>
            <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    <div className="flex items-center gap-2">
                      <span>{candidate.employee?.full_name || "Unknown"}</span>
                      {candidate.succession_plan?.position?.title && (
                        <span className="text-xs text-muted-foreground">
                          → {candidate.succession_plan.position.title}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Candidate Preview */}
          {selectedCandidate && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedCandidate.employee?.avatar_url} />
                    <AvatarFallback>
                      {selectedCandidate.employee?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCandidate.employee?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Candidate for: {selectedCandidate.succession_plan?.position?.title || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Selection */}
          <div className="space-y-2">
            <Label>Assessment Form</Label>
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect based on staff type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto-detect</SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-select based on candidate's staff type
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date (optional)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedCandidateId || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Initiate Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
