import { LearningObjectives } from '../../../components/LearningObjectives';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FileText, AlertTriangle, BarChart3, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Diagnose report template configuration errors',
  'Resolve PDF generation failures',
  'Fix missing data and visualization issues',
  'Troubleshoot report access and distribution problems'
];

const templateIssues: TroubleshootingItem[] = [
  {
    issue: 'Report template not rendering correctly',
    cause: 'Template version mismatch, missing required sections, or corrupted template definition',
    solution: 'Validate template against schema, check feedback_360_report_templates.template_definition for JSON errors, and regenerate from default template if corrupted.'
  },
  {
    issue: 'Custom branding not appearing in reports',
    cause: 'Logo URL invalid, brand colors not configured, or template not linked to company branding',
    solution: 'Verify company_branding.logo_url is accessible, check hex color format in brand_colors, and ensure template.branding_enabled = true.'
  },
  {
    issue: 'Competency sections missing from report',
    cause: 'Framework not linked to cycle, or competency mapping incomplete',
    solution: 'Verify feedback_360_cycles.framework_id is set, check framework has competencies defined, and ensure questions are mapped to competencies.'
  },
  {
    issue: 'Report layout differs between PDF and web view',
    cause: 'CSS print styles not applied, or chart rendering differences between formats',
    solution: 'Use dedicated PDF template with fixed dimensions, pre-render charts as images for PDF, and validate print CSS @media rules.'
  }
];

const pdfGenerationIssues: TroubleshootingItem[] = [
  {
    issue: 'PDF generation fails with timeout',
    cause: 'Report too large, complex charts, or server resource constraints',
    solution: 'Reduce chart complexity, paginate large reports, increase PDF generation timeout to 120 seconds, and consider async generation with email delivery.'
  },
  {
    issue: 'PDF shows blank pages or missing content',
    cause: 'Content overflow, font loading failures, or incorrect page breaks',
    solution: 'Add explicit page break controls, embed fonts in PDF, validate content fits within page margins, and test with reduced data set first.'
  },
  {
    issue: 'Charts not appearing in PDF output',
    cause: 'Canvas rendering issues, or chart library incompatibility with PDF generator',
    solution: 'Convert charts to SVG or PNG before PDF generation, use server-side chart rendering, and validate chart data is available at generation time.'
  },
  {
    issue: 'PDF file size exceeds limit',
    cause: 'High-resolution images, embedded fonts, or excessive chart data',
    solution: 'Compress images before embedding, use subset fonts, optimize chart data points, and set maximum file size limit with fallback to simplified version.'
  }
];

const dataVisualizationIssues: TroubleshootingItem[] = [
  {
    issue: 'Radar chart displaying incorrectly',
    cause: 'Missing competency scores, scale mismatch, or insufficient data points',
    solution: 'Verify all competencies have aggregated scores, ensure scale matches 1-5 or configured range, require minimum 3 competencies for radar display.'
  },
  {
    issue: 'Benchmark comparison not showing',
    cause: 'Benchmark data not available, or comparison group too small',
    solution: 'Check company_benchmarks or role_benchmarks tables for data, ensure k-anonymity threshold met for benchmark group, and display "N/A" with explanation if unavailable.'
  },
  {
    issue: 'Score trends not appearing for multi-cycle view',
    cause: 'No previous cycle data, or cycles not linked for trending',
    solution: 'Verify feedback_360_cycles.previous_cycle_id is set, ensure same participant existed in previous cycle, and check score calculation methodology consistency.'
  },
  {
    issue: 'Category breakdown aggregated unexpectedly',
    cause: 'Anonymity threshold not met for category display',
    solution: 'Check cycle.anonymity_threshold vs actual rater count per category, display "Combined" label with explanation, and offer admin investigation mode if authorized.'
  }
];

const accessDistributionIssues: TroubleshootingItem[] = [
  {
    issue: 'Participant cannot access their report',
    cause: 'Results not released, or release schedule not processed',
    solution: 'Check feedback_360_release_schedules.processed_at, verify participant in correct release audience, and manually trigger release if schedule failed.'
  },
  {
    issue: 'Manager cannot view team reports',
    cause: 'Reporting relationship not recognized, or manager access not enabled',
    solution: 'Verify reports_to relationship in org hierarchy, check cycle.manager_report_access setting, and ensure manager role has FEEDBACK_360_VIEW_TEAM permission.'
  },
  {
    issue: 'Report download fails repeatedly',
    cause: 'File storage issue, or generated file corrupted',
    solution: 'Check storage bucket accessibility, regenerate PDF from source data, verify file exists at expected path, and check for download rate limiting.'
  },
  {
    issue: 'Email distribution of reports failed',
    cause: 'Email service error, or attachment size exceeded',
    solution: 'Check email_logs for delivery status, reduce PDF size if over 10MB limit, and use download link instead of attachment for large reports.'
  }
];

