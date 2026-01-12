import { useState, useEffect, useMemo } from "react";
import { Search, Check, X, Users, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export interface BulkEmployee {
  id: string;
  full_name: string | null;
  email: string;
  position_id: string | null;
  position_title: string | null;
  department_id: string | null;
  department_name: string | null;
  company_id: string | null;
  company_name: string | null;
  // Destination mapping fields for individual mapping
  to_department_id?: string | null;
  to_department_name?: string | null;
  to_position_id?: string | null;
  to_position_title?: string | null;
  mapping_status?: 'unmapped' | 'mapped' | 'error';
  mapping_error?: string | null;
}

interface BulkEmployeeSelectorProps {
  sourceCompanyId: string | null;
  sourceDepartmentId?: string | null;
  selectedEmployees: BulkEmployee[];
  onSelectionChange: (employees: BulkEmployee[]) => void;
  className?: string;
}

export function BulkEmployeeSelector({
  sourceCompanyId,
  sourceDepartmentId,
  selectedEmployees,
  onSelectionChange,
  className,
}: BulkEmployeeSelectorProps) {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<BulkEmployee[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    if (sourceCompanyId) {
      fetchEmployees();
      fetchDepartments();
    } else {
      setEmployees([]);
      setDepartments([]);
    }
  }, [sourceCompanyId, sourceDepartmentId]);

  const fetchEmployees = async () => {
    if (!sourceCompanyId) return;
    
    setLoading(true);
    try {
      // Fetch employees with their current position assignments
      // Note: employee_positions doesn't have department_id directly, 
      // we get it from the position's department
      const { data: employeePositions, error } = await supabase
        .from("employee_positions")
        .select(`
          employee_id,
          position_id,
          position:positions(id, title, department_id, department:departments(id, name, company_id))
        `)
        .eq("is_active", true)
        .eq("is_primary", true) as any;

      if (error) throw error;

      // Filter by source company through position -> department -> company
      const filteredPositions = (employeePositions || []).filter((ep: any) => {
        const deptCompanyId = ep.position?.department?.company_id;
        if (deptCompanyId !== sourceCompanyId) return false;
        if (sourceDepartmentId && ep.position?.department_id !== sourceDepartmentId) return false;
        return true;
      });

      // Get employee profiles
      const employeeIds = filteredPositions.map((ep: any) => ep.employee_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", employeeIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Get company name
      const { data: company } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", sourceCompanyId)
        .single();

      // Check for employees with pending/draft transfer transactions
      const { data: pendingTransactions } = await supabase
        .from("employee_transactions")
        .select(`
          employee_id,
          transaction_type:lookup_values!employee_transactions_transaction_type_id_fkey(code),
          status,
          from_company_id
        `)
        .in("status", ["draft", "pending_approval"])
        .eq("from_company_id", sourceCompanyId);

      // Get employee IDs with pending transfers
      const pendingEmployeeIds = new Set(
        (pendingTransactions || [])
          .filter((t: any) => ["BULK_TRANSFER", "TRANSFER", "PROMOTION"].includes(t.transaction_type?.code))
          .map((t: any) => t.employee_id)
      );

      const mappedEmployees: BulkEmployee[] = filteredPositions.map((ep: any) => {
        const profile = profileMap.get(ep.employee_id);
        return {
          id: ep.employee_id,
          full_name: profile?.full_name || null,
          email: profile?.email || "",
          position_id: ep.position_id,
          position_title: ep.position?.title || null,
          department_id: ep.position?.department_id || null,
          department_name: ep.position?.department?.name || null,
          company_id: sourceCompanyId,
          company_name: company?.name || null,
        };
      });

      // Filter out employees with pending transfers
      const availableEmployees = mappedEmployees.filter(e => !pendingEmployeeIds.has(e.id));

      setEmployees(availableEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!sourceCompanyId) return;

    const { data } = await supabase
      .from("departments")
      .select("id, name")
      .eq("company_id", sourceCompanyId)
      .eq("is_active", true)
      .order("name");

    setDepartments(data || []);
  };

  const filteredEmployees = useMemo(() => {
    let result = employees;

    if (departmentFilter !== "all") {
      result = result.filter(e => e.department_id === departmentFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(e =>
        (e.full_name?.toLowerCase().includes(search)) ||
        e.email.toLowerCase().includes(search) ||
        (e.position_title?.toLowerCase().includes(search)) ||
        (e.department_name?.toLowerCase().includes(search))
      );
    }

    return result;
  }, [employees, departmentFilter, searchTerm]);

  const selectedIds = useMemo(() => 
    new Set(selectedEmployees.map(e => e.id)),
    [selectedEmployees]
  );

  const toggleEmployee = (employee: BulkEmployee) => {
    if (selectedIds.has(employee.id)) {
      onSelectionChange(selectedEmployees.filter(e => e.id !== employee.id));
    } else {
      onSelectionChange([...selectedEmployees, employee]);
    }
  };

  const selectAll = () => {
    const newSelection = [...selectedEmployees];
    filteredEmployees.forEach(e => {
      if (!selectedIds.has(e.id)) {
        newSelection.push(e);
      }
    });
    onSelectionChange(newSelection);
  };

  const deselectAll = () => {
    const filteredIds = new Set(filteredEmployees.map(e => e.id));
    onSelectionChange(selectedEmployees.filter(e => !filteredIds.has(e.id)));
  };

  if (!sourceCompanyId) {
    return (
      <div className={cn("flex items-center justify-center p-8 text-muted-foreground", className)}>
        <Users className="h-5 w-5 mr-2" />
        {t("workforce.modules.transactions.bulkTransfer.selectSourceFirst")}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedEmployees.length} {t("common.selected")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            / {filteredEmployees.length} {t("workforce.modules.transactions.bulkTransfer.employeesInScope")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={loading}
          >
            {t("common.selectAll")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={deselectAll}
            disabled={loading || selectedEmployees.length === 0}
          >
            {t("common.deselectAll")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("workforce.modules.transactions.bulkTransfer.searchEmployees")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("common.allDepartments")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allDepartments")}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <ScrollArea className="h-[350px] border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t("workforce.modules.transactions.bulkTransfer.noEmployeesFound")}
          </div>
        ) : (
          <div className="divide-y">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={cn(
                  "flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedIds.has(employee.id) && "bg-primary/5"
                )}
                onClick={() => toggleEmployee(employee)}
              >
                <Checkbox
                  checked={selectedIds.has(employee.id)}
                  onCheckedChange={() => toggleEmployee(employee)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {employee.full_name || employee.email}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {employee.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {employee.position_title || t("common.noPosition")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {employee.department_name || t("common.noDepartment")}
                  </div>
                </div>
                {selectedIds.has(employee.id) && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
