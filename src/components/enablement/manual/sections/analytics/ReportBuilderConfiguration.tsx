import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, FileText, Layers, Settings, Database, Filter, Download } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldDefinition } from '../../components/FieldReferenceTable';
import { RelatedTopics, StepByStep } from '../../components';

const TEMPLATE_FIELDS: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique template identifier' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company owning the template' },
  { name: 'template_name', required: true, type: 'TEXT', description: 'Display name for the template' },
  { name: 'template_code', required: true, type: 'TEXT', description: 'Unique code for programmatic reference' },
  { name: 'module_scope', required: true, type: 'TEXT', description: 'Module this template applies to (appraisals, goals, etc.)' },
  { name: 'description', required: false, type: 'TEXT', description: 'Template purpose and usage notes' },
  { name: 'output_format', required: true, type: 'TEXT', description: 'PDF, Excel, Word, or PowerPoint' },
  { name: 'page_orientation', required: false, type: 'TEXT', description: 'Portrait or Landscape' },
  { name: 'page_size', required: false, type: 'TEXT', description: 'A4, Letter, Legal' },
  { name: 'header_content', required: false, type: 'TEXT', description: 'Template header HTML/Markdown' },
  { name: 'footer_content', required: false, type: 'TEXT', description: 'Template footer HTML/Markdown' },
  { name: 'is_active', required: true, type: 'BOOLEAN', description: 'Whether template is available for use' },
  { name: 'created_by', required: true, type: 'UUID', description: 'User who created the template' }
];

const BAND_FIELDS: FieldDefinition[] = [
  { name: 'template_id', required: true, type: 'UUID', description: 'Parent template reference' },
  { name: 'band_type', required: true, type: 'TEXT', description: 'header, detail, group_header, group_footer, footer' },
  { name: 'band_order', required: true, type: 'INTEGER', description: 'Rendering order within template' },
  { name: 'content_template', required: true, type: 'TEXT', description: 'Band content with variable placeholders' },
  { name: 'data_source_id', required: false, type: 'UUID', description: 'Data source for detail bands' },
  { name: 'group_by_field', required: false, type: 'TEXT', description: 'Field for grouping (group bands only)' },
  { name: 'sort_by_field', required: false, type: 'TEXT', description: 'Field for sorting within band' },
  { name: 'sort_direction', required: false, type: 'TEXT', description: 'ASC or DESC' },
  { name: 'conditional_display', required: false, type: 'TEXT', description: 'Expression to conditionally show band' }
];

const STEPS = [
  {
    title: 'Create New Template',
    description: 'Initialize the report template',
    substeps: [
      'Navigate to Performance → Setup → Report Templates',
      'Click "Create Template"',
      'Enter template name, code, and module scope',
      'Select output format (PDF, Excel, etc.)'
    ],
    expectedResult: 'Empty template created'
  },
  {
    title: 'Configure Page Settings',
    description: 'Set page layout and formatting',
    substeps: [
      'Select page orientation (Portrait/Landscape)',
      'Choose page size (A4, Letter, Legal)',
      'Configure margins and spacing',
      'Add header/footer content with logo'
    ],
    expectedResult: 'Page layout configured'
  },
  {
    title: 'Add Data Sources',
    description: 'Link template to data tables',
    substeps: [
      'Click "Add Data Source"',
      'Select primary table (e.g., appraisal_participants)',
      'Add related tables via joins',
      'Define available fields for bands'
    ],
    expectedResult: 'Data sources linked'
  },
  {
    title: 'Create Report Bands',
    description: 'Build the report structure',
    substeps: [
      'Add Header band with title and filters',
      'Add Detail band for each data row',
      'Optionally add Group Header/Footer for grouping',
      'Add Footer band for totals and signatures'
    ],
    expectedResult: 'Report structure complete'
  },
  {
    title: 'Configure Band Content',
    description: 'Design each band with fields and formatting',
    substeps: [
      'Use {{field_name}} placeholders for data',
      'Apply formatting (bold, tables, lists)',
      'Add conditional logic for variable content',
      'Preview band rendering'
    ],
    expectedResult: 'Bands designed'
  },
  {
    title: 'Test & Activate',
    description: 'Verify template output',
    substeps: [
      'Click "Preview" with sample data',
      'Verify all fields render correctly',
      'Check grouping and sorting',
      'Activate template for production use'
    ],
    expectedResult: 'Template ready for use'
  }
];

