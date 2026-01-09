import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Building, Clock } from "lucide-react";
import { 
  LearningObjectives,
  FieldReferenceTable,
  StepByStep,
  WarningCallout,
  TipCallout,
  ComplianceCallout,
  type FieldDefinition,
  type Step
} from '../../../manual/components';
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

const prerequisiteFields: FieldDefinition[] = [
  {
    name: "Company/Legal Entity",
    required: true,
    type: "Reference",
    description: "Primary organization unit for benefit plan assignment",
    defaultValue: "—",
    validation: "Must exist in Workforce module"
  },
  {
    name: "Employee Records",
    required: true,
    type: "Reference",
    description: "Employee master data with hire dates and employment types",
    defaultValue: "—",
    validation: "Hire date required for eligibility calculation"
  },
  {
    name: "Pay Periods",
    required: true,
    type: "Reference",
    description: "Payroll schedule for deduction processing",
    defaultValue: "—",
    validation: "Must be configured in Payroll module"
  },
  {
    name: "Provider Contracts",
    required: true,
    type: "Document",
    description: "Signed agreements with insurance carriers and vendors",
    defaultValue: "—",
    validation: "Contract dates and terms documented"
  },
  {
    name: "Eligibility Rules",
    required: true,
    type: "Policy",
    description: "HR policy defining waiting periods and eligibility criteria",
    defaultValue: "—",
    validation: "Approved by HR leadership"
  },
  {
    name: "Contribution Schedules",
    required: false,
    type: "Document",
    description: "Employee and employer contribution amounts by plan",
    defaultValue: "From contracts",
    validation: "Aligned with budget approval"
  }
];

const implementationSteps: Step[] = [
  {
    title: "Verify Workforce Module Configuration",
    description: "Ensure company structure, departments, and employee records are properly configured.",
    substeps: [
      "Confirm all legal entities are created with correct tax IDs",
      "Verify employment types (Full-time, Part-time, Contractor) are defined",
      "Check that employee records have valid hire dates",
      "Confirm job groups and job codes are configured for eligibility rules"
    ],
    expectedResult: "All employees appear in workforce with complete records"
  },
  {
    title: "Configure Payroll Integration",
    description: "Set up payroll periods and deduction categories for benefit premiums.",
    substeps: [
      "Define pay frequencies (Weekly, Bi-weekly, Semi-monthly, Monthly)",
      "Create benefit deduction categories (Pre-tax Medical, Post-tax Life, etc.)",
      "Configure deduction timing (arrears vs. current)",
      "Set up benefit cost centers for employer contributions"
    ],
    expectedResult: "Payroll ready to receive benefit deduction instructions"
  },
  {
    title: "Gather Provider Contracts",
    description: "Collect and organize all benefit provider agreements.",
    substeps: [
      "Obtain signed contracts from all insurance carriers",
      "Document plan effective dates and renewal dates",
      "Extract rate tables and contribution schedules",
      "Identify carrier contacts for implementation support"
    ],
    expectedResult: "Complete contract library ready for system configuration"
  },
  {
    title: "Document Eligibility Policies",
    description: "Formalize HR policies for benefit eligibility.",
    substeps: [
      "Define waiting periods by employment type",
      "Document eligibility criteria (hours worked, job classification)",
      "Specify dependent eligibility rules",
      "Confirm life event policies and windows"
    ],
    expectedResult: "Documented policies approved for system configuration"
  },
  {
    title: "Plan Open Enrollment Timeline",
    description: "Establish the implementation and open enrollment schedule.",
    substeps: [
      "Set target go-live date for Benefits module",
      "Schedule open enrollment window (typically 2-4 weeks)",
      "Plan employee communication timeline",
      "Coordinate with carriers on enrollment file deadlines"
    ],
    expectedResult: "Complete implementation timeline with milestones"
  }
];

export function FoundationPrerequisites() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-2-1" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 2</span>
          <span>•</span>
          <span>Section 2.1</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Prerequisites Checklist</h2>
            <p className="text-muted-foreground mt-1">
              System dependencies, business requirements, and implementation readiness
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            12 min read
          </Badge>
          <Badge variant="outline" className="text-xs">Foundation</Badge>
          <Badge variant="outline" className="text-xs">Required First</Badge>
        </div>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Identify all system prerequisites required before Benefits configuration",
          "Understand dependencies between Workforce, Payroll, and Benefits modules",
          "Prepare necessary business documents and policy decisions",
          "Create an implementation timeline for Benefits module deployment"
        ]}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              System Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Company/Legal Entity configured in Workforce</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Employee records created with hire dates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Employment types defined (Full-time, Part-time, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Payroll module configured for deduction processing</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Business Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Provider contracts and plan documents</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Contribution schedules (employee/employer)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Eligibility rules and waiting periods</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Open enrollment dates for current/next plan year</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Warning Callout */}
      <WarningCallout title="Important Dependencies">
        Benefits configuration should occur <strong>after</strong> Workforce setup (employees, employment types) 
        and <strong>before</strong> running payroll with benefit deductions. Plan the implementation sequence accordingly.
        Missing prerequisites will cause enrollment failures and payroll errors.
      </WarningCallout>

      {/* Field Reference Table */}
      <FieldReferenceTable
        fields={prerequisiteFields}
        title="Prerequisite Requirements Matrix"
      />

      {/* Step-by-Step Implementation */}
      <StepByStep
        steps={implementationSteps}
        title="Implementation Readiness Steps"
      />

      {/* Regional Compliance */}
      <ComplianceCallout title="Regional Considerations">
        <div className="space-y-2 text-sm">
          <p><strong>Caribbean:</strong> Multi-island operations require separate legal entities per territory. 
          Verify statutory benefit requirements (NIS, NHT, PAYE) are configured in Payroll before Benefits setup.</p>
          <p><strong>Ghana/Nigeria:</strong> Ensure SSNIT (Ghana) or PenCom (Nigeria) pension integration is 
          configured. Local labor laws mandate employer contributions to statutory schemes.</p>
          <p><strong>North America:</strong> ACA employer mandate tracking requires accurate FTE calculations 
          from Workforce data. ERISA plan document requirements apply.</p>
        </div>
      </ComplianceCallout>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        title="Implementation Readiness Dashboard"
        description="Dashboard showing prerequisite completion status, missing requirements, and recommended next steps"
        height="h-48"
      />

      {/* Best Practice */}
      <TipCallout title="Implementation Best Practice">
        Create a dedicated Benefits implementation project with milestone tracking. Schedule weekly 
        check-ins with Payroll, HR, and IT teams during the implementation phase. Document all 
        configuration decisions for future audits and renewals.
      </TipCallout>
    </div>
  );
}
