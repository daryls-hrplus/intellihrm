import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Shield, Download, CheckCircle2, Info, ClipboardCheck } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const distributionLogFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Distribution record identifier' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company for audit scoping' },
  { name: 'cycle_id', required: true, type: 'UUID', description: 'Feedback cycle being distributed' },
  { name: 'participant_id', required: false, type: 'UUID', description: 'Subject of the report (if individual)' },
  { name: 'template_id', required: false, type: 'UUID', description: 'Report template used' },
  { name: 'recipient_id', required: true, type: 'UUID', description: 'Profile receiving the report' },
  { name: 'recipient_type', required: true, type: 'enum', description: 'Role of the recipient', validation: 'employee | manager | hr | executive' },
  { name: 'distribution_method', required: true, type: 'enum', description: 'How report was delivered', validation: 'email | in_app | download | print' },
  { name: 'distributed_at', required: true, type: 'timestamptz', description: 'Timestamp of distribution' },
  { name: 'distributed_by', required: false, type: 'UUID', description: 'Admin who triggered distribution' },
  { name: 'report_format', required: false, type: 'enum', description: 'File format of report', validation: 'pdf | docx | html' },
  { name: 'file_url', required: false, type: 'text', description: 'Storage URL for generated file' },
  { name: 'acknowledgment_required', required: true, type: 'boolean', description: 'Whether recipient must acknowledge', defaultValue: 'false' },
  { name: 'acknowledged_at', required: false, type: 'timestamptz', description: 'When recipient acknowledged receipt' },
];

const generatedReportsFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Generated report identifier' },
  { name: 'cycle_id', required: true, type: 'UUID', description: 'Source feedback cycle' },
  { name: 'participant_id', required: false, type: 'UUID', description: 'Subject of the report' },
  { name: 'template_id', required: false, type: 'UUID', description: 'Template used for generation' },
  { name: 'report_version', required: true, type: 'integer', description: 'Version number for this report', defaultValue: '1' },
  { name: 'generation_status', required: true, type: 'enum', description: 'Current generation status', validation: 'pending | generating | completed | failed' },
  { name: 'file_url', required: false, type: 'text', description: 'Storage location of generated file' },
  { name: 'file_size_bytes', required: false, type: 'bigint', description: 'File size for storage tracking' },
  { name: 'generated_by', required: false, type: 'UUID', description: 'Admin who triggered generation' },
  { name: 'generated_at', required: true, type: 'timestamptz', description: 'Timestamp of generation' },
  { name: 'data_snapshot', required: false, type: 'JSONB', description: 'Point-in-time data used for report' },
  { name: 'error_message', required: false, type: 'text', description: 'Error details if generation failed' },
];

export function AnalyticsResultsReleaseAudit() {
  return (
    <section id="sec-6-6" data-manual-anchor="sec-6-6" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            6.6 Results Release Audit
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
            <Badge variant="secondary">Cycles</Badge>
            <span>→</span>
            <Badge variant="secondary">Results Release</Badge>
            <span>→</span>
            <Badge variant="secondary">Audit Log</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Track all report generation and distribution events</li>
                <li>Monitor acknowledgment status for compliance requirements</li>
                <li>Export audit trails for SOC 2 and GDPR compliance</li>
                <li>Manage report versioning and regeneration</li>
                <li>Investigate distribution issues and access patterns</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Compliance-Ready Audit Trail</h4>
            <p className="text-muted-foreground">
              The Results Release Audit system maintains a complete record of every report generated 
              and distributed. This supports SOC 2 Type II audit requirements and GDPR Article 30 
              processing records. All distribution events are timestamped, attributed, and retained 
              according to company data retention policies.
            </p>
          </div>

          {/* Compliance Standards */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Standards Addressed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">SOC 2 Type II</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Complete distribution audit trail</li>
                    <li>• User attribution for all actions</li>
                    <li>• Timestamp integrity</li>
                    <li>• Access control logging</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">GDPR Article 30</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Processing activity records</li>
                    <li>• Data export documentation</li>
                    <li>• Recipient tracking</li>
                    <li>• Retention period compliance</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">ISO 27001</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Information classification</li>
                    <li>• Access logging</li>
                    <li>• Incident investigation support</li>
                    <li>• Change management audit</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Dashboard Features */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Audit Dashboard Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Distribution Log</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Filter by cycle, participant, recipient</li>
                    <li>• Search by distribution method</li>
                    <li>• Date range filtering</li>
                    <li>• Export to CSV for external audit</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Acknowledgment Tracking</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Pending acknowledgments list</li>
                    <li>• Overdue acknowledgment alerts</li>
                    <li>• Bulk reminder for unacknowledged</li>
                    <li>• Acknowledgment rate metrics</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Report Versioning</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Version history per participant</li>
                    <li>• Regeneration triggers and reasons</li>
                    <li>• Data snapshot comparison</li>
                    <li>• Rollback capability (with audit)</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Options
                  </h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Full audit log (CSV/Excel)</li>
                    <li>• Acknowledgment status report</li>
                    <li>• Distribution summary by cycle</li>
                    <li>• Access pattern analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="feedback_report_distribution_log Table Reference" 
            fields={distributionLogFields} 
          />

          <FieldReferenceTable 
            title="feedback_generated_reports Table Reference" 
            fields={generatedReportsFields} 
          />

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Audit Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>All distribution events are immutable once recorded</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Report regeneration creates new version; previous versions retained</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Acknowledgment deadline default: 7 days from distribution</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Audit logs retained for 7 years (SOC 2 requirement)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>Export audit log quarterly for external compliance review</span>
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
                <li><strong>Distribution not logged:</strong> Check RLS policies on distribution_log table</li>
                <li><strong>Acknowledgment stuck:</strong> Verify recipient has access to acknowledge action</li>
                <li><strong>Report regeneration failed:</strong> Check data_snapshot for missing source data</li>
                <li><strong>Audit export timeout:</strong> Apply date range filter to reduce dataset size</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
