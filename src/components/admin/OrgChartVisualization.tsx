import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2,
  Users,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Position {
  id: string;
  department_id: string;
  title: string;
  code: string;
  description: string | null;
  reports_to_position_id: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface EmployeePosition {
  id: string;
  employee_id: string;
  position_id: string;
  is_primary: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  employee?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string | null;
}

interface PositionNode extends Position {
  employees: EmployeePosition[];
  children: PositionNode[];
  department?: Department;
}

interface OrgChartVisualizationProps {
  companyId: string;
}

// Helper function to check if an entity is active at a given date
const isActiveAtDate = (startDate: string, endDate: string | null, checkDate: string): boolean => {
  return startDate <= checkDate && (endDate === null || endDate >= checkDate);
};

export function OrgChartVisualization({ companyId }: OrgChartVisualizationProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [employeePositions, setEmployeePositions] = useState<EmployeePosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all departments (we'll filter by date client-side)
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id, name, code, start_date, end_date")
        .eq("company_id", companyId)
        .order("name");

      if (deptError) throw deptError;
      setDepartments(deptData || []);

      const deptIds = (deptData || []).map(d => d.id);

      if (deptIds.length > 0) {
        // Fetch all positions (we'll filter by date client-side)
        const { data: posData, error: posError } = await supabase
          .from("positions")
          .select("id, department_id, title, code, description, reports_to_position_id, is_active, start_date, end_date")
          .in("department_id", deptIds)
          .order("title");

        if (posError) throw posError;
        setPositions(posData || []);

        const posIds = (posData || []).map(p => p.id);
        if (posIds.length > 0) {
          const { data: epData, error: epError } = await supabase
            .from("employee_positions")
            .select(`
              id, employee_id, position_id, is_primary, is_active, start_date, end_date,
              employee:profiles(id, full_name, email, avatar_url)
            `)
            .in("position_id", posIds);

          if (epError) throw epError;
          setEmployeePositions(epData || []);
          
          // Expand all root nodes by default
          const rootPositions = (posData || []).filter(p => !p.reports_to_position_id);
          setExpandedNodes(new Set(rootPositions.map(p => p.id)));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load org chart data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter entities by the as-of date
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => isActiveAtDate(d.start_date, d.end_date, asOfDate));
  }, [departments, asOfDate]);

  const filteredPositions = useMemo(() => {
    const activeDeptIds = new Set(filteredDepartments.map(d => d.id));
    return positions.filter(p => 
      activeDeptIds.has(p.department_id) && 
      isActiveAtDate(p.start_date, p.end_date, asOfDate)
    );
  }, [positions, filteredDepartments, asOfDate]);

  const filteredEmployeePositions = useMemo(() => {
    const activePosIds = new Set(filteredPositions.map(p => p.id));
    return employeePositions.filter(ep => 
      activePosIds.has(ep.position_id) && 
      isActiveAtDate(ep.start_date, ep.end_date || null, asOfDate)
    );
  }, [employeePositions, filteredPositions, asOfDate]);

  // Build tree structure
  const orgTree = useMemo(() => {
    const departmentFiltered = selectedDepartment === "all" 
      ? filteredPositions 
      : filteredPositions.filter(p => p.department_id === selectedDepartment);

    const positionMap = new Map<string, PositionNode>();
    
    // Create nodes
    departmentFiltered.forEach(pos => {
      const dept = filteredDepartments.find(d => d.id === pos.department_id);
      positionMap.set(pos.id, {
        ...pos,
        employees: filteredEmployeePositions.filter(ep => ep.position_id === pos.id),
        children: [],
        department: dept,
      });
    });

    // Build tree
    const roots: PositionNode[] = [];
    positionMap.forEach(node => {
      if (node.reports_to_position_id && positionMap.has(node.reports_to_position_id)) {
        positionMap.get(node.reports_to_position_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children by title
    const sortChildren = (node: PositionNode) => {
      node.children.sort((a, b) => a.title.localeCompare(b.title));
      node.children.forEach(sortChildren);
    };
    roots.forEach(sortChildren);
    roots.sort((a, b) => a.title.localeCompare(b.title));

    return roots;
  }, [filteredPositions, filteredEmployeePositions, filteredDepartments, selectedDepartment]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedNodes(new Set(filteredPositions.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const PositionCard = ({ node, level = 0 }: { node: PositionNode; level?: number }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div className="relative">
        {/* Connector line from parent */}
        {level > 0 && (
          <div className="absolute -top-4 left-6 w-px h-4 bg-border" />
        )}
        
        <div 
          className={cn(
            "relative border rounded-lg bg-card shadow-sm transition-all hover:shadow-md",
            level === 0 ? "border-primary/30 bg-primary/5" : "border-border"
          )}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0"
                      onClick={() => toggleNode(node.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {!hasChildren && <div className="w-6" />}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate">{node.title}</h4>
                    <p className="text-xs text-muted-foreground">{node.code}</p>
                  </div>
                </div>
                {node.department && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {node.department.name}
                  </Badge>
                )}
              </div>
              {node.employees.length > 0 && (
                <Badge variant="secondary" className="shrink-0">
                  <Users className="h-3 w-3 mr-1" />
                  {node.employees.length}
                </Badge>
              )}
            </div>

            {/* Employees */}
            {node.employees.length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-2">
                {node.employees.map((ep) => (
                  <div key={ep.id} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={ep.employee?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(ep.employee?.full_name || null, ep.employee?.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {ep.employee?.full_name || ep.employee?.email}
                      </p>
                      {ep.is_primary && (
                        <Badge variant="default" className="text-[10px] h-4">Primary</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {node.employees.length === 0 && (
              <p className="mt-3 pt-3 border-t text-xs text-muted-foreground italic">
                No employees assigned
              </p>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-4 ml-8 pl-4 border-l border-border space-y-4">
            {node.children.map((child) => (
              <PositionCard key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-4",
      isFullscreen && "fixed inset-0 z-50 bg-background p-6 overflow-auto"
    )}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          {/* As-of Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="asOfDate" className="text-sm font-medium whitespace-nowrap">As of:</Label>
            <Input
              id="asOfDate"
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-[160px]"
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {filteredDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </>
          )}
        </Button>
      </div>

      {asOfDate !== format(new Date(), "yyyy-MM-dd") && (
        <div className="rounded-lg border border-info/30 bg-info/10 px-4 py-2 text-sm text-info-foreground">
          Showing organization structure as of <strong>{format(new Date(asOfDate), "MMMM d, yyyy")}</strong>
        </div>
      )}

      {orgTree.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No positions found for the selected date. Create positions in the Positions tab first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {orgTree.map((root) => (
            <div key={root.id} className="space-y-4">
              <PositionCard node={root} />
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
        <span>Total Positions: {filteredPositions.length}</span>
        <span>•</span>
        <span>Assigned Employees: {filteredEmployeePositions.length}</span>
        <span>•</span>
        <span>Departments: {filteredDepartments.length}</span>
      </div>
    </div>
  );
}
