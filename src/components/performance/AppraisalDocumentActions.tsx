import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical, Scale } from "lucide-react";
import { ComplianceDocumentGenerator } from "@/components/compliance/ComplianceDocumentGenerator";

interface AppraisalDocumentActionsProps {
  participantId: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  cycleName: string;
  overallScore?: number | null;
  status: string;
}

export function AppraisalDocumentActions({
  participantId,
  employeeId,
  employeeName,
  companyId,
  cycleName,
  overallScore,
  status,
}: AppraisalDocumentActionsProps) {
  const { t } = useTranslation();
  const [documentGeneratorOpen, setDocumentGeneratorOpen] = useState(false);

  // Only show for finalized or reviewed appraisals
  const canGenerateDocument = status === "finalized" || status === "reviewed";

  if (!canGenerateDocument) {
    return null;
  }

  const prefilledData: Record<string, string> = {
    employee_name: employeeName,
    review_period: cycleName,
    overall_rating: overallScore ? `${overallScore.toFixed(1)}%` : "N/A",
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Scale className="h-4 w-4" />
            {t("compliance.documents", "Documents")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDocumentGeneratorOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            {t("compliance.generateReviewSignoff", "Generate Review Sign-off")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ComplianceDocumentGenerator
        open={documentGeneratorOpen}
        onOpenChange={setDocumentGeneratorOpen}
        employeeId={employeeId}
        employeeName={employeeName}
        companyId={companyId}
        sourceType="appraisal"
        sourceId={participantId}
        category="performance"
        prefilledData={prefilledData}
      />
    </>
  );
}
