import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getImportDependencies, ImportDependency } from "./importDependencies";
import { Link } from "react-router-dom";

interface PrerequisiteStatus {
  key: string;
  label: string;
  count: number;
  status: "success" | "error" | "loading";
}

interface ImportDependencyCheckerProps {
  importType: string;
  companyId?: string;
  onPrerequisitesChecked: (allMet: boolean) => void;
}

export function ImportDependencyChecker({
  importType,
  companyId,
  onPrerequisitesChecked,
}: ImportDependencyCheckerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus[]>([]);
  const [optionalPrerequisites, setOptionalPrerequisites] = useState<PrerequisiteStatus[]>([]);

  const config = getImportDependencies(importType);

  useEffect(() => {
    if (!config || config.prerequisites.length === 0) {
      setIsLoading(false);
      onPrerequisitesChecked(true);
      return;
    }

    checkPrerequisites();
  }, [importType, companyId]);

  const checkPrerequisites = async () => {
    if (!config) return;

    setIsLoading(true);
    const results: PrerequisiteStatus[] = [];
    const optionalResults: PrerequisiteStatus[] = [];

    // Check required prerequisites
    for (const prereq of config.prerequisites) {
      const count = await getEntityCount(prereq);
      results.push({
        key: prereq.key,
        label: prereq.label,
        count,
        status: count > 0 ? "success" : "error",
      });
    }

    // Check optional prerequisites
    if (config.optionalPrerequisites) {
      for (const prereq of config.optionalPrerequisites) {
        const count = await getEntityCount(prereq);
        optionalResults.push({
          key: prereq.key,
          label: prereq.label,
          count,
          status: count > 0 ? "success" : "error",
        });
      }
    }

    setPrerequisites(results);
    setOptionalPrerequisites(optionalResults);
    setIsLoading(false);

    const allRequiredMet = results.every((p) => p.status === "success");
    onPrerequisitesChecked(allRequiredMet);
  };

  const getEntityCount = async (prereq: ImportDependency): Promise<number> => {
    try {
      let query = supabase.from(prereq.table as any).select("id", { count: "exact", head: true });

      // Filter by company if applicable and company_id exists
      if (companyId && prereq.key !== "companies") {
        query = query.eq("company_id", companyId);
      }

      const { count, error } = await query;
      if (error) {
        console.error(`Error checking ${prereq.table}:`, error);
        return 0;
      }
      return count || 0;
    } catch (err) {
      console.error(`Error checking ${prereq.table}:`, err);
      return 0;
    }
  };

  const getImportLink = (key: string): string => {
    const structureTypes = ["companies", "departments", "divisions", "sections", "jobs", "job_families"];
    if (structureTypes.includes(key)) {
      return "/hr-hub/data-import?tab=company-structure";
    }
    if (key === "positions") {
      return "/hr-hub/data-import?tab=positions";
    }
    if (key === "salary_grades") {
      return "/hr-hub/setup/salary-grades";
    }
    return "/hr-hub/data-import";
  };

  // No prerequisites needed
  if (!config || config.prerequisites.length === 0) {
    return null;
  }

  const allRequiredMet = prerequisites.every((p) => p.status === "success");
  const missingPrereqs = prerequisites.filter((p) => p.status === "error");

  return (
    <Card className={allRequiredMet ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : allRequiredMet ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          Prerequisites Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking prerequisites...
          </div>
        ) : (
          <>
            {/* Required Prerequisites */}
            <div className="space-y-2">
              {prerequisites.map((prereq) => (
                <div
                  key={prereq.key}
                  className="flex items-center justify-between p-2 rounded-md bg-background/50"
                >
                  <div className="flex items-center gap-2">
                    {prereq.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm font-medium">{prereq.label}</span>
                    <Badge variant={prereq.status === "success" ? "default" : "destructive"} className="text-xs">
                      {prereq.count} found
                    </Badge>
                  </div>
                  {prereq.status === "error" && (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link to={getImportLink(prereq.key)}>
                        Import {prereq.label}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Optional Prerequisites */}
            {optionalPrerequisites.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Optional:</p>
                {optionalPrerequisites.map((prereq) => (
                  <div
                    key={prereq.key}
                    className="flex items-center justify-between p-2 rounded-md bg-background/30"
                  >
                    <div className="flex items-center gap-2">
                      {prereq.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">{prereq.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {prereq.count} found
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {!allRequiredMet && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Missing prerequisites:</strong> Please import{" "}
                  {missingPrereqs.map((p) => p.label).join(", ")} before importing {importType.replace(/_/g, " ")}.
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {allRequiredMet && (
              <Alert className="border-success/50 bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-sm text-success">
                  All prerequisites are met. You can proceed with the import.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
