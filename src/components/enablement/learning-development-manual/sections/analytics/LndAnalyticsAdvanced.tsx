import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Calendar, FileText, Download, Settings, Wand2 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsAIPoweredBI() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          AI-Powered BI Reports enable natural language report generation via the 
          <code>AIModuleReportBuilder</code> component. Access via 
          <strong> Training → Analytics → AI-BI Reports</strong> tab.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Report Types</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={FileText} title="Banded Reports">
            <p className="text-sm mt-2">
              Structured reports with grouped data bands, subtotals, and cross-tabulation.
              Ideal for periodic distribution to stakeholders.
            </p>
            <code className="text-xs block mt-2">reportType="banded"</code>
          </FeatureCard>
          <FeatureCard variant="info" icon={Brain} title="BI Reports">
            <p className="text-sm mt-2">
              Interactive analytical reports with drill-down, pivot tables, and dynamic visualizations.
              Ideal for ad-hoc analysis.
            </p>
            <code className="text-xs block mt-2">reportType="bi"</code>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Natural Language Queries</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Example prompts for AI report generation:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="p-2 bg-muted rounded">
                "Show me completion rates by department for Q4 2025"
              </li>
              <li className="p-2 bg-muted rounded">
                "Which courses have the lowest satisfaction scores this year?"
              </li>
              <li className="p-2 bg-muted rounded">
                "Compare training spend vs completion rate by category"
              </li>
              <li className="p-2 bg-muted rounded">
                "List employees with expiring certifications in the next 90 days"
              </li>
              <li className="p-2 bg-muted rounded">
                "What is our overall compliance rate trend over the last 12 months?"
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.16.1: AI-Powered BI Report Builder with natural language query"
        alt="Report builder interface with prompt input, generated visualization, and export options"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
        <p className="text-sm text-muted-foreground mb-3">
          The AI report builder can query across training module tables:
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">lms_courses</Badge>
          <Badge variant="outline">lms_enrollments</Badge>
          <Badge variant="outline">lms_quiz_attempts</Badge>
          <Badge variant="outline">lms_certificates</Badge>
          <Badge variant="outline">training_budgets</Badge>
          <Badge variant="outline">compliance_training_assignments</Badge>
          <Badge variant="outline">training_evaluations</Badge>
          <Badge variant="outline">training_vendors</Badge>
        </div>
      </section>

      <TipCallout title="Report Saving">
        Save frequently-used AI queries as report templates for quick access.
        Saved reports can be scheduled for automated delivery.
      </TipCallout>

      <InfoCallout title="AI Governance">
        AI-generated reports include explainability metadata showing data sources,
        query interpretation, and confidence scores. Review the AI Governance section
        (6.9) for compliance considerations.
      </InfoCallout>
    </div>
  );
}

export function LndAnalyticsScheduledReports() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Scheduled Reports enable automated delivery of training analytics to stakeholders
          on a recurring basis. Configure via <strong>Training → Analytics → Scheduled Reports</strong>.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Schedule Configuration</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Frequency</TableCell>
              <TableCell>Daily, Weekly, Monthly, Quarterly</TableCell>
              <TableCell>How often the report runs</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Day/Time</TableCell>
              <TableCell>Day of week/month, time of day</TableCell>
              <TableCell>When the report generates</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Format</TableCell>
              <TableCell>PDF, Excel, CSV</TableCell>
              <TableCell>Output file format</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Recipients</TableCell>
              <TableCell>Users, Groups, External emails</TableCell>
              <TableCell>Who receives the report</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Filters</TableCell>
              <TableCell>Company, Department, Date range</TableCell>
              <TableCell>Data scope for the report</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Common Scheduled Reports</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={Calendar} title="Weekly Training Summary">
            <p className="text-sm mt-2">Enrollments, completions, and overdue items for the week</p>
            <p className="text-xs text-muted-foreground mt-1">Recipients: L&D Team, HR Partners</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={FileText} title="Monthly Compliance Report">
            <p className="text-sm mt-2">Compliance rates, escalations, and risk scores</p>
            <p className="text-xs text-muted-foreground mt-1">Recipients: Compliance Officers, Executives</p>
          </FeatureCard>
          <FeatureCard variant="info" icon={Download} title="Quarterly Budget Report">
            <p className="text-sm mt-2">Budget utilization, CPL, and variance analysis</p>
            <p className="text-xs text-muted-foreground mt-1">Recipients: Finance, HR Leadership</p>
          </FeatureCard>
          <FeatureCard variant="success" icon={Calendar} title="Manager Team Alert">
            <p className="text-sm mt-2">Direct reports with overdue or expiring training</p>
            <p className="text-xs text-muted-foreground mt-1">Recipients: Individual managers</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.17.1: Scheduled Report Configuration with frequency and recipient settings"
        alt="Form showing report selection, schedule options, format choice, and recipient list"
      />

      <WarningCallout title="Email Delivery">
        Ensure recipient email addresses are valid and email delivery is configured in
        system settings. Failed deliveries are logged in Admin → Notifications → Delivery Log.
      </WarningCallout>
    </div>
  );
}

export function LndAnalyticsCustomReportBuilder() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The Custom Report Builder enables self-service ad-hoc report creation with 
          drag-drop field selection, filter configuration, and visualization options.
          Reports are saved to <code>saved_report_configs</code> for reuse.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Report Builder Steps</h3>
        <Card>
          <CardContent className="pt-4">
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Select Data Source</p>
                  <p className="text-muted-foreground">Choose primary table (Enrollments, Courses, Completions, etc.)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Add Fields</p>
                  <p className="text-muted-foreground">Drag fields to columns: employee name, course title, dates, scores</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Configure Filters</p>
                  <p className="text-muted-foreground">Set criteria: date range, department, status, category</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Add Grouping/Aggregation</p>
                  <p className="text-muted-foreground">Group by department, sum/avg on numeric fields</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">5</Badge>
                <div>
                  <p className="font-medium">Choose Visualization</p>
                  <p className="text-muted-foreground">Table, bar chart, pie chart, line chart</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">6</Badge>
                <div>
                  <p className="font-medium">Save & Export</p>
                  <p className="text-muted-foreground">Save configuration for reuse, export to PDF/Excel/CSV</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Available Fields by Data Source</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Source</TableHead>
              <TableHead>Available Fields</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Enrollments</TableCell>
              <TableCell>Employee, Course, Status, Enrolled Date, Due Date, Completed Date, Progress %</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Quiz Attempts</TableCell>
              <TableCell>Employee, Quiz, Score, Max Score, %, Passed, Time Spent, Attempt #</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Certificates</TableCell>
              <TableCell>Employee, Course, Certificate #, Issued Date, Expiry Date, Final Score</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Compliance</TableCell>
              <TableCell>Employee, Requirement, Status, Due Date, Completed Date, Escalation Level</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.18.1: Custom Report Builder with drag-drop field selection"
        alt="Report builder showing available fields list, selected columns, filter panel, and preview"
      />

      <TipCallout title="Report Templates">
        Start from a pre-built template to save time. Templates are available for common reports
        like "Monthly Completion Summary" and "Compliance Status by Department".
      </TipCallout>

      <InfoCallout title="Sharing Reports">
        Saved reports can be shared with other users. Use "Share" to grant view or edit access
        to specific users or groups.
      </InfoCallout>
    </div>
  );
}
