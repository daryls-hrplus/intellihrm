import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Mail, CheckCircle, Clock, Variable, Layers, 
  AlertTriangle, Eye, Settings
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const templateCategories = [
  { category: 'Employment', description: 'Job confirmation, employment verification, contract letters', examples: 'Employment Confirmation, Offer Letter, Probation Completion' },
  { category: 'Career & Promotion', description: 'Promotions, transfers, role changes', examples: 'Promotion Letter, Transfer Notice, Role Change Confirmation' },
  { category: 'Compensation', description: 'Salary adjustments, bonus notifications', examples: 'Salary Adjustment Letter, Bonus Notification, Increment Letter' },
  { category: 'General', description: 'Miscellaneous HR correspondence', examples: 'Warning Letter, Acknowledgment, Reference Letter' },
];

const availableVariables = [
  { variable: '{{employee_name}}', description: 'Full name of the employee', example: 'John Smith' },
  { variable: '{{company_name}}', description: 'Legal name of the company', example: 'Acme Corporation Ltd' },
  { variable: '{{current_date}}', description: 'Date when the letter is generated', example: 'January 8, 2026' },
  { variable: '{{letter_number}}', description: 'Auto-generated unique reference number', example: 'LTR-2026-001234' },
  { variable: '{{position_title}}', description: 'Employee\'s current job title', example: 'Senior Software Developer' },
  { variable: '{{department_name}}', description: 'Employee\'s department', example: 'Engineering' },
  { variable: '{{hire_date}}', description: 'Employee\'s original hire date', example: 'March 15, 2023' },
];

