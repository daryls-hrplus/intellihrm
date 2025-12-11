import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  MapPin,
  Building2,
  EyeOff,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  position_title: string | null;
  department_name: string | null;
  location: string | null;
  is_active: boolean;
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logView } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!hasLoggedView.current && !loading) {
      hasLoggedView.current = true;
      logView('employees_list', undefined, 'Employee Directory', { employee_count: employees.length });
    }
  }, [loading, employees.length]);

  const fetchEmployees = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url');

      if (profilesError) throw profilesError;

      // Fetch employee positions with position and department details
      const { data: positions, error: positionsError } = await supabase
        .from('employee_positions')
        .select(`
          employee_id,
          is_active,
          positions:position_id (
            title,
            departments:department_id (
              name,
              companies:company_id (
                city,
                country
              )
            )
          )
        `)
        .eq('is_active', true);

      if (positionsError) throw positionsError;

      // Create a map of employee positions
      const positionMap = new Map<string, {
        position_title: string | null;
        department_name: string | null;
        location: string | null;
      }>();

      positions?.forEach((ep: any) => {
        if (ep.positions) {
          const location = ep.positions.departments?.companies 
            ? `${ep.positions.departments.companies.city || ''}, ${ep.positions.departments.companies.country || ''}`.replace(/^, |, $/g, '')
            : null;
          
          positionMap.set(ep.employee_id, {
            position_title: ep.positions.title,
            department_name: ep.positions.departments?.name || null,
            location: location || null,
          });
        }
      });

      // Combine profiles with position data
      const employeesData: Employee[] = (profiles || []).map((profile: any) => {
        const positionData = positionMap.get(profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name || profile.email,
          email: profile.email,
          avatar_url: profile.avatar_url,
          position_title: positionData?.position_title || null,
          department_name: positionData?.department_name || null,
          location: positionData?.location || null,
          is_active: !!positionData,
        };
      });

      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No employees found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search query" : "Add employees to get started"}
            </p>
          </div>
        )}

        {/* Employee Grid */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee, index) => (
              <div
                key={employee.id}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.avatar_url || undefined} alt={employee.full_name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(employee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        {employee.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.position_title || "No position assigned"}
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
                  {employee.department_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>{employee.department_name}</span>
                    </div>
                  )}
                  {employee.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className={cn(!canViewPii && "font-mono text-xs")}>
                        {maskPii(employee.location, "text")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      employee.is_active
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {employee.is_active ? "Active" : "Unassigned"}
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
        )}
      </div>
    </AppLayout>
  );
}
