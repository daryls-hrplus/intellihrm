import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MessageSquarePlus, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DirectReport {
  employee_id: string;
  employee_name: string;
  position_title?: string;
}

interface Goal {
  id: string;
  title: string;
  employee_id: string | null;
}

interface RequestCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directReports: DirectReport[];
  onSuccess?: () => void;
  // Optional: pre-select employee and goal when opened from TeamGoalCard
  preSelectedEmployeeId?: string;
  preSelectedGoalId?: string;
}

export function RequestCheckInDialog({
  open,
  onOpenChange,
  directReports,
  onSuccess,
  preSelectedEmployeeId,
  preSelectedGoalId,
}: RequestCheckInDialogProps) {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [employeeGoals, setEmployeeGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedEmployee(preSelectedEmployeeId || "");
      setSelectedGoal(preSelectedGoalId || "");
      setMessage("");
      setDueDate(addDays(new Date(), 7));
    }
  }, [open, preSelectedEmployeeId, preSelectedGoalId]);

  // Fetch goals when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeGoals(selectedEmployee);
    } else {
      setEmployeeGoals([]);
      setSelectedGoal("");
    }
  }, [selectedEmployee]);

  const fetchEmployeeGoals = async (employeeId: string) => {
    setLoadingGoals(true);
    try {
      const { data, error } = await supabase
        .from("performance_goals")
        .select("id, title, employee_id")
        .eq("employee_id", employeeId)
        .not("status", "eq", "completed")
        .not("status", "eq", "cancelled")
        .order("title");

      if (error) throw error;
      setEmployeeGoals(data || []);
      
      // If preSelectedGoalId is set and matches, select it
      if (preSelectedGoalId && data?.some(g => g.id === preSelectedGoalId)) {
        setSelectedGoal(preSelectedGoalId);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load employee goals");
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedGoal || !dueDate || !user?.id) {
      toast.error("Please select an employee, goal, and due date");
      return;
    }

    setLoading(true);
    try {
      // Get goal's current progress
      const { data: goal } = await supabase
        .from("performance_goals")
        .select("progress_percentage")
        .eq("id", selectedGoal)
        .maybeSingle();

      // Create check-in record with manager request info
      const { error } = await supabase
        .from("goal_check_ins")
        .insert({
          goal_id: selectedGoal,
          employee_id: selectedEmployee,
          manager_id: user.id,
          check_in_type: "scheduled",
          check_in_date: format(dueDate, "yyyy-MM-dd"),
          progress_at_check_in: goal?.progress_percentage || 0,
          status: "pending",
          // Store request message in coaching_notes (manager's field)
          coaching_notes: message ? `[CHECK-IN REQUEST] ${message}` : null,
        });

      if (error) throw error;

      toast.success("Check-in request sent successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error requesting check-in:", error);
      toast.error("Failed to request check-in");
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployeeName = directReports.find(r => r.employee_id === selectedEmployee)?.employee_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Request Check-in
          </DialogTitle>
          <DialogDescription>
            Request a goal check-in from one of your direct reports. They'll receive a notification to submit their update.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {directReports.map((report) => (
                  <SelectItem key={report.employee_id} value={report.employee_id}>
                    {report.employee_name}
                    {report.position_title && (
                      <span className="text-muted-foreground ml-2">
                        ({report.position_title})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal Selection */}
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Select 
              value={selectedGoal} 
              onValueChange={setSelectedGoal}
              disabled={!selectedEmployee || loadingGoals}
            >
              <SelectTrigger id="goal">
                <SelectValue placeholder={
                  !selectedEmployee 
                    ? "Select an employee first" 
                    : loadingGoals 
                      ? "Loading goals..." 
                      : "Select a goal"
                } />
              </SelectTrigger>
              <SelectContent>
                {employeeGoals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
                {employeeGoals.length === 0 && !loadingGoals && selectedEmployee && (
                  <SelectItem value="none" disabled>
                    No active goals found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Check-in Due Date</Label>
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
                  {dueDate ? format(dueDate, "PPP") : "Select a date"}
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

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="What should they focus on in this check-in? Any specific questions or areas to address?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedEmployee || !selectedGoal || !dueDate}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}