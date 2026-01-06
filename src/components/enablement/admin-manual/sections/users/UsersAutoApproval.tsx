import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, AlertTriangle, Settings } from 'lucide-react';
import { 
  LearningObjectives, 
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout, 
  WarningCallout 
} from '../../../manual/components';
import type { Step, FieldDefinition, ExampleConfig, BusinessRule } from '../../../manual/components';

const ruleFields: FieldDefinition[] = [
  {
    name: "Rule Name",
    type: "Text",
    required: true,
    description: "Descriptive name for the auto-approval rule",
    validation: "2-100 characters"
  },
  {
    name: "Trigger Role(s)",
    type: "Multi-Select",
    required: true,
    description: "Roles that trigger this auto-approval rule"
  },
  {
    name: "Requester Criteria",
    type: "Rule Builder",
    required: true,
    description: "Conditions the requester must meet"
  },
  {
    name: "Skip Manager Approval",
    type: "Toggle",
    required: true,
    description: "Whether to bypass manager approval step",
    defaultValue: "False"
  },
  {
    name: "Skip Security Approval",
    type: "Toggle",
    required: true,
    description: "Whether to bypass security approval step",
    defaultValue: "False"
  },
  {
    name: "Maximum Duration",
    type: "Number",
    required: false,
    description: "Auto-approve only for requests up to X days"
  },
  {
    name: "Risk Level Limit",
    type: "Select",
    required: true,
    description: "Maximum role risk level for auto-approval",
    defaultValue: "Low"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the rule is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Auto-Approval Rules",
    description: "Go to Admin → Security → Access Request → Auto-Approval Rules",
    expectedResult: "Rules list displays"
  },
  {
    title: "Click Create Rule",
    description: "Click 'Add Rule' button",
    expectedResult: "Rule creation form opens"
  },
  {
    title: "Define Trigger Roles",
    description: "Select which roles can be auto-approved",
    substeps: [
      "Select from available roles",
      "Only low-risk roles recommended",
      "Avoid admin or PII-access roles"
    ]
  },
  {
    title: "Configure Requester Criteria",
    description: "Set conditions for auto-approval",
    substeps: [
      "Job level requirements",
      "Department membership",
      "Tenure requirements",
      "Manager hierarchy rules"
    ]
  },
  {
    title: "Set Approval Bypasses",
    description: "Choose which approval steps to skip",
    substeps: [
      "Consider skipping manager for self-service roles",
      "Rarely skip security for any role",
      "Document justification for bypasses"
    ]
  },
  {
    title: "Set Guardrails",
    description: "Configure safety limits",
    substeps: [
      "Set maximum duration for temporary access",
      "Set risk level ceiling",
      "Enable audit logging"
    ]
  },
  {
    title: "Test and Activate",
    description: "Validate rule before production use",
    expectedResult: "Rule active and processing requests"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Self-Service Role Auto-Approval",
    context: "Automatically approve Employee Self-Service for all employees",
    values: [
      { field: "Rule Name", value: "ESS Auto-Approval" },
      { field: "Trigger Role", value: "Employee Self-Service" },
      { field: "Requester Criteria", value: "Is Active Employee = True" },
      { field: "Skip Manager", value: "Yes" },
      { field: "Skip Security", value: "Yes" },
      { field: "Risk Level", value: "Low" }
    ],
    outcome: "All active employees get ESS access instantly"
  },
  {
    title: "Manager Dashboard Access",
    context: "Auto-approve dashboard access for people managers",
    values: [
      { field: "Rule Name", value: "MSS Dashboard Auto-Approval" },
      { field: "Trigger Role", value: "Manager Dashboard Viewer" },
      { field: "Requester Criteria", value: "Is People Manager = True AND Tenure > 30 days" },
      { field: "Skip Manager", value: "Yes" },
      { field: "Skip Security", value: "No (Security reviews)" },
      { field: "Risk Level", value: "Low" }
    ],
    outcome: "Managers get dashboard after security confirms"
  },
  {
    title: "Temporary Report Access",
    context: "Auto-approve short-term report viewer access",
    values: [
      { field: "Rule Name", value: "Temp Reporting Access" },
      { field: "Trigger Role", value: "Basic Report Viewer" },
      { field: "Requester Criteria", value: "Job Level >= 5" },
      { field: "Skip Manager", value: "No" },
      { field: "Skip Security", value: "Yes" },
      { field: "Maximum Duration", value: "30 days" },
      { field: "Risk Level", value: "Low" }
    ],
    outcome: "Manager-approved temp access up to 30 days"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Auto-approval limited to low-risk roles",
    enforcement: "Policy",
    description: "Medium/high risk roles require manual review"
  },
  {
    rule: "PII access roles cannot be auto-approved",
    enforcement: "System",
    description: "GDPR requirement for human review"
  },
  {
    rule: "Admin roles cannot be auto-approved",
    enforcement: "System",
    description: "Elevated access always requires security review"
  },
  {
    rule: "Auto-approved access is fully logged",
    enforcement: "System",
    description: "Complete audit trail maintained"
  },
  {
    rule: "Rules are reviewed quarterly",
    enforcement: "Policy",
    description: "Security Admin must validate rules quarterly"
  }
];

