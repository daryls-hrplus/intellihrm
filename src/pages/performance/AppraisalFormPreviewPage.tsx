import { useParams } from "react-router-dom";
import { useAppraisalTemplatePrintData } from "@/hooks/useAppraisalPrintData";
import {
  AppraisalPrintLayout,
  PrintHeader,
  AppraisalItemsTable,
  ScoreSummarySection,
  CommentsSection,
  SignatureSection,
} from "@/components/performance/appraisal/print";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function AppraisalFormPreviewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { data, isLoading, error } = useAppraisalTemplatePrintData(templateId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Template</AlertTitle>
          <AlertDescription>
            {error?.message || "Unable to load the appraisal form template. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    template,
    sections,
    company,
    items,
    sectionScores,
    totalScore,
    employee,
    supervisor,
    appraisal,
    comments,
    signatures,
  } = data;

  return (
    <AppraisalPrintLayout
      title={`Preview: ${template.name}`}
      templateCode={template.code}
      templateVersion={template.version_number}
      companyName={company.name}
      isPreview={true}
    >
      {/* Preview Notice */}
      <div className="mb-6 no-print">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Template Preview Mode</AlertTitle>
          <AlertDescription>
            This is a preview of how the appraisal form will appear when used. All data shown is
            sample data for demonstration purposes. Only sections configured in the template will
            appear.
          </AlertDescription>
        </Alert>
      </div>

      {/* Template Info Badges */}
      <div className="flex items-center gap-2 mb-4 no-print flex-wrap">
        <Badge variant="outline">Template: {template.code}</Badge>
        <Badge variant="secondary">
          Rating Scale: {template.min_rating} - {template.max_rating}
        </Badge>
        <Badge variant="secondary">{sections.length} Sections Configured</Badge>
        <Badge variant="secondary">{items.length} Items</Badge>
      </div>

      {/* Header Section */}
      <PrintHeader
        employee={employee}
        supervisor={supervisor}
        appraisal={appraisal}
        companyName={company.name}
        companyLogo={company.logo_url || undefined}
        templateCode={template.code}
        templateVersion={template.version_number}
      />

      {/* Appraisal Items Table */}
      {items.length > 0 ? (
        <AppraisalItemsTable
          items={items}
          minRating={template.min_rating}
          maxRating={template.max_rating}
          showEmployeeRating={true}
          showRequiredLevel={true}
        />
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground mb-6">
          <p className="font-medium">No appraisal items configured</p>
          <p className="text-sm mt-1">
            Add sections to the template to see items appear here.
          </p>
        </div>
      )}

      {/* Score Summary */}
      {sectionScores.length > 0 && (
        <ScoreSummarySection
          sections={sectionScores}
          totalScore={totalScore}
          showFormulas={true}
          maxRating={template.max_rating}
        />
      )}

      {/* Page Break before Comments for print */}
      <div className="page-break" />

      {/* Comments Section */}
      <CommentsSection
        employeeComments={comments.employee}
        managerComments={comments.manager}
        hrComments={comments.hr}
        developmentalIssues={comments.developmental}
        strengthsAndGaps={[
          { type: "strength", description: "Strong technical skills and problem-solving ability" },
          { type: "strength", description: "Excellent communication with stakeholders" },
          { type: "gap", description: "Could improve delegation to team members" },
          { type: "gap", description: "Time management during peak periods" },
        ]}
      />

      {/* Signature Section */}
      <SignatureSection signatures={signatures} finalStatus={appraisal.status} />
    </AppraisalPrintLayout>
  );
}
