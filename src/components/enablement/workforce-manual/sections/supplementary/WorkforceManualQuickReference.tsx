import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Briefcase, Users, GitBranch, UserPlus, Settings,
  ArrowRight, CheckCircle2, Clock, AlertCircle, Info
} from 'lucide-react';

interface QuickRefItem {
  action: string;
  steps: string[];
  notes?: string;
}

interface QuickRefCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: QuickRefItem[];
}

const QUICK_REF_CATEGORIES: QuickRefCategory[] = [
  {
    id: 'org-structure',
    title: 'Organization Structure',
    icon: <Building2 className="h-4 w-4" />,
    items: [
      {
        action: 'Create Territory',
        steps: ['Workforce → Territories', 'Click "Add Territory"', 'Enter code & name', 'Set currency & timezone', 'Configure regional settings', 'Save'],
        notes: 'Territories are the top-level organizational unit'
      },
      {
        action: 'Add Company',
        steps: ['Workforce → Companies', 'Click "New Company"', 'Select parent territory', 'Enter legal name & code', 'Set tax ID & registration', 'Configure payroll settings', 'Activate'],
        notes: 'Each company requires unique legal entity setup'
      },
      {
        action: 'Create Department',
        steps: ['Workforce → Departments', 'Select company', 'Click "Add Department"', 'Enter name & code', 'Assign cost center', 'Set department head', 'Save'],
      },
      {
        action: 'Configure Branch/Location',
        steps: ['Workforce → Branches', 'Click "New Branch"', 'Select parent company', 'Enter address details', 'Set geolocation (optional)', 'Configure work calendar', 'Activate'],
      },
      {
        action: 'Import Org Structure',
        steps: ['Workforce → Data Import', 'Select "Organization Structure"', 'Download template', 'Fill in hierarchy data', 'Upload completed file', 'Map columns', 'Validate & import'],
        notes: 'Use hierarchy codes to maintain parent-child relationships'
      }
    ]
  },
  {
    id: 'job-arch',
    title: 'Job Architecture',
    icon: <Briefcase className="h-4 w-4" />,
    items: [
      {
        action: 'Create Job Family',
        steps: ['Workforce → Job Families', 'Click "Add Family"', 'Enter family name & code', 'Add description', 'Set career progression levels', 'Link competency framework', 'Save'],
      },
      {
        action: 'Define Job',
        steps: ['Workforce → Jobs', 'Click "New Job"', 'Select job family', 'Enter job title & code', 'Set grade/level range', 'Add responsibilities', 'Link required skills', 'Publish'],
        notes: 'Jobs are templates; positions are instances'
      },
      {
        action: 'Configure Grade Band',
        steps: ['Workforce → Grades', 'Click "New Grade"', 'Enter grade code & name', 'Set salary min/mid/max', 'Define level criteria', 'Link to job families', 'Save'],
      },
      {
        action: 'Map Competencies',
        steps: ['Open job definition', 'Go to "Competencies" tab', 'Click "Add Competency"', 'Select from library', 'Set proficiency level', 'Mark as required/optional', 'Save'],
      },
      {
        action: 'Link Job to Positions',
        steps: ['Open job definition', 'Go to "Positions" tab', 'Review linked positions', 'Click "Create Position"', 'Set department & reports to', 'Configure FTE', 'Activate'],
      }
    ]
  },
  {
    id: 'employee-mgmt',
    title: 'Employee Management',
    icon: <Users className="h-4 w-4" />,
    items: [
      {
        action: 'Create Employee Record',
        steps: ['Workforce → Employees', 'Click "Add Employee"', 'Enter personal details', 'Add contact information', 'Set employment type', 'Assign to position', 'Save & activate'],
      },
      {
        action: 'Process New Hire',
        steps: ['Create employee record', 'Set hire date', 'Complete tax & banking', 'Assign to department', 'Configure benefits eligibility', 'Trigger onboarding workflow', 'Send welcome notification'],
        notes: 'Onboarding tasks auto-generate based on template'
      },
      {
        action: 'Execute Transfer',
        steps: ['Workforce → Transactions', 'Click "New Transfer"', 'Select employee', 'Choose new position', 'Set effective date', 'Add transfer reason', 'Submit for approval'],
      },
      {
        action: 'Process Promotion',
        steps: ['Workforce → Transactions', 'Click "New Promotion"', 'Select employee', 'Choose new job/grade', 'Set salary adjustment', 'Add effective date', 'Attach documentation', 'Submit for approval'],
      },
      {
        action: 'Handle Separation',
        steps: ['Workforce → Transactions', 'Click "New Separation"', 'Select employee', 'Set separation type', 'Enter last working day', 'Configure final settlement', 'Trigger offboarding workflow'],
        notes: 'System auto-calculates leave encashment & dues'
      }
    ]
  },
  {
    id: 'position-ctrl',
    title: 'Position Control',
    icon: <GitBranch className="h-4 w-4" />,
    items: [
      {
        action: 'Create Position',
        steps: ['Workforce → Positions', 'Click "New Position"', 'Select job definition', 'Set department', 'Configure reports to', 'Set FTE value', 'Define budget', 'Activate'],
      },
      {
        action: 'Assign Employee',
        steps: ['Open position record', 'Click "Assign Employee"', 'Search & select employee', 'Set assignment type', 'Configure start date', 'Set as primary (if applicable)', 'Confirm assignment'],
        notes: 'Employees can have multiple position assignments'
      },
      {
        action: 'Configure FTE Split',
        steps: ['Open employee record', 'Go to "Assignments" tab', 'Add secondary position', 'Set FTE percentage', 'Configure split ratio', 'Set cost allocation', 'Save'],
      },
      {
        action: 'Manage Vacancy',
        steps: ['Workforce → Vacancies', 'Review open positions', 'Click "Create Requisition"', 'Set recruitment details', 'Add budget justification', 'Submit for approval', 'Route to recruitment'],
      },
      {
        action: 'Budget Control Setup',
        steps: ['Workforce → Position Budget', 'Select fiscal year', 'Import budget allocation', 'Link positions to budget', 'Set headcount limits', 'Configure approval thresholds', 'Activate controls'],
      }
    ]
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle Workflows',
    icon: <UserPlus className="h-4 w-4" />,
    items: [
      {
        action: 'Configure Onboarding',
        steps: ['Workforce → Onboarding', 'Click "Edit Template"', 'Add task categories', 'Create task items', 'Set task owners', 'Configure due dates', 'Add dependencies', 'Publish template'],
        notes: 'Tasks auto-assign based on employee attributes'
      },
      {
        action: 'Set Probation Rules',
        steps: ['Workforce → Settings → Probation', 'Set default period', 'Configure extension rules', 'Add review milestones', 'Set notification triggers', 'Link to performance forms', 'Save'],
      },
      {
        action: 'Configure Offboarding',
        steps: ['Workforce → Offboarding', 'Click "Edit Template"', 'Add exit checklist items', 'Set clearance steps', 'Configure asset return', 'Add exit interview', 'Set timeline rules', 'Publish'],
      },
      {
        action: 'Enable Rehire Process',
        steps: ['Workforce → Settings → Rehire', 'Enable rehire tracking', 'Set eligibility criteria', 'Configure waiting period', 'Link previous records', 'Set approval workflow', 'Save'],
      },
      {
        action: 'Create Task Template',
        steps: ['Workforce → Task Templates', 'Click "New Template"', 'Enter template name', 'Add task items', 'Set default assignees', 'Configure triggers', 'Add notifications', 'Activate'],
      }
    ]
  },
  {
    id: 'ess-mss',
    title: 'ESS/MSS Configuration',
    icon: <Settings className="h-4 w-4" />,
    items: [
      {
        action: 'Set ESS Permissions',
        steps: ['Workforce → ESS Settings', 'Select field category', 'Choose editable fields', 'Set view-only fields', 'Configure required documents', 'Set approval routing', 'Save'],
        notes: 'Group by sensitivity: low-risk vs high-risk changes'
      },
      {
        action: 'Configure MSS Actions',
        steps: ['Workforce → MSS Settings', 'Select transaction types', 'Enable manager actions', 'Set delegation rules', 'Configure approval limits', 'Add notification rules', 'Activate'],
      },
      {
        action: 'Enable Profile Updates',
        steps: ['ESS Settings → Profile', 'Select allowed sections', 'Set verification requirements', 'Configure document upload', 'Enable address validation', 'Set change preview', 'Save'],
      },
      {
        action: 'Set Approval Rules',
        steps: ['Workforce → Approval Policies', 'Click "New Policy"', 'Select trigger type', 'Define conditions', 'Add approval levels', 'Set timeout actions', 'Configure escalation', 'Activate'],
      },
      {
        action: 'Configure Delegation',
        steps: ['Workforce → Delegations', 'Click "New Delegation"', 'Select delegator', 'Choose delegate', 'Set scope (all/specific)', 'Define date range', 'Enable notifications', 'Activate'],
      }
    ]
  }
];