export function UsersAutoApproval() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure auto-approval rules for routine access requests",
          "Set appropriate guardrails and risk limits",
          "Balance automation with security requirements",
          "Monitor and audit auto-approved access"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Auto-Approval Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Auto-Approval Rules streamline access provisioning for routine, low-risk access 
            requests. When configured properly, they reduce wait times while maintaining 
            security controls.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Benefits
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Instant access for routine requests</li>
                <li>• Reduced approver workload</li>
                <li>• Consistent access decisions</li>
                <li>• Improved user experience</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risks to Mitigate
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Over-provisioning access</li>
                <li>• Missing segregation conflicts</li>
                <li>• Audit concerns</li>
                <li>• Privilege creep over time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Risk Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Risk Level</th>
                  <th className="border p-2 text-left font-medium">Examples</th>
                  <th className="border p-2 text-center font-medium">Auto-Approve?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"><Badge className="bg-green-100 text-green-700">Low</Badge></td>
                  <td className="border p-2 text-muted-foreground">ESS, MSS Viewer, Basic Reports</td>
                  <td className="border p-2 text-center">✓ Recommended</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2"><Badge className="bg-amber-100 text-amber-700">Medium</Badge></td>
                  <td className="border p-2 text-muted-foreground">HR Officer, Recruiter, Timekeeper</td>
                  <td className="border p-2 text-center">With caution</td>
                </tr>
                <tr>
                  <td className="border p-2"><Badge className="bg-red-100 text-red-700">High</Badge></td>
                  <td className="border p-2 text-muted-foreground">Payroll Admin, Compensation Manager</td>
                  <td className="border p-2 text-center">✗ Not recommended</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2"><Badge className="bg-purple-100 text-purple-700">Critical</Badge></td>
                  <td className="border p-2 text-muted-foreground">Super Admin, Security Admin</td>
                  <td className="border p-2 text-center">✗ Never</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Auto-Approval Rule Fields"
        fields={ruleFields}
      />

      <StepByStep
        title="Creating an Auto-Approval Rule"
        steps={creationSteps}
      />

      <ConfigurationExample
        title="Auto-Approval Rule Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Auto-Approval Business Rules"
        rules={businessRules}
      />

      <WarningCallout title="Security Review Requirement">
        Never configure auto-approval to bypass security review for roles with 
        PII access, admin capabilities, or financial data access. These must 
        always have human security review.
      </WarningCallout>

      <TipCallout title="Start Conservative">
        Begin with strict auto-approval rules and loosen gradually based on audit 
        results. It's easier to expand automation than to restrict it after issues arise.
      </TipCallout>
    </div>
  );
}
