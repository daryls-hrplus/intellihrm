import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Database, ArrowRight, CheckCircle, AlertTriangle,
  Download, FileSpreadsheet, History, GitBranch
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const importTypes = [
  { entity: 'Companies', prerequisites: 'None', keyFields: 'code, name, country', order: 1 },
  { entity: 'Divisions', prerequisites: 'Companies', keyFields: 'company_code, code, name', order: 2 },
  { entity: 'Departments', prerequisites: 'Companies, (Divisions)', keyFields: 'company_code, division_code, code, name', order: 3 },
  { entity: 'Sections', prerequisites: 'Companies, Departments', keyFields: 'company_code, department_code, code, name', order: 4 },
  { entity: 'Job Families', prerequisites: 'Companies', keyFields: 'company_code, code, name', order: 5 },
  { entity: 'Jobs', prerequisites: 'Companies, Job Families', keyFields: 'company_code, job_family_code, code, name', order: 6 },
  { entity: 'Salary Grades', prerequisites: 'Companies', keyFields: 'company_code, code, name, min_salary, max_salary', order: 7 },
  { entity: 'Pay Spines', prerequisites: 'Companies', keyFields: 'company_code, code, name', order: 8 },
  { entity: 'Spinal Points', prerequisites: 'Companies, Pay Spines', keyFields: 'company_code, pay_spine_code, point_number, amount', order: 9 },
  { entity: 'Positions', prerequisites: 'Companies, Departments, Jobs', keyFields: 'company_code, department_code, job_code, code, name', order: 10 },
  { entity: 'Employees', prerequisites: 'None (basic import)', keyFields: 'employee_number, first_name, last_name, email', order: 11 },
  { entity: 'New Hires', prerequisites: 'Companies, Departments, Positions', keyFields: 'position_code, first_name, last_name, email, start_date', order: 12 }
];

const wizardSteps = [
  {
    title: 'Welcome & Preparation',
    description: 'The wizard starts with an overview of the import process and a preparation checklist.',
    substeps: [
      'Review the checklist of prerequisites',
      'Ensure dependent data already exists in the system',
      'Have your source data file ready (CSV format)'
    ],
    expectedResult: 'Understanding of what you need before proceeding'
  },
  {
    title: 'Select Import Type',
    description: 'Choose the entity type you want to import. The wizard shows dependencies and warns if prerequisites are missing.',
    expectedResult: 'Import type selected with dependencies validated'
  },
  {
    title: 'Compensation Model (Positions Only)',
    description: 'When importing positions, choose whether they use Salary Grade or Pay Spine compensation. This determines available template fields.',
    expectedResult: 'Compensation model selected (if applicable)'
  },
  {
    title: 'Download Template',
    description: 'Download the CSV template pre-formatted with required and optional columns for your selected import type.',
    substeps: [
      'Click "Download Template" button',
      'Open in Excel or Google Sheets',
      'Note required fields (marked with *)',
      'Populate with your data'
    ],
    expectedResult: 'Template downloaded and ready to fill'
  },
  {
    title: 'Upload & Validate',
    description: 'Upload your completed CSV file. The system performs AI-powered validation, checking data types, required fields, and foreign key references.',
    expectedResult: 'Validation report showing any errors or warnings'
  },
  {
    title: 'Review & Fix',
    description: 'Review validation results. Errors must be fixed before import; warnings can be acknowledged. You can fix issues inline or download error report.',
    substeps: [
      'Review row-by-row validation status',
      'Click on errors to see details',
      'Edit values inline if needed',
      'Download error report for offline fixes'
    ],
    expectedResult: 'All errors resolved, ready for commit'
  },
  {
    title: 'Commit Import',
    description: 'Execute the import. Records are created in batches with progress tracking. A rollback point is created automatically.',
    expectedResult: 'Import complete with summary of records created'
  }
];

const dependencyDiagram = `graph TD
    subgraph "Foundation Layer"
        A[Companies] --> B[Divisions]
        A --> C[Departments]
        A --> D[Job Families]
        A --> E[Salary Grades]
        A --> F[Pay Spines]
    end
    
    subgraph "Structure Layer"
        B --> C
        C --> G[Sections]
        D --> H[Jobs]
        F --> I[Spinal Points]
    end
    
    subgraph "Position Layer"
        C --> J[Positions]
        H --> J
        E -.-> J
        F -.-> J
    end
    
    subgraph "People Layer"
        J --> K[New Hires]
        L[Employees] -.-> J
    end
    
    style A fill:#10b981,color:#fff
    style J fill:#3b82f6,color:#fff
    style K fill:#8b5cf6,color:#fff
    style L fill:#8b5cf6,color:#fff`;