const templateFields = [
  { name: 'name', required: true, type: 'string', description: 'Display name for the template', validation: 'Must be unique' },
  { name: 'code', required: true, type: 'string', description: 'Unique identifier, auto-formatted to lowercase_snake_case', validation: 'Alphanumeric and underscores only' },
  { name: 'category', required: true, type: 'select', description: 'Template classification (Employment, Career, Compensation, General)' },
  { name: 'subject', required: true, type: 'string', description: 'Subject line for the letter, supports variable substitution' },
  { name: 'body_template', required: true, type: 'textarea', description: 'Letter content with {{variable}} placeholders' },
  { name: 'description', required: false, type: 'string', description: 'Internal notes about when to use this template' },
  { name: 'requires_approval', required: false, type: 'boolean', description: 'If enabled, generated letters queue for HR approval', defaultValue: 'false' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Whether the template is available for use', defaultValue: 'true' },
];

const createTemplateSteps = [
  {
    title: 'Navigate to Letter Templates',
    description: 'Access Admin → Letter Templates from the main navigation menu.',
    expectedResult: 'Letter templates page loads with Templates tab active'
  },
  {
    title: 'Click New Template',
    description: 'Click the "New Template" button in the top right corner.',
    expectedResult: 'Template creation dialog opens'
  },
  {
    title: 'Enter Basic Information',
    description: 'Complete the required fields for the template.',
    substeps: [
      'Name: Descriptive template name (e.g., "Employment Confirmation")',
      'Code: Unique identifier (auto-converts to snake_case)',
      'Category: Select from Employment, Career & Promotion, Compensation, or General',
      'Subject: Letter subject line (can include variables)'
    ],
    expectedResult: 'Basic fields populated'
  },
  {
    title: 'Write Template Body',
    description: 'Enter the letter content using {{variable}} syntax for dynamic data.',
    substeps: [
      'Use {{employee_name}} for the recipient\'s name',
      'Use {{company_name}} for your organization name',
      'Reference the Available Variables panel for all options',
      'Variables are auto-detected from your template text'
    ],
    expectedResult: 'Template body complete with variables highlighted'
  },
  {
    title: 'Configure Approval Settings',
    description: 'Decide whether letters from this template require HR approval before issuance.',
    substeps: [
      'Enable "Requires Approval" for legally sensitive letters',
      'Leave disabled for routine correspondence (auto-approved)'
    ],
    expectedResult: 'Approval mode configured'
  },
  {
    title: 'Save Template',
    description: 'Click Save to create the template. It becomes immediately available for letter generation.',
    expectedResult: 'Success notification; template appears in list'
  }
];

const approvalSteps = [
  {
    title: 'Access Pending Approvals',
    description: 'Navigate to Admin → Letter Templates and click the "Pending Approvals" tab.',
    expectedResult: 'List of pending letter requests displayed with badge count'
  },
  {
    title: 'Review Letter Request',
    description: 'Click "Review" on a pending letter to open the approval dialog.',
    expectedResult: 'Full letter content displayed with employee details'
  },
  {
    title: 'Approve or Reject',
    description: 'Review the generated content and take action.',
    substeps: [
      'Click "Approve" to finalize the letter for issuance',
      'Click "Reject" and provide a reason to decline the request',
      'Approved letters can be downloaded or sent to the employee'
    ],
    expectedResult: 'Letter status updated; removed from pending queue'
  }
];

export function LetterTemplatesSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-4-3">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 4.3</Badge>
            <Badge variant="secondary">15 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Letter Templates</h2>
          <p className="text-muted-foreground mt-1">
            Create standardized HR letters with dynamic variable substitution and approval workflows
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            Letter Templates enable HR teams to generate consistent, professional correspondence 
            with automatic data population. Instead of manually typing employee details, templates 
            use variable placeholders that resolve to actual data when letters are generated.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Variable className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Variable Substitution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {"{{employee_name}}"} becomes "John Smith" automatically
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Layers className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Organized by Category</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Templates grouped by purpose for easy discovery
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Approval Workflows</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Optional review step before letters are issued
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            Template Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Templates are organized into four categories based on their purpose:
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Use Cases</th>
                  <th className="text-left p-3 font-medium">Examples</th>
                </tr>
              </thead>
              <tbody>
                {templateCategories.map((cat, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 font-medium">{cat.category}</td>
                    <td className="p-3 text-muted-foreground">{cat.description}</td>
                    <td className="p-3 text-xs text-muted-foreground">{cat.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Variable Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5 text-purple-500" />
            Available Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Use these placeholders in your template body. Variables are enclosed in double curly braces 
            and automatically replaced with employee data when letters are generated:
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Variable</th>
                  <th className="text-left p-3 font-medium">Resolves To</th>
                  <th className="text-left p-3 font-medium">Example Output</th>
                </tr>
              </thead>
              <tbody>
                {availableVariables.map((v, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 font-mono text-sm bg-muted/30">{v.variable}</td>
                    <td className="p-3 text-muted-foreground">{v.description}</td>
                    <td className="p-3 text-sm">{v.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TipCallout title="Auto-Detection">
            The system automatically detects variables from your template body. As you type 
            &#123;&#123;variable_name&#125;&#125;, it appears in the "Detected Variables" list, helping you 
            verify proper syntax.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Creating Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-500" />
            Creating a Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={createTemplateSteps} />
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={templateFields} />
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            When a template has "Requires Approval" enabled, generated letters enter a pending 
            state until reviewed by an HR administrator.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-700 dark:text-green-400">Auto-Approve</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Letters are generated and immediately available for download. Best for routine 
                correspondence like employment verifications.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-700 dark:text-amber-400">Requires Approval</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Letters queue in "Pending Approvals" for HR review before issuance. Required 
                for offers, terminations, and legal matters.
              </p>
            </div>
          </div>

          <h4 className="font-semibold mt-6">Approving Pending Letters</h4>
          <StepByStep steps={approvalSteps} title="" />

          <WarningCallout title="Approval Required for Legal Letters">
            Always enable "Requires Approval" for offer letters, termination notices, warning 
            letters, and any correspondence with legal implications. This ensures proper review 
            before documents reach employees.
          </WarningCallout>
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
              <h4 className="font-medium mb-2">Template Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use consistent tone and formatting across templates</li>
                <li>• Include company letterhead instructions in descriptions</li>
                <li>• Test templates with sample data before activating</li>
                <li>• Version templates when making significant changes</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Variable Usage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Preview generated letters before sending</li>
                <li>• Use fallback text for optional data fields</li>
                <li>• Keep variable names descriptive and consistent</li>
                <li>• Document custom variables in template description</li>
              </ul>
            </div>
          </div>

          <InfoCallout title="Letter Numbering">
            Each generated letter receives a unique reference number (e.g., LTR-2026-001234) 
            automatically. This number is available as the {"{{letter_number}}"} variable and 
            provides an audit trail for all correspondence.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
}
