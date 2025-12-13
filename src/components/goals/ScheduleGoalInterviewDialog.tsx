import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleGoalInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: {
    goal_id: string;
    employee_id: string;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    meeting_link?: string;
    meeting_type: string;
    agenda?: string;
  }) => void;
  existingInterview?: {
    id: string;
    goal_id: string;
    employee_id: string;
    scheduled_at: string;
    duration_minutes: number;
    location: string | null;
    meeting_link: string | null;
    meeting_type: string;
    agenda: string | null;
  };
  preselectedGoalId?: string;
  preselectedEmployeeId?: string;
}

interface Goal {
  id: string;
  title: string;
  employee_id: string;
  employee?: {
    id: string;
    full_name: string | null;
  };
}

export function ScheduleGoalInterviewDialog({
  open,
  onOpenChange,
  onSchedule,
  existingInterview,
  preselectedGoalId,
  preselectedEmployeeId,
}: ScheduleGoalInterviewDialogProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState(existingInterview?.goal_id || preselectedGoalId || "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(existingInterview?.employee_id || preselectedEmployeeId || "");
  const [date, setDate] = useState<Date | undefined>(
    existingInterview ? new Date(existingInterview.scheduled_at) : undefined
  );
  const [time, setTime] = useState(
    existingInterview ? format(new Date(existingInterview.scheduled_at), "HH:mm") : "09:00"
  );
  const [duration, setDuration] = useState(existingInterview?.duration_minutes?.toString() || "30");
  const [meetingType, setMeetingType] = useState(existingInterview?.meeting_type || "in_person");
  const [location, setLocation] = useState(existingInterview?.location || "");
  const [meetingLink, setMeetingLink] = useState(existingInterview?.meeting_link || "");
  const [agenda, setAgenda] = useState(existingInterview?.agenda || "");

  useEffect(() => {
    if (open && user) {
      fetchGoals();
    }
  }, [open, user]);

  const fetchGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("performance_goals")
      .select("id, title, employee_id")
      .eq("manager_id", user.id)
      .in("status", ["in_progress", "draft"]);

    if (!error && data) {
      setGoals(data.map(g => ({ ...g, employee: undefined })) as Goal[]);
    }
  };

  const handleGoalChange = (goalId: string) => {
    setSelectedGoalId(goalId);
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setSelectedEmployeeId(goal.employee_id);
    }
  };

  const handleSubmit = () => {
    if (!date || !selectedGoalId || !selectedEmployeeId) return;

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    onSchedule({
      goal_id: selectedGoalId,
      employee_id: selectedEmployeeId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parseInt(duration),
      location: location || undefined,
      meeting_link: meetingLink || undefined,
      meeting_type: meetingType,
      agenda: agenda || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedGoalId(preselectedGoalId || "");
    setSelectedEmployeeId(preselectedEmployeeId || "");
    setDate(undefined);
    setTime("09:00");
    setDuration("30");
    setMeetingType("in_person");
    setLocation("");
    setMeetingLink("");
    setAgenda("");
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingInterview ? "Reschedule Goal Review" : "Schedule Goal Review Meeting"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Goal</Label>
            <Select value={selectedGoalId} onValueChange={handleGoalChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title} - {goal.employee?.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGoal && (
            <div className="text-sm text-muted-foreground">
              Employee: {selectedGoal.employee?.full_name}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {meetingType === "in_person" && (
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Conference Room A"
              />
            </div>
          )}

          {meetingType === "video" && (
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g., https://meet.google.com/..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Agenda (Optional)</Label>
            <Textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Topics to discuss during the goal review..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!date || !selectedGoalId}>
            {existingInterview ? "Reschedule" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
