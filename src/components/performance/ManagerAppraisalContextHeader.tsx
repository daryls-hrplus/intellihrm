import { format, differenceInDays, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Briefcase, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  FileCheck
} from "lucide-react";

interface ManagerAppraisalContextHeaderProps {
  employeeName: string;
  positionTitle: string | null;
  departmentName: string | null;
  performancePeriodStart: string | null;
  performancePeriodEnd: string | null;
  evaluationDeadline: string | null;
  selfAssessmentSubmittedAt: string | null;
}

export function ManagerAppraisalContextHeader({
  employeeName,
  positionTitle,
  departmentName,
  performancePeriodStart,
  performancePeriodEnd,
  evaluationDeadline,
  selfAssessmentSubmittedAt,
}: ManagerAppraisalContextHeaderProps) {
  // Calculate days until manager deadline
  const getDaysRemaining = () => {
    if (!evaluationDeadline) return null;
    const deadline = parseISO(evaluationDeadline);
    const today = new Date();
    return differenceInDays(deadline, today);
  };

  const daysRemaining = getDaysRemaining();

  // Determine deadline urgency
  const getDeadlineStatus = (): "normal" | "warning" | "critical" | "overdue" => {
    if (daysRemaining === null) return "normal";
    if (daysRemaining < 0) return "overdue";
    if (daysRemaining <= 3) return "critical";
    if (daysRemaining <= 7) return "warning";
    return "normal";
  };

  const deadlineStatus = getDeadlineStatus();

  // Format performance period
  const formatPeriod = () => {
    if (!performancePeriodStart || !performancePeriodEnd) return null;
    const start = format(parseISO(performancePeriodStart), "MMM d, yyyy");
    const end = format(parseISO(performancePeriodEnd), "MMM d, yyyy");
    return `${start} – ${end}`;
  };

  // Format deadline
  const formatDeadline = () => {
    if (!evaluationDeadline) return null;
    return format(parseISO(evaluationDeadline), "MMMM d, yyyy");
  };

  const getDeadlineBadge = () => {
    if (daysRemaining === null) return null;
    
    if (daysRemaining < 0) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? "s" : ""} overdue
        </Badge>
      );
    }
    
    if (daysRemaining === 0) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <Clock className="h-3 w-3 mr-1" />
          Due today
        </Badge>
      );
    }
    
    if (daysRemaining <= 3) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <Clock className="h-3 w-3 mr-1" />
          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
        </Badge>
      );
    }
    
    if (daysRemaining <= 7) {
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30">
          <Clock className="h-3 w-3 mr-1" />
          {daysRemaining} days left
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        {daysRemaining} days left
      </Badge>
    );
  };

  const performancePeriod = formatPeriod();
  const deadline = formatDeadline();

  return (
    <Card className="border-border bg-muted/20 mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Employee Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Employee:</span>
              <span className="font-medium text-foreground">{employeeName}</span>
            </div>
            
            {positionTitle && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Position:</span>
                <span className="font-medium text-foreground">{positionTitle}</span>
              </div>
            )}
            
            {departmentName && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-foreground">{departmentName}</span>
              </div>
            )}

            {/* Self-Assessment Status */}
            <div className="flex items-center gap-2 text-sm">
              <FileCheck className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Self-Assessment:</span>
              {selfAssessmentSubmittedAt ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="font-medium text-success">
                    Submitted {format(parseISO(selfAssessmentSubmittedAt), "MMM d, yyyy")}
                  </span>
                </div>
              ) : (
                <Badge variant="outline" className="text-warning border-warning/30">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
          
          {/* Right Column - Period & Deadline */}
          <div className="space-y-2 md:text-right">
            {performancePeriod && (
              <div className="flex items-center gap-2 text-sm md:justify-end">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Performance Period:</span>
                <span className="font-medium text-foreground">{performancePeriod}</span>
              </div>
            )}
            
            {deadline && (
              <div className="flex items-center gap-2 text-sm md:justify-end flex-wrap">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Evaluation Due:</span>
                <span className={`font-medium ${
                  deadlineStatus === "overdue" || deadlineStatus === "critical" 
                    ? "text-destructive" 
                    : deadlineStatus === "warning" 
                      ? "text-warning" 
                      : "text-foreground"
                }`}>
                  {deadline}
                </span>
                {getDeadlineBadge()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
