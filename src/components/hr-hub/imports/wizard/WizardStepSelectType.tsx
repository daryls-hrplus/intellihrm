import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Building2, 
  FolderTree, 
  Briefcase, 
  Users, 
  UserPlus,
  CheckCircle2,
  XCircle,
  Lock,
  Info
} from "lucide-react";
import { IMPORT_DEPENDENCIES } from "../importDependencies";

interface ImportTypeOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  prerequisites: string[];
  category: "structure" | "jobs" | "people";
}

const IMPORT_TYPES: ImportTypeOption[] = [
  {
    id: "companies",
    label: "Companies",
    description: "Legal entities and subsidiaries",
    icon: Building2,
    prerequisites: [],
    category: "structure",
  },
  {
    id: "divisions",
    label: "Divisions",
    description: "Business units within companies",
    icon: FolderTree,
    prerequisites: ["companies"],
    category: "structure",
  },
  {
    id: "departments",
    label: "Departments",
    description: "Organizational departments",
    icon: FolderTree,
    prerequisites: ["companies"],
    category: "structure",
  },
  {
    id: "sections",
    label: "Sections",
    description: "Sub-units within departments",
    icon: FolderTree,
    prerequisites: ["companies", "departments"],
    category: "structure",
  },
  {
    id: "job_families",
    label: "Job Families",
    description: "Categories of related jobs",
    icon: Briefcase,
    prerequisites: ["companies"],
    category: "jobs",
  },
  {
    id: "jobs",
    label: "Jobs",
    description: "Job titles and descriptions",
    icon: Briefcase,
    prerequisites: ["companies", "job_families"],
    category: "jobs",
  },
  {
    id: "positions",
    label: "Positions",
    description: "Specific job instances in departments",
    icon: Briefcase,
    prerequisites: ["companies", "departments", "jobs"],
    category: "jobs",
  },
  {
    id: "employees",
    label: "Employees",
    description: "Employee master data",
    icon: Users,
    prerequisites: [],
    category: "people",
  },
  {
    id: "new_hires",
    label: "New Hires",
    description: "Onboard new employees with accounts",
    icon: UserPlus,
    prerequisites: ["companies", "departments", "positions"],
    category: "people",
  },
];

interface WizardStepSelectTypeProps {
  selectedType: string | null;
  onSelectType: (type: string) => void;
  companyId?: string | null;
}

interface PrerequisiteStatus {
  [key: string]: { count: number; met: boolean };
}

export function WizardStepSelectType({ selectedType, onSelectType, companyId }: WizardStepSelectTypeProps) {
  const [prerequisiteStatus, setPrerequisiteStatus] = useState<PrerequisiteStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPrerequisites();
  }, [companyId]);

  const checkPrerequisites = async () => {
    setLoading(true);
    const status: PrerequisiteStatus = {};

    const tables = ["companies", "divisions", "departments", "sections", "jobs", "job_families", "positions"];

    for (const table of tables) {
      try {
        let query = supabase.from(table).select("id", { count: "exact", head: true });
        if (companyId && table !== "companies") {
          query = query.eq("company_id", companyId);
        }
        const { count, error } = await query;

        if (!error) {
          status[table] = { count: count || 0, met: (count || 0) > 0 };
        }
      } catch (e) {
        console.error(`Error checking ${table}:`, e);
        status[table] = { count: 0, met: false };
      }
    }

    setPrerequisiteStatus(status);
    setLoading(false);
  };

  const canImport = (type: ImportTypeOption) => {
    if (type.prerequisites.length === 0) return true;
    return type.prerequisites.every((prereq) => prerequisiteStatus[prereq]?.met);
  };

  const getMissingPrerequisites = (type: ImportTypeOption) => {
    return type.prerequisites.filter((prereq) => !prerequisiteStatus[prereq]?.met);
  };

  const renderCategory = (category: string, title: string) => {
    const typesInCategory = IMPORT_TYPES.filter((t) => t.category === category);

    return (
      <div key={category} className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {typesInCategory.map((type) => {
            const isSelected = selectedType === type.id;
            const canSelect = canImport(type);
            const missing = getMissingPrerequisites(type);
            const Icon = type.icon;

            return (
              <TooltipProvider key={type.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`
                        cursor-pointer transition-all duration-200
                        ${isSelected ? "border-primary ring-2 ring-primary/20" : ""}
                        ${!canSelect ? "opacity-60 cursor-not-allowed" : "hover:border-primary/50 hover:shadow-md"}
                      `}
                      onClick={() => canSelect && onSelectType(type.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`
                            p-2 rounded-lg
                            ${isSelected ? "bg-primary/10" : "bg-muted"}
                          `}>
                            <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{type.label}</h4>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                              )}
                              {!canSelect && (
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {type.description}
                            </p>
                            {!canSelect && missing.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {missing.map((m) => (
                                  <Badge key={m} variant="outline" className="text-xs text-destructive">
                                    Needs {m}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {canSelect && prerequisiteStatus[type.id]?.count !== undefined && (
                              <Badge variant="secondary" className="text-xs mt-2">
                                {prerequisiteStatus[type.id].count} existing
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  {!canSelect && (
                    <TooltipContent>
                      <p>Import {missing.join(", ")} first</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">What would you like to import?</h2>
        <p className="text-muted-foreground">
          Select the type of data you want to import. Locked options require prerequisite data.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {renderCategory("structure", "Organization Structure")}
          {renderCategory("jobs", "Jobs & Positions")}
          {renderCategory("people", "People")}
        </div>
      )}

      {/* Current data summary */}
      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Current Database Status
        </h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(prerequisiteStatus).map(([table, status]) => (
            <Badge
              key={table}
              variant={status.met ? "default" : "outline"}
              className="gap-1"
            >
              {status.met ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {table}: {status.count}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
