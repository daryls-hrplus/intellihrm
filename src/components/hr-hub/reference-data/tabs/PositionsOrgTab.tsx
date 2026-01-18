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
import { Search, Download, Copy, Check, Loader2, Users, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Position {
  id: string;
  code: string;
  title: string;
  description: string | null;
  employment_type: string | null;
  employment_status: string | null;
  is_active: boolean;
  company_id: string;
  company_code: string;
  company_name: string;
  department_code: string | null;
  department_name: string | null;
  supervisor_code: string | null;
  supervisor_title: string | null;
}

export function PositionsOrgTab() {
  const { profile } = useAuth();
  const { companies, companyIds, isLoading: companiesLoading } = useUserAccessibleCompanies();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions-org-reference", companyIds],
    queryFn: async () => {
      if (companyIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("positions")
        .select(`
          id, code, title, description, employment_type, employment_status, is_active, company_id,
          reports_to_position_id,
          companies!positions_company_id_fkey(code, name),
          departments!positions_department_id_fkey(code, name)
        `)
        .in("company_id", companyIds)
        .order("code", { ascending: true });

      if (error) throw error;

      // Build a map for supervisor lookup (self-referential join not supported well by PostgREST)
      const positionMap = new Map<string, { code: string; title: string }>();
      (data || []).forEach((p: any) => {
        positionMap.set(p.id, { code: p.code, title: p.title });
      });
      
      return (data || []).map((p: any) => {
        const supervisor = p.reports_to_position_id ? positionMap.get(p.reports_to_position_id) : null;
        return {
          id: p.id,
          code: p.code,
          title: p.title,
          description: p.description,
          employment_type: p.employment_type,
          employment_status: p.employment_status,
          is_active: p.is_active,
          company_id: p.company_id,
          company_code: p.companies?.code || "",
          company_name: p.companies?.name || "",
          department_code: p.departments?.code || null,
          department_name: p.departments?.name || null,
          supervisor_code: supervisor?.code || null,
          supervisor_title: supervisor?.title || null,
        };
      }) as Position[];
    },
    enabled: companyIds.length > 0,
  });

  const filteredPositions = useMemo(() => {
    let result = positions;

    // Apply company filter
    if (companyFilter !== "all") {
      result = result.filter(p => p.company_id === companyFilter);
    }

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter(p => p.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter(p => !p.is_active);
    }

    // Apply search filter
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        p =>
          p.code.toLowerCase().includes(lowerSearch) ||
          p.title.toLowerCase().includes(lowerSearch) ||
          (p.description && p.description.toLowerCase().includes(lowerSearch)) ||
          (p.department_name && p.department_name.toLowerCase().includes(lowerSearch))
      );
    }

    return result;
  }, [positions, companyFilter, statusFilter, search]);

  const handleCopyCode = (code: string, companyId: string) => {
    // If from different company, add company prefix
    const currentCompanyId = profile?.company_id;
    let copyValue = code;
    
    if (companyId !== currentCompanyId) {
      const company = companies.find(c => c.id === companyId);
      if (company?.code) {
        copyValue = `${company.code}:${code}`;
      }
    }
    
    navigator.clipboard.writeText(copyValue);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${copyValue}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["position_code", "title", "department", "supervisor_code", "company_code", "company_name", "status", "full_reference"];
    const currentCompanyId = profile?.company_id;
    
    const rows = filteredPositions.map(p => {
      const fullRef = p.company_id !== currentCompanyId && p.company_code
        ? `${p.company_code}:${p.code}`
        : p.code;
      
      return [
        p.code,
        `"${(p.title || "").replace(/"/g, '""')}"`,
        p.department_name || "",
        p.supervisor_code || "",
        p.company_code,
        `"${(p.company_name || "").replace(/"/g, '""')}"`,
        p.is_active ? "Active" : "Inactive",
        fullRef,
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "positions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filteredPositions.length} positions`);
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
              placeholder="Search by code, title, or department..."
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
              <Users className="h-3 w-3" />
              {filteredPositions.length} positions
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
                <TableHead className="w-36">Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden lg:table-cell">Supervisor</TableHead>
                <TableHead className="hidden sm:table-cell">Company</TableHead>
                <TableHead className="w-20 text-center">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No positions found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredPositions.map((position) => {
                  const isOtherCompany = position.company_id !== profile?.company_id;
                  
                  return (
                    <TableRow key={position.id} className={cn(!position.is_active && "opacity-60")}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {position.code}
                          </code>
                          {isOtherCompany && (
                            <span className="text-xs text-muted-foreground">
                              {position.company_code}:{position.code}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={cn(!position.is_active && "line-through")}>
                            {position.title}
                          </span>
                          {!position.is_active && (
                            <Badge variant="outline" className="text-xs w-fit mt-0.5">Inactive</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {position.department_name || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {position.supervisor_code ? (
                          <span title={position.supervisor_title || ""}>
                            {position.supervisor_code}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={isOtherCompany ? "outline" : "secondary"} className="text-xs">
                          {position.company_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(position.code, position.company_id)}
                          className="h-8 w-8"
                          title={isOtherCompany ? `Copy as ${position.company_code}:${position.code}` : "Copy code"}
                        >
                          {copiedCode === position.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Positions from companies you have access to. For cross-company references, use the format{" "}
        <code className="px-1 bg-muted rounded">COMPANY_CODE:POSITION_CODE</code>.
      </p>
    </div>
  );
}
