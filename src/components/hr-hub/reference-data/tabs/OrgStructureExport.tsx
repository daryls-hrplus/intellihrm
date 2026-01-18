import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, Users, Building2, FolderTree, Briefcase, Package } from "lucide-react";
import { toast } from "sonner";

interface ExportCounts {
  positions: number;
  departments: number;
  jobFamilies: number;
  companies: number;
}

export function OrgStructureExport() {
  const { profile } = useAuth();
  const { groupCompanies, isLoading: companiesLoading } = useCompanyRelationships(profile?.company_id);
  
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    positions: true,
    departments: true,
    jobFamilies: true,
    companies: true,
  });
  
  const [selectedCompanies, setSelectedCompanies] = useState<Record<string, boolean>>({});
  const [activeOnly, setActiveOnly] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const companyIds = useMemo(() => groupCompanies.map(c => c.id), [groupCompanies]);

  // Initialize selected companies when they load
  useMemo(() => {
    if (groupCompanies.length > 0 && Object.keys(selectedCompanies).length === 0) {
      const initial: Record<string, boolean> = {};
      groupCompanies.forEach(c => { initial[c.id] = true; });
      setSelectedCompanies(initial);
    }
  }, [groupCompanies, selectedCompanies]);

  const selectedCompanyIds = useMemo(() => 
    Object.entries(selectedCompanies)
      .filter(([_, selected]) => selected)
      .map(([id]) => id),
    [selectedCompanies]
  );

  // Fetch counts
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ["org-export-counts", selectedCompanyIds, activeOnly],
    queryFn: async (): Promise<ExportCounts> => {
      if (selectedCompanyIds.length === 0) {
        return { positions: 0, departments: 0, jobFamilies: 0, companies: selectedCompanyIds.length };
      }

      const [positionsRes, departmentsRes, jobFamiliesRes] = await Promise.all([
        (supabase as any)
          .from("positions")
          .select("id", { count: "exact", head: true })
          .in("company_id", selectedCompanyIds)
          .eq(activeOnly ? "is_active" : "id", activeOnly ? true : null as any),
        (supabase as any)
          .from("departments")
          .select("id", { count: "exact", head: true })
          .in("company_id", selectedCompanyIds)
          .eq(activeOnly ? "is_active" : "id", activeOnly ? true : null as any),
        (supabase as any)
          .from("company_job_families")
          .select("id", { count: "exact", head: true })
          .in("company_id", selectedCompanyIds)
          .eq(activeOnly ? "is_active" : "id", activeOnly ? true : null as any),
      ]);

      return {
        positions: positionsRes.count || 0,
        departments: departmentsRes.count || 0,
        jobFamilies: jobFamiliesRes.count || 0,
        companies: selectedCompanyIds.length,
      };
    },
    enabled: selectedCompanyIds.length > 0,
  });

  const handleExport = async () => {
    if (selectedCompanyIds.length === 0) {
      toast.error("Please select at least one company");
      return;
    }

    const anySelected = Object.values(selectedTypes).some(v => v);
    if (!anySelected) {
      toast.error("Please select at least one data type to export");
      return;
    }

    setIsExporting(true);
    const files: { name: string; content: string }[] = [];

    try {
      // Export Positions
      if (selectedTypes.positions) {
        const { data } = await (supabase as any)
          .from("positions")
          .select(`
            code, title, description, employment_type, employment_status, is_active,
            companies!positions_company_id_fkey(code, name),
            departments!positions_department_id_fkey(code, name),
            supervisor:positions!positions_reports_to_position_id_fkey(code)
          `)
          .in("company_id", selectedCompanyIds)
          .order("code");

        if (data && data.length > 0) {
          const headers = ["position_code", "title", "description", "department_code", "supervisor_code", "employment_type", "employment_status", "company_code", "status"];
          const rows = (data as any[]).map((p) => [
            p.code,
            `"${(p.title || "").replace(/"/g, '""')}"`,
            `"${(p.description || "").replace(/"/g, '""')}"`,
            p.departments?.code || "",
            p.supervisor?.code || "",
            p.employment_type || "",
            p.employment_status || "",
            p.companies?.code || "",
            p.is_active ? "Active" : "Inactive",
          ].join(","));
          files.push({ name: "positions.csv", content: [headers.join(","), ...rows].join("\n") });
        }
      }

      // Export Departments
      if (selectedTypes.departments) {
        const { data } = await (supabase as any)
          .from("departments")
          .select(`
            code, name, description, is_active,
            companies!departments_company_id_fkey(code, name),
            divisions!departments_division_id_fkey(name)
          `)
          .in("company_id", selectedCompanyIds)
          .order("code");

        if (data && data.length > 0) {
          const headers = ["department_code", "name", "description", "division", "company_code", "status"];
          const rows = (data as any[]).map((d) => [
            d.code,
            `"${(d.name || "").replace(/"/g, '""')}"`,
            `"${(d.description || "").replace(/"/g, '""')}"`,
            (d.divisions as any)?.name || "",
            (d.companies as any)?.code || "",
            d.is_active ? "Active" : "Inactive",
          ].join(","));
          files.push({ name: "departments.csv", content: [headers.join(","), ...rows].join("\n") });
        }
      }

      // Export Job Families
      if (selectedTypes.jobFamilies) {
        const { data } = await (supabase as any)
          .from("company_job_families")
          .select(`
            code, name, description, is_active,
            companies!company_job_families_company_id_fkey(code, name),
            master_job_families!company_job_families_master_job_family_id_fkey(code, name)
          `)
          .in("company_id", selectedCompanyIds)
          .order("code");

        if (data && data.length > 0) {
          const headers = ["job_family_code", "name", "description", "master_job_family", "company_code", "status"];
          const rows = (data as any[]).map((jf) => [
            jf.code,
            `"${(jf.name || "").replace(/"/g, '""')}"`,
            `"${(jf.description || "").replace(/"/g, '""')}"`,
            (jf.master_job_families as any)?.name || "",
            (jf.companies as any)?.code || "",
            jf.is_active ? "Active" : "Inactive",
          ].join(","));
          files.push({ name: "job_families.csv", content: [headers.join(","), ...rows].join("\n") });
        }
      }

      // Export Companies
      if (selectedTypes.companies) {
        const selectedGroupCompanies = groupCompanies.filter(c => selectedCompanyIds.includes(c.id));
        const headers = ["company_code", "company_name", "is_your_company"];
        const rows = selectedGroupCompanies.map(c => [
          c.code,
          `"${(c.name || "").replace(/"/g, '""')}"`,
          c.isCurrentCompany ? "Yes" : "No",
        ].join(","));
        files.push({ name: "companies.csv", content: [headers.join(","), ...rows].join("\n") });
      }

      // Download files
      if (files.length === 1) {
        // Single file - download directly
        const blob = new Blob([files[0].content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = files[0].name;
        a.click();
        URL.revokeObjectURL(url);
      } else if (files.length > 1) {
        // Multiple files - download as combined CSV with separators
        const combined = files.map(f => 
          `# === ${f.name.toUpperCase().replace('.CSV', '')} ===\n${f.content}`
        ).join("\n\n");
        
        const blob = new Blob([combined], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "org_structure_export.csv";
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Exported ${files.length} data type(s) successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev => ({ ...prev, [companyId]: !prev[companyId] }));
  };

  const toggleAllCompanies = (selected: boolean) => {
    const updated: Record<string, boolean> = {};
    groupCompanies.forEach(c => { updated[c.id] = selected; });
    setSelectedCompanies(updated);
  };

  if (companiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allCompaniesSelected = groupCompanies.length > 0 && 
    groupCompanies.every(c => selectedCompanies[c.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Data Types
          </CardTitle>
          <CardDescription>
            Choose which organizational data to include in the export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={selectedTypes.positions}
                onCheckedChange={() => toggleType("positions")}
              />
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Positions</div>
                {counts && (
                  <div className="text-sm text-muted-foreground">{counts.positions} records</div>
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={selectedTypes.departments}
                onCheckedChange={() => toggleType("departments")}
              />
              <FolderTree className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Departments</div>
                {counts && (
                  <div className="text-sm text-muted-foreground">{counts.departments} records</div>
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={selectedTypes.jobFamilies}
                onCheckedChange={() => toggleType("jobFamilies")}
              />
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Job Families</div>
                {counts && (
                  <div className="text-sm text-muted-foreground">{counts.jobFamilies} records</div>
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={selectedTypes.companies}
                onCheckedChange={() => toggleType("companies")}
              />
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Companies</div>
                {counts && (
                  <div className="text-sm text-muted-foreground">{counts.companies} records</div>
                )}
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Companies
              </CardTitle>
              <CardDescription>
                Choose which companies to include in the export
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleAllCompanies(!allCompaniesSelected)}
            >
              {allCompaniesSelected ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {groupCompanies.map(company => (
            <label 
              key={company.id}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox 
                checked={selectedCompanies[company.id] || false}
                onCheckedChange={() => toggleCompany(company.id)}
              />
              <code className="px-2 py-0.5 bg-muted rounded text-sm font-mono">
                {company.code}
              </code>
              <span className="flex-1">{company.name}</span>
              {company.isCurrentCompany && (
                <Badge variant="default" className="text-xs">Your Company</Badge>
              )}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox 
              checked={activeOnly}
              onCheckedChange={(checked) => setActiveOnly(!!checked)}
            />
            <span>Active records only</span>
          </label>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {countsLoading ? (
                "Calculating..."
              ) : (
                `Ready to export ${Object.values(selectedTypes).filter(Boolean).length} data type(s)`
              )}
            </div>
            <Button onClick={handleExport} disabled={isExporting || selectedCompanyIds.length === 0}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Download Export"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Export all organizational structure data for offline reference, backup, or migration purposes.
        The export includes position codes, departments, job families, and company information.
      </p>
    </div>
  );
}
