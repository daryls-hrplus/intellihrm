import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2, ChevronDown } from "lucide-react";

type ReferenceType = 
  | "jobs"
  | "competencies" 
  | "responsibilities"
  | "education_levels"
  | "fields_of_study"
  | "qualification_types"
  | "accrediting_bodies"
  | "positions"
  | "departments"
  | "countries"
  | "currencies";

interface ReferenceDataDownloadsProps {
  companyId: string;
  availableDownloads: ReferenceType[];
  label?: string;
}

export function ReferenceDataDownloads({ 
  companyId, 
  availableDownloads,
  label = "Reference Data"
}: ReferenceDataDownloadsProps) {
  const [isLoading, setIsLoading] = useState<ReferenceType | null>(null);

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJobs = async () => {
    setIsLoading("jobs");
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("code, name, job_family_id")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("code");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No active jobs found");
        return;
      }

      downloadCSV(
        "jobs_reference.csv",
        ["job_code", "name", "job_family_id"],
        data.map(j => [j.code, j.name, j.job_family_id || ""])
      );
      toast.success(`Downloaded ${data.length} jobs`);
    } catch (error) {
      console.error("Error downloading jobs:", error);
      toast.error("Failed to download jobs reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadCompetencies = async () => {
    setIsLoading("competencies");
    try {
      const { data, error } = await supabase
        .from("skills_competencies")
        .select("code, name, category")
        .eq("company_id", companyId)
        .eq("type", "COMPETENCY")
        .eq("status", "active")
        .order("code");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No active competencies found");
        return;
      }

      downloadCSV(
        "competencies_reference.csv",
        ["competency_code", "name", "category"],
        data.map(c => [c.code, c.name, c.category || ""])
      );
      toast.success(`Downloaded ${data.length} competencies`);
    } catch (error) {
      console.error("Error downloading competencies:", error);
      toast.error("Failed to download competencies reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadResponsibilities = async () => {
    setIsLoading("responsibilities");
    try {
      const { data, error } = await supabase
        .from("responsibilities")
        .select("code, name, description")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("code");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No active responsibilities found");
        return;
      }

      downloadCSV(
        "responsibilities_reference.csv",
        ["responsibility_code", "name", "description"],
        data.map(r => [r.code, r.name, r.description || ""])
      );
      toast.success(`Downloaded ${data.length} responsibilities`);
    } catch (error) {
      console.error("Error downloading responsibilities:", error);
      toast.error("Failed to download responsibilities reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadEducationLevels = async () => {
    setIsLoading("education_levels");
    try {
      const { data, error } = await supabase
        .from("education_levels")
        .select("code, name, display_order")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No education levels found");
        return;
      }

      downloadCSV(
        "education_levels_reference.csv",
        ["education_level_code", "name", "display_order"],
        data.map(e => [e.code, e.name, String(e.display_order || "")])
      );
      toast.success(`Downloaded ${data.length} education levels`);
    } catch (error) {
      console.error("Error downloading education levels:", error);
      toast.error("Failed to download education levels reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadFieldsOfStudy = async () => {
    setIsLoading("fields_of_study");
    try {
      const { data, error } = await supabase
        .from("fields_of_study")
        .select("code, name, category")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No fields of study found");
        return;
      }

      downloadCSV(
        "fields_of_study_reference.csv",
        ["field_code", "name", "category"],
        data.map(f => [f.code, f.name, f.category || ""])
      );
      toast.success(`Downloaded ${data.length} fields of study`);
    } catch (error) {
      console.error("Error downloading fields of study:", error);
      toast.error("Failed to download fields of study reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadQualificationTypes = async () => {
    setIsLoading("qualification_types");
    try {
      const { data, error } = await supabase
        .from("qualification_types")
        .select("code, name, record_type, description")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No qualification types found");
        return;
      }

      downloadCSV(
        "qualification_types_reference.csv",
        ["qualification_type_code", "name", "record_type", "description"],
        data.map(q => [q.code, q.name, q.record_type || "", q.description || ""])
      );
      toast.success(`Downloaded ${data.length} qualification types`);
    } catch (error) {
      console.error("Error downloading qualification types:", error);
      toast.error("Failed to download qualification types reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadAccreditingBodies = async () => {
    setIsLoading("accrediting_bodies");
    try {
      const { data, error } = await supabase
        .from("accrediting_bodies")
        .select("code, name, short_name, country")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No accrediting bodies found");
        return;
      }

      downloadCSV(
        "accrediting_bodies_reference.csv",
        ["accrediting_body_code", "name", "short_name", "country"],
        data.map(a => [a.code || "", a.name, a.short_name || "", a.country || ""])
      );
      toast.success(`Downloaded ${data.length} accrediting bodies`);
    } catch (error) {
      console.error("Error downloading accrediting bodies:", error);
      toast.error("Failed to download accrediting bodies reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadPositions = async () => {
    setIsLoading("positions");
    try {
      const { data, error } = await supabase
        .from("positions")
        .select("code, title, job_id")
        .eq("company_id", companyId)
        .order("code");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No positions found");
        return;
      }

      downloadCSV(
        "positions_reference.csv",
        ["position_code", "title", "job_id"],
        data.map(p => [p.code, p.title, p.job_id || ""])
      );
      toast.success(`Downloaded ${data.length} positions`);
    } catch (error) {
      console.error("Error downloading positions:", error);
      toast.error("Failed to download positions reference");
    } finally {
      setIsLoading(null);
    }
  };

  const downloadDepartments = async () => {
    setIsLoading("departments");
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("code, name, description")
        .eq("company_id", companyId)
        .order("code");

      if (error) throw error;
      if (!data?.length) {
        toast.warning("No departments found");
        return;
      }

      downloadCSV(
        "departments_reference.csv",
        ["department_code", "name", "description"],
        data.map(d => [d.code || "", d.name, d.description || ""])
      );
      toast.success(`Downloaded ${data.length} departments`);
    } catch (error) {
      console.error("Error downloading departments:", error);
      toast.error("Failed to download departments reference");
    } finally {
      setIsLoading(null);
    }
  };

  const handlers: Record<ReferenceType, () => Promise<void>> = {
    jobs: downloadJobs,
    competencies: downloadCompetencies,
    responsibilities: downloadResponsibilities,
    education_levels: downloadEducationLevels,
    fields_of_study: downloadFieldsOfStudy,
    qualification_types: downloadQualificationTypes,
    accrediting_bodies: downloadAccreditingBodies,
    positions: downloadPositions,
    departments: downloadDepartments,
    countries: async () => { toast.info("Countries download not yet implemented"); },
    currencies: async () => { toast.info("Currencies download not yet implemented"); },
  };

  const labels: Record<ReferenceType, string> = {
    jobs: "Jobs",
    competencies: "Competencies",
    responsibilities: "Responsibilities",
    education_levels: "Education Levels",
    fields_of_study: "Fields of Study",
    qualification_types: "Qualification Types",
    accrediting_bodies: "Accrediting Bodies",
    positions: "Positions",
    departments: "Departments",
    countries: "Countries",
    currencies: "Currencies",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading !== null}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {label}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download Valid Values</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableDownloads.map(type => (
          <DropdownMenuItem 
            key={type} 
            onClick={handlers[type]}
            disabled={isLoading !== null}
          >
            <Download className="h-4 w-4 mr-2" />
            {labels[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
