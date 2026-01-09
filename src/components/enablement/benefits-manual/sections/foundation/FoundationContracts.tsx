import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Clock, FileText, Calendar, AlertCircle, Users } from "lucide-react";
import { 
  LearningObjectives,
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  WarningCallout,
  ComplianceCallout,
  type FieldDefinition,
  type Step,
  type BusinessRule
} from '../../../manual/components';
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

const contactFields: FieldDefinition[] = [
  {
    name: "Contact Name",
    required: true,
    type: "Text",
    description: "Full name of the provider contact",
    defaultValue: "—",
    validation: "Max 100 characters"
  },
  {
    name: "Contact Type",
    required: true,
    type: "Select",
    description: "Role of the contact (Account Manager, Service, Claims, Escalation)",
    defaultValue: "Account Manager",
    validation: "Must select one option"
  },
  {
    name: "Email",
    required: true,
    type: "Email",
    description: "Business email for the contact",
    defaultValue: "—",
    validation: "Valid email format"
  },
  {
    name: "Phone",
    required: true,
    type: "Phone",
    description: "Direct phone number",
    defaultValue: "—",
    validation: "Valid phone format"
  },
  {
    name: "Hours",
    required: false,
    type: "Text",
    description: "Available hours for contact",
    defaultValue: "Business hours",
    validation: "—"
  },
  {
    name: "Territory",
    required: false,
    type: "Text",
    description: "Geographic area covered by this contact",
    defaultValue: "All",
    validation: "—"
  }
];

const contractFields: FieldDefinition[] = [
  {
    name: "Contract Number",
    required: true,
    type: "Text",
    description: "Provider's contract or policy number",
    defaultValue: "—",
    validation: "Alphanumeric"
  },
  {
    name: "Effective Date",
    required: true,
    type: "Date",
    description: "When the contract takes effect",
    defaultValue: "—",
    validation: "Cannot be in the past for new contracts"
  },
  {
    name: "Expiration Date",
    required: true,
    type: "Date",
    description: "When the contract ends or renews",
    defaultValue: "—",
    validation: "Must be after effective date"
  },
  {
    name: "Renewal Type",
    required: true,
    type: "Select",
    description: "Auto-renew, negotiated, or term",
    defaultValue: "Annual Renewal",
    validation: "Must select one option"
  },
  {
    name: "Notice Period",
    required: true,
    type: "Number",
    description: "Days notice required for non-renewal",
    defaultValue: "60",
    validation: "Positive integer"
  },
  {
    name: "Contract Document",
    required: false,
    type: "File",
    description: "Uploaded contract PDF",
    defaultValue: "—",
    validation: "PDF format recommended"
  }
];

const contactSetupSteps: Step[] = [
  {
    title: "Access Provider Contacts",
    description: "Navigate to the provider's contact management.",
    substeps: [
      "Go to Benefits → Configuration → Providers",
      "Select the provider record",
      "Click 'Contacts' tab"
    ],
    expectedResult: "Contact list for provider displayed"
  },
  {
    title: "Add Account Manager",
    description: "Create the primary relationship contact.",
    substeps: [
      "Click 'Add Contact'",
      "Select 'Account Manager' type",
      "Enter name, email, and phone",
      "Add territory if applicable"
    ],
    expectedResult: "Account manager contact saved"
  },
  {
    title: "Add Service Contacts",
    description: "Add operational support contacts.",
    substeps: [
      "Add 'Service Support' contact for day-to-day issues",
      "Add 'Claims Contact' for claims questions",
      "Include hotline numbers if available"
    ],
    expectedResult: "Operational contacts configured"
  },
  {
    title: "Add Escalation Contact",
    description: "Configure emergency escalation path.",
    substeps: [
      "Add 'Escalation' contact for urgent issues",
      "Include executive sponsor if known",
      "Note SLA response times"
    ],
    expectedResult: "Complete escalation path documented"
  }
];

const contractRules: BusinessRule[] = [
  {
    rule: "Contract renewal notices must be sent before notice period",
    enforcement: "System",
    description: "System generates reminder 30 days before notice deadline. Calendar integration available."
  },
  {
    rule: "Contract documents must be stored securely",
    enforcement: "Policy",
    description: "Contracts contain confidential pricing. Access limited to Benefits administrators."
  },
  {
    rule: "Rate changes require contract amendment documentation",
    enforcement: "Policy",
    description: "All mid-contract rate changes must be documented with signed amendment."
  },
  {
    rule: "Expired contracts prevent new enrollments",
    enforcement: "System",
    description: "Plans linked to expired contracts are blocked from new enrollments until renewed."
  },
  {
    rule: "Contact changes must be verified with provider",
    enforcement: "Advisory",
    description: "Confirm contact changes directly with provider to avoid communication gaps."
  }
];

