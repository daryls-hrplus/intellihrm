import { useState, useEffect } from "react";
import { User, Calendar, Building2, Briefcase, Wallet, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

interface EmployeeContextData {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url?: string | null;
  hire_date?: string | null;
  employment_status?: string | null;
  current_position?: {
    title: string;
    code: string;
  } | null;
  current_department?: {
    name: string;
  } | null;
  current_company?: {
    name: string;
  } | null;
  pay_group?: {
    name: string;
    code: string;
  } | null;
}

interface EmployeeContextCardProps {
  employeeId: string | undefined;
  className?: string;
  compact?: boolean;
}

export function EmployeeContextCard({
  employeeId,
  className,
  compact = false,
}: EmployeeContextCardProps) {
  const { t } = useLanguage();
  const [employee, setEmployee] = useState<EmployeeContextData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployeeContext = async () => {
      if (!employeeId) {
        setEmployee(null);
        return;
      }

      setLoading(true);
      try {
        // Fetch employee profile (hire_date may be on employee_positions or a separate table)
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, employment_status")
          .eq("id", employeeId)
          .single();

        if (!profile) {
          setEmployee(null);
          setLoading(false);
          return;
        }

        // Fetch current primary position
        const { data: empPosition } = await supabase
          .from("employee_positions")
          .select("position_id")
          .eq("employee_id", employeeId)
          .eq("is_active", true)
          .eq("is_primary", true)
          .maybeSingle();

        let positionData = null;
        let departmentData = null;
        let companyData = null;

        if (empPosition?.position_id) {
          // Fetch position details
          const { data: position } = await supabase
            .from("positions")
            .select("title, code, department_id")
            .eq("id", empPosition.position_id)
            .single();

          if (position) {
            positionData = { title: position.title, code: position.code };

            // Fetch department
            if (position.department_id) {
              const { data: dept } = await supabase
                .from("departments")
                .select("name, company_id")
                .eq("id", position.department_id)
                .single();

              if (dept) {
                departmentData = { name: dept.name };

                // Fetch company
                if (dept.company_id) {
                  const { data: company } = await supabase
                    .from("companies")
                    .select("name")
                    .eq("id", dept.company_id)
                    .single();

                  if (company) {
                    companyData = { name: company.name };
                  }
                }
              }
            }
          }
        }

        // Fetch pay group (using any to avoid type issues)
        const payGroupResult: any = await supabase
          .from("employee_pay_groups" as any)
          .select("pay_group_id")
          .eq("employee_id", employeeId)
          .eq("is_active", true)
          .maybeSingle();

        let payGroupData = null;
        const payGroupAssignment = payGroupResult?.data as { pay_group_id: string } | null;

        if (payGroupAssignment?.pay_group_id) {
          const { data: pg } = await supabase
            .from("pay_groups")
            .select("name, code")
            .eq("id", payGroupAssignment.pay_group_id)
            .single();

          if (pg) {
            payGroupData = { name: pg.name, code: pg.code };
          }
        }

        // Get hire date from the oldest employee_position record
        const { data: hireInfo } = await supabase
          .from("employee_positions")
          .select("start_date")
          .eq("employee_id", employeeId)
          .order("start_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        setEmployee({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          hire_date: hireInfo?.start_date || null,
          employment_status: profile.employment_status,
          current_position: positionData,
          current_department: departmentData,
          current_company: companyData,
          pay_group: payGroupData,
        });
      } catch (error) {
        console.error("Error fetching employee context:", error);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeContext();
  }, [employeeId]);

  if (!employeeId) return null;

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) return null;

  const initials = employee.full_name
    ? employee.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : employee.email[0].toUpperCase();

  const tenureYears = employee.hire_date
    ? Math.floor(
        (new Date().getTime() - new Date(employee.hire_date).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : null;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-2 bg-muted/50 rounded-lg", className)}>
        <Avatar className="h-8 w-8">
          {employee.avatar_url && <AvatarImage src={employee.avatar_url} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {employee.full_name || employee.email}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {employee.current_position?.title || t("common.noPosition")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-muted/30 p-4", className)}>
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          {employee.avatar_url && <AvatarImage src={employee.avatar_url} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Name and Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold">
              {employee.full_name || employee.email}
            </h4>
            {employee.employment_status && (
              <Badge variant="outline" className="text-xs">
                {employee.employment_status}
              </Badge>
            )}
          </div>

          {/* Position and Department */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            {employee.current_position && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {employee.current_position.title}
              </span>
            )}
            {employee.current_department && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {employee.current_department.name}
              </span>
            )}
            {employee.current_company && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {employee.current_company.name}
              </span>
            )}
          </div>

          {/* Hire Date and Pay Group */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            {employee.hire_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t("workforce.modules.transactions.form.hired", "Hired")}:{" "}
                {formatDateForDisplay(employee.hire_date, "MMM d, yyyy")}
                {tenureYears !== null && tenureYears >= 1 && (
                  <span className="ml-1 text-muted-foreground/70">
                    ({tenureYears} {tenureYears === 1 ? t("common.year") : t("common.years")})
                  </span>
                )}
              </span>
            )}
            {employee.pay_group && (
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {employee.pay_group.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
