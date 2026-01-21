import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Helper to avoid deep type instantiation
const query = (table: string) => supabase.from(table as any);
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Phone, Building, Building2, MapPin, Users, LayoutGrid, List, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { format, formatDistanceToNow } from "date-fns";

interface EmployeePosition {
  title: string;
  position_id: string | null;
  department_id: string | null;
  department_name: string | null;
  assignment_type: string;
  is_primary: boolean;
  reports_to_position_id: string | null;
}

interface ManagerInfo {
  id: string;
  full_name: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  company_id: string | null;
  positions: EmployeePosition[];
  company?: { name: string } | null;
  // Enhanced fields
  work_phone?: string | null;
  work_mobile?: string | null;
  extension?: string | null;
  manager?: ManagerInfo | null;
  work_location?: string | null;
  hire_date?: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

export default function EmployeeDirectoryPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const fromHrHub = searchParams.get("from") === "hr-hub";
  const fromAdmin = searchParams.get("from") === "admin";
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (profile?.company_id) {
      loadData();
    }
  }, [profile?.company_id, fromHrHub]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Build employee query
      let empQuery = query("profiles")
        .select("id, full_name, email, avatar_url, department_id, company_id, first_hire_date")
        .eq("is_active", true)
        .order("full_name");

      if (!fromHrHub && profile?.company_id) {
        empQuery = empQuery.eq("company_id", profile.company_id);
      }

      // Fetch all data in parallel for efficiency
      const [empRes, deptRes, companyRes, positionsRes, empPositionsRes, contactsRes, locationsRes]: any[] = await Promise.all([
        empQuery,
        query("departments").select("id, name").order("name"),
        query("companies").select("id, name").eq("is_active", true).order("name"),
        query("positions").select("id, title, department_id, reports_to_position_id"),
        query("employee_positions").select("employee_id, position_id, assignment_type, is_primary").eq("is_active", true),
        query("employee_contacts").select("employee_id, contact_type, contact_value, is_primary").in("contact_type", ["work_phone", "work_mobile", "extension"]),
        query("company_branch_locations").select("id, name, company_id").eq("is_active", true).order("name"),
      ]);

      const empData = empRes.data || [];
      const deptData = deptRes.data || [];
      const companyData = companyRes.data || [];
      const positionsData = positionsRes.data || [];
      const empPositionsData = empPositionsRes.data || [];
      const contactsData = contactsRes.data || [];
      const locationsData = locationsRes.data || [];

      // Build lookup maps for O(1) access
      const deptMap = new Map(deptData.map((d: any) => [d.id, d.name]));
      const companyMap = new Map(companyData.map((c: any) => [c.id, c.name]));
      const positionMap = new Map(positionsData.map((p: any) => [p.id, p]));
      const locationMap = new Map(locationsData.map((l: any) => [l.id, l.name]));

      // Group employee positions by employee_id
      const empPositionsByEmployee = new Map<string, any[]>();
      for (const ep of empPositionsData) {
        if (!empPositionsByEmployee.has(ep.employee_id)) {
          empPositionsByEmployee.set(ep.employee_id, []);
        }
        empPositionsByEmployee.get(ep.employee_id)!.push(ep);
      }

      // Group contacts by employee_id
      const contactsByEmployee = new Map<string, { work_phone?: string; work_mobile?: string; extension?: string }>();
      for (const contact of contactsData) {
        if (!contactsByEmployee.has(contact.employee_id)) {
          contactsByEmployee.set(contact.employee_id, {});
        }
        const empContacts = contactsByEmployee.get(contact.employee_id)!;
        if (contact.contact_type === "work_phone") {
          empContacts.work_phone = contact.contact_value;
        } else if (contact.contact_type === "work_mobile") {
          empContacts.work_mobile = contact.contact_value;
        } else if (contact.contact_type === "extension") {
          empContacts.extension = contact.contact_value;
        }
      }

      // Build position to employee map for manager lookup
      const positionToEmployee = new Map<string, { id: string; full_name: string }>();
      for (const emp of empData) {
        const empPositions = empPositionsByEmployee.get(emp.id) || [];
        const primaryPos = empPositions.find((ep: any) => ep.is_primary);
        if (primaryPos) {
          positionToEmployee.set(primaryPos.position_id, { id: emp.id, full_name: emp.full_name });
        }
      }

      // Build employee list with positions and enhanced fields
      const employeesWithDetails: Employee[] = empData.map((emp: any) => {
        const empPositions = empPositionsByEmployee.get(emp.id) || [];
        // Sort so primary positions come first
        empPositions.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

        const positions: EmployeePosition[] = empPositions.map((ep) => {
          const pos = positionMap.get(ep.position_id) as { id: string; title: string; department_id: string | null; reports_to_position_id: string | null } | undefined;
          return {
            title: pos?.title || "",
            position_id: ep.position_id,
            department_id: pos?.department_id || null,
            department_name: pos?.department_id ? String(deptMap.get(pos.department_id) || "") : null,
            assignment_type: ep.assignment_type || "primary",
            is_primary: ep.is_primary,
            reports_to_position_id: pos?.reports_to_position_id || null,
          };
        });

        // Get manager from primary position's reports_to
        let manager: ManagerInfo | null = null;
        const primaryPosition = positions.find(p => p.is_primary);
        if (primaryPosition?.reports_to_position_id) {
          const managerInfo = positionToEmployee.get(primaryPosition.reports_to_position_id);
          if (managerInfo) {
            manager = managerInfo;
          }
        }

        // Get contacts
        const contacts = contactsByEmployee.get(emp.id) || {};

        return {
          id: emp.id,
          full_name: emp.full_name || "",
          email: emp.email || "",
          avatar_url: emp.avatar_url,
          company_id: emp.company_id || null,
          positions,
          company: emp.company_id ? { name: String(companyMap.get(emp.company_id) || "") } : null,
          work_phone: contacts.work_phone || null,
          work_mobile: contacts.work_mobile || null,
          extension: contacts.extension || null,
          manager,
          hire_date: emp.first_hire_date || null,
        };
      });

      setEmployees(employeesWithDetails);
      setDepartments(deptData as Department[]);
      setCompanies(companyData as Company[]);
      setLocations(locationsData as Location[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const positionTitles = emp.positions.map(p => p.title.toLowerCase()).join(" ");
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      positionTitles.includes(searchTerm.toLowerCase()) ||
      (emp.work_phone && emp.work_phone.includes(searchTerm)) ||
      (emp.extension && emp.extension.includes(searchTerm));

    const matchesDepartment =
      selectedDepartment === "all" || 
      emp.positions.some(p => p.department_id === selectedDepartment);

    const matchesCompany =
      selectedCompany === "all" || emp.company_id === selectedCompany;

    return matchesSearch && matchesDepartment && matchesCompany;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatPhone = (phone?: string | null, extension?: string | null) => {
    if (!phone && !extension) return null;
    let result = phone || "";
    if (extension) {
      result += result ? ` ext. ${extension}` : `ext. ${extension}`;
    }
    return result;
  };

  const formatTenure = (hireDate?: string | null) => {
    if (!hireDate) return null;
    try {
      return formatDistanceToNow(new Date(hireDate), { addSuffix: false });
    } catch {
      return null;
    }
  };

  const breadcrumbItems = fromHrHub
    ? [
        { label: t("navigation.hrHub"), href: "/hr-hub" },
        { label: t("hrHub.employeeDirectory") },
      ]
    : fromAdmin
    ? [
        { label: t("navigation.admin"), href: "/admin" },
        { label: t("hrHub.employeeDirectory") },
      ]
    : [
        { label: t("navigation.ess"), href: "/ess" },
        { label: t("hrHub.employeeDirectory") },
      ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Directory</h1>
            <p className="text-muted-foreground">Find and connect with colleagues</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="gap-1">
              <Users className="h-4 w-4" />
              {filteredEmployees.length} employees
            </Badge>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, position, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Building className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading directory...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No employees found</div>
        ) : viewMode === "list" ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Reports To</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => {
                  const phoneDisplay = formatPhone(emp.work_phone || emp.work_mobile, emp.extension);
                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={emp.avatar_url || undefined} alt={emp.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(emp.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{emp.full_name}</span>
                            {emp.hire_date && (
                              <p className="text-xs text-muted-foreground">
                                {formatTenure(emp.hire_date)} tenure
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {emp.positions.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span>{emp.positions[0].title}</span>
                              {!emp.positions[0].is_primary && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {emp.positions[0].assignment_type}
                                </Badge>
                              )}
                            </div>
                            {emp.positions.length > 1 && (
                              <span className="text-xs text-muted-foreground">
                                +{emp.positions.length - 1} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {emp.positions.length > 0 && emp.positions[0].department_name ? (
                          emp.positions[0].department_name
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {phoneDisplay ? (
                          <a href={`tel:${emp.work_phone || emp.work_mobile}`} className="text-muted-foreground hover:text-primary">
                            {phoneDisplay}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {emp.manager ? (
                          <Link to={`/workforce/employees/${emp.manager.id}`} className="text-primary hover:underline">
                            {emp.manager.full_name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {emp.company ? emp.company.name : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={`mailto:${emp.email}`}>
                                  <Mail className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send Email</TooltipContent>
                          </Tooltip>
                          {(emp.work_phone || emp.work_mobile) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <a href={`tel:${emp.work_phone || emp.work_mobile}`}>
                                    <Phone className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Call</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link to={`/workforce/employees/${emp.id}`}>
                                  <User className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Profile</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((emp) => {
              const phoneDisplay = formatPhone(emp.work_phone || emp.work_mobile, emp.extension);
              return (
                <Card key={emp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={emp.avatar_url || undefined} alt={emp.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(emp.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{emp.full_name}</h3>
                        {emp.positions.length > 0 && (
                          <p className="text-sm text-muted-foreground truncate">
                            {emp.positions[0].title}
                            {!emp.positions[0].is_primary && (
                              <Badge variant="outline" className="ml-1 text-xs capitalize">
                                {emp.positions[0].assignment_type}
                              </Badge>
                            )}
                          </p>
                        )}
                        {emp.company && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{emp.company.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {emp.positions.length > 1 && (
                      <div className="mt-2 space-y-1">
                        {emp.positions.slice(1).map((pos, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="truncate">{pos.title}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {pos.assignment_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      {/* Email */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <a href={`mailto:${emp.email}`} className="truncate hover:text-primary">
                          {emp.email}
                        </a>
                      </div>

                      {/* Phone + Extension - Always Show */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        {phoneDisplay ? (
                          <a href={`tel:${emp.work_phone || emp.work_mobile}`} className="truncate hover:text-primary">
                            {phoneDisplay}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>

                      {/* Department - Always Show */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        {emp.positions.length > 0 && emp.positions[0].department_name ? (
                          <span className="truncate">{emp.positions[0].department_name}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>

                      {/* Work Location - Always Show */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {emp.company?.name ? (
                          <span className="truncate">{emp.company.name}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>

                      {/* Manager - Always Show */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        {emp.manager ? (
                          <span className="truncate">
                            Reports to:{" "}
                            <Link 
                              to={`/workforce/employees/${emp.manager.id}`} 
                              className="hover:text-primary"
                            >
                              {emp.manager.full_name}
                            </Link>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>

                      {/* Tenure - Always Show */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        {emp.hire_date ? (
                          <span className="truncate text-xs">
                            Joined {format(new Date(emp.hire_date), "MMM yyyy")} · {formatTenure(emp.hire_date)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions Footer - Always Show All */}
                    <div className="mt-4 pt-3 border-t flex justify-between items-center">
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`mailto:${emp.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Send Email</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {(emp.work_phone || emp.work_mobile) ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={`tel:${emp.work_phone || emp.work_mobile}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                                <Phone className="h-4 w-4 opacity-40" />
                              </Button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {(emp.work_phone || emp.work_mobile) ? "Call" : "No phone number"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/workforce/employees/${emp.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
