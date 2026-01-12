import { useState, useEffect, useMemo } from "react";
import { Search, Check, AlertTriangle, X, ArrowRight, Copy, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { BulkEmployee } from "./BulkEmployeeSelector";

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  department_id: string;
}

interface BulkTransferMappingStepProps {
  employees: BulkEmployee[];
  destinationCompanyId: string;
  defaultDepartmentId?: string | null;
  onMappingChange: (employees: BulkEmployee[]) => void;
}

export function BulkTransferMappingStep({
  employees,
  destinationCompanyId,
  defaultDepartmentId,
  onMappingChange,
}: BulkTransferMappingStepProps) {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch departments and positions for destination company
  useEffect(() => {
    if (destinationCompanyId) {
      fetchData();
    }
  }, [destinationCompanyId]);

  // Auto-apply default department on mount if set
  useEffect(() => {
    if (defaultDepartmentId && defaultDepartmentId !== "_keep" && departments.length > 0) {
      const dept = departments.find(d => d.id === defaultDepartmentId);
      if (dept) {
        const updated = employees.map(emp => ({
          ...emp,
          to_department_id: emp.to_department_id || defaultDepartmentId,
          to_department_name: emp.to_department_name || dept.name,
          mapping_status: (emp.to_department_id || defaultDepartmentId) && emp.to_position_id 
            ? 'mapped' as const 
            : 'unmapped' as const,
        }));
        onMappingChange(updated);
      }
    }
  }, [defaultDepartmentId, departments.length]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, posRes] = await Promise.all([
        supabase
          .from("departments")
          .select("id, name")
          .eq("company_id", destinationCompanyId)
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("positions")
          .select("id, title, department_id")
          .eq("is_active", true),
      ]);

      setDepartments(deptRes.data || []);
      
      // Filter positions to only those in departments belonging to destination company
      const deptIds = new Set((deptRes.data || []).map(d => d.id));
      const filteredPositions = (posRes.data || []).filter(p => deptIds.has(p.department_id));
      setPositions(filteredPositions);
    } catch (error) {
      console.error("Error fetching mapping data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const search = searchTerm.toLowerCase();
    return employees.filter(e =>
      (e.full_name?.toLowerCase().includes(search)) ||
      e.email.toLowerCase().includes(search) ||
      (e.position_title?.toLowerCase().includes(search)) ||
      (e.department_name?.toLowerCase().includes(search))
    );
  }, [employees, searchTerm]);

  const mappingStats = useMemo(() => {
    const mapped = employees.filter(e => e.to_department_id && e.to_position_id).length;
    const partiallyMapped = employees.filter(e => e.to_department_id && !e.to_position_id).length;
    const unmapped = employees.filter(e => !e.to_department_id).length;
    return { mapped, partiallyMapped, unmapped, total: employees.length };
  }, [employees]);

  const getPositionsForDepartment = (departmentId: string) => {
    return positions.filter(p => p.department_id === departmentId);
  };

  const updateEmployeeMapping = (
    employeeId: string,
    field: 'to_department_id' | 'to_position_id',
    value: string | null,
    displayValue?: string
  ) => {
    const updated = employees.map(emp => {
      if (emp.id !== employeeId) return emp;

      let newEmp = { ...emp };

      if (field === 'to_department_id') {
        const dept = departments.find(d => d.id === value);
        newEmp.to_department_id = value;
        newEmp.to_department_name = dept?.name || null;
        // Reset position when department changes
        newEmp.to_position_id = null;
        newEmp.to_position_title = null;
      } else {
        const pos = positions.find(p => p.id === value);
        newEmp.to_position_id = value;
        newEmp.to_position_title = pos?.title || null;
      }

      // Update mapping status
      newEmp.mapping_status = newEmp.to_department_id && newEmp.to_position_id
        ? 'mapped'
        : newEmp.to_department_id
        ? 'unmapped'
        : 'unmapped';

      return newEmp;
    });

    onMappingChange(updated);
  };

  const applyToAllBelow = (fromIndex: number) => {
    const sourceEmployee = filteredEmployees[fromIndex];
    if (!sourceEmployee.to_department_id) return;

    const filteredIds = filteredEmployees.slice(fromIndex + 1).map(e => e.id);
    const updated = employees.map(emp => {
      if (!filteredIds.includes(emp.id)) return emp;

      return {
        ...emp,
        to_department_id: sourceEmployee.to_department_id,
        to_department_name: sourceEmployee.to_department_name,
        to_position_id: sourceEmployee.to_position_id,
        to_position_title: sourceEmployee.to_position_title,
        mapping_status: sourceEmployee.to_department_id && sourceEmployee.to_position_id
          ? 'mapped' as const
          : 'unmapped' as const,
      };
    });

    onMappingChange(updated);
  };

  const applyToUnmapped = (sourceEmployee: BulkEmployee) => {
    if (!sourceEmployee.to_department_id) return;

    const updated = employees.map(emp => {
      if (emp.to_department_id && emp.to_position_id) return emp; // Skip already mapped

      return {
        ...emp,
        to_department_id: sourceEmployee.to_department_id,
        to_department_name: sourceEmployee.to_department_name,
        to_position_id: sourceEmployee.to_position_id,
        to_position_title: sourceEmployee.to_position_title,
        mapping_status: sourceEmployee.to_department_id && sourceEmployee.to_position_id
          ? 'mapped' as const
          : 'unmapped' as const,
      };
    });

    onMappingChange(updated);
  };

  const tryMatchCurrentPosition = (employee: BulkEmployee) => {
    if (!employee.position_title) return;

    // Find a position in destination company with matching title
    const matchingPosition = positions.find(p => 
      p.title.toLowerCase() === employee.position_title?.toLowerCase()
    );

    if (matchingPosition) {
      const dept = departments.find(d => d.id === matchingPosition.department_id);
      const updated = employees.map(emp => {
        if (emp.id !== employee.id) return emp;
        return {
          ...emp,
          to_department_id: matchingPosition.department_id,
          to_department_name: dept?.name || null,
          to_position_id: matchingPosition.id,
          to_position_title: matchingPosition.title,
          mapping_status: 'mapped' as const,
        };
      });
      onMappingChange(updated);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={mappingStats.mapped === mappingStats.total ? "default" : "secondary"}>
            {mappingStats.mapped} / {mappingStats.total} {t("workforce.modules.transactions.bulkTransfer.mapping.mapped")}
          </Badge>
          {mappingStats.partiallyMapped > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              {mappingStats.partiallyMapped} {t("workforce.modules.transactions.bulkTransfer.mapping.partial")}
            </Badge>
          )}
        </div>
        <Progress 
          value={(mappingStats.mapped / mappingStats.total) * 100} 
          className="w-32 h-2" 
        />
      </div>

      {/* Search */}
      <div className="relative">
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

      {/* Mapping Warning */}
      {mappingStats.unmapped > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            {t("workforce.modules.transactions.bulkTransfer.mapping.unmappedWarning", {
              count: mappingStats.unmapped + mappingStats.partiallyMapped,
            })}
          </span>
        </div>
      )}

      {/* Employee Mapping Table */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <div className="divide-y">
          {/* Header */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 text-sm font-medium sticky top-0 z-10">
            <div className="w-5"></div>
            <div className="w-52">{t("workforce.common.employee")}</div>
            <div className="w-44">{t("workforce.modules.transactions.bulkTransfer.mapping.current")}</div>
            <div className="w-5 flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-[400px]">{t("workforce.modules.transactions.bulkTransfer.mapping.newAssignment")}</div>
            <div className="w-16"></div>
          </div>

          {filteredEmployees.map((employee, index) => {
            const deptPositions = employee.to_department_id 
              ? getPositionsForDepartment(employee.to_department_id)
              : [];
            const isMapped = employee.to_department_id && employee.to_position_id;
            const isPartial = employee.to_department_id && !employee.to_position_id;

            return (
              <div
                key={employee.id}
                className={cn(
                  "flex items-center gap-3 p-3 transition-colors",
                  isMapped ? "bg-primary/5" : isPartial ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                )}
              >
                {/* Status Icon */}
                <div className="w-5 flex justify-center">
                  {isMapped ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : isPartial ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>

                {/* Employee Info */}
                <div className="w-52 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {employee.full_name || employee.email}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {employee.email}
                  </div>
                </div>

                {/* Current Assignment */}
                <div className="w-44 min-w-0">
                  <div className="text-sm truncate">{employee.position_title || "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {employee.department_name || "—"}
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-5 flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* New Assignment Selectors */}
                <div className="flex-1 flex gap-2 min-w-[400px]">
                  {/* Department Selector */}
                  <Select
                    value={employee.to_department_id || ""}
                    onValueChange={(value) => updateEmployeeMapping(employee.id, 'to_department_id', value)}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder={t("workforce.modules.transactions.bulkTransfer.mapping.selectDept")} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Position Selector */}
                  <Select
                    value={employee.to_position_id || ""}
                    onValueChange={(value) => updateEmployeeMapping(employee.id, 'to_position_id', value)}
                    disabled={!employee.to_department_id}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder={t("workforce.modules.transactions.bulkTransfer.mapping.selectPos")} />
                    </SelectTrigger>
                    <SelectContent>
                      {deptPositions.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          {t("workforce.modules.transactions.bulkTransfer.mapping.noPositions")}
                        </div>
                      ) : (
                        deptPositions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="w-16 flex gap-1 shrink-0">
                  <TooltipProvider>
                    {employee.position_title && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => tryMatchCurrentPosition(employee)}
                          >
                            <Search className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("workforce.modules.transactions.bulkTransfer.mapping.matchTitle")}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {isMapped && index < filteredEmployees.length - 1 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => applyToAllBelow(index)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("workforce.modules.transactions.bulkTransfer.mapping.applyBelow")}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