export function DataImportSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-2-3">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 2.3</Badge>
            <Badge variant="secondary">15 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Data Import Tools</h2>
          <p className="text-muted-foreground mt-1">
            Migrate data from legacy systems and perform bulk data loads
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-500" />
            Migration & Bulk Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Data Import Tools enable you to migrate from legacy HRIS systems, load initial 
            implementation data, and perform ongoing bulk updates. A guided wizard walks you 
            through each step, with AI-powered validation to catch errors before they enter the system.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <FileSpreadsheet className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">CSV Templates</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Pre-formatted templates for each entity type
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Smart Validation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  AI checks data types, references, and business rules
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <History className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Rollback Support</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Undo imports with automatic rollback points
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Dependency Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-500" />
            Import Dependency Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Data must be imported in a specific order because entities depend on each other. 
            For example, you can't import Positions until Companies, Departments, and Jobs exist. 
            The diagram below shows the dependency chain:
          </p>

          <WorkflowDiagram 
            title="Import Order Dependencies"
            description="Solid arrows show required dependencies; dashed arrows show optional dependencies"
            diagram={dependencyDiagram}
          />

          <TipCallout title="Always Import in Order">
            Start from the top (Companies) and work down. The wizard prevents importing 
            entities before their dependencies exist, but planning your import sequence 
            upfront saves time.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Import Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-500" />
            Import Types Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium w-8">#</th>
                  <th className="text-left p-3 font-medium">Entity</th>
                  <th className="text-left p-3 font-medium">Prerequisites</th>
                  <th className="text-left p-3 font-medium">Key Fields</th>
                </tr>
              </thead>
              <tbody>
                {importTypes.map((type) => (
                  <tr key={type.order} className="border-t">
                    <td className="p-3 text-muted-foreground">{type.order}</td>
                    <td className="p-3 font-medium">{type.entity}</td>
                    <td className="p-3 text-muted-foreground">
                      {type.prerequisites === 'None' || type.prerequisites === 'None (basic import)' ? (
                        <span className="text-green-600">{type.prerequisites}</span>
                      ) : (
                        type.prerequisites
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs">{type.keyFields}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import Wizard Walkthrough */}
      <Card>
        <CardHeader>
          <CardTitle>Import Wizard Walkthrough</CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={wizardSteps} />
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Error Handling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The validation engine categorizes issues into errors (blocking) and warnings (advisory):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h4 className="font-medium text-destructive">Errors (Blocking)</h4>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  Required field missing (code, name)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  Invalid data type (text in number field)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  Foreign key not found (invalid company_code)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  Duplicate code in import file
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="font-medium text-amber-600">Warnings (Advisory)</h4>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Code already exists (will update, not create)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Optional field has unusual value
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Date format ambiguous (interpreted as DD/MM/YYYY)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Value outside typical range
                </li>
              </ul>
            </div>
          </div>

          <InfoCallout title="Partial Imports">
            You can choose to import only valid rows, skipping errors. Failed rows are 
            logged and can be exported for correction and re-import.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Import History & Rollback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-500" />
            Import History & Rollback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Every import is logged with a unique batch ID, timestamp, user, and record counts. 
            You can view import history and initiate rollbacks if needed.
          </p>

          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="font-medium mb-2">Import History Record Contains:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 grid grid-cols-2 gap-2">
              <li>• Batch ID</li>
              <li>• Import type</li>
              <li>• Initiated by (user)</li>
              <li>• Timestamp</li>
              <li>• Records attempted</li>
              <li>• Records created</li>
              <li>• Records updated</li>
              <li>• Records failed</li>
            </ul>
          </div>

          <WarningCallout title="Rollback Limitations">
            Rollback removes records created by the import but cannot undo updates to existing 
            records. If an import updated existing data, those changes are permanent. Always 
            test imports in a non-production environment first.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Import Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Before Import</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Backup existing data</li>
                <li>• Test with small sample first</li>
                <li>• Verify prerequisite data exists</li>
                <li>• Clean source data (remove duplicates, fix encoding)</li>
                <li>• Validate date formats match expected (YYYY-MM-DD)</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">During Import</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review all errors before proceeding</li>
                <li>• Use inline editing for quick fixes</li>
                <li>• Don't ignore warnings without investigation</li>
                <li>• Keep original file for reference</li>
                <li>• Note the batch ID for tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
