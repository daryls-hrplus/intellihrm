import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Upload, FileSpreadsheet, GraduationCap,
  Settings, RefreshCw, FileText
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  WarningCallout,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationPunchImport() {
  const learningObjectives = [
    'Configure external punch import from third-party systems',
    'Set up file-based batch imports (CSV, Excel)',
    'Handle legacy data migration during implementation',
    'Validate and reconcile imported punch data',
    'Troubleshoot common import errors'
  ];

  const importConfigFields: FieldDefinition[] = [
    { name: 'import_name', required: true, type: 'text', description: 'Name for this import configuration', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'import_type', required: true, type: 'enum', description: 'Type of import source', defaultValue: 'csv', validation: 'csv, excel, api, legacy_system' },
    { name: 'source_system', required: false, type: 'text', description: 'Name of external system', defaultValue: 'null', validation: 'For documentation' },
    { name: 'file_format', required: false, type: 'jsonb', description: 'Column mapping configuration', defaultValue: '{}', validation: 'JSON field mapping' },
    { name: 'date_format', required: false, type: 'text', description: 'Date format in source data', defaultValue: 'YYYY-MM-DD', validation: 'Moment.js format' },
    { name: 'time_format', required: false, type: 'text', description: 'Time format in source data', defaultValue: 'HH:mm:ss', validation: 'Moment.js format' },
    { name: 'timezone', required: false, type: 'text', description: 'Timezone of source data', defaultValue: 'UTC', validation: 'IANA timezone' },
    { name: 'employee_id_field', required: true, type: 'text', description: 'Column containing employee ID', defaultValue: 'employee_id', validation: 'Column name' },
    { name: 'employee_id_type', required: false, type: 'enum', description: 'Type of employee identifier', defaultValue: 'employee_number', validation: 'employee_number, email, badge_number' },
    { name: 'duplicate_handling', required: false, type: 'enum', description: 'How to handle duplicates', defaultValue: 'skip', validation: 'skip, replace, flag' },
    { name: 'validation_rules', required: false, type: 'jsonb', description: 'Custom validation rules', defaultValue: '[]', validation: 'Array of validation rules' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether import is enabled', defaultValue: 'true', validation: 'true/false' },
    { name: 'schedule_cron', required: false, type: 'text', description: 'Automated import schedule', defaultValue: 'null', validation: 'Cron expression' }
  ];

  const importLogFields: FieldDefinition[] = [
    { name: 'import_id', required: true, type: 'uuid', description: 'Unique import batch ID', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'config_id', required: true, type: 'uuid', description: 'Import configuration used', defaultValue: '—', validation: 'Must reference valid config' },
    { name: 'file_name', required: false, type: 'text', description: 'Source file name', defaultValue: 'null', validation: 'Original filename' },
    { name: 'total_rows', required: true, type: 'integer', description: 'Total rows in source', defaultValue: '0', validation: 'Non-negative' },
    { name: 'processed_rows', required: true, type: 'integer', description: 'Rows successfully processed', defaultValue: '0', validation: 'Non-negative' },
    { name: 'failed_rows', required: true, type: 'integer', description: 'Rows that failed validation', defaultValue: '0', validation: 'Non-negative' },
    { name: 'skipped_rows', required: true, type: 'integer', description: 'Duplicate/skipped rows', defaultValue: '0', validation: 'Non-negative' },
    { name: 'import_status', required: true, type: 'enum', description: 'Overall import status', defaultValue: 'pending', validation: 'pending, processing, completed, failed, partial' },
    { name: 'error_log', required: false, type: 'jsonb', description: 'Detailed error information', defaultValue: '[]', validation: 'Array of errors' },
    { name: 'started_at', required: true, type: 'timestamp', description: 'Import start time', defaultValue: 'now()', validation: 'Auto-set' },
    { name: 'completed_at', required: false, type: 'timestamp', description: 'Import completion time', defaultValue: 'null', validation: 'Auto-set' },
    { name: 'imported_by', required: false, type: 'uuid', description: 'User who triggered import', defaultValue: 'null', validation: 'Must reference valid user' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Employee Matching',
      enforcement: 'System',
      description: 'Imported punches must be matched to existing employees. The system supports matching by employee number, email, or badge number.'
    },
    {
      rule: 'Duplicate Detection',
      enforcement: 'System',
      description: 'A punch is considered duplicate if same employee, same timestamp (within 1 minute), same punch type already exists.'
    },
    {
      rule: 'Future Date Rejection',
      enforcement: 'System',
      description: 'Punches with timestamps in the future are rejected. Clock skew tolerance is 5 minutes.'
    },
    {
      rule: 'Historical Limit',
      enforcement: 'Advisory',
      description: 'By default, punches older than 90 days are flagged for review but still imported.'
    },
    {
      rule: 'Timezone Conversion',
      enforcement: 'System',
      description: 'All imported timestamps are converted from source timezone to UTC for storage.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Create Import Configuration',
      description: 'Navigate to import settings and create a new import configuration.',
      notes: ['Time & Attendance → Setup → Punch Import → Add Configuration']
    },
    {
      title: 'Define Source Format',
      description: 'Specify the file type and column mappings for your source data.',
      notes: ['Map source columns to: employee_id, punch_timestamp, punch_type']
    },
    {
      title: 'Configure Date/Time Formats',
      description: 'Set the date and time formats used in your source file.',
      notes: ['Examples: YYYY-MM-DD, MM/DD/YYYY, DD-MMM-YYYY']
    },
    {
      title: 'Set Employee Matching',
      description: 'Choose how to match rows to employees (employee number, email, badge).',
      notes: ['Ensure the identifier exists in the profiles table']
    },
    {
      title: 'Configure Duplicate Handling',
      description: 'Decide whether to skip, replace, or flag duplicate punches.',
      notes: ['Skip is safest for ongoing imports', 'Replace for corrections']
    },
    {
      title: 'Test with Sample File',
      description: 'Upload a small sample file to validate the configuration before bulk import.',
      notes: ['Review import log for errors and adjust mapping']
    }
  ];

  const csvExample = `employee_number,punch_date,punch_time,punch_type
EMP001,2024-01-15,08:00:00,clock_in
EMP001,2024-01-15,12:00:00,break_start
EMP001,2024-01-15,12:30:00,break_end
EMP001,2024-01-15,17:00:00,clock_out
EMP002,2024-01-15,09:00:00,clock_in
EMP002,2024-01-15,18:00:00,clock_out`;

  return (
    <Card id="ta-sec-2-6" data-manual-anchor="ta-sec-2-6" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.6</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Punch Import Configuration</CardTitle>
        <CardDescription>
          External system imports, legacy data migration, and batch processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">When to Use Punch Import</h3>
              <p className="text-muted-foreground leading-relaxed">
                Punch import is used to bring time data from external sources into the system. 
                Common scenarios include: migrating historical data from a legacy time system, 
                importing punches from standalone devices that don't integrate directly, 
                reconciling data from third-party contractors, or correcting bulk data issues. 
                The import process validates each punch, matches it to an employee, and creates 
                time clock entries that flow through normal processing.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Punch Import Interface"
          caption="Import configuration showing file upload, column mapping, and validation options"
        />

        {/* Import Types */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Supported Import Types
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                type: 'CSV File',
                description: 'Comma-separated values with header row',
                format: '.csv',
                useCase: 'Most common for exports from other systems'
              },
              {
                type: 'Excel Spreadsheet',
                description: 'Microsoft Excel workbook',
                format: '.xlsx, .xls',
                useCase: 'Manual data preparation, complex formatting'
              },
              {
                type: 'API Integration',
                description: 'Real-time push from external system',
                format: 'JSON/REST',
                useCase: 'Automated sync from legacy systems'
              },
              {
                type: 'Legacy Migration',
                description: 'One-time bulk historical data load',
                format: 'Various',
                useCase: 'Initial system implementation'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">{item.type}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Format: {item.format}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 italic">{item.useCase}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CSV Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Sample CSV Format
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre">{csvExample}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Required columns: employee identifier, date, time, punch type (clock_in, clock_out, break_start, break_end)
          </p>
        </div>

        {/* Field Reference Tables */}
        <FieldReferenceTable 
          fields={importConfigFields}
          title="punch_import_configs Table Fields"
        />

        <FieldReferenceTable 
          fields={importLogFields}
          title="punch_import_logs Table Fields"
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

        {/* Import Status Reference */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Import Status Reference
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Meaning</th>
                  <th className="text-left p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { status: 'Pending', meaning: 'Import queued, not yet started', action: 'Wait for processing' },
                  { status: 'Processing', meaning: 'Currently importing rows', action: 'Monitor progress' },
                  { status: 'Completed', meaning: 'All rows processed successfully', action: 'Review import log' },
                  { status: 'Partial', meaning: 'Some rows failed validation', action: 'Review errors, re-import failed rows' },
                  { status: 'Failed', meaning: 'Import could not complete', action: 'Check configuration, fix file format' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.status}</td>
                    <td className="p-3 text-muted-foreground">{row.meaning}</td>
                    <td className="p-3 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>Automated Imports:</strong> For ongoing integration with external systems, 
          configure a scheduled import using cron expressions. The system will automatically 
          poll for new files or API data at the specified interval.
        </InfoCallout>

        {/* Warning */}
        <WarningCallout>
          <strong>Data Validation:</strong> Always test with a small sample before bulk import. 
          Incorrect date formats, missing employees, or timezone mismatches can result in 
          thousands of invalid records that require manual cleanup.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Legacy Migration:</strong> For large historical imports (100,000+ records), 
          consider importing in batches by date range. This improves performance and makes 
          error tracking easier. Start with the most recent data and work backward.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
