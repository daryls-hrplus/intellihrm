import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileDown, Printer, Settings, CheckCircle2, Info, Eye } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const exportConfigFields: FieldDefinition[] = [
  { name: 'format', required: true, type: 'enum', description: 'Output file format', validation: 'pdf | docx | print' },
  { name: 'page_size', required: true, type: 'text', description: 'Paper size for PDF/print', defaultValue: 'A4', validation: 'A4 | Letter | Legal' },
  { name: 'orientation', required: true, type: 'text', description: 'Page orientation', defaultValue: 'portrait', validation: 'portrait | landscape' },
  { name: 'include_cover', required: true, type: 'boolean', description: 'Include cover page with summary', defaultValue: 'true' },
  { name: 'include_toc', required: true, type: 'boolean', description: 'Include table of contents', defaultValue: 'true' },
  { name: 'include_charts', required: true, type: 'boolean', description: 'Render charts as images', defaultValue: 'true' },
  { name: 'chart_quality', required: true, type: 'text', description: 'Chart image resolution', defaultValue: 'high', validation: 'low | medium | high' },
  { name: 'watermark', required: false, type: 'text', description: 'Watermark text (e.g., "Confidential")' },
  { name: 'header_logo', required: false, type: 'boolean', description: 'Include company logo in header', defaultValue: 'true' },
  { name: 'footer_text', required: false, type: 'text', description: 'Custom footer text' },
];

const printSections = [
  { id: 'cover', label: 'Cover Page', default: true },
  { id: 'summary', label: 'Executive Summary', default: true },
  { id: 'scores', label: 'Score Breakdown', default: true },
  { id: 'categories', label: 'Category Analysis', default: true },
  { id: 'questions', label: 'Question Details', default: true },
  { id: 'comments', label: 'Written Feedback', default: true },
  { id: 'themes', label: 'AI Themes', default: true },
  { id: 'development', label: 'Development Suggestions', default: true },
];

export function AnalyticsPDFExportConfiguration() {
  return (
    <section id="sec-6-7" data-manual-anchor="sec-6-7" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            6.7 PDF Export & Print Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Report Viewer</Badge>
            <span>→</span>
            <Badge variant="secondary">Download Report</Badge>
            <span>→</span>
            <Badge variant="secondary">Export Options</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure PDF export settings for 360 feedback reports</li>
                <li>Use print preview to customize section inclusion</li>
                <li>Apply branding elements (logo, watermark, footer)</li>
                <li>Optimize chart rendering for print quality</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Export & Print Workflow</h4>
            <p className="text-muted-foreground">
              The 360 Feedback report system supports multiple export formats: PDF for archival, 
              DOCX for editing, and direct printing. The print preview modal allows users to 
              select which sections to include and configure page layout before export.
            </p>
          </div>

          {/* Export Formats */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Supported Export Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileDown className="h-4 w-4 text-primary" />
                    <h5 className="font-medium">PDF Document</h5>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Best for sharing and archiving. Maintains formatting across devices.
                  </p>
                  <Badge variant="outline">jsPDF + html2canvas</Badge>
                </div>
                <div className="p-3 bg-background rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileDown className="h-4 w-4 text-blue-500" />
                    <h5 className="font-medium">Word Document</h5>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Editable format for customization and annotation.
                  </p>
                  <Badge variant="outline">docx library</Badge>
                </div>
                <div className="p-3 bg-background rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <Printer className="h-4 w-4 text-gray-500" />
                    <h5 className="font-medium">Print</h5>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Direct print or save as PDF via browser print dialog.
                  </p>
                  <Badge variant="outline">window.print()</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Print Preview Modal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Section Selection</h5>
                  <p className="text-xs text-muted-foreground mb-3">
                    Users can toggle which sections to include in the export:
                  </p>
                  <div className="space-y-2">
                    {printSections.map((section) => (
                      <div key={section.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded border ${section.default ? 'bg-primary' : 'bg-background'}`} />
                        <span>{section.label}</span>
                        {section.default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Preview Pane</h5>
                  <p className="text-xs text-muted-foreground mb-3">
                    A4-aspect preview showing selected sections before export.
                  </p>
                  <div className="border rounded p-4 bg-white aspect-[210/297] flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Live Preview Area</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="Export Configuration Options" 
            fields={exportConfigFields} 
          />

          {/* Implementation Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Implementation Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium mb-1">Key Components</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li><code className="bg-muted px-1 rounded">ReportDownloadButton.tsx</code> – Dropdown with format options</li>
                    <li><code className="bg-muted px-1 rounded">PrintPreviewModal.tsx</code> – Section selection and preview</li>
                    <li><code className="bg-muted px-1 rounded">Feedback360ReportPDF.tsx</code> – PDF generation utility</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Dependencies</h5>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">jsPDF</Badge>
                    <Badge variant="outline">html2canvas</Badge>
                    <Badge variant="outline">docx</Badge>
                    <Badge variant="outline">file-saver</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Export Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Charts rendered at 2x resolution for print quality</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>PDF generation logged to distribution audit table</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>"Confidential" watermark applied by default for HR audience</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>Use "accessible" color scheme for printed reports</span>
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
                <li><strong>Charts not appearing in PDF:</strong> Wait for html2canvas to complete rendering</li>
                <li><strong>Large PDF file size:</strong> Reduce chart_quality setting to "medium"</li>
                <li><strong>Page breaks in wrong places:</strong> Check CSS print media queries</li>
                <li><strong>Logo not appearing:</strong> Verify company logo_url is accessible</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
