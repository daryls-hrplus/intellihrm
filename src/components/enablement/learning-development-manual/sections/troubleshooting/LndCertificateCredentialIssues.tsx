import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CERTIFICATE_ISSUES = [
  {
    id: 'CRT-001',
    symptom: 'Certificate not generating after course completion',
    severity: 'High',
    cause: 'Certificate template not linked to course, or template is inactive, or generation trigger not firing.',
    resolution: [
      'Navigate to course settings and verify certificate template is assigned',
      'Check certificate template status is "Active"',
      'Verify course completion triggered certificate generation event',
      'Check lms_certificates table for any failed generation records',
      'Manually trigger certificate generation from enrollment details'
    ],
    prevention: 'Link certificate templates during course creation. Test certificate flow before go-live.'
  },
  {
    id: 'CRT-002',
    symptom: 'Certificate number sequence duplicating or gaps',
    severity: 'High',
    cause: 'Sequence generator conflict, concurrent generation race condition, or number format misconfigured.',
    resolution: [
      'Review certificate_number sequence in database',
      'Check for any duplicate numbers in lms_certificates',
      'Reset sequence to max(certificate_number) + 1 if needed',
      'Enable database-level unique constraint on certificate_number',
      'Consider using UUID-based numbering to avoid conflicts'
    ],
    prevention: 'Use database sequences for numbering. Implement unique constraint on certificate_number.'
  },
  {
    id: 'CRT-003',
    symptom: 'PDF download failing or showing corrupted file',
    severity: 'High',
    cause: 'PDF generation service error, template rendering failure, or file storage issue.',
    resolution: [
      'Check PDF generation service logs for errors',
      'Verify template HTML/CSS is valid for PDF rendering',
      'Test with a simple template to isolate the issue',
      'Check file storage bucket access and permissions',
      'Regenerate PDF and verify download'
    ],
    prevention: 'Use PDF-compatible fonts and layouts. Test PDF generation across browsers.'
  },
  {
    id: 'CRT-004',
    symptom: 'Template placeholders not populating with actual data',
    severity: 'Medium',
    cause: 'Placeholder syntax incorrect, field name mismatch, or data not available at generation time.',
    resolution: [
      'Verify placeholder syntax: {{employee_name}}, {{course_title}}',
      'Check available placeholders in template documentation',
      'Ensure all required data exists for the enrollment',
      'Test template preview with sample data',
      'Check for typos in placeholder field names'
    ],
    prevention: 'Use the placeholder picker in template editor. Preview before activating templates.'
  },
  {
    id: 'CRT-005',
    symptom: 'Certificate expiry date showing incorrect value',
    severity: 'High',
    cause: 'Validity period misconfigured, calculation using wrong base date, or timezone issue.',
    resolution: [
      'Verify validity_months setting on certificate template',
      'Check if expiry calculates from completion_date or issue_date',
      'Verify timezone settings for date calculations',
      'Recalculate expiry: completion_date + validity_months',
      'Update incorrect expiry dates in lms_certificates'
    ],
    prevention: 'Configure validity period during template setup. Document expiry calculation logic.'
  },
  {
    id: 'CRT-006',
    symptom: 'Recertification reminder not triggering before expiry',
    severity: 'Medium',
    cause: 'Reminder job not running, reminder_days_before not configured, or notification template missing.',
    resolution: [
      'Verify recertification reminder job is enabled and running',
      'Check reminder_days_before setting (e.g., 30, 14, 7 days)',
      'Verify notification template exists for recertification',
      'Check user email preferences allow reminder notifications',
      'Manually send reminder as immediate workaround'
    ],
    prevention: 'Configure reminder schedule during template setup. Test reminder flow before go-live.'
  },
  {
    id: 'CRT-007',
    symptom: 'External certification import failing validation',
    severity: 'Medium',
    cause: 'Required fields missing, certificate number format invalid, or accrediting body not recognized.',
    resolution: [
      'Review validation error message for specific field',
      'Verify all required fields are populated in import',
      'Check certificate number format matches expected pattern',
      'Ensure accrediting body exists in system reference data',
      'Use import template for correct field mapping'
    ],
    prevention: 'Use provided import template. Validate data before import.'
  },
  {
    id: 'CRT-008',
    symptom: 'Certificate verification link not working for third parties',
    severity: 'Medium',
    cause: 'Verification endpoint not public, certificate marked private, or link expired.',
    resolution: [
      'Verify public verification endpoint is accessible',
      'Check certificate is_public flag allows external verification',
      'Confirm verification link format is correct',
      'Check if verification link has time-based expiry',
      'Test verification as anonymous user'
    ],
    prevention: 'Enable public verification during setup. Test verification links before distributing.'
  },
  {
    id: 'CRT-009',
    symptom: 'Badge image not displaying on generated certificate',
    severity: 'Low',
    cause: 'Badge image URL broken, image format unsupported, or image not included in PDF render.',
    resolution: [
      'Verify badge image URL is accessible',
      'Check image format is supported (PNG, JPG recommended)',
      'Ensure image is embedded in template, not linked',
      'Convert image to base64 for PDF compatibility',
      'Test with different image to isolate issue'
    ],
    prevention: 'Embed images in templates rather than linking. Use web-safe image formats.'
  },
  {
    id: 'CRT-010',
    symptom: 'Bulk certificate generation timing out or failing',
    severity: 'Medium',
    cause: 'Too many certificates in single batch, server timeout, or PDF service overload.',
    resolution: [
      'Reduce batch size to 50 certificates at a time',
      'Use async generation queue for large batches',
      'Check server timeout settings and increase if needed',
      'Monitor PDF service capacity during generation',
      'Implement retry logic for failed generations'
    ],
    prevention: 'Use async batch processing for large volumes. Set appropriate batch size limits.'
  },
  // NEW: Phase 1 additions (CRT-011 to CRT-013)
  {
    id: 'CRT-011',
    symptom: 'Certificate QR code verification returning invalid response',
    severity: 'Medium',
    cause: 'QR verification endpoint misconfigured, SSL certificate issue, or verification service down.',
    resolution: [
      'Verify QR verification endpoint URL in certificate settings',
      'Test endpoint directly with certificate ID',
      'Check SSL certificate validity on verification domain',
      'Review verification service logs for errors',
      'Regenerate QR code with updated endpoint if needed'
    ],
    prevention: 'Test QR verification during template preview. Monitor endpoint availability.'
  },
  {
    id: 'CRT-012',
    symptom: 'External credential import validation errors',
    severity: 'Medium',
    cause: 'Data format mismatch, required fields missing, or duplicate credential already exists.',
    resolution: [
      'Review import error log for specific field errors',
      'Verify date formats match expected pattern (YYYY-MM-DD)',
      'Check for existing credentials with same credential_number',
      'Validate accrediting_body exists in reference data',
      'Use import template with data validation rules'
    ],
    prevention: 'Use provided CSV template. Pre-validate data with import preview function.'
  },
  {
    id: 'CRT-013',
    symptom: 'Digital badge not publishing to Credly/Badgr',
    severity: 'Medium',
    cause: 'OAuth credentials expired, badge template not mapped, or external API rate limit exceeded.',
    resolution: [
      'Verify badge provider OAuth credentials are current',
      'Check badge template mapping in integration settings',
      'Review API rate limits and request counts',
      'Test with manual badge push to isolate issue',
      'Reauthorize integration if OAuth token expired'
    ],
    prevention: 'Monitor integration health dashboard. Set up OAuth token refresh reminders.'
  },
];