const diagnosticSteps: Step[] = [
  {
    title: 'Verify Report Configuration',
    description: 'Check template and cycle settings.',
    substeps: [
      'Navigate to cycle settings → Report Configuration',
      'Verify template_id is assigned and valid',
      'Check audience visibility settings',
      'Review scheduled release dates'
    ],
    expectedResult: 'Configuration matches expected output format'
  },
  {
    title: 'Check Data Availability',
    description: 'Ensure all required data exists for report generation.',
    substeps: [
      'Verify cycle status is completed or in reporting phase',
      'Check aggregated scores exist in feedback_360_aggregated_scores',
      'Confirm competency mappings are complete',
      'Validate benchmark data if comparisons enabled'
    ],
    expectedResult: 'All data sources populated and accessible'
  },
  {
    title: 'Test Report Generation',
    description: 'Generate test report to identify specific failures.',
    substeps: [
      'Use admin preview mode to generate sample',
      'Check browser console for JavaScript errors',
      'Review server logs for generation exceptions',
      'Compare expected vs actual content'
    ],
    expectedResult: 'Specific error identified or successful test generation'
  },
  {
    title: 'Apply Fix and Validate',
    description: 'Implement solution and verify resolution.',
    substeps: [
      'Apply identified fix (template, data, or config)',
      'Regenerate affected reports',
      'Verify fix across multiple participants',
      'Update release schedule if needed'
    ],
    expectedResult: 'Reports generating correctly for all participants'
  }
];

const databaseFields: FieldDefinition[] = [
  { name: 'feedback_360_report_templates.template_definition', required: true, type: 'jsonb', description: 'Report template JSON configuration' },
  { name: 'feedback_360_report_templates.audience_type', required: true, type: 'enum', description: 'Target audience (subject, manager, hr)' },
  { name: 'feedback_360_aggregated_scores.competency_id', required: true, type: 'uuid', description: 'Competency reference for scoring' },
  { name: 'feedback_360_aggregated_scores.score_value', required: true, type: 'decimal', description: 'Aggregated score value' },
  { name: 'feedback_360_release_schedules.release_date', required: true, type: 'timestamp', description: 'Scheduled release date' },
  { name: 'feedback_360_release_schedules.processed_at', required: false, type: 'timestamp', description: 'Actual processing timestamp' },
  { name: 'feedback_360_cycles.report_template_id', required: false, type: 'uuid', description: 'Linked report template' },
  { name: 'feedback_360_cycles.results_released_at', required: false, type: 'timestamp', description: 'Results release timestamp' },
  { name: 'company_branding.logo_url', required: false, type: 'text', description: 'Company logo URL for reports' },
  { name: 'feedback_360_generated_reports.file_path', required: false, type: 'text', description: 'Generated PDF storage path' },
];

export function F360ReportGenerationIssues() {
  return (
    <section id="sec-8-5" data-manual-anchor="sec-8-5" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          8.5 Report Generation Problems
        </h3>
        <p className="text-muted-foreground mt-2">
          Troubleshooting report templates, PDF generation, data visualization, and distribution issues.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Report Generation Architecture</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Reports are generated from aggregated scores and template definitions. Web preview renders in real-time;
          PDF generation is queued and processed asynchronously with 120-second timeout.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Template Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Template configuration or rendering failures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4 text-amber-500" />
              PDF Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              PDF creation timeouts or content issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              Visualizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Charts, trends, or benchmark display problems
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              Access/Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Report access or email delivery failures
            </p>
          </CardContent>
        </Card>
      </div>

      <TroubleshootingSection
        items={templateIssues}
        title="Template Configuration Issues"
      />

      <TroubleshootingSection
        items={pdfGenerationIssues}
        title="PDF Generation Failures"
      />

      <TroubleshootingSection
        items={dataVisualizationIssues}
        title="Data Visualization Issues"
      />

      <TroubleshootingSection
        items={accessDistributionIssues}
        title="Access & Distribution Problems"
      />

      <StepByStep
        steps={diagnosticSteps}
        title="Report Generation Diagnostic Procedure"
      />

      <FieldReferenceTable
        fields={databaseFields}
        title="Report Generation Database Fields"
      />
    </section>
  );
}
