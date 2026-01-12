import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Check, AlertTriangle, X, ArrowRight, Copy, Loader2, Users } from "lucide-react";
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

interface SeatAvailability {
  positionId: string;
  availableSeats: number;
  totalSeats: number;
  isLoading: boolean;
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
  const [seatAvailability, setSeatAvailability] = useState<Map<string, SeatAvailability>>(new Map());

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

  // Get unique position IDs from employee mappings
  const selectedPositionIds = useMemo(() => {
    const ids = new Set<string>();
    employees.forEach(emp => {
      if (emp.to_position_id) {
        ids.add(emp.to_position_id);
      }
    });
    return Array.from(ids);
  }, [employees]);

  // Count how many employees are targeting each position
  const positionAssignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    employees.forEach(emp => {
      if (emp.to_position_id) {
        counts.set(emp.to_position_id, (counts.get(emp.to_position_id) || 0) + 1);
      }
    });
    return counts;
  }, [employees]);

  // Check seat availability for positions
  const checkSeatAvailability = useCallback(async (positionIds: string[]) => {
    if (positionIds.length === 0) return;

    // Mark as loading
    setSeatAvailability(prev => {
      const newMap = new Map(prev);
      positionIds.forEach(id => {
        newMap.set(id, { positionId: id, availableSeats: 0, totalSeats: 0, isLoading: true });
      });
      return newMap;
    });

    try {
      const { data, error } = await supabase
        .from("seat_occupancy_summary")
        .select("position_id, seat_id, allocation_status, is_shared_seat, current_occupant_count, max_occupants")
        .in("position_id", positionIds);

      if (error) {
        console.error("Error checking seat availability:", error);
        return;
      }

      // Group seats by position
      const seatsByPosition = new Map<string, typeof data>();
      positionIds.forEach(id => seatsByPosition.set(id, []));
      
      (data || []).forEach(seat => {
        const existing = seatsByPosition.get(seat.position_id) || [];
        existing.push(seat);
        seatsByPosition.set(seat.position_id, existing);
      });

      // Calculate availability for each position
      setSeatAvailability(prev => {
        const newMap = new Map(prev);
        seatsByPosition.forEach((seats, positionId) => {
          const totalSeats = seats.length;
          const availableSeats = seats.filter(seat => 
            seat.allocation_status === "VACANT" || 
            (seat.is_shared_seat && (seat.current_occupant_count || 0) < (seat.max_occupants || 1))
          ).length;

          newMap.set(positionId, {
            positionId,
            availableSeats,
            totalSeats,
            isLoading: false,
          });
        });
        return newMap;
      });
    } catch (err) {
      console.error("Error checking seat availability:", err);
    }
  }, []);

  // Fetch seat availability when position selections change
  useEffect(() => {
    const positionsToCheck = selectedPositionIds.filter(id => !seatAvailability.has(id));
    if (positionsToCheck.length > 0) {
      checkSeatAvailability(positionsToCheck);
    }
  }, [selectedPositionIds, checkSeatAvailability]);

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

      // Fetch seat availability for all positions upfront
      if (filteredPositions.length > 0) {
        const positionIds = filteredPositions.map(p => p.id);
        const { data: seatData } = await supabase
          .from("seat_occupancy_summary")
          .select("position_id, seat_id, status, allocation_status, is_shared_seat, current_occupant_count, max_occupants")
          .in("position_id", positionIds);

        // Calculate availability for each position
        const availabilityMap = new Map<string, SeatAvailability>();
        
        // Initialize all positions with 0 seats
        positionIds.forEach(id => {
          availabilityMap.set(id, { positionId: id, availableSeats: 0, totalSeats: 0, isLoading: false });
        });

        // Group seats by position and calculate
        const seatsByPosition = new Map<string, typeof seatData>();
        (seatData || []).forEach(seat => {
          const existing = seatsByPosition.get(seat.position_id) || [];
          existing.push(seat);
          seatsByPosition.set(seat.position_id, existing);
        });

        seatsByPosition.forEach((seats, positionId) => {
          const totalSeats = seats.length;
          const availableSeats = seats.filter(seat => 
            seat.status === "VACANT" || 
            (seat.is_shared_seat && (seat.current_occupant_count || 0) < (seat.max_occupants || 1))
          ).length;

          availabilityMap.set(positionId, {
            positionId,
            availableSeats,
            totalSeats,
            isLoading: false,
          });
        });

        setSeatAvailability(availabilityMap);
      }
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
    
    // Check for seat issues
    let seatIssues = 0;
    positionAssignmentCounts.forEach((count, positionId) => {
      const availability = seatAvailability.get(positionId);
      if (availability && !availability.isLoading && count > availability.availableSeats) {
        seatIssues++;
      }
    });
    
    return { mapped, partiallyMapped, unmapped, seatIssues, total: employees.length };
  }, [employees, positionAssignmentCounts, seatAvailability]);

  // Get positions for a department, filtered to only those with available seats
  const getPositionsForDepartment = (departmentId: string, currentEmployeePositionId?: string | null) => {
    return positions.filter(p => {
      if (p.department_id !== departmentId) return false;
      
      // Always include the currently selected position for this employee
      if (currentEmployeePositionId && p.id === currentEmployeePositionId) return true;
      
      // Check seat availability
      const availability = seatAvailability.get(p.id);
      if (!availability) return true; // Include if we don't have data yet
      
      // Calculate remaining seats after other employees' assignments
      const assignedCount = positionAssignmentCounts.get(p.id) || 0;
      const remainingSeats = availability.availableSeats - assignedCount;
      
      // Show position if it has remaining seats
      return remainingSeats > 0;
    });
  };

  const getSeatStatusForPosition = (positionId: string): { 
    status: 'loading' | 'available' | 'warning' | 'error'; 
    availableSeats: number;
    totalSeats: number;
    assignedCount: number;
  } | null => {
    if (!positionId) return null;
    
    const availability = seatAvailability.get(positionId);
    const assignedCount = positionAssignmentCounts.get(positionId) || 0;
    
    if (!availability) {
      return { status: 'loading', availableSeats: 0, totalSeats: 0, assignedCount };
    }
    
    if (availability.isLoading) {
      return { status: 'loading', availableSeats: 0, totalSeats: 0, assignedCount };
    }
    
    const remainingAfterAssignment = availability.availableSeats - assignedCount;
    
    if (remainingAfterAssignment < 0) {
      return { 
        status: 'error', 
        availableSeats: availability.availableSeats, 
        totalSeats: availability.totalSeats,
        assignedCount 
      };
    }
    
    if (remainingAfterAssignment === 0) {
      return { 
        status: 'warning', 
        availableSeats: availability.availableSeats, 
        totalSeats: availability.totalSeats,
        assignedCount 
      };
    }
    
    return { 
      status: 'available', 
      availableSeats: availability.availableSeats, 
      totalSeats: availability.totalSeats,
      assignedCount 
    };
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
          {mappingStats.seatIssues > 0 && (
            <Badge variant="destructive">
              {mappingStats.seatIssues} {t("workforce.modules.transactions.bulkTransfer.mapping.seatIssues")}
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

      {/* Seat Issues Warning */}
      {mappingStats.seatIssues > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            {t("workforce.modules.transactions.bulkTransfer.mapping.seatIssuesWarning")}
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
            <div className="flex-1 min-w-[480px]">{t("workforce.modules.transactions.bulkTransfer.mapping.newAssignment")}</div>
            <div className="w-16"></div>
          </div>

          {filteredEmployees.map((employee, index) => {
            const deptPositions = employee.to_department_id 
              ? getPositionsForDepartment(employee.to_department_id, employee.to_position_id)
              : [];
            const isMapped = employee.to_department_id && employee.to_position_id;
            const isPartial = employee.to_department_id && !employee.to_position_id;
            const seatStatus = employee.to_position_id ? getSeatStatusForPosition(employee.to_position_id) : null;
            const hasSeatIssue = seatStatus?.status === 'error';

            return (
              <div
                key={employee.id}
                className={cn(
                  "flex items-center gap-3 p-3 transition-colors",
                  hasSeatIssue ? "bg-destructive/5" : isMapped ? "bg-primary/5" : isPartial ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                )}
              >
                {/* Status Icon */}
                <div className="w-5 flex justify-center">
                  {hasSeatIssue ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : isMapped ? (
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
                <div className="flex-1 flex items-center gap-2 min-w-[480px]">
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
                    <SelectTrigger className={cn(
                      "w-[180px] h-9",
                      hasSeatIssue && "border-destructive"
                    )}>
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

                  {/* Seat Availability Indicator */}
                  {seatStatus && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium shrink-0",
                            seatStatus.status === 'loading' && "bg-muted text-muted-foreground",
                            seatStatus.status === 'available' && "bg-primary/10 text-primary",
                            seatStatus.status === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                            seatStatus.status === 'error' && "bg-destructive/10 text-destructive"
                          )}>
                            {seatStatus.status === 'loading' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Users className="h-3 w-3" />
                                <span>
                                  {seatStatus.availableSeats - seatStatus.assignedCount}/{seatStatus.totalSeats}
                                </span>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {seatStatus.status === 'loading' ? (
                            t("workforce.modules.transactions.bulkTransfer.mapping.checkingSeats")
                          ) : seatStatus.status === 'error' ? (
                            t("workforce.modules.transactions.bulkTransfer.mapping.notEnoughSeats", {
                              assigned: seatStatus.assignedCount,
                              available: seatStatus.availableSeats,
                            })
                          ) : (
                            t("workforce.modules.transactions.bulkTransfer.mapping.seatsAvailable", {
                              remaining: seatStatus.availableSeats - seatStatus.assignedCount,
                              total: seatStatus.totalSeats,
                            })
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
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
