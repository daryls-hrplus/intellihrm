import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, CheckCircle, List, Upload, Settings2, Clock,
  Briefcase, Calendar, GraduationCap, Globe
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const lookupCategories = [
  {
    module: 'Leave Management',
    categories: [
      { code: 'leave_type', name: 'Leave Types', purpose: 'Types of leave available to employees', examples: 'Annual, Sick, Maternity, Bereavement' }
    ]
  },
  {
    module: 'Workforce',
    subgroup: null,
    categories: [
      { code: 'contract_type', name: 'Contract Types', purpose: 'Types of employment contracts', examples: 'Permanent, Fixed-term, Casual' },
      { code: 'employee_status', name: 'Employee Statuses', purpose: 'Employment state tracking', examples: 'Active, On Leave, Suspended, Terminated' },
      { code: 'employee_type', name: 'Employee Types', purpose: 'Classification of employees', examples: 'Full-time, Part-time, Contractor' },
      { code: 'employment_action', name: 'Employment Actions', purpose: 'Actions on employee records', examples: 'Hire, Promote, Transfer, Terminate' },
      { code: 'termination_reason', name: 'Termination Reasons', purpose: 'Exit documentation', examples: 'Resignation, Retirement, Dismissal, Redundancy' }
    ]
  },
  {
    module: 'Workforce',
    subgroup: 'Immigration',
    categories: [
      { code: 'immigration_document_types', name: 'Document Types', purpose: 'Passports, visas, permits', examples: 'Passport, Work Permit, Visa' },
      { code: 'immigration_categories', name: 'Permit Categories', purpose: 'Country-specific visa types', examples: 'Skilled Worker, Investor, Student' },
      { code: 'csme_skill_categories', name: 'CSME Skills', purpose: 'CARICOM free movement categories', examples: 'Artiste, Nurse, Teacher, Engineer' },
      { code: 'immigration_permit_statuses', name: 'Permit Statuses', purpose: 'Document lifecycle states', examples: 'Valid, Expired, Pending, Revoked' }
    ]
  },
  {
    module: 'Workforce',
    subgroup: 'Qualifications',
    categories: [
      { code: 'education_level', name: 'Education Levels', purpose: 'Academic attainment', examples: 'High School, Bachelors, Masters, PhD' },
      { code: 'qualification_type', name: 'Qualification Types', purpose: 'Categories of qualifications', examples: 'Academic, Professional, Technical' },
      { code: 'certification_type', name: 'Certification Types', purpose: 'Professional certifications', examples: 'License, Certificate, Accreditation' },
      { code: 'accrediting_body', name: 'Accrediting Bodies', purpose: 'Issuing organizations', examples: 'PMI, SHRM, CPA, ACCA' }
    ]
  }
];

const addValueSteps = [
  {
    title: 'Navigate to Lookup Values',
    description: 'Access Admin → Lookup Values from the main menu.',
    expectedResult: 'Lookup values management page loads with category tabs'
  },
  {
    title: 'Select Category',
    description: 'Choose the category you want to add values to. Categories are grouped by module (Leave Management, Workforce) and subgroups (Immigration, Qualifications).',
    expectedResult: 'Category tab becomes active and shows existing values'
  },
  {
    title: 'Click Add New Value',
    description: 'Click the "Add Value" button to open the create dialog.',
    expectedResult: 'Add value dialog opens with empty form'
  },
  {
    title: 'Complete the Form',
    description: 'Enter the required fields: Code (auto-uppercased), Name, and optionally Description, Display Order, and validity dates.',
    substeps: [
      'Code: Unique identifier (e.g., SICK_LEAVE)',
      'Name: Display label (e.g., "Sick Leave")',
      'Description: Optional context for users',
      'Display Order: Controls sort position',
      'Is Default: Check if this should be pre-selected',
      'Start/End Date: Set validity period'
    ],
    expectedResult: 'Form fields populated with valid data'
  },
  {
    title: 'Save the Value',
    description: 'Click Save to create the lookup value. The value becomes immediately available across the system.',
    expectedResult: 'Success toast appears; new value shows in the list'
  }
];