export function FoundationContracts() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-2-4" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 2</span>
          <span>•</span>
          <span>Section 2.4</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Provider Contact & Contract Management</h2>
            <p className="text-muted-foreground mt-1">
              Account managers, escalation contacts, contract terms tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            15 min read
          </Badge>
          <Badge variant="outline" className="text-xs">Foundation</Badge>
          <Badge variant="outline" className="text-xs">Governance</Badge>
        </div>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Configure provider contacts for different support functions",
          "Track contract terms, renewal dates, and notice periods",
          "Set up automated renewal reminders",
          "Establish escalation paths for issue resolution"
        ]}
      />

      {/* Contact Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Contact Type Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Typical Response</TableHead>
                <TableHead>When to Use</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Account Manager</TableCell>
                <TableCell>Primary relationship contact</TableCell>
                <TableCell>24-48 hours</TableCell>
                <TableCell>Strategic issues, renewals, escalations</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Service Support</TableCell>
                <TableCell>Day-to-day operational issues</TableCell>
                <TableCell>4-8 hours</TableCell>
                <TableCell>Enrollment issues, system access, general questions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Claims Contact</TableCell>
                <TableCell>Claims processing questions</TableCell>
                <TableCell>24-48 hours</TableCell>
                <TableCell>Claim status, denials, appeals</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Escalation</TableCell>
                <TableCell>Urgent/executive issues</TableCell>
                <TableCell>Same day</TableCell>
                <TableCell>Critical issues not resolved through normal channels</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Implementation</TableCell>
                <TableCell>New plan setup and integration</TableCell>
                <TableCell>24 hours</TableCell>
                <TableCell>Initial setup, integration testing, go-live support</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contact Fields */}
      <FieldReferenceTable
        fields={contactFields}
        title="Contact Information Fields"
      />

      {/* Setup Steps */}
      <StepByStep
        steps={contactSetupSteps}
        title="Contact Configuration Steps"
      />

      {/* Contract Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Contract Term Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            Maintaining accurate contract information ensures timely renewals, proper rate application, 
            and compliance with contractual obligations. Track key dates to avoid lapses in coverage 
            or missed negotiation windows.
          </p>
        </CardContent>
      </Card>

      {/* Contract Fields */}
      <FieldReferenceTable
        fields={contractFields}
        title="Contract Tracking Fields"
      />

      {/* Renewal Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Contract Renewal Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline">120 days</Badge>
              <span className="text-muted-foreground">Begin renewal planning, request renewal quotes</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">90 days</Badge>
              <span className="text-muted-foreground">Review renewal rates, compare alternatives</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">60 days</Badge>
              <span className="text-muted-foreground">Negotiate final terms, submit notice if not renewing</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">30 days</Badge>
              <span className="text-muted-foreground">Finalize contract, update system rates</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-green-500">Renewal</Badge>
              <span className="text-muted-foreground">New contract effective, verify system updates</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <WarningCallout title="Renewal Notice Deadline">
        Missing the notice period deadline may result in automatic renewal at unfavorable rates 
        or loss of negotiating leverage. Set calendar reminders at 120, 90, and 60 days before 
        contract expiration. The system can send automated reminders to designated administrators.
      </WarningCallout>

      {/* Business Rules */}
      <BusinessRules
        rules={contractRules}
        title="Contract Governance Rules"
      />

      {/* Compliance */}
      <ComplianceCallout title="Contract Retention Requirements">
        <div className="space-y-2 text-sm">
          <p><strong>ERISA (US):</strong> Retain plan documents and contracts for 6 years after plan termination.</p>
          <p><strong>Regional:</strong> Caribbean and African jurisdictions may have specific retention 
          requirements. Consult local labor law for guidance.</p>
          <p><strong>Audit:</strong> Contract terms may be requested during financial or compliance audits. 
          Maintain organized contract library with version history.</p>
        </div>
      </ComplianceCallout>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        title="Contract Management Dashboard"
        description="Contract tracking screen showing renewal dates, notice deadlines, and contract document library"
        height="h-48"
      />

      {/* Tips */}
      <TipCallout title="Proactive Contract Management">
        Create a benefits calendar with all provider contract dates. Schedule quarterly reviews 
        of provider relationships and performance. Document all rate negotiations and amendments 
        for future reference during renewals.
      </TipCallout>
    </div>
  );
}
