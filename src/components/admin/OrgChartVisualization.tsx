import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2,
  Users,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Calendar,
  GitCompare,
  Plus,
  Minus,
  Equal,
  FileDown,
  MoreVertical,
  Printer,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  changeStatus?: "added" | "removed" | "unchanged" | "modified";
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
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareDate, setCompareDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return format(date, "yyyy-MM-dd");
  });

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

  // Filter entities by a specific date
  const getFilteredData = (date: string) => {
    const filteredDepts = departments.filter(d => isActiveAtDate(d.start_date, d.end_date, date));
    const activeDeptIds = new Set(filteredDepts.map(d => d.id));
    
    const filteredPos = positions.filter(p => 
      activeDeptIds.has(p.department_id) && 
      isActiveAtDate(p.start_date, p.end_date, date)
    );
    
    const activePosIds = new Set(filteredPos.map(p => p.id));
    const filteredEmp = employeePositions.filter(ep => 
      activePosIds.has(ep.position_id) && 
      isActiveAtDate(ep.start_date, ep.end_date || null, date)
    );
    
    return { filteredDepts, filteredPos, filteredEmp };
  };

  // Filter entities by the as-of date
  const { filteredDepts: filteredDepartments, filteredPos: filteredPositions, filteredEmp: filteredEmployeePositions } = useMemo(() => {
    return getFilteredData(asOfDate);
  }, [departments, positions, employeePositions, asOfDate]);

  // Filter entities by the comparison date
  const { filteredPos: comparePositions, filteredEmp: compareEmployeePositions, filteredDepts: compareDepartments } = useMemo(() => {
    return getFilteredData(compareDate);
  }, [departments, positions, employeePositions, compareDate]);

  // Build tree structure with optional comparison
  const buildOrgTree = (
    positionsData: Position[],
    employeeData: EmployeePosition[],
    departmentsData: Department[],
    comparisonPositionIds?: Set<string>
  ): PositionNode[] => {
    const departmentFiltered = selectedDepartment === "all" 
      ? positionsData 
      : positionsData.filter(p => p.department_id === selectedDepartment);

    const positionMap = new Map<string, PositionNode>();
    
    // Create nodes
    departmentFiltered.forEach(pos => {
      const dept = departmentsData.find(d => d.id === pos.department_id);
      let changeStatus: PositionNode["changeStatus"] = "unchanged";
      
      if (comparisonPositionIds) {
        if (!comparisonPositionIds.has(pos.id)) {
          changeStatus = "added";
        }
      }
      
      positionMap.set(pos.id, {
        ...pos,
        employees: employeeData.filter(ep => ep.position_id === pos.id),
        children: [],
        department: dept,
        changeStatus,
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
  };

  // Main org tree
  const orgTree = useMemo(() => {
    if (comparisonMode) {
      const comparePositionIds = new Set(comparePositions.map(p => p.id));
      return buildOrgTree(filteredPositions, filteredEmployeePositions, filteredDepartments, comparePositionIds);
    }
    return buildOrgTree(filteredPositions, filteredEmployeePositions, filteredDepartments);
  }, [filteredPositions, filteredEmployeePositions, filteredDepartments, comparisonMode, comparePositions, selectedDepartment]);

  // Removed positions (only in compare date, not in current date)
  const removedPositions = useMemo(() => {
    if (!comparisonMode) return [];
    const currentPositionIds = new Set(filteredPositions.map(p => p.id));
    return comparePositions.filter(p => !currentPositionIds.has(p.id));
  }, [comparisonMode, filteredPositions, comparePositions]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = [...filteredPositions.map(p => p.id), ...removedPositions.map(p => p.id)];
    setExpandedNodes(new Set(allIds));
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

  // PDF Export function
  const exportToPdf = useCallback(async (elementId: string, title: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error("Could not find element to export");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf-export" });

    try {
      // Find the actual chart content (the inner flex container with nodes)
      const chartContent = element.querySelector('.flex.flex-col.items-center') as HTMLElement;
      const targetElement = chartContent || element;
      
      // Get the bounding rect of actual content
      const contentRect = targetElement.getBoundingClientRect();
      
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: contentRect.width,
        height: contentRect.height,
      });

      // Use JPEG with compression for smaller file size
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      
      // Determine orientation based on content aspect ratio
      const contentAspect = canvas.width / canvas.height;
      const isLandscape = contentAspect > 1.2; // Use landscape if content is notably wider
      
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      
      // Scale to fill the page appropriately
      const scaleX = availableWidth / (canvas.width / 2); // Divide by scale factor
      const scaleY = availableHeight / (canvas.height / 2);
      const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x to prevent over-enlargement
      
      const finalWidth = (canvas.width / 2) * scale;
      const finalHeight = (canvas.height / 2) * scale;
      
      const xOffset = margin + (availableWidth - finalWidth) / 2;
      const yOffset = margin + (availableHeight - finalHeight) / 2;

      pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast.success("PDF exported successfully", { id: "pdf-export" });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF", { id: "pdf-export" });
    }
  }, []);

  // Comparison summary
  const comparisonSummary = useMemo(() => {
    if (!comparisonMode) return null;
    
    const currentIds = new Set(filteredPositions.map(p => p.id));
    const compareIds = new Set(comparePositions.map(p => p.id));
    
    const added = filteredPositions.filter(p => !compareIds.has(p.id)).length;
    const removed = comparePositions.filter(p => !currentIds.has(p.id)).length;
    const unchanged = filteredPositions.filter(p => compareIds.has(p.id)).length;
    
    return { added, removed, unchanged };
  }, [comparisonMode, filteredPositions, comparePositions]);

  const PositionCard = ({ node, level = 0, isRemoved = false }: { node: PositionNode; level?: number; isRemoved?: boolean }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isAdded = node.changeStatus === "added";
    const cardId = `position-card-${node.id}`;

    const handleExportPdf = () => {
      // First expand all children for complete export
      const getAllChildIds = (n: PositionNode): string[] => {
        return [n.id, ...n.children.flatMap(getAllChildIds)];
      };
      const allIds = getAllChildIds(node);
      setExpandedNodes(prev => new Set([...prev, ...allIds]));
      
      // Wait for render then export
      setTimeout(() => {
        exportToPdf(cardId, `${node.title}-org-chart`);
      }, 100);
    };

    return (
      <div id={cardId} className="relative">
        {/* Connector line from parent */}
        {level > 0 && (
          <div className="absolute -top-4 left-6 w-px h-4 bg-border print:hidden" />
        )}
        
        <div 
          className={cn(
            "relative border rounded-lg bg-card shadow-sm transition-all hover:shadow-md",
            level === 0 && !isRemoved && !isAdded && "border-primary/30 bg-primary/5",
            isRemoved && "border-destructive/50 bg-destructive/10 opacity-75",
            isAdded && "border-green-500/50 bg-green-500/10",
            !isRemoved && !isAdded && level > 0 && "border-border"
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
                      className="h-6 w-6 shrink-0 print:hidden"
                      onClick={() => toggleNode(node.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {!hasChildren && <div className="w-6 print:hidden" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{node.title}</h4>
                      {comparisonMode && isAdded && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {comparisonMode && isRemoved && (
                        <Badge variant="destructive" className="text-xs">
                          <Minus className="h-3 w-3 mr-1" />
                          Removed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{node.code}</p>
                  </div>
                </div>
                {node.department && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {node.department.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {node.employees.length > 0 && (
                  <Badge variant="secondary" className="shrink-0">
                    <Users className="h-3 w-3 mr-1" />
                    {node.employees.length}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 print:hidden">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPdf}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export to PDF
                    </DropdownMenuItem>
                    {hasChildren && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          const getAllChildIds = (n: PositionNode): string[] => [n.id, ...n.children.flatMap(getAllChildIds)];
                          setExpandedNodes(prev => new Set([...prev, ...getAllChildIds(node)]));
                        }}>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Expand All Below
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const getAllChildIds = (n: PositionNode): string[] => n.children.flatMap(c => [c.id, ...getAllChildIds(c)]);
                          const childIds = new Set(getAllChildIds(node));
                          setExpandedNodes(prev => new Set([...prev].filter(id => !childIds.has(id))));
                        }}>
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Collapse All Below
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
              <PositionCard key={child.id} node={child} level={level + 1} isRemoved={isRemoved} />
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
            <Label htmlFor="asOfDate" className="text-sm font-medium whitespace-nowrap">
              {comparisonMode ? "Current:" : "As of:"}
            </Label>
            <Input
              id="asOfDate"
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-[160px]"
            />
          </div>

          {/* Comparison Mode Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="comparisonMode"
              checked={comparisonMode}
              onCheckedChange={setComparisonMode}
            />
            <Label htmlFor="comparisonMode" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
              <GitCompare className="h-4 w-4" />
              Compare
            </Label>
          </div>

          {/* Compare Date Picker (shown only in comparison mode) */}
          {comparisonMode && (
            <div className="flex items-center gap-2">
              <Label htmlFor="compareDate" className="text-sm font-medium whitespace-nowrap">Compare to:</Label>
              <Input
                id="compareDate"
                type="date"
                value={compareDate}
                onChange={(e) => setCompareDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
          )}

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

      {/* Comparison Summary */}
      {comparisonMode && comparisonSummary && (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium">Changes from {format(new Date(compareDate), "MMM d, yyyy")} to {format(new Date(asOfDate), "MMM d, yyyy")}:</span>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-green-500">
              <Plus className="h-3 w-3 mr-1" />
              {comparisonSummary.added} Added
            </Badge>
            <Badge variant="destructive">
              <Minus className="h-3 w-3 mr-1" />
              {comparisonSummary.removed} Removed
            </Badge>
            <Badge variant="secondary">
              <Equal className="h-3 w-3 mr-1" />
              {comparisonSummary.unchanged} Unchanged
            </Badge>
          </div>
        </div>
      )}

      {!comparisonMode && asOfDate !== format(new Date(), "yyyy-MM-dd") && (
        <div className="rounded-lg border border-info/30 bg-info/10 px-4 py-2 text-sm text-info-foreground">
          Showing organization structure as of <strong>{format(new Date(asOfDate), "MMMM d, yyyy")}</strong>
        </div>
      )}

      {orgTree.length === 0 && removedPositions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No positions found for the selected date. Create positions in the Positions tab first.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current positions */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {orgTree.map((root) => (
              <div key={root.id} className="space-y-4">
                <PositionCard node={root} />
              </div>
            ))}
          </div>

          {/* Removed positions section (comparison mode only) */}
          {comparisonMode && removedPositions.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
                <Minus className="h-5 w-5" />
                Removed Positions (were active on {format(new Date(compareDate), "MMM d, yyyy")})
              </h3>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {removedPositions.map((pos) => {
                  const dept = compareDepartments.find(d => d.id === pos.department_id);
                  const removedNode: PositionNode = {
                    ...pos,
                    employees: compareEmployeePositions.filter(ep => ep.position_id === pos.id),
                    children: [],
                    department: dept,
                    changeStatus: "removed",
                  };
                  return (
                    <div key={pos.id} className="space-y-4">
                      <PositionCard node={removedNode} isRemoved />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
        <span>Total Positions: {filteredPositions.length}</span>
        <span>•</span>
        <span>Assigned Employees: {filteredEmployeePositions.length}</span>
        <span>•</span>
        <span>Departments: {filteredDepartments.length}</span>
        {comparisonMode && (
          <>
            <span>•</span>
            <span className="text-destructive">Removed: {removedPositions.length}</span>
          </>
        )}
      </div>
    </div>
  );
}
