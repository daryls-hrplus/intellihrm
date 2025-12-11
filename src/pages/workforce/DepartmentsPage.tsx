import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, Building2, ChevronRight, ChevronDown, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export default function DepartmentsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      
      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompanyId(data[0].id);
      }
      setIsLoading(false);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    
    const fetchDepartments = async () => {
      setIsLoading(true);
      
      const { data: depts } = await supabase
        .from("departments")
        .select("id, name, code, description, is_active")
        .eq("company_id", selectedCompanyId)
        .order("name");

      if (depts) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name, code, description, is_active, department_id")
          .in("department_id", depts.map(d => d.id))
          .order("name");

        const departmentsWithSections = depts.map(dept => ({
          ...dept,
          sections: sections?.filter(s => s.department_id === dept.id) || []
        }));

        setDepartments(departmentsWithSections);
      }
      
      setIsLoading(false);
    };
    
    fetchDepartments();
  }, [selectedCompanyId]);

  const toggleDept = (deptId: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FolderTree className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Departments
              </h1>
              <p className="text-muted-foreground">
                View departments and sections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : departments.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No departments found for this company.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {departments.map((dept) => (
              <div key={dept.id} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  onClick={() => toggleDept(dept.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {dept.sections.length > 0 ? (
                      expandedDepts.has(dept.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                    <FolderTree className="h-5 w-5 text-warning" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dept.sections.length > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {dept.sections.length} sections
                      </Badge>
                    )}
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </button>
                
                {expandedDepts.has(dept.id) && dept.sections.length > 0 && (
                  <div className="border-t border-border bg-muted/30">
                    {dept.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between px-4 py-3 pl-12 border-b border-border last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{section.name}</p>
                            <p className="text-sm text-muted-foreground">{section.code}</p>
                          </div>
                        </div>
                        <Badge variant={section.is_active ? "outline" : "secondary"}>
                          {section.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
