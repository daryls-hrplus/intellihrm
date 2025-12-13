import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Target
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalInterview } from "@/hooks/useGoalInterviews";

interface GoalInterviewCardProps {
  interview: GoalInterview;
  userRole: "employee" | "manager";
  onConfirm?: () => void;
  onCancel?: (reason: string) => void;
  onReschedule?: () => void;
  onComplete?: (outcome?: string) => void;
  onAddNotes?: (notes: string) => void;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500",
  confirmed: "bg-green-500/10 text-green-500",
  completed: "bg-gray-500/10 text-gray-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const meetingTypeIcons: Record<string, React.ReactNode> = {
  in_person: <MapPin className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
};

export function GoalInterviewCard({
  interview,
  userRole,
  onConfirm,
  onCancel,
  onReschedule,
  onComplete,
}: GoalInterviewCardProps) {
  const scheduledDate = new Date(interview.scheduled_at);
  const isPast = scheduledDate < new Date();
  const canConfirm = interview.status === "scheduled" && userRole === "employee";
  const canComplete = interview.status === "confirmed" && userRole === "manager" && isPast;
  const canReschedule = ["scheduled", "confirmed"].includes(interview.status);
  const canCancel = ["scheduled", "confirmed"].includes(interview.status);

  const getInitials = (fullName?: string | null) => {
    if (!fullName) return "?";
    const parts = fullName.split(" ");
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={interview.employee?.avatar_url || undefined} />
              <AvatarFallback>
                {getInitials(interview.employee?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium">
                {interview.employee?.full_name}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-3 w-3" />
                <span className="line-clamp-1">{interview.goal?.title}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(scheduledDate, "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(scheduledDate, "h:mm a")} ({interview.duration_minutes} min)
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {meetingTypeIcons[interview.meeting_type]}
                <span className="capitalize">{interview.meeting_type.replace("_", " ")}</span>
                {interview.location && <span>• {interview.location}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[interview.status]}>
              {interview.status}
            </Badge>

            {(canConfirm || canComplete || canReschedule || canCancel) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canConfirm && (
                    <DropdownMenuItem onClick={onConfirm}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Attendance
                    </DropdownMenuItem>
                  )}
                  {canComplete && (
                    <DropdownMenuItem onClick={() => onComplete?.()}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  {canReschedule && (
                    <DropdownMenuItem onClick={onReschedule}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                  )}
                  {canCancel && (
                    <DropdownMenuItem 
                      onClick={() => onCancel?.("Cancelled by user")}
                      className="text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {interview.agenda && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              <strong>Agenda:</strong> {interview.agenda}
            </div>
          </div>
        )}

        {interview.meeting_link && interview.meeting_type === "video" && (
          <div className="mt-2">
            <Button variant="outline" size="sm" asChild>
              <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-4 w-4" />
                Join Meeting
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
