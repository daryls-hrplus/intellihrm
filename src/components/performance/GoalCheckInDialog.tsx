import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  Paperclip,
  Info,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useGoalCheckIns, GoalCheckIn, CreateCheckInData } from "@/hooks/useGoalCheckIns";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { GoalEvidenceAttachment } from "./GoalEvidenceAttachment";
import { useNavigate } from "react-router-dom";
import { EvidenceType } from "@/hooks/capabilities/usePerformanceEvidence";

interface Goal {
  id: string;
  title: string;
  progress_percentage: number;
  employee_id: string;
  assigned_by?: string | null;
  measurement_method?: string | null;
}

// Map measurement methods to suggested evidence types
const MEASUREMENT_TO_EVIDENCE: Record<string, EvidenceType> = {
  quantitative: "metric_achievement",
  qualitative: "document",
  milestone: "deliverable",
  percentage: "metric_achievement",
  rating_scale: "document",
};

interface GoalCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  existingCheckIn?: GoalCheckIn | null;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: "on_track", label: "On Track", icon: CheckCircle, color: "text-green-600" },
  { value: "ahead", label: "Ahead of Schedule", icon: TrendingUp, color: "text-blue-600" },
  { value: "at_risk", label: "At Risk", icon: AlertCircle, color: "text-yellow-600" },
  { value: "blocked", label: "Blocked", icon: Clock, color: "text-red-600" },
];

const MANAGER_ASSESSMENT_OPTIONS = [
  { value: "on_track", label: "On Track" },
  { value: "needs_attention", label: "Needs Attention" },
  { value: "off_track", label: "Off Track" },
];

