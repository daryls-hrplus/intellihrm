import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, User, CalendarDays } from "lucide-react";

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
}

export function PrintHeader({ employee, supervisor, appraisal, companyName, companyLogo }: PrintHeaderProps) {
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

  return (
    <div className="border-b pb-6 mb-6">
      {/* Company Header */}
      <div className="flex items-center justify-between mb-6">
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
        <div className="text-right">
          <Badge variant="outline" className="text-sm">
            {appraisal.status || "Draft"}
          </Badge>
        </div>
      </div>

      {/* Appraisal Event Info */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Appraisal Event</span>
            <span className="font-medium">{appraisal.eventName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Cycle</span>
            <span className="font-medium">{appraisal.cycleName || "Annual"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Appraisal Period</span>
            <span className="font-medium">
              {formatDate(appraisal.startDate)} - {formatDate(appraisal.endDate)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Performance Period</span>
            <span className="font-medium">
              {appraisal.performancePeriodStart && appraisal.performancePeriodEnd
                ? `${formatDate(appraisal.performancePeriodStart)} - ${formatDate(appraisal.performancePeriodEnd)}`
                : "Same as Appraisal Period"}
            </span>
          </div>
        </div>
      </div>

      {/* Employee and Supervisor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Employee
          </h3>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.avatarUrl} alt={employee.fullName} />
              <AvatarFallback className="text-lg">{getInitials(employee.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-lg">{employee.fullName}</p>
              <p className="text-sm text-primary">{employee.jobTitle || "N/A"}</p>
              {employee.employeeNumber && (
                <p className="text-xs text-muted-foreground">ID: {employee.employeeNumber}</p>
              )}
              <div className="text-xs text-muted-foreground pt-1">
                {[employee.division, employee.department, employee.section]
                  .filter(Boolean)
                  .join(" › ")}
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Direct Supervisor
          </h3>
          {supervisor ? (
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={supervisor.avatarUrl} alt={supervisor.fullName} />
                <AvatarFallback className="text-lg">{getInitials(supervisor.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-lg">{supervisor.fullName}</p>
                <p className="text-sm text-primary">{supervisor.jobTitle || "N/A"}</p>
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
