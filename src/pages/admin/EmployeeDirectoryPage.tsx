import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Phone, Building, MapPin, Users } from "lucide-react";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  department?: { name: string } | null;
  company?: { name: string } | null;
  position_title?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function EmployeeDirectoryPage() {
  const { profile } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            avatar_url,
            department:departments(name),
            company:companies(name)
          `)
          .eq("is_active", true)
          .order("full_name"),
        supabase
          .from("departments")
          .select("id, name")
          .order("name"),
      ]);

      // Get position titles for employees
      const employeesWithPositions = await Promise.all(
        (empRes.data || []).map(async (emp: any) => {
          const { data: posData } = await supabase
            .from("employee_positions")
            .select("position:positions(title)")
            .eq("employee_id", emp.id)
            .eq("is_active", true)
            .eq("is_primary", true)
            .limit(1);
          
          return {
            ...emp,
            position_title: posData?.[0]?.position?.title || null,
          };
        })
      );

      setEmployees(employeesWithPositions as Employee[]);
      setDepartments((deptRes.data || []) as Department[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesDepartment =
      selectedDepartment === "all" || emp.department?.name === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "Employee Directory" },
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
          <Badge variant="outline" className="gap-1">
            <Users className="h-4 w-4" />
            {filteredEmployees.length} employees
          </Badge>
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
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
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
                      {emp.position_title && (
                        <p className="text-sm text-muted-foreground truncate">{emp.position_title}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <a href={`mailto:${emp.email}`} className="truncate hover:text-primary">
                        {emp.email}
                      </a>
                    </div>
                    {emp.department && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{emp.department.name}</span>
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