const QUICK_REFERENCE = [
  { id: 'CRT-001', symptom: 'Certificate not generating', severity: 'High' },
  { id: 'CRT-002', symptom: 'Duplicate certificate numbers', severity: 'High' },
  { id: 'CRT-003', symptom: 'PDF download failing', severity: 'High' },
  { id: 'CRT-005', symptom: 'Expiry date incorrect', severity: 'High' },
  { id: 'CRT-011', symptom: 'QR verification failing', severity: 'Medium' },
];

export function LndCertificateCredentialIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-6" data-manual-anchor="sec-9-6" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin</span>
          </div>
          <h3 className="text-xl font-semibold">9.6 Certificate & Credential Issues</h3>
          <p className="text-muted-foreground mt-1">
            Certificate generation, numbering, PDF rendering, expiry, recertification, and verification troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve certificate generation failures',
          'Troubleshoot certificate numbering and duplication issues',
          'Fix PDF rendering and template placeholder problems',
          'Address certificate expiry and recertification reminder failures',
          'Resolve external certification import and verification issues'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certificate Issues Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Issue ID</th>
                  <th className="text-left py-2 font-medium">Symptom</th>
                  <th className="text-left py-2 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">
                      <Badge variant="outline" className="font-mono">{item.id}</Badge>
                    </td>
                    <td className="py-2">{item.symptom}</td>
                    <td className="py-2">
                      <Badge variant="destructive">{item.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution (13 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {CERTIFICATE_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'High' ? 'text-destructive' : issue.severity === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Root Cause</span>
                      <p className="text-sm mt-1">{issue.cause}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution Steps</span>
                      <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        {issue.resolution.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Prevention</span>
                        <p className="text-sm mt-1">{issue.prevention}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="Certificate Template Testing">
        Before activating any certificate template: (1) Preview with sample data, (2) Generate test PDF, 
        (3) Verify all placeholders populate, (4) Test verification link, (5) Confirm expiry calculation.
      </TipCallout>
    </div>
  );
}
