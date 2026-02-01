import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, MapPin, Users, GraduationCap, Link2,
  Home, Building2, Briefcase
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  InfoCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationGeofenceAssignments() {
  const learningObjectives = [
    'Assign employees to one or multiple geofences',
    'Configure multi-location employee access',
    'Set up home/remote work geofence assignments',
    'Understand geofence validation at clock-in time',
    'Manage roaming/traveling employee exceptions'
  ];

  const geofenceAssignmentFields: FieldDefinition[] = [
    { name: 'assignment_id', required: true, type: 'uuid', description: 'Unique assignment record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee being assigned', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'geofence_id', required: true, type: 'uuid', description: 'Geofence being assigned', defaultValue: '—', validation: 'Must reference valid geofence' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'assignment_type', required: false, type: 'enum', description: 'Type of geofence access', defaultValue: 'work_location', validation: 'work_location, home_office, client_site, temporary' },
    { name: 'is_primary', required: false, type: 'boolean', description: 'Primary work location', defaultValue: 'true', validation: 'One primary per employee' },
    { name: 'effective_date', required: true, type: 'date', description: 'When assignment starts', defaultValue: 'now()', validation: 'Cannot be past for new' },
    { name: 'end_date', required: false, type: 'date', description: 'When assignment expires', defaultValue: 'null', validation: 'For temporary assignments' },
    { name: 'allow_override', required: false, type: 'boolean', description: 'Can punch outside with note', defaultValue: 'true', validation: 'Override permission' },
    { name: 'require_justification', required: false, type: 'boolean', description: 'Override needs explanation', defaultValue: 'true', validation: 'Audit compliance' },
    { name: 'assigned_by', required: false, type: 'uuid', description: 'Manager who assigned', defaultValue: 'null', validation: 'Audit trail' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Assignment is in effect', defaultValue: 'true', validation: 'Deactivate to remove' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Any Assigned Geofence Valid',
      enforcement: 'System',
      description: 'During clock-in, the system checks if employee is within ANY of their assigned geofences. Being inside any one is sufficient.'
    },
    {
      rule: 'Primary Location Reporting',
      enforcement: 'System',
      description: 'Analytics and reports use the primary geofence for location-based metrics. Only one geofence can be marked primary.'
    },
    {
      rule: 'Temporary Assignment Priority',
      enforcement: 'System',
      description: 'Temporary geofence assignments (with end_date) are included in validation during their active period without affecting permanent assignments.'
    },
    {
      rule: 'Home Office Verification',
      enforcement: 'Policy',
      description: 'Home office geofences are verified against employee\'s registered home address. Changes require HR approval.'
    },
    {
      rule: 'No Assignment = Any Location',
      enforcement: 'Advisory',
      description: 'Employees with no geofence assignments skip geofence validation entirely. Use this for traveling staff or executives.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Employee Geofences',
      description: 'Access geofence assignments from the employee profile or bulk assignment tool.',
      notes: ['Employee → Time & Attendance → Geofence Assignments']
    },
    {
      title: 'Select Geofences to Assign',
      description: 'Choose one or more geofences the employee should be able to clock in from.',
      notes: ['Geofences must be created first (Section 2.9)']
    },
    {
      title: 'Designate Primary Location',
      description: 'Mark one geofence as primary for reporting purposes.',
      notes: ['Usually the employee\'s main office']
    },
    {
      title: 'Configure Override Permissions',
      description: 'Decide if this employee can override geofence validation with justification.',
      notes: ['Disable for strict location enforcement']
    },
    {
      title: 'Set Effective Dates',
      description: 'For temporary assignments (client sites, projects), set start and end dates.',
      notes: ['Permanent assignments leave end_date null']
    },
    {
      title: 'Test Mobile Clock-In',
      description: 'Have employee test clock-in from assigned location via mobile app.',
      notes: ['Verify GPS accuracy and geofence boundaries']
    }
  ];

  return (
    <Card id="ta-sec-2-10" data-manual-anchor="ta-sec-2-10" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.10</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>7 min read</span>
        </div>
        <CardTitle className="text-2xl">Employee Geofence Assignments</CardTitle>
        <CardDescription>
          Linking employees to work locations, home offices, and client sites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Geofences vs. Geofence Assignments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Section 2.9 covered creating geofences (GPS boundaries around locations). This 
                section covers assigning employees to those geofences. Without assignments, 
                geofence validation is skipped. Employees can be assigned to multiple geofences—
                useful for multi-site workers, field staff visiting client sites, or hybrid 
                workers with both office and home assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Geofence Assignment Interface"
          caption="Employee geofence assignments showing multiple locations and assignment types"
        />

        {/* Assignment Types */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Assignment Types
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Building2,
                type: 'Work Location',
                description: 'Primary office, factory, or branch assignment',
                permanent: true,
                example: 'Kingston HQ, Spanish Town Branch'
              },
              {
                icon: Home,
                type: 'Home Office',
                description: 'Employee\'s registered home address for remote work',
                permanent: true,
                example: 'Based on profile home address'
              },
              {
                icon: Briefcase,
                type: 'Client Site',
                description: 'External client location for project-based work',
                permanent: false,
                example: 'Temporary: March 1 - June 30'
              },
              {
                icon: MapPin,
                type: 'Temporary',
                description: 'Short-term assignment with automatic expiry',
                permanent: false,
                example: 'Training center, conference venue'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">{item.type}</h4>
                  <Badge variant={item.permanent ? 'default' : 'outline'} className="ml-auto text-xs">
                    {item.permanent ? 'Permanent' : 'Date-limited'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Example:</span> {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={geofenceAssignmentFields}
          title="employee_geofence_assignments Table Fields"
        />

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Configuration
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Multi-Location Scenarios */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Common Multi-Location Scenarios
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Scenario</th>
                  <th className="text-left p-3 font-medium">Assignments</th>
                  <th className="text-left p-3 font-medium">Validation Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { scenario: 'Single office worker', assignments: '1 work location (primary)', behavior: 'Must clock in from office' },
                  { scenario: 'Hybrid worker', assignments: '1 work location + 1 home office', behavior: 'Can clock from either' },
                  { scenario: 'Multi-branch manager', assignments: '3 work locations', behavior: 'Can clock from any branch' },
                  { scenario: 'Field sales rep', assignments: '10+ client sites + home', behavior: 'Flexible location access' },
                  { scenario: 'Traveling executive', assignments: 'No assignments', behavior: 'Geofence validation skipped' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.scenario}</td>
                    <td className="p-3 text-muted-foreground">{row.assignments}</td>
                    <td className="p-3 text-muted-foreground">{row.behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>Bulk Assignments:</strong> Use the batch assignment tool to assign an entire 
          department or job position to a geofence at once. This automatically creates 
          individual assignment records that can be overridden per employee.
        </InfoCallout>

        {/* Warning */}
        <WarningCallout>
          <strong>Expired Assignments:</strong> When a temporary assignment expires, the system 
          falls back to remaining active assignments. If no assignments remain, geofence 
          validation is skipped—which may not be desired. Review expirations monthly.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Home Office Setup:</strong> For hybrid work policies, create a "Home Office" 
          geofence type with a larger radius (100-200m) to account for GPS inaccuracy indoors. 
          Link it to the employee's profile home address.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
