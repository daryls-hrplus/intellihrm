import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, ArrowRight, CheckCircle, AlertTriangle, Upload, FileText, Shield, Sparkles } from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { TipCallout, WarningCallout, InfoCallout, SuccessCallout } from '@/components/enablement/manual/components/Callout';

export function TAOverviewMigration() {
  const entityMappings = [
    {
      legacyEntity: 'Time Punch Records',
      targetTable: 'time_clock_entries',
      keyFields: ['punch_time', 'employee_id', 'clock_method', 'status'],
      transformations: 'Convert legacy employee IDs, map punch types (IN/OUT → clock_in/clock_out)',
      complexity: 'Medium'
    },
    {
      legacyEntity: 'Shift Definitions',
      targetTable: 'shift_templates',
      keyFields: ['shift_name', 'start_time', 'end_time', 'break_duration'],
      transformations: 'Split into template + template_entries for multi-segment shifts',
      complexity: 'Low'
    },
    {
      legacyEntity: 'Schedule Periods',
      targetTable: 'work_schedules',
      keyFields: ['period_start', 'period_end', 'schedule_type'],
      transformations: 'Map rotation patterns, convert schedule IDs',
      complexity: 'Medium'
    },
    {
      legacyEntity: 'Employee Assignments',
      targetTable: 'employee_shift_assignments',
      keyFields: ['employee_id', 'shift_id', 'assignment_date'],
      transformations: 'Link to migrated shift_templates, validate employee exists',
      complexity: 'Medium'
    },
    {
      legacyEntity: 'Overtime Tracking',
      targetTable: 'overtime_requests',
      keyFields: ['employee_id', 'ot_hours', 'approval_status', 'approval_date'],
      transformations: 'Map approval statuses, link to manager profiles',
      complexity: 'Low'
    },
    {
      legacyEntity: 'Attendance Exceptions',
      targetTable: 'attendance_exceptions',
      keyFields: ['exception_type', 'exception_date', 'resolution_status'],
      transformations: 'Map exception codes to new enum values',
      complexity: 'Low'
    },
    {
      legacyEntity: 'Timesheet Data',
      targetTable: 'timesheet_submissions',
      keyFields: ['period_start', 'period_end', 'total_hours', 'status'],
      transformations: 'Create entries from line items, map approval chain',
      complexity: 'High'
    },
    {
      legacyEntity: 'Device Configurations',
      targetTable: 'timeclock_devices',
      keyFields: ['device_serial', 'device_type', 'location_id'],
      transformations: 'Map device types to new enum, link to geofence_locations',
      complexity: 'Low'
    }
  ];

  const migrationSteps = [
    { step: 1, title: 'Pre-Migration Assessment', description: 'Inventory legacy data, identify gaps, document field mappings', duration: '1-2 weeks' },
    { step: 2, title: 'Data Extraction', description: 'Export data from legacy system in CSV/JSON format', duration: '2-3 days' },
    { step: 3, title: 'Field Transformation', description: 'Apply mapping rules, convert IDs, validate referential integrity', duration: '1 week' },
    { step: 4, title: 'Staging Import', description: 'Load to staging environment, run validation checks', duration: '2-3 days' },
    { step: 5, title: 'Validation Testing', description: 'Compare record counts, spot-check sample records, verify calculations', duration: '1 week' },
    { step: 6, title: 'User Acceptance', description: 'Key users verify data accuracy, sign off on migration', duration: '3-5 days' },
    { step: 7, title: 'Production Cutover', description: 'Final delta sync, switch to new system, monitor for issues', duration: '1-2 days' },
    { step: 8, title: 'Post-Migration Support', description: 'Address edge cases, fine-tune configurations, hypercare period', duration: '2 weeks' }
  ];

  const validationChecklist = [
    { check: 'Employee count matches', category: 'Records', critical: true },
    { check: 'Total punch records within 1% of legacy', category: 'Records', critical: true },
    { check: 'All shift templates migrated', category: 'Configuration', critical: true },
    { check: 'Historical timesheets accessible', category: 'History', critical: false },
    { check: 'Overtime calculations verified (sample)', category: 'Calculations', critical: true },
    { check: 'Approval workflows functional', category: 'Workflows', critical: true },
    { check: 'Exception types mapped correctly', category: 'Configuration', critical: false },
    { check: 'Device registrations complete', category: 'Devices', critical: true },
    { check: 'Geofence locations configured', category: 'Configuration', critical: false },
    { check: 'Face enrollments migrated (if applicable)', category: 'Biometrics', critical: false }
  ];

  const newCapabilities = [
    { feature: 'AI-Powered Scheduling', description: 'Constraint-based optimization not available in legacy', icon: Sparkles },
    { feature: 'Face Verification', description: 'Multi-angle face recognition with liveness detection', icon: Shield },
    { feature: 'Geofencing', description: 'GPS-validated clock-in with configurable zones', icon: Database },
    { feature: 'Bradford Factor Analysis', description: 'Automated absenteeism pattern detection', icon: FileText },
    { feature: 'Wellness AI', description: 'Burnout and fatigue prediction from time patterns', icon: Sparkles },
    { feature: 'Real-time Dashboard', description: 'Live attendance monitoring with instant updates', icon: Database },
    { feature: 'CBA Rule Engine', description: 'Automated union agreement enforcement', icon: Shield },
    { feature: 'Open Shift Marketplace', description: 'Self-service shift claiming and bidding', icon: CheckCircle }
  ];

  return (
    <Card id="ta-sec-1-6" data-manual-anchor="ta-sec-1-6" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.6</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>15 min read</span>
        </div>
        <CardTitle className="text-2xl">Legacy Migration Guide</CardTitle>
        <CardDescription>Entity mappings, migration workflow, and validation checklist for legacy system transitions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={[
          'Map legacy T&A entities to Intelli HRM database tables',
          'Follow the 8-step migration workflow for successful transitions',
          'Apply field transformation rules for common data patterns',
          'Execute the validation checklist before go-live',
          'Identify new capabilities not available in legacy systems'
        ]} />

        <InfoCallout title="Neutral Migration Framework">
          This guide uses generic "Legacy System" terminology and applies to migrations from any 
          source system including Kronos, ADP, Workday, SAP, or custom solutions.
        </InfoCallout>

        {/* Entity Mapping Reference */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Entity Mapping Reference
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Legacy Entity</th>
                  <th className="text-left p-3 font-medium">Target Table</th>
                  <th className="text-left p-3 font-medium">Key Fields</th>
                  <th className="text-left p-3 font-medium">Transformations</th>
                  <th className="text-left p-3 font-medium">Complexity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entityMappings.map((mapping, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mapping.legacyEntity}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono text-xs">{mapping.targetTable}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {mapping.keyFields.map((field, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{field}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{mapping.transformations}</td>
                    <td className="p-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          mapping.complexity === 'High' ? 'border-red-500 text-red-600' :
                          mapping.complexity === 'Medium' ? 'border-amber-500 text-amber-600' :
                          'border-green-500 text-green-600'
                        }`}
                      >
                        {mapping.complexity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Migration Workflow */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Migration Workflow (8 Steps)
          </h3>
          <div className="space-y-3">
            {migrationSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
                {i < migrationSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        <WarningCallout title="Cutover Planning">
          Schedule production cutover during a low-activity period (e.g., weekend). Ensure parallel running 
          of both systems for at least one pay period to validate data accuracy.
        </WarningCallout>

        {/* Validation Checklist */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Validation Checklist
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {validationChecklist.map((item, i) => (
              <div 
                key={i} 
                className={`p-3 border rounded-lg flex items-start gap-3 ${
                  item.critical ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/30'
                }`}
              >
                <div className={`mt-0.5 ${item.critical ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {item.critical ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.check}</span>
                    {item.critical && (
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Transformation Examples */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Common Field Transformations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Employee ID Mapping</h4>
              <div className="text-sm space-y-2 font-mono">
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Legacy:</span> EMP-12345
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Target:</span> UUID (via lookup table)
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Punch Type Mapping</h4>
              <div className="text-sm space-y-2 font-mono">
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Legacy:</span> IN, OUT, BRK_IN, BRK_OUT
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Target:</span> clock_in, clock_out, break_start, break_end
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Status Mapping</h4>
              <div className="text-sm space-y-2 font-mono">
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Legacy:</span> A (Approved), P (Pending), R (Rejected)
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Target:</span> approved, pending, rejected
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Datetime Conversion</h4>
              <div className="text-sm space-y-2 font-mono">
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Legacy:</span> 2025-01-15 08:30:00 (local)
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-2 bg-background rounded border">
                  <span className="text-muted-foreground">Target:</span> 2025-01-15T12:30:00Z (UTC)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Capabilities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            New Capabilities (Not in Legacy)
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {newCapabilities.map((cap, i) => (
              <div key={i} className="p-3 border rounded-lg bg-emerald-500/5 border-emerald-500/20 flex items-start gap-3">
                <cap.icon className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{cap.feature}</h4>
                  <p className="text-xs text-muted-foreground">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SuccessCallout title="Migration Complete">
          After successful migration, new features like AI scheduling, face verification, and wellness monitoring 
          become immediately available. Train users on these capabilities during hypercare period.
        </SuccessCallout>

        <TipCallout title="Implementation Resources">
          Contact your implementation consultant for migration templates, field mapping spreadsheets, 
          and automated validation scripts tailored to your legacy system.
        </TipCallout>

        {/* Section Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Estimated reading time: 12-15 minutes</span>
          </div>
          <Badge variant="outline">Section 1.6 of 1.6</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
