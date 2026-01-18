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
import { Search, Download, Copy, Check, Loader2, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompanyJobFamily {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  company_id: string;
  company_code: string;
  company_name: string;
  master_job_family_name: string | null;
  master_job_family_code: string | null;
}

export function CompanyJobFamiliesTab() {
  const { profile } = useAuth();
  const { companies, companyIds, isLoading: companiesLoading } = useUserAccessibleCompanies();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: jobFamilies = [], isLoading } = useQuery({
    queryKey: ["company-job-families-org-reference", companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];

      const { data, error } = await (supabase as any)
        .from("company_job_families")
        .select(`
          id, code, name, description, is_active, company_id,
          companies!company_job_families_company_id_fkey(code, name),
          master_job_families!company_job_families_master_job_family_id_fkey(code, name)
        `)
        .in("company_id", companyIds)
        .order("code", { ascending: true });

      if (error) throw error;

      return (data || []).map((jf: any) => ({
        id: jf.id,
        code: jf.code,
        name: jf.name,
        description: jf.description,
        is_active: jf.is_active,
        company_id: jf.company_id,
        company_code: jf.companies?.code || "",
        company_name: jf.companies?.name || "",
        master_job_family_name: jf.master_job_families?.name || null,
        master_job_family_code: jf.master_job_families?.code || null,
      })) as CompanyJobFamily[];
    },
    enabled: companyIds.length > 0,
  });

  const filteredJobFamilies = useMemo(() => {
    let result = jobFamilies;

    if (companyFilter !== "all") {
      result = result.filter(jf => jf.company_id === companyFilter);
    }

    if (statusFilter === "active") {
      result = result.filter(jf => jf.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter(jf => !jf.is_active);
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        jf =>
          jf.code.toLowerCase().includes(lowerSearch) ||
          jf.name.toLowerCase().includes(lowerSearch) ||
          (jf.description && jf.description.toLowerCase().includes(lowerSearch)) ||
          (jf.master_job_family_name && jf.master_job_family_name.toLowerCase().includes(lowerSearch))
      );
    }

    return result;
  }, [jobFamilies, companyFilter, statusFilter, search]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["job_family_code", "name", "description", "master_job_family", "company_code", "company_name", "status"];
    const rows = filteredJobFamilies.map(jf => [
      jf.code,
      `"${(jf.name || "").replace(/"/g, '""')}"`,
      `"${(jf.description || "").replace(/"/g, '""')}"`,
      jf.master_job_family_name || "",
      jf.company_code,
      `"${(jf.company_name || "").replace(/"/g, '""')}"`,
      jf.is_active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "company_job_families.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filteredJobFamilies.length} job families`);
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
              placeholder="Search by code, name, or master family..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} {c.isCurrentCompany && "(Your Company)"}
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
              <Briefcase className="h-3 w-3" />
              {filteredJobFamilies.length} job families
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
                <TableHead className="hidden md:table-cell">Master Family</TableHead>
                <TableHead className="hidden sm:table-cell">Company</TableHead>
                <TableHead className="w-20 text-center">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No job families found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobFamilies.map((jf) => (
                  <TableRow key={jf.id} className={cn(!jf.is_active && "opacity-60")}>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {jf.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={cn(!jf.is_active && "line-through")}>
                          {jf.name}
                        </span>
                        {jf.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {jf.description}
                          </span>
                        )}
                        {!jf.is_active && (
                          <Badge variant="outline" className="text-xs w-fit mt-0.5">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {jf.master_job_family_name ? (
                        <Badge variant="secondary" className="text-xs">
                          {jf.master_job_family_name}
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {jf.company_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyCode(jf.code)}
                        className="h-8 w-8"
                      >
                        {copiedCode === jf.code ? (
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
        Company-specific job families from companies you have access to. Use job family codes for position classification.
      </p>
    </div>
  );
}
