import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  CheckCircle2,
  FolderTree,
  Briefcase,
  Users,
  Layers
} from "lucide-react";

export interface CompanyStructure {
  hasDivisions: boolean;
  hasDepartments: boolean;
  hasSections: boolean;
  hasJobFamilies: boolean;
  hasJobs: boolean;
  hasPositions: boolean;
  hasEmployees: boolean;
  divisionCount: number;
  departmentCount: number;
  sectionCount: number;
  jobFamilyCount: number;
  jobCount: number;
  positionCount: number;
  employeeCount: number;
}

interface CompanyOption {
  id: string;
  code: string;
  name: string;
  structure: CompanyStructure;
}

interface WizardStepCompanySelectionProps {
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string, companyCode: string, structure: CompanyStructure) => void;
}

export function WizardStepCompanySelection({ 
  selectedCompanyId, 
  onSelectCompany 
}: WizardStepCompanySelectionProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompaniesWithStructure();
  }, []);

  const fetchCompaniesWithStructure = async () => {
    setLoading(true);
    
    try {
      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, code, name")
        .eq("is_active", true)
        .order("name");

      if (companiesError) throw companiesError;
      if (!companiesData || companiesData.length === 0) {
        setCompanies([]);
        setLoading(false);
        return;
      }

      // For each company, get organizational counts
      const companyOptions: CompanyOption[] = await Promise.all(
        companiesData.map(async (company) => {
          // Run all count queries in parallel - cast to any to avoid deep type instantiation
          const divisionsQuery = (supabase.from("company_divisions") as any).select("id", { count: "exact", head: true }).eq("company_id", company.id);
          const departmentsQuery = (supabase.from("departments") as any).select("id", { count: "exact", head: true }).eq("company_id", company.id);
          const sectionsQuery = (supabase.from("sections") as any).select("id", { count: "exact", head: true }).eq("company_id", company.id);
          const jobFamiliesQuery = (supabase.from("job_families") as any).select("id", { count: "exact", head: true }).eq("company_id", company.id);
          const jobsQuery = (supabase.from("jobs") as any).select("id", { count: "exact", head: true }).eq("company_id", company.id);
          const positionsQuery = (supabase.from("positions") as any).select("id", { count: "exact", head: true }).eq("company_id", company.id);

          const [
            divisionsResult,
            departmentsResult,
            sectionsResult,
            jobFamiliesResult,
            jobsResult,
            positionsResult,
          ] = await Promise.all([
            divisionsQuery,
            departmentsQuery,
            sectionsQuery,
            jobFamiliesQuery,
            jobsQuery,
            positionsQuery,
          ]);

          const structure: CompanyStructure = {
            hasDivisions: (divisionsResult.count || 0) > 0,
            hasDepartments: (departmentsResult.count || 0) > 0,
            hasSections: (sectionsResult.count || 0) > 0,
            hasJobFamilies: (jobFamiliesResult.count || 0) > 0,
            hasJobs: (jobsResult.count || 0) > 0,
            hasPositions: (positionsResult.count || 0) > 0,
            hasEmployees: false, // Will add later if needed
            divisionCount: divisionsResult.count || 0,
            departmentCount: departmentsResult.count || 0,
            sectionCount: sectionsResult.count || 0,
            jobFamilyCount: jobFamiliesResult.count || 0,
            jobCount: jobsResult.count || 0,
            positionCount: positionsResult.count || 0,
            employeeCount: 0,
          };

          return {
            id: company.id,
            code: company.code || "",
            name: company.name,
            structure,
          };
        })
      );

      setCompanies(companyOptions);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextImportStep = (structure: CompanyStructure): string => {
    if (!structure.hasDepartments && !structure.hasDivisions) {
      return "Divisions or Departments";
    }
    if (!structure.hasJobFamilies) {
      return "Job Families";
    }
    if (!structure.hasJobs) {
      return "Jobs";
    }
    if (!structure.hasPositions) {
      return "Positions";
    }
    return "Employee Assignments";
  };

  const getCompletionPercentage = (structure: CompanyStructure): number => {
    const steps = [
      structure.hasDivisions || structure.hasDepartments, // At least one org structure
      structure.hasDepartments,
      structure.hasJobFamilies,
      structure.hasJobs,
      structure.hasPositions,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-1">Select Target Company</h2>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-1">Select Target Company</h2>
          <p className="text-muted-foreground">
            No companies found. You'll need to import companies first.
          </p>
        </div>
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Start by importing your company data. The wizard will guide you through the process.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Select Target Company</h2>
        <p className="text-muted-foreground">
          Choose the company you want to import data for. The wizard will adapt based on the company's structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => {
          const isSelected = selectedCompanyId === company.id;
          const nextStep = getNextImportStep(company.structure);
          const completion = getCompletionPercentage(company.structure);

          return (
            <Card
              key={company.id}
              className={`
                cursor-pointer transition-all duration-200
                ${isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50 hover:shadow-md"}
              `}
              onClick={() => onSelectCompany(company.id, company.code, company.structure)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                    <Building2 className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{company.name}</h4>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{company.code}</p>

                    {/* Structure badges - always show all counts */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge 
                        variant={company.structure.divisionCount > 0 ? "secondary" : "outline"} 
                        className="text-xs gap-1"
                      >
                        <FolderTree className="h-3 w-3" />
                        {company.structure.divisionCount} Divisions
                      </Badge>
                      <Badge 
                        variant={company.structure.departmentCount > 0 ? "secondary" : "outline"} 
                        className="text-xs gap-1"
                      >
                        <FolderTree className="h-3 w-3" />
                        {company.structure.departmentCount} Depts
                      </Badge>
                      <Badge 
                        variant={company.structure.sectionCount > 0 ? "secondary" : "outline"} 
                        className="text-xs gap-1"
                      >
                        <Layers className="h-3 w-3" />
                        {company.structure.sectionCount} Sections
                      </Badge>
                      <Badge 
                        variant={company.structure.jobCount > 0 ? "secondary" : "outline"} 
                        className="text-xs gap-1"
                      >
                        <Briefcase className="h-3 w-3" />
                        {company.structure.jobCount} Jobs
                      </Badge>
                      <Badge 
                        variant={company.structure.positionCount > 0 ? "secondary" : "outline"} 
                        className="text-xs gap-1"
                      >
                        <Users className="h-3 w-3" />
                        {company.structure.positionCount} Positions
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Import Progress</span>
                        <span>{completion}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Next: <span className="font-medium">{nextStep}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info about creating a new company */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Don't see your company? If you need to import a new company, select any company above and 
          choose "Companies" as the import type to add new ones.
        </p>
      </div>
    </div>
  );
}