export function GoalCheckInDialog({
  open,
  onOpenChange,
  goal,
  existingCheckIn,
  onSuccess,
}: GoalCheckInDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createCheckIn, submitEmployeeCheckIn, submitManagerReview, saving } = useGoalCheckIns();
  
  const isManager = user?.id === goal.assigned_by && user?.id !== goal.employee_id;
  const isEmployee = user?.id === goal.employee_id;
  
  // Employee form state
  const [employeeStatus, setEmployeeStatus] = useState<string>("");
  const [employeeCommentary, setEmployeeCommentary] = useState("");
  const [achievements, setAchievements] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  
  // Manager form state
  const [managerAssessment, setManagerAssessment] = useState<string>("");
  const [managerCommentary, setManagerCommentary] = useState("");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [actionItems, setActionItems] = useState("");

  // Populate from existing check-in
  useEffect(() => {
    if (existingCheckIn) {
      setEmployeeStatus(existingCheckIn.employee_status || "");
      setEmployeeCommentary(existingCheckIn.employee_commentary || "");
      setAchievements(existingCheckIn.achievements || "");
      setBlockers(existingCheckIn.blockers || "");
      setNextSteps(existingCheckIn.next_steps || "");
      setManagerAssessment(existingCheckIn.manager_assessment || "");
      setManagerCommentary(existingCheckIn.manager_commentary || "");
      setCoachingNotes(existingCheckIn.coaching_notes || "");
      setActionItems(existingCheckIn.action_items || "");
    }
  }, [existingCheckIn]);

  const handleEmployeeSubmit = async () => {
    if (!employeeStatus || !employeeCommentary.trim()) return;

    if (existingCheckIn) {
      const success = await submitEmployeeCheckIn(existingCheckIn.id, {
        employee_status: employeeStatus,
        employee_commentary: employeeCommentary,
        achievements: achievements || undefined,
        blockers: blockers || undefined,
        next_steps: nextSteps || undefined,
        evidence_urls: evidenceUrl ? [evidenceUrl] : undefined,
      });
      if (success) {
        onOpenChange(false);
        onSuccess?.();
      }
    } else {
      const checkIn = await createCheckIn({
        goal_id: goal.id,
        check_in_type: "ad_hoc",
        progress_at_check_in: goal.progress_percentage,
        employee_status: employeeStatus,
        employee_commentary: employeeCommentary,
        achievements: achievements || undefined,
        blockers: blockers || undefined,
        next_steps: nextSteps || undefined,
        evidence_urls: evidenceUrl ? [evidenceUrl] : undefined,
      } as CreateCheckInData);
      if (checkIn) {
        onOpenChange(false);
        onSuccess?.();
      }
    }
  };

  const handleManagerSubmit = async () => {
    if (!existingCheckIn || !managerAssessment || !managerCommentary.trim()) return;

    const success = await submitManagerReview(existingCheckIn.id, {
      manager_assessment: managerAssessment,
      manager_commentary: managerCommentary,
      coaching_notes: coachingNotes || undefined,
      action_items: actionItems || undefined,
    });
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getStatusBadge = (status: string | null) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    if (!option) return null;
    const Icon = option.icon;
    return (
      <Badge variant="outline" className={option.color}>
        <Icon className="h-3 w-3 mr-1" />
        {option.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {existingCheckIn ? "Goal Check-in" : "New Check-in"}
          </DialogTitle>
        </DialogHeader>

        {/* Goal Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{goal.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Progress:</span>
                    <Progress value={goal.progress_percentage} className="h-2 w-20" />
                    <span className="font-medium">{goal.progress_percentage}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {existingCheckIn?.employee_status && getStatusBadge(existingCheckIn.employee_status)}
                <GoalEvidenceAttachment
                  goalId={goal.id}
                  employeeId={goal.employee_id}
                  goalTitle={goal.title}
                  readOnly={!isEmployee || existingCheckIn?.status === "completed"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress ≠ Rating Reminder */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Progress ≠ Rating:</strong> This check-in captures progress and blockers. 
            Performance ratings are determined at cycle end during formal review.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={isManager && existingCheckIn?.status === "employee_submitted" ? "manager" : "employee"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee" disabled={!isEmployee && existingCheckIn?.status !== "completed"}>
              Employee Input
            </TabsTrigger>
            <TabsTrigger value="manager" disabled={!isManager || !existingCheckIn}>
              Manager Review
            </TabsTrigger>
          </TabsList>

          {/* Employee Section */}
          <TabsContent value="employee" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="status">How is this goal progressing? *</Label>
              <Select
                value={employeeStatus}
                onValueChange={setEmployeeStatus}
                disabled={!isEmployee || existingCheckIn?.status === "completed"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentary">Progress Update *</Label>
              <Textarea
                id="commentary"
                value={employeeCommentary}
                onChange={(e) => setEmployeeCommentary(e.target.value)}
                placeholder="Describe your progress since the last check-in..."
                rows={3}
                disabled={!isEmployee || existingCheckIn?.status === "completed"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="achievements">Key Achievements</Label>
              <Textarea
                id="achievements"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="What have you accomplished?"
                rows={2}
                disabled={!isEmployee || existingCheckIn?.status === "completed"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockers">Blockers or Challenges</Label>
              <Textarea
                id="blockers"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Any obstacles you're facing?"
                rows={2}
                disabled={!isEmployee || existingCheckIn?.status === "completed"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextSteps">Next Steps</Label>
              <Textarea
                id="nextSteps"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="What are your planned next actions?"
                rows={2}
                disabled={!isEmployee || existingCheckIn?.status === "completed"}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="evidence" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Evidence / Attachment URL
                </Label>
                {isEmployee && existingCheckIn?.status !== "completed" && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => {
                      const suggestedType = goal.measurement_method 
                        ? MEASUREMENT_TO_EVIDENCE[goal.measurement_method] || "deliverable"
                        : "deliverable";
                      navigate(`/ess/evidence-portfolio?goalId=${goal.id}&type=${suggestedType}&title=${encodeURIComponent(goal.title)}`);
                      onOpenChange(false);
                    }}
                  >
                    <FolderOpen className="h-3.5 w-3.5 mr-1" />
                    Add to Portfolio
                  </Button>
                )}
              </div>
              <Input
                id="evidence"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Link to supporting document or evidence"
                disabled={!isEmployee || existingCheckIn?.status === "completed"}
              />
              <p className="text-xs text-muted-foreground">
                Or use "Add to Portfolio" for file uploads with full evidence tracking
              </p>
            </div>

            {isEmployee && existingCheckIn?.status !== "completed" && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleEmployeeSubmit}
                  disabled={saving || !employeeStatus || !employeeCommentary.trim()}
                >
                  {saving ? "Submitting..." : existingCheckIn ? "Update Check-in" : "Submit Check-in"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Manager Section */}
          <TabsContent value="manager" className="space-y-4 mt-4">
            {existingCheckIn?.employee_commentary && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Employee's Check-in</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(existingCheckIn.employee_status)}
                  </div>
                  <p className="text-muted-foreground">{existingCheckIn.employee_commentary}</p>
                  {existingCheckIn.achievements && (
                    <div>
                      <span className="font-medium">Achievements: </span>
                      <span className="text-muted-foreground">{existingCheckIn.achievements}</span>
                    </div>
                  )}
                  {existingCheckIn.blockers && (
                    <div>
                      <span className="font-medium text-destructive">Blockers: </span>
                      <span className="text-muted-foreground">{existingCheckIn.blockers}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="assessment">Manager Assessment *</Label>
              <Select
                value={managerAssessment}
                onValueChange={setManagerAssessment}
                disabled={!isManager || existingCheckIn?.status === "completed"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your assessment" />
                </SelectTrigger>
                <SelectContent>
                  {MANAGER_ASSESSMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerCommentary">Manager Feedback *</Label>
              <Textarea
                id="managerCommentary"
                value={managerCommentary}
                onChange={(e) => setManagerCommentary(e.target.value)}
                placeholder="Provide your feedback on progress..."
                rows={3}
                disabled={!isManager || existingCheckIn?.status === "completed"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coaching">Coaching Notes</Label>
              <Textarea
                id="coaching"
                value={coachingNotes}
                onChange={(e) => setCoachingNotes(e.target.value)}
                placeholder="Any coaching or development feedback..."
                rows={2}
                disabled={!isManager || existingCheckIn?.status === "completed"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actions">Action Items</Label>
              <Textarea
                id="actions"
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                placeholder="List any follow-up actions..."
                rows={2}
                disabled={!isManager || existingCheckIn?.status === "completed"}
              />
            </div>

            {isManager && existingCheckIn && existingCheckIn.status !== "completed" && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleManagerSubmit}
                  disabled={saving || !managerAssessment || !managerCommentary.trim()}
                >
                  {saving ? "Submitting..." : "Complete Review"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
