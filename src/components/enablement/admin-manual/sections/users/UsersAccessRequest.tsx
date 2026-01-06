import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Clock, CheckCircle, XCircle, ArrowRight, Bell } from 'lucide-react';
import { 
  LearningObjectives, 
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout, 
  InfoCallout 
} from '../../../manual/components';
import type { Step, ExampleConfig, BusinessRule } from '../../../manual/components';

const requestSteps: Step[] = [
  {
    title: "User Initiates Request",
    description: "Employee or manager submits access request",
    substeps: [
      "Navigate to Access Request form",
      "Select requested role(s) or permission(s)",
      "Provide business justification",
      "Set requested duration (if temporary)"
    ],
    expectedResult: "Request submitted with unique ticket number"
  },
  {
    title: "Manager Approval (if required)",
    description: "Direct manager reviews and approves",
    substeps: [
      "Manager receives notification",
      "Reviews request details and justification",
      "Approves or rejects with comments"
    ],
    expectedResult: "Request moves to security review"
  },
  {
    title: "Security Admin Review",
    description: "Security team validates the request",
    substeps: [
      "Review role appropriateness",
      "Check for segregation of duties conflicts",
      "Verify business justification",
      "Approve, reject, or request more info"
    ],
    expectedResult: "Final approval or rejection"
  },
  {
    title: "Access Provisioning",
    description: "System automatically grants access",
    substeps: [
      "Role assigned to user account",
      "User notified of new access",
      "Audit log entry created"
    ],
    expectedResult: "User can access new functionality"
  },
  {
    title: "Access Review (if temporary)",
    description: "Periodic review for ongoing access",
    substeps: [
      "System sends expiry reminder",
      "User or manager requests extension",
      "Or access automatically revoked"
    ]
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Standard Access Request Flow",
    context: "HR Officer requesting Payroll view access",
    values: [
      { field: "Requested By", value: "Jane Smith (HR Officer)" },
      { field: "Requested Access", value: "Payroll Viewer Role" },
      { field: "Duration", value: "Permanent" },
      { field: "Justification", value: "Need to verify employee salary data for benefits enrollment" },
      { field: "Approval Path", value: "Manager → Security Admin" }
    ],
    outcome: "Access granted after 2-level approval"
  },
  {
    title: "Emergency Access Request",
    context: "Temporary admin access for system issue",
    values: [
      { field: "Requested By", value: "IT Support (John Doe)" },
      { field: "Requested Access", value: "Temporary Module Admin" },
      { field: "Duration", value: "24 hours" },
      { field: "Justification", value: "Production issue requiring elevated access to diagnose" },
      { field: "Approval Path", value: "Security Admin only (expedited)" }
    ],
    outcome: "Emergency access granted with automatic expiry"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "All access requests require business justification",
    enforcement: "System",
    description: "Justification field is mandatory"
  },
  {
    rule: "Manager approval required for elevated roles",
    enforcement: "Policy",
    description: "Roles with PII access require manager sign-off"
  },
  {
    rule: "Security Admin approval required for admin roles",
    enforcement: "System",
    description: "No admin access without security review"
  },
  {
    rule: "Temporary access must have expiry date",
    enforcement: "System",
    description: "Maximum 90 days for temporary access"
  },
  {
    rule: "Segregation of duties violations block approval",
    enforcement: "System",
    description: "Conflicting roles cannot be assigned together"
  }
];

export function UsersAccessRequest() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the access request workflow stages",
          "Configure approval routing for different role types",
          "Process access requests as an approver",
          "Handle emergency and temporary access requests"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Access Request Workflow Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Access Request Workflow provides a controlled, auditable process for 
            users to request additional system access. All requests are logged and 
            require appropriate approvals based on the sensitivity of the access requested.
          </p>
          
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <Badge variant="secondary">Request</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">Manager Review</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">Security Review</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge className="bg-green-100 text-green-700">Provisioned</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Request Status Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg border">
              <Badge className="bg-blue-100 text-blue-700 mb-2">Pending</Badge>
              <p className="text-sm text-muted-foreground">Awaiting first approval</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge className="bg-amber-100 text-amber-700 mb-2">In Review</Badge>
              <p className="text-sm text-muted-foreground">Under security evaluation</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge className="bg-green-100 text-green-700 mb-2">Approved</Badge>
              <p className="text-sm text-muted-foreground">Access granted</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge className="bg-red-100 text-red-700 mb-2">Rejected</Badge>
              <p className="text-sm text-muted-foreground">Request denied with reason</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Access Request Workflow Steps"
        steps={requestSteps}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Approver Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
              <h4 className="font-medium">Approve</h4>
              <p className="text-sm text-muted-foreground">
                Grant the requested access. Optionally modify duration or scope.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
              <XCircle className="h-5 w-5 text-red-600 mb-2" />
              <h4 className="font-medium">Reject</h4>
              <p className="text-sm text-muted-foreground">
                Deny the request with mandatory rejection reason.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
              <Clock className="h-5 w-5 text-blue-600 mb-2" />
              <h4 className="font-medium">Request Info</h4>
              <p className="text-sm text-muted-foreground">
                Ask requester for additional justification or clarification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfigurationExample
        title="Access Request Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Access Request Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="SLA for Request Processing">
        Standard access requests should be processed within 48 business hours. 
        Emergency requests follow an expedited path and should be completed within 4 hours.
      </InfoCallout>

      <TipCallout title="Delegation During Absence">
        Approvers can delegate their approval authority when on leave. Set up delegation 
        in advance to avoid request backlogs.
      </TipCallout>
    </div>
  );
}