const STATUS_INDICATORS = [
  { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, label: 'Active / Completed', description: 'Record is active or action is complete' },
  { icon: <Clock className="h-4 w-4 text-amber-500" />, label: 'Pending / In Progress', description: 'Awaiting approval or processing' },
  { icon: <AlertCircle className="h-4 w-4 text-red-500" />, label: 'Attention Required', description: 'Action needed or validation error' },
  { icon: <Info className="h-4 w-4 text-blue-500" />, label: 'Information', description: 'Additional context or guidance' },
];

export const WorkforceManualQuickReference = () => {
  const [activeTab, setActiveTab] = useState('org-structure');

  return (
    <div className="space-y-6">
      <div data-manual-anchor="quick-ref" id="quick-ref">
        <h2 className="text-2xl font-bold mb-4">Quick Reference Cards</h2>
        <p className="text-muted-foreground mb-6">
          Step-by-step guides for common Workforce module administrative tasks.
          Select a category to view available quick reference cards.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {QUICK_REF_CATEGORIES.map(cat => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                {cat.icon}
                {cat.title}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {QUICK_REF_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {category.icon}
                      {item.action}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {item.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs shrink-0">
                            {stepIdx + 1}
                          </Badge>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                    {item.notes && (
                      <div className="mt-3 flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                        <Info className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Status Indicators Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATUS_INDICATORS.map((indicator, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {indicator.icon}
                <div>
                  <p className="text-sm font-medium">{indicator.label}</p>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Task Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Set Up New Department</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>Company</span>
                <ArrowRight className="h-3 w-3" />
                <span>Department</span>
                <ArrowRight className="h-3 w-3" />
                <span>Cost Center</span>
                <ArrowRight className="h-3 w-3" />
                <span>Manager</span>
                <ArrowRight className="h-3 w-3" />
                <span>Positions</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">New Employee Onboarding</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>Create Record</span>
                <ArrowRight className="h-3 w-3" />
                <span>Position</span>
                <ArrowRight className="h-3 w-3" />
                <span>Benefits</span>
                <ArrowRight className="h-3 w-3" />
                <span>Tasks</span>
                <ArrowRight className="h-3 w-3" />
                <span>Activate</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Process Internal Transfer</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>Request</span>
                <ArrowRight className="h-3 w-3" />
                <span>Approval</span>
                <ArrowRight className="h-3 w-3" />
                <span>Position Change</span>
                <ArrowRight className="h-3 w-3" />
                <span>Cost Reallocation</span>
                <ArrowRight className="h-3 w-3" />
                <span>Notify</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Employee Separation</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>Notice</span>
                <ArrowRight className="h-3 w-3" />
                <span>Clearance</span>
                <ArrowRight className="h-3 w-3" />
                <span>Settlement</span>
                <ArrowRight className="h-3 w-3" />
                <span>Exit Interview</span>
                <ArrowRight className="h-3 w-3" />
                <span>Archive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
