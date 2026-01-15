import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppraisalTemplatePrintData } from "@/hooks/useAppraisalPrintData";
import {
  AppraisalPrintLayout,
  PrintHeader,
  AppraisalItemsTable,
  ScoreSummarySection,
  CommentsSection,
  SignatureSection,
  ViewModeToggle,
  RatingScaleLegendCompact,
  ExecutiveSummary,
  DevelopmentPlanSection,
  NextStepsSection,
  CompactAppraisalTable,
  type ViewMode,
} from "@/components/performance/appraisal/print";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppraisalFormPreviewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get("view") as ViewMode) || "hr";
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [layoutMode, setLayoutMode] = useState<"compact" | "full">("compact");
  
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
      minRating={template.min_rating}
      maxRating={template.max_rating}
    >
      {/* Preview Notice */}
      <div className="mb-6 no-print">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Template Preview Mode</AlertTitle>
          <AlertDescription>
            This is a preview of how the appraisal form will appear when used. All data shown is
            sample data for demonstration purposes.
          </AlertDescription>
        </Alert>
      </div>

      {/* View Mode & Layout Toggle */}
      <div className="mb-6 no-print flex items-center justify-between flex-wrap gap-4">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <Tabs value={layoutMode} onValueChange={(v) => setLayoutMode(v as "compact" | "full")}>
          <TabsList>
            <TabsTrigger value="compact">Compact View</TabsTrigger>
            <TabsTrigger value="full">Full View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Template Info Badges */}
      <div className="flex items-center gap-2 mb-4 no-print flex-wrap">
        <Badge variant="outline">Template: {template.code}</Badge>
        <Badge variant="secondary">
          Rating Scale: {template.min_rating} - {template.max_rating}
        </Badge>
        <Badge variant="secondary">{sections.length} Sections</Badge>
        <Badge variant="secondary">{items.length} Items</Badge>
      </div>

      {/* Executive Summary - NEW */}
      <ExecutiveSummary
        employee={{
          name: employee.fullName,
          position: employee.jobTitle,
          department: employee.department,
          employeeId: employee.employeeNumber,
        }}
        appraisal={{
          period: appraisal.cycleName,
          status: appraisal.status,
          startDate: appraisal.performancePeriodStart,
          endDate: appraisal.performancePeriodEnd,
        }}
        overallRating={totalScore}
        maxRating={template.max_rating}
        minRating={template.min_rating}
        items={items}
        managerStatement={comments.manager}
        companyName={company.name}
      />

      {/* Header Section */}
      <PrintHeader
        employee={employee}
        supervisor={supervisor}
        appraisal={appraisal}
        companyName={company.name}
        companyLogo={company.logo_url || undefined}
        templateCode={template.code}
        templateVersion={template.version_number}
        compact
      />

      {/* Rating Scale Legend */}
      <RatingScaleLegendCompact
        minRating={template.min_rating}
        maxRating={template.max_rating}
        sticky
        className="mb-4 rounded-lg border shadow-sm"
      />

      {/* Appraisal Items - Compact or Full Layout */}
      {items.length > 0 ? (
        layoutMode === "compact" ? (
          <CompactAppraisalTable
            items={items}
            minRating={template.min_rating}
            maxRating={template.max_rating}
            viewMode={viewMode}
          />
        ) : (
          <AppraisalItemsTable
            items={items}
            minRating={template.min_rating}
            maxRating={template.max_rating}
            viewMode={viewMode}
            isPreview={true}
          />
        )
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground mb-6">
          <p className="font-medium">No appraisal items configured</p>
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

      {/* Development Plan - NEW */}
      <div className="page-break" />
      <DevelopmentPlanSection items={items} />

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

      {/* Next Steps - NEW */}
      <NextStepsSection />

      {/* Signature Section */}
      <SignatureSection signatures={signatures} finalStatus={appraisal.status} />
    </AppraisalPrintLayout>
  );
}
