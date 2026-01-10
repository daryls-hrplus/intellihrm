import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Search, Mail, Phone, Building, Building2, MapPin, Users, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface EmployeePosition {
  title: string;
  department_id: string | null;
  department_name: string | null;
  assignment_type: string;
  is_primary: boolean;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  company_id: string | null;
  positions: EmployeePosition[];
  company?: { name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

interface Company {
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
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
        .select("id, full_name, email, avatar_url, department_id, company_id")
        .eq("is_active", true)
        .order("full_name");

      if (!fromHrHub && profile?.company_id) {
        empQuery = empQuery.eq("company_id", profile.company_id);
      }

      // Fetch all data in parallel for efficiency
      const [empRes, deptRes, companyRes, positionsRes, empPositionsRes]: any[] = await Promise.all([
        empQuery,
        query("departments").select("id, name").order("name"),
        query("companies").select("id, name").eq("is_active", true).order("name"),
        query("positions").select("id, title, department_id"),
        query("employee_positions").select("employee_id, position_id, assignment_type, is_primary").eq("is_active", true),
      ]);

      const empData = empRes.data || [];
      const deptData = deptRes.data || [];
      const companyData = companyRes.data || [];
      const positionsData = positionsRes.data || [];
      const empPositionsData = empPositionsRes.data || [];

      // Build lookup maps for O(1) access
      const deptMap = new Map(deptData.map((d: any) => [d.id, d.name]));
      const companyMap = new Map(companyData.map((c: any) => [c.id, c.name]));
      const positionMap = new Map(positionsData.map((p: any) => [p.id, p]));

      // Group employee positions by employee_id
      const empPositionsByEmployee = new Map<string, any[]>();
      for (const ep of empPositionsData) {
        if (!empPositionsByEmployee.has(ep.employee_id)) {
          empPositionsByEmployee.set(ep.employee_id, []);
        }
        empPositionsByEmployee.get(ep.employee_id)!.push(ep);
      }

      // Build employee list with positions (no additional queries needed)
      const employeesWithDetails: Employee[] = empData.map((emp: any) => {
        const empPositions = empPositionsByEmployee.get(emp.id) || [];
        // Sort so primary positions come first
        empPositions.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

        const positions: EmployeePosition[] = empPositions.map((ep) => {
          const pos = positionMap.get(ep.position_id) as { id: string; title: string; department_id: string | null } | undefined;
          return {
            title: pos?.title || "",
            department_id: pos?.department_id || null,
            department_name: pos?.department_id ? String(deptMap.get(pos.department_id) || "") : null,
            assignment_type: ep.assignment_type || "primary",
            is_primary: ep.is_primary,
          };
        });

        return {
          id: emp.id,
          full_name: emp.full_name || "",
          email: emp.email || "",
          avatar_url: emp.avatar_url,
          company_id: emp.company_id || null,
          positions,
          company: emp.company_id ? { name: String(companyMap.get(emp.company_id) || "") } : null,
        };
      });

      setEmployees(employeesWithDetails);
      setDepartments(deptData as Department[]);
      setCompanies(companyData as Company[]);
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
      positionTitles.includes(searchTerm.toLowerCase());

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
              placeholder="Search by name, email, or position..."
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
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={emp.avatar_url || undefined} alt={emp.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(emp.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{emp.full_name}</span>
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
                      {emp.company ? emp.company.name : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${emp.email}`} className="text-primary hover:underline">
                        {emp.email}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((emp) => (
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <a href={`mailto:${emp.email}`} className="truncate hover:text-primary">
                        {emp.email}
                      </a>
                    </div>
                    {emp.positions.length > 0 && emp.positions[0].department_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{emp.positions[0].department_name}</span>
                      </div>
                    )}
                    {emp.company && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{emp.company.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
