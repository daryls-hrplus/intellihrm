import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
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
  X,
  Check,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { EmployeeEditDialog } from "@/components/employee/EmployeeEditDialog";
import { AddEmployeeDialog } from "@/components/employee/AddEmployeeDialog";

interface EmployeePosition {
  position_title: string;
  department_name: string | null;
  assignment_type: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  positions: EmployeePosition[];
  location: string | null;
  is_active: boolean;
}

interface Company {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unassigned">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { logView, logAction } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    setCompanies(data || []);
  };

  useEffect(() => {
    if (!hasLoggedView.current && !loading) {
      hasLoggedView.current = true;
      logView('employees_list', undefined, 'Employee Directory', { employee_count: employees.length });
    }
  }, [loading, employees.length]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Fetch profiles - optionally filter by company
      let profilesQuery = supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, company_id');
      
      if (selectedCompanyId !== "all") {
        profilesQuery = profilesQuery.eq('company_id', selectedCompanyId);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;

      // Fetch employee positions with position and department details
      const { data: positions, error: positionsError } = await supabase
        .from('employee_positions')
        .select(`
          employee_id,
          is_active,
          assignment_type,
          positions:position_id (
            title,
            departments:department_id (
              name,
              company_id,
              companies:company_id (
                city,
                country
              )
            )
          )
        `)
        .eq('is_active', true);

      if (positionsError) throw positionsError;

      // Create a map of employee positions (array of positions per employee)
      const positionMap = new Map<string, {
        positions: EmployeePosition[];
        location: string | null;
      }>();

      positions?.forEach((ep: any) => {
        if (ep.positions) {
          const location = ep.positions.departments?.companies 
            ? `${ep.positions.departments.companies.city || ''}, ${ep.positions.departments.companies.country || ''}`.replace(/^, |, $/g, '')
            : null;
          
          const positionData: EmployeePosition = {
            position_title: ep.positions.title,
            department_name: ep.positions.departments?.name || null,
            assignment_type: ep.assignment_type || 'permanent',
          };

          const existing = positionMap.get(ep.employee_id);
          if (existing) {
            existing.positions.push(positionData);
            if (!existing.location && location) {
              existing.location = location;
            }
          } else {
            positionMap.set(ep.employee_id, {
              positions: [positionData],
              location: location || null,
            });
          }
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
          positions: positionData?.positions || [],
          location: positionData?.location || null,
          is_active: (positionData?.positions?.length || 0) > 0,
        };
      });

      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments for filter
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    employees.forEach(emp => {
      emp.positions.forEach(pos => {
        if (pos.department_name) deptSet.add(pos.department_name);
      });
    });
    return Array.from(deptSet).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search filter - check across all positions
      const positionSearchMatch = emp.positions.some(pos => 
        pos.position_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pos.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
      const matchesSearch = 
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        positionSearchMatch;
      
      // Status filter
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && emp.is_active) ||
        (statusFilter === "unassigned" && !emp.is_active);
      
      // Department filter - check if any position matches
      const matchesDepartment = 
        departmentFilter === "all" || 
        emp.positions.some(pos => pos.department_name === departmentFilter);

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchQuery, statusFilter, departmentFilter]);

  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (departmentFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchEmployees();
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employeeToDelete.id);

      if (error) throw error;

      await logAction({
        action: 'DELETE',
        entityType: 'employee',
        entityId: employeeToDelete.id,
        entityName: employeeToDelete.full_name,
      });

      setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
      toast.success(`${employeeToDelete.full_name} has been deleted`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("workforce.title"), href: "/workforce" },
          { label: t("workforce.employees") }
        ]} />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("workforce.employees")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t("workforce.manageWorkforce")}
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("workforce.addEmployee")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-slide-up">
          {/* Company Filter */}
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-card-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">{t("workforce.allCompanies")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("workforce.searchEmployees")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-all hover:bg-accent">
                <Filter className="h-4 w-4" />
                {t("workforce.filters")}
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{t("workforce.filters")}</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                      {t("workforce.clearAll")}
                    </Button>
                  )}
                </div>
                
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("workforce.status")}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: t("workforce.all") },
                      { value: "active", label: t("workforce.active") },
                      { value: "unassigned", label: t("workforce.unassigned") },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value as typeof statusFilter)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                          statusFilter === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {statusFilter === option.value && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("workforce.department")}</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">{t("workforce.allDepartments")}</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {!canViewPii && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600">
                  <EyeOff className="h-3.5 w-3.5" />
                  {t("workforce.piiHidden")}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("workforce.piiHiddenTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("workforce.activeFilters")}:</span>
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {t("workforce.status")}: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {departmentFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {t("workforce.department")}: {departmentFilter}
                <button onClick={() => setDepartmentFilter("all")} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

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
            <h3 className="mt-4 text-lg font-medium text-foreground">{t("workforce.noEmployeesFound")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || activeFiltersCount > 0 
                ? t("workforce.tryAdjustingFilters") 
                : t("workforce.addEmployeesToStart")}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                {t("workforce.clearFilters")}
              </Button>
            )}
          </div>
        )}

        {/* Employee Grid View */}
        {!loading && filteredEmployees.length > 0 && viewMode === "grid" && (
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
                    <div className="min-w-0">
                      <h3 className="font-semibold text-card-foreground">
                        {employee.full_name}
                      </h3>
                      {employee.positions.length > 0 ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {employee.positions[0].position_title}
                          {employee.positions.length > 1 && (
                            <span className="text-xs ml-1">+{employee.positions.length - 1}</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("workforce.noPositionAssigned")}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(employee)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Positions Section */}
                {employee.positions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {employee.positions.map((pos, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs capitalize shrink-0",
                            pos.assignment_type === 'acting' && "border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/30",
                            pos.assignment_type === 'permanent' && "border-primary/50 text-primary bg-primary/5",
                            pos.assignment_type === 'temporary' && "border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                          )}
                        >
                          {pos.assignment_type}
                        </Badge>
                        <span className="text-muted-foreground truncate">
                          {pos.position_title}
                          {pos.department_name && <span className="text-xs ml-1">({pos.department_name})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className={cn("truncate", !canViewPii && "font-mono text-xs")}>
                      {maskPii(employee.email, "email")}
                    </span>
                  </div>
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
                    {employee.is_active ? t("workforce.active") : t("workforce.unassigned")}
                  </span>
                  <button 
                    onClick={() => navigate(`/workforce/employees/${employee.id}`)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t("workforce.viewProfile")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employee List View */}
        {!loading && filteredEmployees.length > 0 && viewMode === "list" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">{t("workforce.employee")}</TableHead>
                  <TableHead>{t("workforce.position")}</TableHead>
                  <TableHead>{t("workforce.department")}</TableHead>
                  <TableHead>{t("workforce.email")}</TableHead>
                  <TableHead>{t("workforce.location")}</TableHead>
                  <TableHead>{t("workforce.status")}</TableHead>
                  <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow 
                    key={employee.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/workforce/employees/${employee.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatar_url || undefined} alt={employee.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(employee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{employee.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.positions.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{employee.positions[0].position_title}</span>
                          {employee.positions.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              +{employee.positions.length - 1}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">{t("workforce.noPositionAssigned")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.positions.length > 0 && employee.positions[0].department_name ? (
                        <span className="text-sm">{employee.positions[0].department_name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm", !canViewPii && "font-mono text-xs")}>
                        {maskPii(employee.email, "email")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {employee.location ? (
                        <span className={cn("text-sm", !canViewPii && "font-mono text-xs")}>
                          {maskPii(employee.location, "text")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          employee.is_active
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {employee.is_active ? t("workforce.active") : t("workforce.unassigned")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(employee);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(employee);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("workforce.deleteEmployee")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("workforce.deleteEmployeeConfirm", { name: employeeToDelete?.full_name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Employee Dialog */}
        <EmployeeEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          employee={employeeToEdit}
          onSuccess={handleEditSuccess}
        />

        {/* Add Employee Dialog */}
        <AddEmployeeDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={fetchEmployees}
        />
      </div>
    </AppLayout>
  );
}
