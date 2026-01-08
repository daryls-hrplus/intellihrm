import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Upload, Brain, Shield, CheckCircle, Clock, 
  RefreshCw, AlertTriangle, Globe, Building2, BookOpen
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout, ComplianceCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const supportedFormats = [
  { format: 'PDF', extension: '.pdf', processing: 'Full text extraction, OCR for scanned documents' },
  { format: 'Word', extension: '.docx', processing: 'Text and formatting extraction' },
  { format: 'Plain Text', extension: '.txt', processing: 'Direct text processing' },
  { format: 'Markdown', extension: '.md', processing: 'Structured content parsing with headers' },
];

const processingStatuses = [
  { status: 'Pending', icon: Clock, color: 'text-gray-500', description: 'Queued for AI processing', action: 'Wait for processing to begin' },
  { status: 'Processing', icon: RefreshCw, color: 'text-blue-500', description: 'AI analyzing document content', action: 'Wait for completion (typically 1-5 minutes)' },
  { status: 'Completed', icon: CheckCircle, color: 'text-green-500', description: 'Rules extracted successfully', action: 'Review extracted rules in Rules tab' },
  { status: 'Failed', icon: AlertTriangle, color: 'text-red-500', description: 'Processing encountered an error', action: 'Check error message, reprocess document' },
];

const severityLevels = [
  { severity: 'Blocking', badge: 'destructive', description: 'Prevents transaction from proceeding until resolved', useCase: 'Mandatory compliance requirements' },
  { severity: 'Warning', badge: 'warning', description: 'Alerts user but allows transaction to continue', useCase: 'Best practices, non-critical requirements' },
  { severity: 'Info', badge: 'secondary', description: 'Informational guidance without enforcement', useCase: 'Recommendations, optional guidelines' },
];

const documentFields = [
  { name: 'title', required: true, type: 'string', description: 'Document display name (auto-filled from filename)' },
  { name: 'description', required: false, type: 'string', description: 'Brief summary of document purpose' },
  { name: 'category', required: false, type: 'select', description: 'Classification for filtering and organization' },
  { name: 'company', required: false, type: 'select', description: 'Company scope (leave empty for global policies)' },
  { name: 'is_global', required: false, type: 'boolean', description: 'If enabled, applies to all companies', defaultValue: 'false' },
  { name: 'version', required: false, type: 'string', description: 'Document version number', defaultValue: '1.0' },
  { name: 'effective_date', required: false, type: 'date', description: 'Date from which the policy is active' },
];

const uploadSteps = [
  {
    title: 'Navigate to Policy Documents',
    description: 'Access Admin → Policy Documents from the main navigation.',
    expectedResult: 'Policy documents page loads with Documents tab active'
  },
  {
    title: 'Click Upload Document',
    description: 'Click the "Upload Document" button in the top right corner.',
    expectedResult: 'Upload dialog opens'
  },
  {
    title: 'Select Document File',
    description: 'Choose a policy document from your computer.',
    substeps: [
      'Supported formats: PDF, DOCX, TXT, or MD',
      'Title auto-fills from filename',
      'Maximum file size: 10MB'
    ],
    expectedResult: 'File selected and title populated'
  },
  {
    title: 'Configure Scope',
    description: 'Determine whether this policy applies globally or to specific companies.',
    substeps: [
      'Enable "Global" for organization-wide policies',
      'Select specific company for entity-specific policies',
      'Global policies apply to all entities automatically'
    ],
    expectedResult: 'Scope configured appropriately'
  },
  {
    title: 'Complete Metadata',
    description: 'Add optional details for organization and tracking.',
    substeps: [
      'Description: Brief summary of policy content',
      'Category: Select from available categories',
      'Version: Track document revisions',
      'Effective Date: When policy becomes active'
    ],
    expectedResult: 'Metadata fields completed'
  },
  {
    title: 'Upload and Process',
    description: 'Click Upload to save the document. AI processing begins automatically.',
    expectedResult: 'Document appears in list with "Processing" status'
  },
  {
    title: 'Review Extracted Rules',
    description: 'Once processing completes, review the auto-extracted rules.',
    substeps: [
      'Navigate to the "Extracted Rules" tab',
      'Review each rule for accuracy',
      'Toggle inactive any rules that shouldn\'t be enforced',
      'Active rules apply during employee transactions'
    ],
    expectedResult: 'Rules reviewed and configured'
  }
];

