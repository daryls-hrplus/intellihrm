import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const IMPORT_TEMPLATES = [
  { name: "Employee Master Data", fields: "45 fields", format: "CSV, XLSX" },
  { name: "Organization Structure", fields: "12 fields", format: "CSV" },
  { name: "Job Positions", fields: "18 fields", format: "CSV, XLSX" },
  { name: "Leave Balances", fields: "8 fields", format: "CSV" },
  { name: "Skills & Certifications", fields: "15 fields", format: "CSV" },
  { name: "Compensation Data", fields: "22 fields", format: "CSV" },
];

const IMPORT_STEPS = [
  "Download the appropriate template for your data type",
  "Populate the template following the column specifications",
  "Validate data locally (no duplicates, required fields filled)",
  "Upload the file via Admin → Bulk Operations → Import",
  "Review the validation summary and fix any errors",
  "Confirm import to process records",
  "Monitor the import progress and review completion report"
];

export function SystemBulkOperations() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Bulk operations enable efficient mass data management including importing employee records, 
        exporting data for analysis, and performing batch updates across multiple records.
      </p>

      {/* Import Section */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Upload className="h-4 w-4 text-green-500" />
          Data Import
        </h4>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Template</th>
                  <th className="text-left p-3 font-medium">Fields</th>
                  <th className="text-left p-3 font-medium">Formats</th>
                </tr>
              </thead>
              <tbody>
                {IMPORT_TEMPLATES.map((template, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{template.name}</td>
                    <td className="p-3">{template.fields}</td>
                    <td className="p-3">
                      <Badge variant="outline">{template.format}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Import Process Steps
            </h5>
            <ol className="text-sm space-y-2 text-muted-foreground">
              {IMPORT_STEPS.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.7.1: Bulk Import interface with file upload and validation preview"
        alt="Import wizard showing file upload, column mapping, and validation results"
      />

      {/* Export Section */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Download className="h-4 w-4 text-blue-500" />
          Data Export
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Standard Exports</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Employee directory (filtered by status, department)</li>
              <li>• Payroll data extract</li>
              <li>• Leave balance reports</li>
              <li>• Organization hierarchy</li>
              <li>• Audit trail exports</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Export Formats</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• CSV (universal compatibility)</li>
              <li>• XLSX (Excel with formatting)</li>
              <li>• PDF (formatted reports)</li>
              <li>• JSON (API integration)</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.7.2: Export configuration with column selection and format options"
        alt="Export dialog showing available columns, filters, and format selection"
      />

      {/* Batch Updates */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-purple-500" />
          Batch Updates
        </h4>
        <div className="border rounded-lg p-4">
          <p className="text-sm mb-3">
            Batch updates allow modifying multiple records simultaneously, such as:
          </p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Mass department reassignments during reorganization</li>
            <li>• Bulk status changes (e.g., activating seasonal workers)</li>
            <li>• Applying cost of living adjustments to salary bands</li>
            <li>• Updating manager assignments after leadership changes</li>
          </ul>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Best Practice:</strong> Always export current data as a backup before performing bulk updates. 
          Large imports (5,000+ records) should be scheduled during off-peak hours.
        </AlertDescription>
      </Alert>
    </div>
  );
}
