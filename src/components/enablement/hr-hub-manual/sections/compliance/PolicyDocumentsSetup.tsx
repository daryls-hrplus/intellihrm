import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Upload, Sparkles, CheckCircle, AlertTriangle, Settings, FileText } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const supportedFileTypes = [
  { type: 'PDF', extension: '.pdf', notes: 'Recommended for formatted policies' },
  { type: 'Word', extension: '.docx', notes: 'Microsoft Word documents' },
  { type: 'Text', extension: '.txt', notes: 'Plain text files' },
  { type: 'Markdown', extension: '.md', notes: 'Markdown formatted text' }
];

const severityLevels = [
  { severity: 'Blocking', effect: 'Prevents action completion until resolved', color: 'destructive', example: 'Employee must complete safety training before site access' },
  { severity: 'Warning', effect: 'Shows alert but allows user to proceed with acknowledgment', color: 'secondary', example: 'Leave balance is running low' },
  { severity: 'Info', effect: 'Informational display only, no action required', color: 'outline', example: 'Policy has been updated since last acknowledgment' }
];

const processingStatuses = [
  { status: 'Pending', description: 'Document uploaded, awaiting processing', icon: Clock },
  { status: 'Processing', description: 'AI is extracting content and rules', icon: Sparkles },
  { status: 'Completed', description: 'Processing finished, rules extracted', icon: CheckCircle },
  { status: 'Failed', description: 'Processing encountered an error', icon: AlertTriangle }
];

const configurationSteps = [
  {
    title: 'Navigate to Policy Documents',
    description: 'Access Admin → Policy Documents from the main menu.',
    expectedResult: 'Policy Documents page loads with Documents, Rules, and Categories tabs'
  },
  {
    title: 'Create Categories (Optional)',
    description: 'Go to the Categories tab and create logical groupings for your policies (e.g., "HR Policies", "Safety", "IT Security").',
    expectedResult: 'Categories created for organization'
  },
  {
    title: 'Upload Policy Document',
    description: 'Click "Upload Document" to add a new policy file.',
    expectedResult: 'Upload dialog opens'
  },
  {
    title: 'Complete Document Details',
    description: 'Fill in the document metadata:',
    substeps: [
      'Title: Clear policy name',
      'Description: Brief summary',
      'Category: Select appropriate category',
      'Company: Select company or mark as Global',
      'Version: Document version number',
      'Effective Date: When policy becomes active',
      'File: Select PDF, DOCX, TXT, or MD file'
    ],
    expectedResult: 'Document metadata is complete'
  },
  {
    title: 'Upload and Process',
    description: 'Click Upload to save the document. The AI will automatically process it to extract rules and content for search.',
    expectedResult: 'Document uploaded and processing begins'
  },
  {
    title: 'Review Extracted Rules',
    description: 'Go to the Rules tab to see AI-extracted rules. Toggle rules on/off based on your organization\'s enforcement needs.',
    expectedResult: 'Rules are visible and configurable'
  }
];

const documentFields = [
  { name: 'title', type: 'Text', required: true, description: 'Policy document title' },
  { name: 'description', type: 'Text', required: false, description: 'Brief summary of policy content' },
  { name: 'category_id', type: 'UUID', required: false, description: 'Category for organization' },
  { name: 'company_id', type: 'UUID', required: false, description: 'Company scope (null if global)' },
  { name: 'is_global', type: 'Boolean', required: false, description: 'Applies to all companies if true' },
  { name: 'version', type: 'Text', required: false, description: 'Document version identifier' },
  { name: 'effective_date', type: 'Date', required: false, description: 'When policy becomes effective' },
  { name: 'file', type: 'File', required: true, description: 'PDF, DOCX, TXT, or MD file' }
];

const ruleFields = [
  { name: 'rule_type', type: 'Text', required: true, description: 'Type of rule extracted' },
  { name: 'rule_context', type: 'Text', required: true, description: 'Where the rule applies' },
  { name: 'rule_description', type: 'Text', required: true, description: 'Full rule description' },
  { name: 'severity', type: 'Select', required: true, description: 'Blocking, Warning, or Info' },
  { name: 'is_active', type: 'Boolean', required: true, description: 'Whether rule is enforced' }
];

const processingFlowDiagram = `flowchart LR
    A[Upload Document] --> B[Store in Storage]
    B --> C[Create DB Record]
    C --> D[Trigger AI Processing]
    D --> E[Extract Content]
    E --> F[Identify Rules]
    F --> G[Categorize by Severity]
    G --> H[Save Rules to DB]
    H --> I[Ready for Enforcement]`;

export function PolicyDocumentsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-7">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.7</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          10 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle>Policy Documents & AI Rules</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered policy management and automated rule enforcement
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Policy Documents enable organizations to upload their policies and have AI automatically 
              extract enforceable rules. These rules can then be applied during transactions to ensure 
              compliance, warn users of potential issues, or provide contextual information.
            </p>
          </div>

          <InfoCallout title="AI-Powered Processing">
            When you upload a policy document, the AI reads the content, identifies rules and requirements, 
            categorizes them by severity, and makes them available for enforcement. This happens 
            automatically - you just need to review and activate the rules you want to enforce.
          </InfoCallout>

          {/* Supported File Types */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supported File Types
            </h4>
            <div className="grid gap-3 md:grid-cols-4">
              {supportedFileTypes.map((type, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/20 text-center">
                  <Badge variant="outline" className="mb-2">{type.extension}</Badge>
                  <p className="text-sm font-medium">{type.type}</p>
                  <p className="text-xs text-muted-foreground">{type.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Processing Statuses */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Processing Statuses
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {processingStatuses.map((status, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <status.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">{status.status}</h5>
                    <p className="text-sm text-muted-foreground">{status.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Processing Flow Diagram */}
          <WorkflowDiagram
            title="Document Processing Pipeline"
            description="How policy documents are processed by AI"
            diagram={processingFlowDiagram}
          />

          {/* Severity Levels */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Rule Severity Levels
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Severity</th>
                    <th className="border p-3 text-left font-medium">Effect</th>
                    <th className="border p-3 text-left font-medium">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {severityLevels.map((level, idx) => (
                    <tr key={idx}>
                      <td className="border p-3">
                        <Badge variant={level.color as any}>{level.severity}</Badge>
                      </td>
                      <td className="border p-3">{level.effect}</td>
                      <td className="border p-3 text-muted-foreground">{level.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <WarningCallout title="Review AI-Extracted Rules">
            AI extraction is powerful but not perfect. Always review extracted rules before activating 
            them for enforcement. Disable rules that don't apply to your context or that were 
            incorrectly extracted.
          </WarningCallout>

          {/* Configuration Steps */}
          <StepByStep
            title="Uploading and Managing Policy Documents"
            steps={configurationSteps}
          />

          {/* Field References */}
          <FieldReferenceTable
            title="Document Fields"
            fields={documentFields}
          />

          <FieldReferenceTable
            title="Rule Fields"
            fields={ruleFields}
          />

          <TipCallout title="Reprocessing Documents">
            If you update a policy document, upload the new version and click "Reprocess" to have 
            the AI extract updated rules. This ensures your enforcement rules stay in sync with 
            your current policies.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use PDF format for best text extraction quality</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Create categories before uploading to keep policies organized</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Review extracted rules and disable those that don't apply</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use version numbers to track policy document revisions</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Set effective dates to control when new policies become active</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
