import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, BookOpen, Sparkles, Folder, List, CheckCircle } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const taskTypes = [
  { code: 'leave_request', label: 'Leave Request', purpose: 'Leave application and approval workflows', examples: 'Submission guidelines, approval criteria, cancellation rules' },
  { code: 'expense_claim', label: 'Expense Claim', purpose: 'Expense reimbursement processing', examples: 'Receipt requirements, spending limits, approval thresholds' },
  { code: 'onboarding', label: 'Onboarding', purpose: 'New employee setup and orientation', examples: 'Day 1 checklist, system access, required training' },
  { code: 'offboarding', label: 'Offboarding', purpose: 'Exit processing and handover', examples: 'Equipment return, access revocation, final pay' },
  { code: 'recruitment', label: 'Recruitment', purpose: 'Hiring workflow and candidate management', examples: 'Job posting standards, interview steps, offer process' },
  { code: 'performance_review', label: 'Performance Review', purpose: 'Evaluation and feedback cycles', examples: 'Goal setting, rating guidelines, calibration' },
  { code: 'training', label: 'Training', purpose: 'Learning and development requests', examples: 'Approval process, completion tracking, budget guidelines' },
  { code: 'payroll', label: 'Payroll', purpose: 'Pay processing and adjustments', examples: 'Deadline schedules, exception handling, corrections' },
  { code: 'benefits', label: 'Benefits', purpose: 'Benefits enrollment and changes', examples: 'Open enrollment, life events, contribution limits' },
  { code: 'general', label: 'General', purpose: 'Miscellaneous standardized procedures', examples: 'Any other HR procedure not in specific categories' }
];

const configurationSteps = [
  {
    title: 'Navigate to SOP Management',
    description: 'Access HR Hub → SOP Management from the main menu.',
    expectedResult: 'SOP Management page loads with Documents and Categories tabs'
  },
  {
    title: 'Create Categories First',
    description: 'Switch to the Categories tab and create logical groupings for your SOPs (e.g., "HR Operations", "Payroll Procedures", "Benefits Administration").',
    substeps: [
      'Click "Add Category"',
      'Enter Name, Code, and Description',
      'Categories help organize SOPs for easy discovery'
    ],
    expectedResult: 'Categories created for organizing SOPs'
  },
  {
    title: 'Add SOP Document',
    description: 'Return to the Documents tab and click "Add SOP" to create a new Standard Operating Procedure.',
    expectedResult: 'SOP creation dialog opens'
  },
  {
    title: 'Complete Basic Information',
    description: 'Enter the SOP title, description, and version number. Select the category and task type.',
    substeps: [
      'Title: Clear, action-oriented name',
      'Description: Brief summary of the procedure',
      'Version: Track revisions (e.g., 1.0, 1.1)',
      'Task Type: Associate with AI context',
      'Category: Organize for discoverability'
    ],
    expectedResult: 'Core SOP metadata is defined'
  },
  {
    title: 'Define Step-by-Step Instructions',
    description: 'Add individual steps that make up the procedure. Each step includes an instruction and optional notes.',
    substeps: [
      'Click "Add Step" to add a new step',
      'Enter the step instruction clearly',
      'Add notes for additional context',
      'Reorder steps as needed'
    ],
    expectedResult: 'Complete procedural steps are documented'
  },
  {
    title: 'Set Scope and Effective Date',
    description: 'Mark as Global (applies to all companies) or company-specific. Set the effective date when this SOP becomes active.',
    expectedResult: 'SOP scope and validity are configured'
  },
  {
    title: 'Save and Activate',
    description: 'Save the SOP. It will automatically become available to the AI Assistant for contextual guidance.',
    expectedResult: 'SOP is active and feeding AI responses'
  }
];

const sopFields = [
  { name: 'title', type: 'Text', required: true, description: 'Clear, descriptive procedure name' },
  { name: 'description', type: 'Text', required: false, description: 'Brief summary of what the SOP covers' },
  { name: 'content', type: 'Rich Text', required: false, description: 'Full procedure content (alternative to steps)' },
  { name: 'version', type: 'Text', required: true, description: 'Version identifier (e.g., 1.0, 2.1)' },
  { name: 'task_type', type: 'Select', required: false, description: 'Associate with a task type for AI context' },
  { name: 'category_id', type: 'UUID', required: false, description: 'Category for organization' },
  { name: 'is_global', type: 'Boolean', required: false, description: 'Applies to all companies if true' },
  { name: 'effective_date', type: 'Date', required: false, description: 'When this SOP becomes active' },
  { name: 'steps', type: 'Array', required: false, description: 'Ordered list of procedural steps' }
];

export function SOPManagementSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-2">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.2</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          10 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle>SOP Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Standard Operating Procedures for AI guidance and organizational consistency
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            Standard Operating Procedures (SOPs) are documented instructions that ensure consistent execution 
            of business processes. In HRplus, SOPs serve a dual purpose: they provide reference documentation 
            for employees AND feed contextual guidance to the AI Assistant.
          </p>

          <InfoCallout title="AI Integration">
            When employees interact with the AI Assistant, it uses SOPs associated with the relevant task type 
            to provide accurate, organization-specific guidance. This means your SOPs directly influence the 
            quality of AI responses.
          </InfoCallout>

          {/* Task Types Reference */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Task Types Reference
            </h4>
            <p className="text-sm text-muted-foreground">
              Each SOP can be associated with a task type. This enables the AI to retrieve relevant procedures 
              when users ask questions about specific HR processes.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Code</th>
                    <th className="border p-3 text-left font-medium">Label</th>
                    <th className="border p-3 text-left font-medium">Purpose</th>
                    <th className="border p-3 text-left font-medium">Example Procedures</th>
                  </tr>
                </thead>
                <tbody>
                  {taskTypes.map((type, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-mono text-xs">{type.code}</td>
                      <td className="border p-3 font-medium">{type.label}</td>
                      <td className="border p-3">{type.purpose}</td>
                      <td className="border p-3 text-muted-foreground">{type.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SOP Structure */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              SOP Structure
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h5 className="font-medium">Content Options</h5>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Free-form content field for narrative procedures</li>
                    <li>• Structured steps with order, instruction, and notes</li>
                    <li>• Version tracking for revision history</li>
                    <li>• Effective date for validity control</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <h5 className="font-medium">Organization</h5>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Categories for logical grouping</li>
                    <li>• Task type association for AI context</li>
                    <li>• Global vs. company-specific scope</li>
                    <li>• Active/inactive status control</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Configuration Steps */}
          <StepByStep
            title="Configuration Procedure"
            steps={configurationSteps}
          />

          {/* Field Reference */}
          <FieldReferenceTable
            title="SOP Document Fields"
            fields={sopFields}
          />

          <TipCallout title="Start with High-Impact Procedures">
            Begin with high-frequency tasks like leave requests and expense claims. These are the procedures 
            employees ask about most often, so having accurate SOPs will immediately improve AI response quality.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use clear, action-oriented titles (e.g., "How to Submit a Leave Request")</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Keep steps concise and numbered for easy reference</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Include expected outcomes so users know when they've completed correctly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Update versions when policies change to maintain accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Associate all SOPs with appropriate task types to maximize AI effectiveness</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
