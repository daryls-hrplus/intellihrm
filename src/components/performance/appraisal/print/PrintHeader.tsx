import { Badge } from "@/components/ui/badge";
import { Building, Calendar, User } from "lucide-react";

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
  compact?: boolean;
}

export function PrintHeader({
  employee,
  supervisor,
  appraisal,
  companyName,
  companyLogo,
  templateCode,
  templateVersion,
  compact = false,
}: PrintHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const orgPath = [employee.division, employee.department, employee.section]
    .filter(Boolean)
    .join(" › ");

  return (
    <div className="print-header-section border rounded-lg mb-4 bg-white overflow-hidden print:mb-2">
      {/* Row 1: Company + Form Info */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
              <Building className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold leading-tight">{companyName || "Company Name"}</h1>
            <p className="text-xs text-muted-foreground">Performance Appraisal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <Badge variant="outline" className="text-[10px] h-5">
            {appraisal.status || "Draft"}
          </Badge>
          {templateCode && (
            <span className="text-[10px] text-muted-foreground">
              {templateCode}{templateVersion && ` v${templateVersion}`}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Period Info - Condensed */}
      <div className="grid grid-cols-2 divide-x text-xs border-b">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">Performance Period</span>
            {appraisal.isPreview && (
              <Badge variant="outline" className="text-[8px] h-4 text-amber-600 border-amber-300 ml-1">
                SAMPLE
              </Badge>
            )}
          </div>
          <p className="font-medium text-foreground">
            {appraisal.performancePeriodStart && appraisal.performancePeriodEnd
              ? formatDateRange(appraisal.performancePeriodStart, appraisal.performancePeriodEnd)
              : "Not specified"}
          </p>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">Review Period</span>
            {appraisal.isPreview && (
              <Badge variant="outline" className="text-[8px] h-4 text-amber-600 border-amber-300 ml-1">
                SAMPLE
              </Badge>
            )}
          </div>
          <p className="font-medium text-foreground">
            {formatDateRange(appraisal.startDate, appraisal.endDate)}
          </p>
        </div>
      </div>

      {/* Row 3: Event + Cycle */}
      <div className="grid grid-cols-2 divide-x text-xs border-b bg-muted/10">
        <div className="px-3 py-1.5">
          <span className="text-muted-foreground">Event: </span>
          <span className="font-medium">{appraisal.eventName}</span>
        </div>
        <div className="px-3 py-1.5">
          <span className="text-muted-foreground">Cycle: </span>
          <span className="font-medium">{appraisal.cycleName || "Annual"}</span>
        </div>
      </div>

      {/* Row 4: Employee + Supervisor - Table Layout */}
      <div className="grid grid-cols-2 divide-x text-xs">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <User className="h-3 w-3" />
            <span className="font-medium uppercase text-[10px] tracking-wide">Employee</span>
          </div>
          <p className="font-semibold text-sm text-foreground leading-tight">{employee.fullName}</p>
          <p className="text-primary text-xs">{employee.jobTitle || "N/A"}</p>
          <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
            {employee.employeeNumber && <span>ID: {employee.employeeNumber}</span>}
          </div>
          {orgPath && (
            <p className="text-muted-foreground truncate mt-0.5" title={orgPath}>
              {orgPath}
            </p>
          )}
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <User className="h-3 w-3" />
            <span className="font-medium uppercase text-[10px] tracking-wide">Supervisor</span>
          </div>
          {supervisor ? (
            <>
              <p className="font-semibold text-sm text-foreground leading-tight">{supervisor.fullName}</p>
              <p className="text-primary text-xs">{supervisor.jobTitle || "N/A"}</p>
            </>
          ) : (
            <p className="text-muted-foreground italic">Not assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
