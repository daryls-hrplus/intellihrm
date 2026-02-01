import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, AlertCircle, Building2, Users, 
  Settings, Database, Link, GraduationCap, ArrowRight,
  FileText, Shield
} from 'lucide-react';
import { 
  LearningObjectives, 
  WarningCallout,
  IntegrationCallout,
  TipCallout,
  StepByStep
} from '@/components/enablement/manual/components';

export function TAFoundationPrerequisites() {
  const learningObjectives = [
    'Identify all system prerequisites before T&A configuration',
    'Validate Workforce module integration is complete',
    'Confirm company and location setup requirements',
    'Understand data dependencies between modules',
    'Create a pre-implementation readiness checklist'
  ];

  const prerequisiteChecks = [
    {
      category: 'Workforce Module',
      icon: Users,
      color: 'primary',
      items: [
        { name: 'Companies configured', table: 'companies', required: true },
        { name: 'Locations/branches set up', table: 'locations', required: true },
        { name: 'Departments defined', table: 'departments', required: true },
        { name: 'Job positions created', table: 'jobs', required: true },
        { name: 'Employee profiles active', table: 'profiles', required: true },
        { name: 'Employment assignments created', table: 'employee_jobs', required: true }
      ]
    },
    {
      category: 'Organizational Structure',
      icon: Building2,
      color: 'blue',
      items: [
        { name: 'Legal entities defined', table: 'companies', required: true },
        { name: 'Cost centers configured', table: 'cost_centers', required: false },
        { name: 'Reporting hierarchy set', table: 'profiles.reports_to', required: true },
        { name: 'Work calendars defined', table: 'company_calendars', required: true }
      ]
    },
    {
      category: 'Security & Permissions',
      icon: Shield,
      color: 'amber',
      items: [
        { name: 'Time Admin role created', table: 'roles', required: true },
        { name: 'Module permissions assigned', table: 'user_roles', required: true },
        { name: 'Data access policies defined', table: 'rls_policies', required: true },
        { name: 'Audit logging enabled', table: 'time_attendance_audit_log', required: true }
      ]
    },
    {
      category: 'System Configuration',
      icon: Settings,
      color: 'green',
      items: [
        { name: 'Time zone settings configured', table: 'companies.timezone', required: true },
        { name: 'Date/time formats set', table: 'company_settings', required: false },
        { name: 'Currency for differentials', table: 'companies.currency', required: true },
        { name: 'Pay period structure defined', table: 'pay_periods', required: true }
      ]
    }
  ];

  const implementationSteps = [
    {
      title: 'Verify Workforce Module Completion',
      description: 'Confirm all employee records, jobs, and organizational hierarchy are in place before proceeding with T&A setup.',
      notes: ['Navigate to: Workforce → Dashboard → Data Quality Report']
    },
    {
      title: 'Validate Location Data',
      description: 'Ensure each work location has complete address information required for geofencing configuration.',
      notes: ['Navigate to: Workforce → Locations → All Locations']
    },
    {
      title: 'Confirm Pay Period Structure',
      description: 'Verify pay periods align with payroll cycles and are configured for the current and upcoming periods.',
      notes: ['Navigate to: Payroll → Setup → Pay Periods']
    },
    {
      title: 'Review User Permissions',
      description: 'Assign Time Admin role to appropriate users and verify module access controls.',
      notes: ['Navigate to: Admin → Security → Roles & Permissions']
    },
    {
      title: 'Enable Audit Logging',
      description: 'Confirm audit trail is active for all time-sensitive operations to ensure compliance.',
      notes: ['Navigate to: Admin → System → Audit Configuration']
    }
  ];

  return (
    <Card id="ta-sec-2-1" data-manual-anchor="ta-sec-2-1" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.1</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>6 min read</span>
        </div>
        <CardTitle className="text-2xl">Prerequisites Checklist</CardTitle>
        <CardDescription>
          Dependencies, data requirements, and Workforce module integration validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Critical Warning */}
        <WarningCallout>
          <strong>Complete Workforce Setup First:</strong> The Time & Attendance module depends on 
          employee records, locations, and organizational structure from the Workforce module. 
          Attempting to configure T&A without complete Workforce data will result in assignment 
          failures and reporting gaps.
        </WarningCallout>

        {/* Prerequisite Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Prerequisites by Module
          </h3>
          <div className="grid gap-6">
            {prerequisiteChecks.map((category, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-medium">{category.category}</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {category.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {item.required ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 border rounded mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground ml-1">({item.table})</span>
                        {item.required && (
                          <Badge variant="destructive" className="ml-2 text-[10px] px-1 py-0">Required</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Dependencies Diagram */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Module Dependency Flow
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                <Building2 className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                <div className="font-medium">Workforce</div>
                <div className="text-xs text-muted-foreground">Employees, Jobs</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="font-medium">Time & Attendance</div>
                <div className="text-xs text-muted-foreground">Policies, Shifts</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <FileText className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <div className="font-medium">Payroll</div>
                <div className="text-xs text-muted-foreground">Time Sync</div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Pre-Implementation Validation Steps
          </h3>
          <StepByStep steps={implementationSteps} />
        </div>

        {/* Integration Callout */}
        <IntegrationCallout>
          <strong>Payroll Integration:</strong> Time & Attendance data flows to Payroll via the{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">payroll_time_sync_logs</code> table.
          Ensure pay periods are configured before enabling automatic sync.
        </IntegrationCallout>

        {/* Best Practice Tip */}
        <TipCallout>
          <strong>Recommended:</strong> Run a data quality report in the Workforce module before T&A setup.
          Incomplete employee records (missing department, location, or job assignments) will cause
          shift assignment failures and reporting gaps.
        </TipCallout>

        {/* Readiness Checklist Summary */}
        <div className="p-6 bg-muted/30 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Implementation Readiness Checklist
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'All employees have active employment assignments',
              'Work locations have complete address data',
              'Departments are linked to cost centers',
              'Pay periods are configured for the next 12 months',
              'Time Admin role is assigned to appropriate users',
              'Audit logging is enabled for time-sensitive operations',
              'Company time zones are correctly configured',
              'Work calendars include all public holidays'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="h-4 w-4 border-2 border-primary rounded mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
