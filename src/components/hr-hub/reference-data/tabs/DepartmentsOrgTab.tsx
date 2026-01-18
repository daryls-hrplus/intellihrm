import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccessibleCompanies } from "@/hooks/useUserAccessibleCompanies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Copy, Check, Loader2, FolderTree, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  company_id: string;
  company_code: string;
  company_name: string;
  division_name: string | null;
  parent_department_name: string | null;
}

export function DepartmentsOrgTab() {
  const { profile } = useAuth();
  const { companies, companyIds, isLoading: companiesLoading } = useUserAccessibleCompanies();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments-org-reference", companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await (supabase as any)
        .from("departments")
        .select(`
          id, code, name, description, is_active, company_id,
          companies!departments_company_id_fkey(code, name),
          divisions!departments_division_id_fkey(name),
          parent:departments!departments_parent_department_id_fkey(name)
        `)
        .in("company_id", companyIds)
        .order("code", { ascending: true });

      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        description: d.description,
        is_active: d.is_active,
        company_id: d.company_id,
        company_code: d.companies?.code || "",
        company_name: d.companies?.name || "",
        division_name: d.divisions?.name || null,
        parent_department_name: d.parent?.name || null,
      })) as Department[];
    },
    enabled: companyIds.length > 0,
  });

  const filteredDepartments = useMemo(() => {
    let result = departments;

    if (companyFilter !== "all") {
      result = result.filter(d => d.company_id === companyFilter);
    }

    if (statusFilter === "active") {
      result = result.filter(d => d.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter(d => !d.is_active);
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        d =>
          d.code.toLowerCase().includes(lowerSearch) ||
          d.name.toLowerCase().includes(lowerSearch) ||
          (d.description && d.description.toLowerCase().includes(lowerSearch)) ||
          (d.division_name && d.division_name.toLowerCase().includes(lowerSearch))
      );
    }

    return result;
  }, [departments, companyFilter, statusFilter, search]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["department_code", "name", "description", "division", "company_code", "company_name", "status"];
    const rows = filteredDepartments.map(d => [
      d.code,
      `"${(d.name || "").replace(/"/g, '""')}"`,
      `"${(d.description || "").replace(/"/g, '""')}"`,
      d.division_name || "",
      d.company_code,
      `"${(d.company_name || "").replace(/"/g, '""')}"`,
      d.is_active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departments.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filteredDepartments.length} departments`);
  };

  if (isLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, name, or division..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[220px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.isCurrentCompany && "(Your Company)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <FolderTree className="h-3 w-3" />
              {filteredDepartments.length} departments
            </Badge>
            {companies.length > 1 && (
              <Badge variant="outline">
                {companies.length} companies
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Division</TableHead>
                <TableHead className="hidden sm:table-cell">Company</TableHead>
                <TableHead className="w-20 text-center">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No departments found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id} className={cn(!dept.is_active && "opacity-60")}>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {dept.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={cn(!dept.is_active && "line-through")}>
                          {dept.name}
                        </span>
                        {dept.parent_department_name && (
                          <span className="text-xs text-muted-foreground">
                            in {dept.parent_department_name}
                          </span>
                        )}
                        {!dept.is_active && (
                          <Badge variant="outline" className="text-xs w-fit mt-0.5">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {dept.division_name || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {dept.company_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyCode(dept.code)}
                        className="h-8 w-8"
                      >
                        {copiedCode === dept.code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Departments from companies you have access to. Use department codes in bulk imports and API references.
      </p>
    </div>
  );
}
