import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MapPin, Video, Phone, MoreVertical, Check, X, RefreshCw, CheckCircle, User } from "lucide-react";
import { AppraisalInterview } from "@/hooks/useAppraisalInterviews";
import { cn } from "@/lib/utils";

interface AppraisalInterviewCardProps {
  interview: AppraisalInterview;
  userRole: "employee" | "manager";
  onConfirm?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  onComplete?: () => void;
  onViewDetails?: () => void;
}

export function AppraisalInterviewCard({
  interview,
  userRole,
  onConfirm,
  onCancel,
  onReschedule,
  onComplete,
  onViewDetails,
}: AppraisalInterviewCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Scheduled</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      case "rescheduled":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Rescheduled</Badge>;
      case "no_show":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "video_call":
        return <Video className="h-4 w-4 text-muted-foreground" />;
      case "phone_call":
        return <Phone className="h-4 w-4 text-muted-foreground" />;
      default:
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const scheduledDate = new Date(interview.scheduled_at);
  const isPast = scheduledDate < new Date();
  const canConfirm = interview.status === "scheduled" || interview.status === "rescheduled";
  const canComplete = (interview.status === "confirmed" || interview.status === "scheduled") && isPast;
  const canCancel = interview.status !== "cancelled" && interview.status !== "completed";

  const otherPartyName = userRole === "employee"
    ? interview.participant?.evaluator?.full_name
    : interview.participant?.employee?.full_name;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      interview.status === "cancelled" && "opacity-60"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {otherPartyName || "Unknown"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {interview.participant?.cycle?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(interview.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  View Details
                </DropdownMenuItem>
                {canConfirm && userRole === "employee" && (
                  <DropdownMenuItem onClick={onConfirm}>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Attendance
                  </DropdownMenuItem>
                )}
                {userRole === "manager" && (
                  <>
                    <DropdownMenuItem onClick={onReschedule}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                    {canComplete && (
                      <DropdownMenuItem onClick={onComplete}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Completed
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {canCancel && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onCancel} className="text-destructive">
                      <X className="mr-2 h-4 w-4" />
                      Cancel Interview
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(scheduledDate, "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(scheduledDate, "h:mm a")} ({interview.duration_minutes} min)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {getMeetingTypeIcon(interview.meeting_type)}
          <span className="capitalize">{interview.meeting_type.replace("_", " ")}</span>
          {interview.location && (
            <span className="text-muted-foreground">• {interview.location}</span>
          )}
          {interview.meeting_link && (
            <a
              href={interview.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Join Meeting
            </a>
          )}
        </div>

        {interview.agenda && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">Agenda</p>
            <p className="text-sm line-clamp-2">{interview.agenda}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
