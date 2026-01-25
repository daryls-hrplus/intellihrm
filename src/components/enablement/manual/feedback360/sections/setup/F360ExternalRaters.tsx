import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, Mail, Shield, Clock } from 'lucide-react';

export function F360ExternalRaters() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.10 External Rater Configuration</h3>
        <p className="text-muted-foreground">
          External raters are non-employees (customers, vendors, board members, consultants) who 
          can provide 360 feedback via secure invitation links.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Configure external rater categories and invitation workflows</li>
            <li>• Set up consent collection for GDPR compliance</li>
            <li>• Manage access tokens and expiration policies</li>
            <li>• Understand relationship types and their applications</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Navigation:</span>
            <span className="text-muted-foreground">
              Performance → Setup → 360 Feedback → External Raters
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            External Rater Fields (in feedback_360_requests)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Field</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'external_email', type: 'Text', desc: 'Rater\'s email address for invitation', default: 'Required' },
                  { field: 'external_name', type: 'Text', desc: 'Rater\'s display name', default: 'Required' },
                  { field: 'external_organization', type: 'Text', desc: 'Company/organization name', default: 'Optional' },
                  { field: 'external_relationship', type: 'Enum', desc: 'Relationship type to subject', default: 'Required' },
                  { field: 'access_token', type: 'Text', desc: 'Secure token for feedback access', default: 'Auto-generated' },
                  { field: 'access_token_expires_at', type: 'Timestamp', desc: 'Token expiration datetime', default: '30 days' },
                  { field: 'invitation_sent_at', type: 'Timestamp', desc: 'When invitation was sent', default: 'null' },
                  { field: 'reminder_count', type: 'Number', desc: 'Number of reminders sent', default: '0' },
                  { field: 'consent_given', type: 'Boolean', desc: 'Whether consent was provided', default: 'false' },
                  { field: 'consent_given_at', type: 'Timestamp', desc: 'When consent was recorded', default: 'null' },
                  { field: 'consent_version', type: 'Text', desc: 'Version of consent text accepted', default: 'null' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{row.field}</TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.default}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            Relationship Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Customer', code: 'CUSTOMER', desc: 'External customers who interact with the subject', useCase: 'Customer-facing roles, sales, support' },
              { type: 'Vendor', code: 'VENDOR', desc: 'Suppliers or service providers', useCase: 'Procurement, vendor management roles' },
              { type: 'Partner', code: 'PARTNER', desc: 'Business partners, alliance members', useCase: 'Partnership management, business development' },
              { type: 'Board Member', code: 'BOARD', desc: 'Board of directors members', useCase: 'Executive 360 assessments' },
              { type: 'Consultant', code: 'CONSULTANT', desc: 'External consultants or advisors', useCase: 'Project-based roles, advisory input' },
              { type: 'Other', code: 'OTHER', desc: 'Other external stakeholders', useCase: 'Flexible for unique relationships' },
            ].map((rel) => (
              <div key={rel.code} className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">{rel.code}</Badge>
                  <span className="font-semibold">{rel.type}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rel.desc}</p>
                <p className="text-xs"><span className="font-medium">Use Case:</span> {rel.useCase}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invitation Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Invitation Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              {[
                'Add External Rater',
                'Generate Access Token',
                'Send Invitation',
                'Consent Collection',
                'Feedback Form Access',
                'Response Submitted'
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full border bg-muted/50 text-xs">
                    {step}
                  </div>
                  {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invitation Email Content
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Subject's name and role</li>
                  <li>• Requester's name (HR or manager)</li>
                  <li>• Purpose of feedback request</li>
                  <li>• Estimated completion time</li>
                  <li>• Deadline for response</li>
                  <li>• Secure access link with token</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Token Expiration Settings
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Default expiration</span>
                    <span className="font-medium">30 days</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Configurable range</span>
                    <span className="font-medium">7-90 days</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Token regeneration</span>
                    <span className="font-medium">On request</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Consent Management (GDPR Compliance)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              External raters must provide consent before accessing the feedback form. Consent text 
              is versioned and tracked for compliance.
            </p>

            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Sample Consent Text</h4>
              <p className="text-xs text-muted-foreground italic">
                "By providing feedback, you consent to [Company Name] collecting and processing your 
                responses for the purpose of employee development. Your responses will be anonymized 
                when aggregated with other external feedback. Your data will be retained for [X years] 
                in accordance with our privacy policy. You may withdraw consent at any time by 
                contacting privacy@company.com."
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { element: 'Purpose Statement', desc: 'Clear explanation of how data will be used' },
                { element: 'Anonymity Assurance', desc: 'How responses will be protected' },
                { element: 'Retention Period', desc: 'How long data will be stored' },
                { element: 'Withdrawal Rights', desc: 'How to revoke consent' },
                { element: 'Contact Information', desc: 'Privacy officer or DPO contact' },
                { element: 'Version Control', desc: 'Track which version was accepted' },
              ].map((item) => (
                <div key={item.element} className="p-3 rounded-lg border">
                  <div className="font-medium text-sm">{item.element}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Add an External Rater</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to the 360 cycle and select a participant', result: 'Opens participant rater management' },
              { step: 2, action: 'Click "Add External Rater" in the External category', result: 'Opens external rater form' },
              { step: 3, action: 'Enter rater email, name, and organization', result: 'Required fields for invitation' },
              { step: 4, action: 'Select relationship type (Customer, Vendor, etc.)', result: 'Categorizes the rater relationship' },
              { step: 5, action: 'Set token expiration (default: 30 days)', result: 'How long the link remains valid' },
              { step: 6, action: 'Click "Save & Send Invitation"', result: 'Creates request and sends email' },
              { step: 7, action: 'Monitor invitation status in rater list', result: 'Shows sent, opened, consented, completed' },
              { step: 8, action: '(Optional) Send reminder if not completed', result: 'Resends invitation with reminder text' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Considerations */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Security Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span><strong>Token Security:</strong> Access tokens are cryptographically generated and single-use per session</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span><strong>Link Expiration:</strong> Expired links cannot access the form; new invitation required</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span><strong>IP Logging:</strong> All external access logged with IP address for audit</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span><strong>Rate Limiting:</strong> Prevents brute-force token guessing attempts</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span><strong>No PII Exposure:</strong> External raters see only subject name and questions</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Limit external raters to 2-3 per participant—more dilutes internal feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Use 30-day token expiration—shorter may cause issues; longer increases risk</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Send personal invitations from the subject's manager for higher response rates</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Limit external questions to 5-10 (subset of full question bank)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Always require consent before form access—no exceptions</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                issue: 'External rater not receiving invitation',
                cause: 'Email blocked by spam filter or invalid email address',
                solution: 'Verify email address; ask rater to check spam; resend invitation'
              },
              {
                issue: 'Access link not working',
                cause: 'Token expired or already used in another session',
                solution: 'Regenerate token and resend invitation'
              },
              {
                issue: 'Consent page not appearing',
                cause: 'Consent template not configured or inactive',
                solution: 'Configure and activate consent template in Governance settings'
              },
              {
                issue: 'External responses not appearing in reports',
                cause: 'Anonymity threshold not met for External category',
                solution: 'Need 3+ external responses or aggregate with other categories'
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-amber-300 bg-white dark:bg-background">
                <div className="font-medium text-sm">{item.issue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Cause:</span> {item.cause}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Solution:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
