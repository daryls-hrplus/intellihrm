import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileCheck, Users, Globe, FileText, Stamp, Download, FolderArchive, ArrowRight } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  StepByStep,
  BusinessRules,
  ScreenshotPlaceholder,
  TipCallout,
  ComplianceCallout,
  RelatedTopics
} from '../../components';

const TEMPLATE_CATEGORIES = [
  { category: 'Disciplinary', examples: ['Verbal Warning', 'Written Warning', 'Final Warning', 'Suspension Notice'] },
  { category: 'Performance', examples: ['Performance Review Sign-off', 'PIP Documentation', 'Performance Acknowledgment'] },
  { category: 'Separation', examples: ['Resignation Acceptance', 'Termination Letter', 'Exit Clearance'] },
  { category: 'Employment', examples: ['Probation Confirmation', 'Role Change Confirmation', 'Salary Adjustment Letter'] },
  { category: 'Grievance', examples: ['Grievance Acknowledgment', 'Investigation Summary', 'Resolution Letter'] }
];

const GENERATION_STEPS = [
  {
    title: 'Access Document Generation',
    description: 'Open document generation from the appraisal',
    substeps: [
      'Navigate to the finalized/reviewed appraisal',
      'Click "Actions" → "Generate Document"',
      'Or access from Compliance Tracker → Documents'
    ],
    expectedResult: 'Document generator wizard opens'
  },
  {
    title: 'Select Template',
    description: 'Choose the appropriate jurisdiction-specific template',
    substeps: [
      'Filter by jurisdiction (Caribbean, Ghana, Nigeria, Global)',
      'Select document category (Performance, Disciplinary, etc.)',
      'Choose specific template from filtered list'
    ],
    expectedResult: 'Template selected with preview available'
  },
  {
    title: 'Review Variable Population',
    description: 'Verify auto-populated data from appraisal',
    substeps: [
      'Review employee name, ID, position',
      'Check dates, scores, and ratings',
      'Verify manager and HR information'
    ],
    expectedResult: 'All variables correctly populated'
  },
  {
    title: 'Add Custom Content',
    description: 'Enter any additional required information',
    substeps: [
      'Fill in template-specific fields',
      'Add narrative sections as needed',
      'Review terms and conditions applicability'
    ],
    expectedResult: 'Document content complete'
  },
  {
    title: 'Generate & Review',
    description: 'Create the document and verify output',
    substeps: [
      'Click "Generate Document"',
      'Review generated PDF/document',
      'Make any final edits if needed'
    ],
    expectedResult: 'Jurisdiction-compliant document ready'
  },
  {
    title: 'Route for Signatures (Optional)',
    description: 'Send document through signature workflow',
    substeps: [
      'If signatures required, click "Send for Signature"',
      'Select signatories (Employee, Manager, HR, Witness)',
      'Track signature progress in document status'
    ],
    expectedResult: 'Document routed for execution'
  }
];

const BUSINESS_RULES = [
  { rule: 'Templates are jurisdiction-specific', enforcement: 'System' as const, description: 'Templates include region-appropriate legal language and requirements.' },
  { rule: 'Variables auto-populate from appraisal', enforcement: 'System' as const, description: 'Employee data, scores, and dates pulled automatically from linked appraisal.' },
  { rule: 'Documents linked to source records', enforcement: 'System' as const, description: 'Generated documents reference the appraisal ID and remain connected for audit.' },
  { rule: 'Retention policies apply automatically', enforcement: 'System' as const, description: 'Documents stored according to configured retention schedules by document type.' },
  { rule: 'Signatures tracked in audit log', enforcement: 'System' as const, description: 'All signature events logged with timestamp, IP, and method.' }
];