export function PolicyDocumentsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-4-2">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 4.2</Badge>
            <Badge variant="secondary">15 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Policy Documents</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered policy management with automatic rule extraction and enforcement
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            Policy Documents is an AI-powered system that transforms your written policies into 
            enforceable rules. Upload HR policies, compliance documents, and guidelines—the system 
            extracts actionable rules that guide employees and enforce compliance during transactions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">AI Rule Extraction</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically identifies and extracts enforceable rules from policy text
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Flexible Scoping</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Apply policies globally or to specific companies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Active Enforcement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Rules enforce compliance during employee transactions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Supported File Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Format</th>
                  <th className="text-left p-3 font-medium">Extension</th>
                  <th className="text-left p-3 font-medium">Processing</th>
                </tr>
              </thead>
              <tbody>
                {supportedFormats.map((f, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 font-medium">{f.format}</td>
                    <td className="p-3 font-mono text-sm">{f.extension}</td>
                    <td className="p-3 text-muted-foreground">{f.processing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TipCallout title="Best Format for AI Processing">
            Markdown (.md) and plain text (.txt) files yield the best rule extraction results. 
            Use clear headers and bullet points to structure policy content for optimal AI parsing.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Document Scoping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            Document Scoping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Policies can be scoped globally or to specific companies within your organization:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-700 dark:text-blue-400">Global Policies</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Apply to all companies in the organization. Use for organization-wide standards, 
                universal compliance requirements, and group-level policies.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-purple-700 dark:text-purple-400">Company-Specific</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Apply only to selected company. Use for local labor laws, entity-specific 
                regulations, and subsidiary-specific policies.
              </p>
            </div>
          </div>

          <InfoCallout title="Scope Hierarchy">
            When both global and company-specific policies exist, company-specific rules take 
            precedence. This allows overriding organization defaults for local requirements.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Upload Procedure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-500" />
            Uploading a Policy Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={uploadSteps} />
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={documentFields} />
        </CardContent>
      </Card>

      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Processing Status Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            After upload, documents go through AI processing to extract enforceable rules:
          </p>
          <div className="space-y-3">
            {processingStatuses.map((s, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                <s.icon className={`h-5 w-5 ${s.color} mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{s.status}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Action:</strong> {s.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Managing Extracted Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            After processing completes, review the extracted rules in the "Extracted Rules" tab. 
            Each rule represents an enforceable policy statement detected by the AI.
          </p>

          <h4 className="font-semibold mt-4">Severity Levels</h4>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Severity</th>
                  <th className="text-left p-3 font-medium">Behavior</th>
                  <th className="text-left p-3 font-medium">Use Case</th>
                </tr>
              </thead>
              <tbody>
                {severityLevels.map((s, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">
                      <Badge variant={s.badge as any}>{s.severity}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{s.description}</td>
                    <td className="p-3 text-sm">{s.useCase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50 mt-4">
            <h4 className="font-medium mb-2">Rule Management Actions</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span><strong>Active:</strong> Rule enforces during transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <span><strong>Inactive:</strong> Rule exists but doesn't enforce (useful for testing)</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5" />
                <span><strong>Reprocess:</strong> Re-extract rules after updating the source document</span>
              </li>
            </ul>
          </div>

          <WarningCallout title="Review AI-Extracted Rules">
            AI extraction is highly accurate but not perfect. Always review extracted rules 
            before activating them in production. Disable rules that are incorrectly interpreted 
            or not applicable to your organization.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The "Categories" tab allows you to organize documents into logical groups. Categories 
            help users filter and find relevant policies quickly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Default Categories</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HR Policies</li>
                <li>• Compliance & Legal</li>
                <li>• Health & Safety</li>
                <li>• Employee Benefits</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Custom Categories</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create categories matching your organization structure</li>
                <li>• Assign icons for visual identification</li>
                <li>• Set display order for priority</li>
                <li>• Deactivate unused categories</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Document Preparation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear, structured language for better AI extraction</li>
                <li>• Include section headers and numbered lists</li>
                <li>• Avoid complex tables and images (text-only processed)</li>
                <li>• Split very long documents into topic-specific files</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Version Control</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Update version number when revising documents</li>
                <li>• Set effective dates for policy changes</li>
                <li>• Reprocess after significant content changes</li>
                <li>• Keep a change log in the description field</li>
              </ul>
            </div>
          </div>

          <ComplianceCallout title="Regional Compliance">
            Upload country-specific labor laws and regulations as company-scoped documents. 
            This ensures employees in each jurisdiction receive applicable guidance. Caribbean 
            and African markets often have unique requirements not covered by global policies.
          </ComplianceCallout>
        </CardContent>
      </Card>
    </div>
  );
}