const lookupFields = [
  { name: 'code', required: true, type: 'string', description: 'Unique identifier for the value, auto-converted to UPPERCASE_SNAKE_CASE', validation: 'Alphanumeric, underscores only' },
  { name: 'name', required: true, type: 'string', description: 'Display label shown to users throughout the system' },
  { name: 'description', required: false, type: 'string', description: 'Optional help text explaining when to use this value' },
  { name: 'display_order', required: false, type: 'number', description: 'Sort position in dropdown lists', defaultValue: '0' },
  { name: 'is_default', required: false, type: 'boolean', description: 'Whether this value is pre-selected in forms', defaultValue: 'false' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Whether the value is available for selection', defaultValue: 'true' },
  { name: 'start_date', required: false, type: 'date', description: 'Date from which the value becomes active', defaultValue: 'Today' },
  { name: 'end_date', required: false, type: 'date', description: 'Date after which the value is no longer available' }
];

export function LookupValuesSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-2-1">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 2.1</Badge>
            <Badge variant="secondary">12 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Lookup Values Management</h2>
          <p className="text-muted-foreground mt-1">
            Configure dropdown lists, classification codes, and system-wide reference data
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-500" />
            Why Lookup Values Matter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Lookup values are the building blocks of your HRMS configuration. They define the options 
            available in dropdown lists throughout the system—from employee statuses and leave types 
            to immigration categories and qualification levels. Properly configured lookup values ensure:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Data Consistency</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Same values used across all modules prevent data fragmentation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Settings2 className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">No-Code Configuration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  HR admins can add new values without developer involvement
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Temporal Control</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Start/end dates support regulatory changes without losing history
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-blue-500" />
            Category Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Lookup values are organized by module and subgroup. Each category serves a specific 
            purpose within the system. Below is the complete reference of available categories:
          </p>

          {lookupCategories.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2">
                {group.module === 'Leave Management' && <Calendar className="h-4 w-4 text-green-500" />}
                {group.module === 'Workforce' && !group.subgroup && <Briefcase className="h-4 w-4 text-blue-500" />}
                {group.subgroup === 'Immigration' && <Globe className="h-4 w-4 text-purple-500" />}
                {group.subgroup === 'Qualifications' && <GraduationCap className="h-4 w-4 text-amber-500" />}
                <h4 className="font-semibold">
                  {group.module}{group.subgroup ? ` → ${group.subgroup}` : ''}
                </h4>
              </div>
              
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Purpose</th>
                      <th className="text-left p-3 font-medium">Example Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.categories.map((cat, cidx) => (
                      <tr key={cidx} className="border-t">
                        <td className="p-3 font-medium">{cat.name}</td>
                        <td className="p-3 text-muted-foreground">{cat.purpose}</td>
                        <td className="p-3">
                          <span className="text-xs text-muted-foreground">{cat.examples}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <Card>
        <CardHeader>
          <CardTitle>Adding a Lookup Value</CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={addValueSteps} />
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={lookupFields} />
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-500" />
            Bulk Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            For large-scale initial setup or regulatory updates, use the bulk upload feature 
            to import multiple values at once via CSV.
          </p>

          <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2"># CSV Format:</p>
            <p>code,name,description,display_order,is_default,is_active,start_date,end_date</p>
            <p className="text-muted-foreground mt-2 mb-2"># Example rows:</p>
            <p>ANNUAL,Annual Leave,Standard vacation entitlement,1,true,true,2024-01-01,</p>
            <p>SICK,Sick Leave,Medical absence with certification,2,false,true,2024-01-01,</p>
          </div>

          <TipCallout title="Template Available">
            Click "Download Template" in the bulk upload dialog to get a pre-formatted CSV 
            for the currently selected category with the correct column headers.
          </TipCallout>
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
              <h4 className="font-medium mb-2">Code Conventions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use UPPERCASE_SNAKE_CASE for codes</li>
                <li>• Keep codes short but descriptive (max 30 chars)</li>
                <li>• Avoid special characters except underscores</li>
                <li>• Use consistent prefixes for related values</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Lifecycle Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set start_date for values effective in future</li>
                <li>• Use end_date instead of deleting (preserves history)</li>
                <li>• Review inactive values quarterly</li>
                <li>• Document regulatory changes in descriptions</li>
              </ul>
            </div>
          </div>

          <WarningCallout title="Impact of Changes">
            Modifying or deleting lookup values affects historical data reporting. Employees 
            with the old value retain it, but new selections won't include deprecated options. 
            Always use end_date rather than deleting to maintain data integrity.
          </WarningCallout>

          <InfoCallout title="Regional Compliance">
            Some lookup values (especially in the Immigration subgroup) are pre-configured for 
            Caribbean and African markets. CSME Skills categories, for example, align with 
            CARICOM free movement protocols. Verify regional requirements before modifying 
            these system-provided values.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
}
