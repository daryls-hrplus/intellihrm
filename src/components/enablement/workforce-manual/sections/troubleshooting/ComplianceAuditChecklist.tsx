import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClipboardCheck, Globe, FileCheck, Calendar, 
  CheckCircle, Lightbulb, AlertTriangle, BookOpen
} from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';

const regionalCompliance = [
  {
    region: 'Jamaica',
    requirements: [
      'National Insurance Scheme (NIS) registration',
      'Tax Registration Number (TRN) for all employees',
      'Employment Termination and Redundancy Payments Act compliance',
      'Minimum Wage Orders adherence',
      'Holidays with Pay Order tracking'
    ],
    retention: '7 years'
  },
  {
    region: 'Trinidad & Tobago',
    requirements: [
      'National Insurance registration',
      'Board of Inland Revenue compliance',
      'Industrial Relations Act adherence',
      'Minimum Wages Order compliance',
      'Severance Benefits Act documentation'
    ],
    retention: '7 years'
  },
  {
    region: 'Ghana',
    requirements: [
      'Social Security and National Insurance Trust (SSNIT)',
      'Ghana Revenue Authority registration',
      'Labour Act 2003 (Act 651) compliance',
      'National Pensions Act adherence',
      'Data Protection Commission registration'
    ],
    retention: '6 years'
  },
  {
    region: 'Nigeria',
    requirements: [
      'National Pension Commission (PenCom) registration',
      'Federal Inland Revenue Service compliance',
      'Nigeria Data Protection Regulation (NDPR)',
      'Employee Compensation Act documentation',
      'Labour Act compliance'
    ],
    retention: '6 years'
  },
  {
    region: 'Dominican Republic',
    requirements: [
      'Social Security Treasury (TSS) registration',
      'Internal Revenue Directorate (DGII) compliance',
      'Labour Code compliance',
      'AFP/ARS contributions tracking',
      'Christmas bonus (Regalía) documentation'
    ],
    retention: '5 years'
  }
];

const auditDocuments = [
  { doc: 'Employee Master List', freq: 'Monthly', owner: 'HR Admin', retention: 'Indefinite' },
  { doc: 'Organizational Chart', freq: 'Quarterly', owner: 'HR Admin', retention: '5 years' },
  { doc: 'Position Control Report', freq: 'Monthly', owner: 'HR Admin', retention: '5 years' },
  { doc: 'Termination Records', freq: 'As occurs', owner: 'HR Ops', retention: '7+ years' },
  { doc: 'Salary Change History', freq: 'As occurs', owner: 'Compensation', retention: '7+ years' },
  { doc: 'Access Control Audit', freq: 'Monthly', owner: 'IT Security', retention: '5 years' },
  { doc: 'Data Subject Requests Log', freq: 'Ongoing', owner: 'Compliance', retention: '3 years' },
  { doc: 'Consent Records', freq: 'Ongoing', owner: 'HR Admin', retention: 'Active + 3 years' }
];

export function ComplianceAuditChecklist() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-compliance">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10">
              <ClipboardCheck className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <CardTitle>10.6 Compliance & Audit Checklist</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Regional labor law requirements, data residency, and audit documentation standards
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">Admin</Badge>
            <Badge variant="secondary">Compliance</Badge>
            <Badge variant="outline">Est. 15 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Regional Compliance Matrix */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-500" />
              Regional Compliance Requirements
            </h4>
            <div className="space-y-4">
              {regionalCompliance.map((region) => (
                <div key={region.region} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">{region.region}</h5>
                    <Badge variant="outline">Retention: {region.retention}</Badge>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm">
                    {region.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Documentation Checklist */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5 text-purple-500" />
              Audit Documentation Checklist
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Document</th>
                    <th className="text-left p-3 font-medium">Generation Frequency</th>
                    <th className="text-left p-3 font-medium">Owner</th>
                    <th className="text-left p-3 font-medium">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {auditDocuments.map((doc) => (
                    <tr key={doc.doc}>
                      <td className="p-3 font-medium">{doc.doc}</td>
                      <td className="p-3 text-muted-foreground">{doc.freq}</td>
                      <td className="p-3 text-muted-foreground">{doc.owner}</td>
                      <td className="p-3 text-muted-foreground">{doc.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Subject Rights */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Data Subject Rights Handling
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                variant="primary"
                title="Right of Access"
                description="Employee can request all personal data held. Generate via Reports → Employee Data Export. Response within 30 days."
              />
              <FeatureCard
                variant="info"
                title="Right to Rectification"
                description="Employee can request corrections. Process via standard data change workflow with audit trail."
              />
              <FeatureCard
                variant="warning"
                title="Right to Erasure"
                description="Limited by statutory retention requirements. Mark as 'Anonymized' after minimum retention period."
              />
              <FeatureCard
                variant="purple"
                title="Right to Portability"
                description="Export in machine-readable format (CSV/JSON). Available via Reports → Data Portability Export."
              />
            </div>
          </div>

          {/* Pre-Audit Preparation Steps */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-500" />
              Pre-Audit Preparation Steps
            </h4>
            <div className="space-y-3">
              {[
                { week: 'Week -4', task: 'Confirm audit scope and document list with auditors', owner: 'Compliance Lead' },
                { week: 'Week -3', task: 'Generate all required reports and verify data accuracy', owner: 'HR Admin' },
                { week: 'Week -2', task: 'Review access control audit and resolve anomalies', owner: 'IT Security' },
                { week: 'Week -1', task: 'Prepare audit room, staging documents, and walkthrough', owner: 'Compliance Lead' },
                { week: 'Audit Day', task: 'Provide auditor access and designate point of contact', owner: 'HR Director' }
              ].map((step) => (
                <div key={step.week} className="flex items-start gap-3">
                  <Badge variant="outline" className="w-20 flex-shrink-0 justify-center">{step.week}</Badge>
                  <div className="flex-1">
                    <span className="text-sm">{step.task}</span>
                    <span className="text-xs text-muted-foreground ml-2">({step.owner})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consent Tracking */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-900 dark:text-amber-100">
              <AlertTriangle className="h-5 w-5" />
              Employee Consent Tracking
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              All jurisdictions require documented consent for processing personal data. The system tracks:
            </p>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <strong>Initial Consent</strong>
                <p className="text-xs text-amber-700 dark:text-amber-300">Captured at onboarding with timestamp</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <strong>Consent Updates</strong>
                <p className="text-xs text-amber-700 dark:text-amber-300">Tracked when policies change</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <strong>Consent Withdrawal</strong>
                <p className="text-xs text-amber-700 dark:text-amber-300">Logged with impact analysis</p>
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Schedule an annual "Compliance Health Check" using the built-in 
              Compliance Dashboard. It automatically flags records approaching retention limits, missing 
              consents, and policy violations.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.6: Compliance Dashboard showing regional compliance status and upcoming audit deadlines"
          />

        </CardContent>
      </Card>
    </div>
  );
}