const BUSINESS_RULES = [
  { rule: 'Template codes must be unique per company', enforcement: 'System' as const, description: 'Template code uniqueness is enforced at the database level.' },
  { rule: 'Detail bands require data source', enforcement: 'System' as const, description: 'Detail and group bands must have an associated data source.' },
  { rule: 'Band order determines rendering', enforcement: 'System' as const, description: 'Bands render in ascending order within their type.' },
  { rule: 'Inactive templates are hidden', enforcement: 'System' as const, description: 'Setting is_active=false hides template from user selection.' }
];

export function ReportBuilderConfiguration() {
  return (
    <Card id="sec-6-9">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.9</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~15 min read</Badge>
          <Badge className="gap-1 bg-amber-600 text-white"><Users className="h-3 w-3" />Admin / Consultant</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-amber-500" />
          Report Builder Configuration
        </CardTitle>
        <CardDescription>
          Create custom banded reports with templates, data sources, and formatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Setup', 'Report Templates']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand report template architecture (templates, bands, data sources)</li>
            <li>Create custom report templates for performance data</li>
            <li>Configure bands with grouping, sorting, and conditional logic</li>
            <li>Test and activate templates for production use</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Report Builder Architecture
          </h3>
          <p className="text-muted-foreground">
            The Report Builder uses a banded report architecture common in enterprise reporting tools. 
            Templates define page layout and formatting, while bands define repeating sections 
            (headers, details, footers) that render with data.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="font-medium text-sm">Templates</p>
              <p className="text-xs text-muted-foreground">Page layout, format, header/footer</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Layers className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="font-medium text-sm">Bands</p>
              <p className="text-xs text-muted-foreground">Header, detail, group, footer sections</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Database className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="font-medium text-sm">Data Sources</p>
              <p className="text-xs text-muted-foreground">Tables, joins, available fields</p>
            </div>
          </div>
        </div>

        {/* Band Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Band Types</h3>
          <div className="space-y-3">
            {[
              { type: 'Header', description: 'Appears once at the top of the report. Contains title, filters, date range.' },
              { type: 'Group Header', description: 'Appears before each group. Shows group value (e.g., department name).' },
              { type: 'Detail', description: 'Repeats for each data row. Contains main report data.' },
              { type: 'Group Footer', description: 'Appears after each group. Contains group subtotals.' },
              { type: 'Footer', description: 'Appears once at the bottom. Contains totals, signatures, notes.' }
            ].map((item) => (
              <div key={item.type} className="p-3 border rounded-lg">
                <Badge variant="outline" className="mb-1">{item.type}</Badge>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <StepByStep steps={STEPS} title="Creating a Report Template" />

        <TipCallout title="Start with Existing Templates">
          Clone an existing template as a starting point rather than building from scratch. 
          This preserves proven formatting and data source configurations.
        </TipCallout>

        <WarningCallout title="Custom SQL Considerations">
          Custom SQL data sources bypass RLS policies. Ensure you implement appropriate 
          company_id filtering in custom queries to maintain data security.
        </WarningCallout>

        <FieldReferenceTable 
          fields={TEMPLATE_FIELDS}
          title="Database Fields: report_templates"
        />

        <FieldReferenceTable 
          fields={BAND_FIELDS}
          title="Database Fields: report_template_bands"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-10', title: 'Scheduled Reports & Exports' },
            { sectionId: 'sec-6-1', title: 'Appraisal Analytics Dashboard' },
            { sectionId: 'sec-6-11', title: 'BI Dashboard Customization' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
