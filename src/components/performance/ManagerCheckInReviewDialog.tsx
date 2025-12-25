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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  User,
  History,
  Info,
} from "lucide-react";
import { useGoalCheckIns, GoalCheckIn } from "@/hooks/useGoalCheckIns";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ManagerCheckInReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkIn: GoalCheckIn | null;
  onSuccess?: () => void;
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  on_track: CheckCircle,
  ahead: TrendingUp,
  at_risk: AlertCircle,
  blocked: Clock,
};

const STATUS_COLORS: Record<string, string> = {
  on_track: "text-success bg-success/10",
  ahead: "text-info bg-info/10",
  at_risk: "text-warning bg-warning/10",
  blocked: "text-destructive bg-destructive/10",
};

const STATUS_LABELS: Record<string, string> = {
  on_track: "On Track",
  ahead: "Ahead of Schedule",
  at_risk: "At Risk",
  blocked: "Blocked",
};

const MANAGER_ASSESSMENT_OPTIONS = [
  { value: "on_track", label: "On Track", description: "Progress is satisfactory" },
  { value: "needs_attention", label: "Needs Attention", description: "Some concerns to address" },
  { value: "off_track", label: "Off Track", description: "Significant intervention needed" },
];

export function ManagerCheckInReviewDialog({
  open,
  onOpenChange,
  checkIn,
  onSuccess,
}: ManagerCheckInReviewDialogProps) {
  const { submitManagerReview, saving } = useGoalCheckIns();
  
  const [goalTitle, setGoalTitle] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [goalProgress, setGoalProgress] = useState(0);
  const [previousCheckIns, setPreviousCheckIns] = useState<GoalCheckIn[]>([]);
  
  // Manager form state
  const [managerAssessment, setManagerAssessment] = useState("");
  const [managerCommentary, setManagerCommentary] = useState("");
  const [coachingNotes, setCoachingNotes] = useState("");
  const [actionItems, setActionItems] = useState("");

  useEffect(() => {
    if (checkIn) {
      fetchGoalAndEmployee();
      fetchPreviousCheckIns();
      
      // Pre-fill if already has manager input
      setManagerAssessment(checkIn.manager_assessment || "");
      setManagerCommentary(checkIn.manager_commentary || "");
      setCoachingNotes(checkIn.coaching_notes || "");
      setActionItems(checkIn.action_items || "");
    }
  }, [checkIn]);

  const fetchGoalAndEmployee = async () => {
    if (!checkIn) return;
    
    const { data: goal } = await supabase
      .from("performance_goals")
      .select("title, progress_percentage, employee_id")
      .eq("id", checkIn.goal_id)
      .single();
    
    if (goal) {
      setGoalTitle(goal.title);
      setGoalProgress(goal.progress_percentage);
      
      if (goal.employee_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", goal.employee_id)
          .single();
        
        if (profile) {
          setEmployeeName(profile.full_name);
        }
      }
    }
  };

  const fetchPreviousCheckIns = async () => {
    if (!checkIn) return;
    
    const { data } = await supabase
      .from("goal_check_ins")
      .select("*")
      .eq("goal_id", checkIn.goal_id)
      .neq("id", checkIn.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(3);
    
    setPreviousCheckIns((data as GoalCheckIn[]) || []);
  };

  const handleSubmit = async () => {
    if (!checkIn || !managerAssessment || !managerCommentary.trim()) {
      toast.error("Please provide your assessment and feedback");
      return;
    }

    const success = await submitManagerReview(checkIn.id, {
      manager_assessment: managerAssessment,
      manager_commentary: managerCommentary,
      coaching_notes: coachingNotes || undefined,
      action_items: actionItems || undefined,
    });

    if (success) {
      toast.success("Check-in review completed");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const Icon = STATUS_ICONS[status] || Clock;
    return (
      <Badge className={STATUS_COLORS[status] || "bg-muted"}>
        <Icon className="h-3 w-3 mr-1" />
        {STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  if (!checkIn) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Review Check-in Submission
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="space-y-4 pr-4">
              {/* Goal & Employee Summary */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employeeName ? getInitials(employeeName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{employeeName || "Employee"}</span>
                        {getStatusBadge(checkIn.employee_status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Target className="h-3.5 w-3.5" />
                        <span>{goalTitle || "Goal"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Submitted {checkIn.employee_submitted_at 
                              ? formatDistanceToNow(new Date(checkIn.employee_submitted_at), { addSuffix: true })
                              : "recently"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Progress at check-in: </span>
                          <span className="font-medium">{checkIn.progress_at_check_in || 0}%</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={goalProgress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Current: {goalProgress}%</span>
                          <span>Target: 100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee's Submission */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Employee's Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Progress Update</Label>
                    <p className="text-sm mt-1">{checkIn.employee_commentary || "No commentary provided"}</p>
                  </div>
                  
                  {checkIn.achievements && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Key Achievements
                      </Label>
                      <p className="text-sm mt-1">{checkIn.achievements}</p>
                    </div>
                  )}
                  
                  {checkIn.blockers && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        Blockers / Challenges
                      </Label>
                      <p className="text-sm mt-1 text-destructive/80">{checkIn.blockers}</p>
                    </div>
                  )}
                  
                  {checkIn.next_steps && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Next Steps</Label>
                      <p className="text-sm mt-1">{checkIn.next_steps}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Previous Check-ins */}
              {previousCheckIns.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Previous Check-ins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {previousCheckIns.map((prev) => (
                        <div key={prev.id} className="flex items-start gap-3 text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge(prev.employee_status)}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(prev.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{prev.employee_commentary}</p>
                            {prev.manager_assessment && (
                              <p className="text-xs text-primary mt-1">
                                Manager: {prev.manager_assessment.replace("_", " ")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Progress ≠ Rating Reminder */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Progress ≠ Rating:</strong> This review captures progress feedback. 
                  Performance ratings are determined at cycle end during formal review.
                </AlertDescription>
              </Alert>

              {/* Manager Review Form */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Your Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assessment *</Label>
                    <Select
                      value={managerAssessment}
                      onValueChange={setManagerAssessment}
                      disabled={checkIn.status === "completed"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your assessment" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANAGER_ASSESSMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                – {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Feedback *</Label>
                    <Textarea
                      value={managerCommentary}
                      onChange={(e) => setManagerCommentary(e.target.value)}
                      placeholder="Provide specific, constructive feedback on progress..."
                      rows={3}
                      disabled={checkIn.status === "completed"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Coaching Notes</Label>
                    <Textarea
                      value={coachingNotes}
                      onChange={(e) => setCoachingNotes(e.target.value)}
                      placeholder="Any development or coaching guidance..."
                      rows={2}
                      disabled={checkIn.status === "completed"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Action Items</Label>
                    <Textarea
                      value={actionItems}
                      onChange={(e) => setActionItems(e.target.value)}
                      placeholder="List follow-up actions or next steps..."
                      rows={2}
                      disabled={checkIn.status === "completed"}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        {checkIn.status !== "completed" && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !managerAssessment || !managerCommentary.trim()}
            >
              {saving ? "Submitting..." : "Complete Review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
