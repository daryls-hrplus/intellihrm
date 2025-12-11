import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const employees = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    position: "Senior Software Engineer",
    location: "San Francisco, CA",
    status: "active",
    avatar: "SC",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael.brown@company.com",
    phone: "+1 (555) 234-5678",
    department: "Sales",
    position: "Sales Manager",
    location: "New York, NY",
    status: "active",
    avatar: "MB",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    department: "Marketing",
    position: "Marketing Director",
    location: "Los Angeles, CA",
    status: "active",
    avatar: "ER",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.wilson@company.com",
    phone: "+1 (555) 456-7890",
    department: "Operations",
    position: "Operations Lead",
    location: "Chicago, IL",
    status: "on_leave",
    avatar: "JW",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.thompson@company.com",
    phone: "+1 (555) 567-8901",
    department: "HR",
    position: "HR Business Partner",
    location: "Austin, TX",
    status: "active",
    avatar: "LT",
  },
];

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { logView } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();
  const hasLoggedView = useRef(false);

  // Log view on mount
  useEffect(() => {
    if (!hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('employees_list', undefined, 'Employee Directory', { employee_count: employees.length });
    }
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Workforce", href: "/workforce" },
          { label: "Employees" }
        ]} />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Employees
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your organization's workforce
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-all hover:bg-accent">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          {!canViewPii && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600">
                  <EyeOff className="h-3.5 w-3.5" />
                  PII Hidden
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Personal information is hidden based on your role permissions</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Employee Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee, index) => (
            <div
              key={employee.id}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.position}
                    </p>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className={cn("truncate", !canViewPii && "font-mono text-xs")}>
                    {maskPii(employee.email, "email")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className={cn(!canViewPii && "font-mono text-xs")}>
                    {maskPii(employee.phone, "phone")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className={cn(!canViewPii && "font-mono text-xs")}>
                    {maskPii(employee.location, "text")}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    employee.status === "active"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  )}
                >
                  {employee.status === "active" ? "Active" : "On Leave"}
                </span>
                <button 
                  onClick={() => navigate(`/workforce/employees/${employee.id}`)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