export function ComplianceDocumentSection() {
  return (
    <Card id="sec-7-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 7.7</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="gap-1 bg-green-600 text-white">
            <Users className="h-3 w-3" />
            Manager / HR User
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-green-500" />
          Compliance Document Generation
        </CardTitle>
        <CardDescription>
          Generate jurisdiction-compliant performance documents from appraisal data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Appraisals', 'Actions', 'Generate Document']} />

        <LearningObjectives
          objectives={[
            'Generate performance documents from finalized appraisals',
            'Select appropriate jurisdiction-specific templates',
            'Understand variable auto-population from appraisal data',
            'Route documents for signatures when required'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            What is Compliance Document Generation?
          </h4>
          <p className="text-muted-foreground">
            Compliance Document Generation enables managers and HR to create jurisdiction-specific 
            performance documentation directly from appraisal outcomes. Templates are pre-configured 
            with legal language appropriate for Caribbean, Ghana, Nigeria, and global operations, 
            ensuring consistency and compliance across your multi-country workforce.
          </p>
        </div>

        {/* Regional Coverage */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Supported Jurisdictions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2 bg-background rounded text-center">
              <Globe className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-sm font-medium">Caribbean</p>
              <p className="text-xs text-muted-foreground">TT, JM, BB</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <Globe className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-sm font-medium">Ghana</p>
              <p className="text-xs text-muted-foreground">GH Labour Act</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <Globe className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-sm font-medium">Nigeria</p>
              <p className="text-xs text-muted-foreground">NG Labour Law</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <Globe className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <p className="text-sm font-medium">Global</p>
              <p className="text-xs text-muted-foreground">General templates</p>
            </div>
          </div>
        </div>

        {/* Template Categories */}
        <div>
          <h4 className="font-medium mb-3">Template Categories</h4>
          <div className="space-y-3">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <div key={cat.category} className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium">{cat.category}</h5>
                  <p className="text-sm text-muted-foreground">
                    {cat.examples.join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 7.7.1: Compliance Document Generator with template selection"
          alt="Document generator interface"
        />

        {/* Data Flow */}
        <div>
          <h4 className="font-medium mb-3">Data Flow: Appraisal → Document</h4>
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg">
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <p className="text-xs font-medium">Appraisal</p>
              <p className="text-xs text-muted-foreground">Finalized</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <p className="text-xs font-medium">Template</p>
              <p className="text-xs text-muted-foreground">Selected</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <p className="text-xs font-medium">Variables</p>
              <p className="text-xs text-muted-foreground">Populated</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <Stamp className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs font-medium">Document</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 text-center min-w-[80px]">
              <Download className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-xs font-medium">Signed</p>
            </div>
          </div>
        </div>

        <StepByStep steps={GENERATION_STEPS} title="Generating a Compliance Document" />

        <ScreenshotPlaceholder
          caption="Figure 7.7.2: Generated document preview with signature routing options"
          alt="Document preview and signature options"
        />

        {/* Storage & Access */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <FolderArchive className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Document Storage & Access</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Generated documents are stored securely and accessible from multiple locations:
          </p>
          <ul className="text-sm space-y-1">
            <li>• <strong>Appraisal Record:</strong> Documents tab on the source appraisal</li>
            <li>• <strong>Employee Profile:</strong> Documents section under employee record</li>
            <li>• <strong>Compliance Tracker:</strong> Central document library with search</li>
            <li>• <strong>HR Document Management:</strong> Integrated with DMS if configured</li>
          </ul>
        </div>

        <ComplianceCallout title="Legal Compliance">
          Templates are reviewed by legal counsel for each jurisdiction. However, organizations 
          should verify template appropriateness for their specific context. Always consult with 
          local legal advisors for high-stakes documents like terminations.
        </ComplianceCallout>

        <TipCallout title="Template Customization">
          If standard templates don't meet your needs, HR Admins can request template 
          modifications or create new templates via the Template Management interface 
          (requires appropriate permissions).
        </TipCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-3-10', title: 'Finalization & Close-out' },
            { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' },
            { sectionId: 'sec-8-4', title: 'Compliance & Audit Checklist' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
