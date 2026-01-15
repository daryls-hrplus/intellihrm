import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, User, Calendar, FileText } from "lucide-react";

interface EmployeeInfo {
  id: string;
  fullName: string;
  avatarUrl?: string;
  employeeNumber?: string;
  jobTitle?: string;
  department?: string;
  division?: string;
  section?: string;
}

interface SupervisorInfo {
  id: string;
  fullName: string;
  avatarUrl?: string;
  jobTitle?: string;
}

interface AppraisalInfo {
  eventName: string;
  cycleName?: string;
  startDate: string;
  isPreview?: boolean;
  endDate: string;
  performancePeriodStart?: string;
  performancePeriodEnd?: string;
  status?: string;
}

interface PrintHeaderProps {
  employee: EmployeeInfo;
  supervisor?: SupervisorInfo;
  appraisal: AppraisalInfo;
  companyName?: string;
  companyLogo?: string;
  templateCode?: string;
  templateVersion?: number;
}

export function PrintHeader({
  employee,
  supervisor,
  appraisal,
  companyName,
  companyLogo,
  templateCode,
  templateVersion,
}: PrintHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} — ${formatDate(end)}`;
  };

  return (
    <div className="print-header-section border-b pb-6 mb-6">
      {/* Company Header with Document Info */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="h-12 w-auto" />
          ) : (
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{companyName || "Company Name"}</h1>
            <p className="text-sm text-muted-foreground">Performance Appraisal Form</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <Badge variant="outline" className="text-xs">
            {appraisal.status || "Draft"}
          </Badge>
          {templateCode && (
            <p className="text-xs text-muted-foreground">
              Form: {templateCode}
              {templateVersion && ` v${templateVersion}`}
            </p>
          )}
        </div>
      </div>

      {/* Period Information - Industry Standard Layout */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Performance Period - The work period being evaluated */}
          <div className="border-l-4 border-primary pl-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Performance Period</span>
              {appraisal.isPreview && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-400">
                  SAMPLE
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-0.5">
              Work period being evaluated
            </p>
            <p className="font-medium">
              {appraisal.performancePeriodStart && appraisal.performancePeriodEnd
                ? formatDateRange(appraisal.performancePeriodStart, appraisal.performancePeriodEnd)
                : "Not specified"}
            </p>
            {appraisal.isPreview && (
              <p className="text-xs text-amber-600 italic mt-1">Set in Cycle Setup</p>
            )}
          </div>

          {/* Appraisal Period - The formal review window */}
          <div className="border-l-4 border-muted-foreground/50 pl-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Appraisal Period</span>
              {appraisal.isPreview && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-400">
                  SAMPLE
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-0.5">
              Formal review window
            </p>
            <p className="font-medium">
              {formatDateRange(appraisal.startDate, appraisal.endDate)}
            </p>
            {appraisal.isPreview && (
              <p className="text-xs text-amber-600 italic mt-1">Set in Cycle Setup</p>
            )}
          </div>
        </div>

        {/* Event Info Row */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-muted">
          <div>
            <span className="text-xs text-muted-foreground block">Appraisal Event</span>
            <span className="font-medium text-sm">{appraisal.eventName}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Review Cycle</span>
            <span className="font-medium text-sm">{appraisal.cycleName || "Annual"}</span>
          </div>
        </div>
      </div>

      {/* Employee and Supervisor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employee Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Employee Being Appraised
          </h3>
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 print:h-10 print:w-10">
              <AvatarImage src={employee.avatarUrl} alt={employee.fullName} />
              <AvatarFallback className="text-sm">{getInitials(employee.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5 min-w-0">
              <p className="font-semibold text-base leading-tight">{employee.fullName}</p>
              <p className="text-sm text-primary leading-tight">{employee.jobTitle || "N/A"}</p>
              {employee.employeeNumber && (
                <p className="text-xs text-muted-foreground">ID: {employee.employeeNumber}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {[employee.division, employee.department, employee.section]
                  .filter(Boolean)
                  .join(" › ")}
              </p>
            </div>
          </div>
        </div>

        {/* Supervisor Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Direct Supervisor / Appraiser
          </h3>
          {supervisor ? (
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 print:h-10 print:w-10">
                <AvatarImage src={supervisor.avatarUrl} alt={supervisor.fullName} />
                <AvatarFallback className="text-sm">{getInitials(supervisor.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="font-semibold text-base leading-tight">{supervisor.fullName}</p>
                <p className="text-sm text-primary leading-tight">{supervisor.jobTitle || "N/A"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No supervisor assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
