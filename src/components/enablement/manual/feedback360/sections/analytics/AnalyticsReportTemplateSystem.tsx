import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Settings, Layout, Info, CheckCircle2 } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const templateFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique template identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'company_id', required: false, type: 'UUID', description: 'Company owning this template (null for system templates)', defaultValue: 'null' },
  { name: 'name', required: true, type: 'text', description: 'Template display name', validation: 'Max 100 characters' },
  { name: 'description', required: false, type: 'text', description: 'Purpose and use case description' },
  { name: 'audience_type', required: true, type: 'enum', description: 'Target audience for the report', validation: 'executive | manager | individual_contributor | hr | self' },
  { name: 'sections_config', required: true, type: 'JSONB', description: 'Toggle configuration for report sections', defaultValue: 'All sections enabled' },
  { name: 'visualization_config', required: true, type: 'JSONB', description: 'Chart types, benchmarks, color scheme settings' },
  { name: 'content_depth', required: true, type: 'enum', description: 'Level of detail in report content', validation: 'high_level | summary | detailed | comprehensive' },
  { name: 'anonymity_level', required: true, type: 'enum', description: 'How strictly anonymity is enforced', validation: 'strict | standard | relaxed' },
  { name: 'is_default', required: true, type: 'boolean', description: 'Default template for this audience type', defaultValue: 'false' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Whether template is available for use', defaultValue: 'true' },
];

const sectionsConfigFields: FieldDefinition[] = [
  { name: 'executive_summary', required: true, type: 'boolean', description: 'High-level overview with key metrics', defaultValue: 'true' },
  { name: 'score_breakdown', required: true, type: 'boolean', description: 'Overall scores by rater category', defaultValue: 'true' },
  { name: 'category_analysis', required: true, type: 'boolean', description: 'Competency/category-level analysis', defaultValue: 'true' },
  { name: 'question_details', required: true, type: 'boolean', description: 'Individual question scores', defaultValue: 'true' },
  { name: 'verbatim_comments', required: true, type: 'boolean', description: 'Written feedback (anonymized)', defaultValue: 'true' },
  { name: 'anonymized_themes', required: true, type: 'boolean', description: 'AI-extracted themes from comments', defaultValue: 'true' },
  { name: 'comparison_to_norm', required: true, type: 'boolean', description: 'Benchmark comparison section', defaultValue: 'false' },
  { name: 'development_suggestions', required: true, type: 'boolean', description: 'AI-generated development recommendations', defaultValue: 'true' },
  { name: 'ai_insights', required: true, type: 'boolean', description: 'Additional AI analysis and insights', defaultValue: 'false' },
];

export function AnalyticsReportTemplateSystem() {
  return (
    <section id="sec-6-1" data-manual-anchor="sec-6-1" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            6.1 Report Template System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Admin</Badge>
            <span>→</span>
            <Badge variant="outline">Performance</Badge>
            <span>→</span>
            <Badge variant="outline">360 Feedback</Badge>
            <span>→</span>
            <Badge variant="secondary">Report Templates</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand the report template architecture and configuration options</li>
                <li>Configure section visibility for different audience types</li>
                <li>Set up visualization preferences and color schemes</li>
                <li>Manage content depth levels for appropriate detail</li>
                <li>Apply anonymity settings to protect rater identity</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Template Architecture Overview</h4>
            <p className="text-muted-foreground">
              The Report Template System provides configurable templates that control how 360 feedback results 
              are presented to different audiences. Each template defines which sections appear, the level of 
              detail shown, visualization preferences, and anonymity enforcement.
            </p>
          </div>

          {/* Template Configuration Diagram */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Template Configuration Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Audience Types</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Executive – Strategic overview</li>
                    <li>• Manager – Coaching focus</li>
                    <li>• IC – Full detail</li>
                    <li>• HR – Analytics view</li>
                    <li>• Self – Reflection focus</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Content Depth</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• High Level – KPIs only</li>
                    <li>• Summary – Key findings</li>
                    <li>• Detailed – Full analysis</li>
                    <li>• Comprehensive – Everything</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Anonymity Levels</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Strict – Min 5 raters</li>
                    <li>• Standard – Min 3 raters</li>
                    <li>• Relaxed – Min 2 raters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="feedback_report_templates Table Reference" 
            fields={templateFields} 
          />

          <FieldReferenceTable 
            title="sections_config JSONB Structure" 
            fields={sectionsConfigFields} 
          />

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Business Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Only one template per audience type can be marked as default</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Anonymity level must meet minimum rater threshold before showing category breakdown</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Verbatim comments hidden when rater count below anonymity threshold</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>Executive templates should use "high_level" content depth</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Template not appearing:</strong> Check is_active flag and company_id match</li>
                <li><strong>Sections missing:</strong> Verify sections_config has required toggles enabled</li>
                <li><strong>Wrong template used:</strong> Check is_default flag for audience type</li>
                <li><strong>Comments hidden:</strong> Rater count may be below anonymity threshold</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
