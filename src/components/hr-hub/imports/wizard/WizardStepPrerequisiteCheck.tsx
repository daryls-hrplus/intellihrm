import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  ArrowRight,
  DollarSign,
  GitBranch
} from "lucide-react";
import { CompensationModel } from "./WizardStepCompensationModel";

interface PrerequisiteStatus {
  key: string;
  label: string;
  count: number;
  required: boolean;
  status: "loading" | "found" | "missing";
}

interface WizardStepPrerequisiteCheckProps {
  compensationModel: CompensationModel | null;
  companyId: string | null;
  companyCode: string | null;
  onPrerequisitesMet: () => void;
  onImportPrerequisite: (type: string) => void;
  onSkipToDirectPay: () => void;
}

type PrerequisiteTable = "salary_grades" | "pay_spines";

const COMPENSATION_PREREQUISITES: Record<string, { key: string; label: string; table: PrerequisiteTable }[]> = {
  salary_grade: [
    { key: "salary_grades", label: "Salary Grades", table: "salary_grades" }
  ],
  spinal_point: [
    { key: "pay_spines", label: "Pay Spines", table: "pay_spines" }
    // Spinal points are created alongside pay spines, so we only check pay_spines
  ],
  hybrid: [
    { key: "salary_grades", label: "Salary Grades", table: "salary_grades" }
    // Hybrid uses salary grades as base, commission is added separately
  ],
  direct_pay: [], // No prerequisites for direct pay
  commission_based: [],
  hourly_rate: []
};

export function WizardStepPrerequisiteCheck({
  compensationModel,
  companyId,
  companyCode,
  onPrerequisitesMet,
  onImportPrerequisite,
  onSkipToDirectPay,
}: WizardStepPrerequisiteCheckProps) {
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allMet, setAllMet] = useState(false);

  useEffect(() => {
    checkPrerequisites();
  }, [compensationModel, companyId]);

  const checkPrerequisites = async () => {
    if (!compensationModel || !companyId) {
      setIsLoading(false);
      return;
    }

    const requiredPrereqs = COMPENSATION_PREREQUISITES[compensationModel] || [];
    
    if (requiredPrereqs.length === 0) {
      // No prerequisites needed (e.g., direct_pay)
      setAllMet(true);
      setIsLoading(false);
      // Auto-proceed after a short delay
      setTimeout(() => onPrerequisitesMet(), 100);
      return;
    }

    setIsLoading(true);
    const statuses: PrerequisiteStatus[] = [];

    for (const prereq of requiredPrereqs) {
      try {
        let count = 0;
        let queryError = null;

        // Use specific queries based on table
        if (prereq.table === "salary_grades") {
          const result = await supabase
            .from("salary_grades")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId);
          count = result.count || 0;
          queryError = result.error;
        } else if (prereq.table === "pay_spines") {
          const result = await supabase
            .from("pay_spines")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId);
          count = result.count || 0;
          queryError = result.error;
        }

        if (queryError) {
          console.error(`Error checking ${prereq.table}:`, queryError);
          statuses.push({
            key: prereq.key,
            label: prereq.label,
            count: 0,
            required: true,
            status: "missing"
          });
        } else {
          statuses.push({
            key: prereq.key,
            label: prereq.label,
            count: count,
            required: true,
            status: count > 0 ? "found" : "missing"
          });
        }
      } catch (err) {
        console.error(`Error checking ${prereq.table}:`, err);
        statuses.push({
          key: prereq.key,
          label: prereq.label,
          count: 0,
          required: true,
          status: "missing"
        });
      }
    }

    setPrerequisites(statuses);
    const allPrereqsMet = statuses.every(s => s.status === "found");
    setAllMet(allPrereqsMet);
    setIsLoading(false);

    // Auto-proceed if all prerequisites are met
    if (allPrereqsMet) {
      setTimeout(() => onPrerequisitesMet(), 500);
    }
  };

  const getModelLabel = (model: CompensationModel | null) => {
    switch (model) {
      case "salary_grade": return "Salary Grade";
      case "spinal_point": return "Spinal Point";
      case "direct_pay": return "Direct Pay";
      case "hybrid": return "Hybrid";
      case "commission_based": return "Commission Based";
      case "hourly_rate": return "Hourly Rate";
      default: return model || "Unknown";
    }
  };

  const getStatusIcon = (status: PrerequisiteStatus["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case "found":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "missing":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getPrerequisiteIcon = (key: string) => {
    switch (key) {
      case "salary_grades":
        return <DollarSign className="h-5 w-5" />;
      case "pay_spines":
      case "spinal_points":
        return <GitBranch className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Checking prerequisites...</p>
      </div>
    );
  }

  if (allMet) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Prerequisites Met</AlertTitle>
          <AlertDescription className="text-green-700">
            All required data for {getModelLabel(compensationModel)} compensation is available. 
            Proceeding to the next step...
          </AlertDescription>
        </Alert>

        <div className="grid gap-3">
          {prerequisites.map((prereq) => (
            <Card key={prereq.key} className="border-green-200">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  {getPrerequisiteIcon(prereq.key)}
                  <div>
                    <p className="font-medium">{prereq.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {prereq.count} record{prereq.count !== 1 ? "s" : ""} found
                    </p>
                  </div>
                </div>
                {getStatusIcon(prereq.status)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Prerequisites not met - show guidance
  const missingPrereqs = prerequisites.filter(p => p.status === "missing");
  const firstMissing = missingPrereqs[0];

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Prerequisites Required</AlertTitle>
        <AlertDescription className="text-amber-700">
          To import positions with <strong>{getModelLabel(compensationModel)}</strong> compensation, 
          you need to import the required data first.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Data for {companyCode || "Selected Company"}</CardTitle>
          <CardDescription>
            The following data must be imported before you can import positions with {getModelLabel(compensationModel)} compensation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {prerequisites.map((prereq) => (
            <div 
              key={prereq.key}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                prereq.status === "found" 
                  ? "border-green-200 bg-green-50" 
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {getPrerequisiteIcon(prereq.key)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{prereq.label}</p>
                    {prereq.status === "missing" && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prereq.status === "found" 
                      ? `${prereq.count} record${prereq.count !== 1 ? "s" : ""} found`
                      : "No records found for this company"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(prereq.status)}
                {prereq.status === "missing" && (
                  <Button 
                    size="sm" 
                    onClick={() => onImportPrerequisite(prereq.key)}
                  >
                    Import Now
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {firstMissing && (
        <div className="flex flex-col gap-4 pt-4">
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => onImportPrerequisite(firstMissing.key)}
              className="gap-2"
            >
              Import {firstMissing.label} First
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Or, if you prefer:</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSkipToDirectPay}
            >
              Use Direct Pay Instead (Skip Prerequisites)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
