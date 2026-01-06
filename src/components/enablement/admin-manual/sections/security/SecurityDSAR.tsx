import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSearch, Download, Trash2, Clock, UserCheck, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const REQUEST_TYPES = [
  { type: "Access Request", right: "Right to Access", description: "Provide copy of all personal data held", timeline: "30 days" },
  { type: "Rectification", right: "Right to Rectification", description: "Correct inaccurate personal data", timeline: "30 days" },
  { type: "Erasure", right: "Right to Erasure", description: "Delete personal data ('Right to be Forgotten')", timeline: "30 days" },
  { type: "Portability", right: "Right to Portability", description: "Export data in machine-readable format", timeline: "30 days" },
  { type: "Restriction", right: "Right to Restriction", description: "Limit processing of personal data", timeline: "Immediate" },
  { type: "Objection", right: "Right to Object", description: "Object to processing for specific purposes", timeline: "Immediate" },
];

const DATA_CATEGORIES = [
  "Personal identification data",
  "Contact information",
  "Employment records",
  "Compensation & benefits data",
  "Performance evaluations",
  "Training records",
  "Leave & attendance records",
  "Disciplinary records",
  "Health & safety records",
  "System access logs"
];

const DSAR_WORKFLOW_STEPS = [
  { step: "Request Received", actor: "Employee/Data Subject", actions: "Submit request via portal or email" },
  { step: "Identity Verification", actor: "HR/DPO", actions: "Verify requester identity, log request" },
  { step: "Scope Assessment", actor: "DPO", actions: "Determine data scope, identify systems involved" },
  { step: "Data Collection", actor: "System", actions: "Aggregate data from all relevant systems" },
  { step: "Review & Redaction", actor: "HR/Legal", actions: "Review for third-party data, apply redactions" },
  { step: "Response Delivery", actor: "DPO", actions: "Deliver response, document completion" },
];

export function SecurityDSAR() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Data Subject Access Requests (DSAR) management enables organizations to respond to 
        individual rights requests under GDPR and other privacy regulations within mandated timelines.
      </p>

      {/* Request Types */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-blue-500" />
          Supported Request Types
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Request Type</th>
                <th className="text-left p-3 font-medium">Right</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {REQUEST_TYPES.map((req, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{req.type}</td>
                  <td className="p-3">
                    <Badge variant="outline">{req.right}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{req.description}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{req.timeline}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.9.1: DSAR Request Management Dashboard"
        alt="Dashboard showing pending and completed data subject requests with status indicators"
      />

      {/* Workflow */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-500" />
          DSAR Processing Workflow
        </h4>
        <div className="space-y-3">
          {DSAR_WORKFLOW_STEPS.map((step, index) => (
            <div key={index} className="flex items-start gap-4 border rounded-lg p-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{step.step}</span>
                  <Badge variant="outline" className="text-xs">{step.actor}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{step.actions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Categories */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-500" />
          Data Categories Included
        </h4>
        <div className="grid gap-2 md:grid-cols-2">
          {DATA_CATEGORIES.map((category, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {category}
            </div>
          ))}
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.9.2: Data Export Package generation with category selection"
        alt="Export configuration showing selectable data categories and format options"
      />

      {/* Export & Deletion */}
      <div>
        <h4 className="font-medium mb-4">Export & Deletion Tools</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Download className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Data Export</span>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• JSON format for portability</li>
              <li>• PDF summary report</li>
              <li>• Secure download link (time-limited)</li>
              <li>• Encrypted archive option</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm">Data Erasure</span>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Soft delete with retention period</li>
              <li>• Hard delete after confirmation</li>
              <li>• Legal hold override protection</li>
              <li>• Audit trail preserved</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.9.3: Data Erasure confirmation with legal hold check"
        alt="Deletion confirmation dialog showing impacted data and legal hold status"
      />

      {/* Identity Verification */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-amber-500" />
          Identity Verification Requirements
        </h4>
        <div className="border rounded-lg p-4">
          <p className="text-sm mb-3">
            Before processing any DSAR, verify the requester's identity to prevent unauthorized data disclosure:
          </p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Government-issued ID verification</li>
            <li>• Knowledge-based authentication questions</li>
            <li>• Verification through registered email/phone</li>
            <li>• In-person verification for sensitive requests</li>
          </ul>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Requirement:</strong> DSARs must be completed within 30 days under GDPR. 
          Extensions up to 60 days are permitted for complex requests but require notification to the data subject.
        </AlertDescription>
      </Alert>
    </div>
  );
}
