import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Calendar, Shield, AlertTriangle, CheckCircle, FileText, Scale, Users, Clock, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ChecklistItem {
  id: string;
  item: string;
  frequency: 'per-cycle' | 'quarterly' | 'annual';
  responsible: string;
  regulatory?: string;
}

const QUARTERLY_CHECKLIST: ChecklistItem[] = [
  {
    id: 'Q-01',
    item: 'All calibration adjustments have documented justifications',
    frequency: 'per-cycle',
    responsible: 'HR Manager',
    regulatory: 'EEOC'
  },
  {
    id: 'Q-02',
    item: 'Employee response/acknowledgment records are complete',
    frequency: 'per-cycle',
    responsible: 'HR User',
    regulatory: 'Labor Law'
  },
  {
    id: 'Q-03',
    item: 'AI bias detection reports reviewed and addressed',
    frequency: 'per-cycle',
    responsible: 'HR Manager',
    regulatory: 'EEOC'
  },
  {
    id: 'Q-04',
    item: 'RLS policies verified for data access control',
    frequency: 'quarterly',
    responsible: 'Admin',
    regulatory: 'GDPR/SOC2'
  },
  {
    id: 'Q-05',
    item: 'Audit logs exported and retained per policy',
    frequency: 'quarterly',
    responsible: 'Admin',
    regulatory: 'SOC2'
  },
  {
    id: 'Q-06',
    item: 'User access reviews completed for HR roles',
    frequency: 'quarterly',
    responsible: 'Admin',
    regulatory: 'SOC2'
  },
  {
    id: 'Q-07',
    item: 'Integration log errors reviewed and remediated',
    frequency: 'per-cycle',
    responsible: 'HR User'
  },
  {
    id: 'Q-08',
    item: 'Appraisal completion rates meet target thresholds',
    frequency: 'per-cycle',
    responsible: 'HR Manager'
  }
];

const ANNUAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'A-01',
    item: 'Rating scale alignment verified with compensation bands',
    frequency: 'annual',
    responsible: 'Compensation Lead',
    regulatory: 'Pay Equity'
  },
  {
    id: 'A-02',
    item: 'Adverse impact analysis completed for protected classes',
    frequency: 'annual',
    responsible: 'HR Analytics',
    regulatory: 'EEOC/Title VII'
  },
  {
    id: 'A-03',
    item: 'Manager calibration training records current',
    frequency: 'annual',
    responsible: 'L&D',
    regulatory: 'Best Practice'
  },
  {
    id: 'A-04',
    item: 'Competency framework reviewed for relevance',
    frequency: 'annual',
    responsible: 'HR Manager',
    regulatory: 'Best Practice'
  },
  {
    id: 'A-05',
    item: 'Data retention policies applied to historical cycles',
    frequency: 'annual',
    responsible: 'Admin',
    regulatory: 'GDPR'
  },
  {
    id: 'A-06',
    item: 'Third-party penetration testing completed',
    frequency: 'annual',
    responsible: 'IT Security',
    regulatory: 'SOC2'
  },
  {
    id: 'A-07',
    item: 'Performance-to-termination correlation analyzed',
    frequency: 'annual',
    responsible: 'HR Analytics',
    regulatory: 'EEOC'
  },
  {
    id: 'A-08',
    item: 'AI model fairness audit completed',
    frequency: 'annual',
    responsible: 'AI Governance',
    regulatory: 'AI Ethics'
  }
];

const REGULATORY_MAPPINGS = [
  {
    regulation: 'EEOC Guidelines',
    requirement: 'Non-discriminatory evaluation criteria',
    control: 'AI bias detection on all evaluations',
    evidence: 'Bias detection reports, adverse impact analysis'
  },
  {
    regulation: 'Title VII (US)',
    requirement: 'Equal treatment regardless of protected class',
    control: 'Standardized forms, calibration process',
    evidence: 'Form templates, calibration audit trail'
  },
  {
    regulation: 'GDPR (EU)',
    requirement: 'Data minimization and purpose limitation',
    control: 'Role-based access, data retention policies',
    evidence: 'RLS policies, retention schedules, DPIAs'
  },
  {
    regulation: 'SOX (US Public)',
    requirement: 'Internal controls over financial reporting',
    control: 'Audit trail for compensation-impacting decisions',
    evidence: 'Compensation integration logs, approval records'
  },
  {
    regulation: 'Labor Laws (Multi-jurisdiction)',
    requirement: 'Employee right to respond to evaluation',
    control: 'Employee response phase, escalation workflow',
    evidence: 'Response records, escalation history'
  },
  {
    regulation: 'Pay Equity Laws',
    requirement: 'Objective, documented performance criteria',
    control: 'Weighted scoring, competency frameworks',
    evidence: 'Rating scales, score calculations, calibration'
  }
];

const DOCUMENTATION_REQUIREMENTS = [
  {
    document: 'Appraisal Policy',
    purpose: 'Defines evaluation process and employee rights',
    owner: 'HR Policy',
    review: 'Annual',
    retention: 'Current + 1 version'
  },
  {
    document: 'Rating Scale Definitions',
    purpose: 'Standardized criteria for each rating level',
    owner: 'HR Operations',
    review: 'Annual',
    retention: 'Per cycle'
  },
  {
    document: 'Calibration Guidelines',
    purpose: 'Rules for score adjustment and justification',
    owner: 'HR Operations',
    review: 'Annual',
    retention: 'Current + 1 version'
  },
  {
    document: 'Manager Training Materials',
    purpose: 'Training content for consistent evaluations',
    owner: 'L&D',
    review: 'Per cycle',
    retention: '3 years'
  },
  {
    document: 'AI Governance Policy',
    purpose: 'Controls for AI-assisted recommendations',
    owner: 'AI Governance',
    review: 'Annual',
    retention: 'Current + 1 version'
  },
  {
    document: 'Data Processing Agreement',
    purpose: 'GDPR compliance for appraisal data',
    owner: 'Legal',
    review: 'Annual',
    retention: 'Active + 6 years'
  }
];

const ChecklistCard = ({ items, title, icon }: { items: ChecklistItem[]; title: string; icon: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b">
      {icon}
      <h3 className="font-semibold">{title}</h3>
      <Badge variant="outline">{items.length} items</Badge>
    </div>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
          <Checkbox id={item.id} />
          <div className="flex-1">
            <label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
              {item.item}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{item.responsible}</Badge>
              {item.regulatory && (
                <Badge variant="outline" className="text-xs">{item.regulatory}</Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function ComplianceAuditSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-4">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.4</Badge>
            <Badge variant="secondary">Reference</Badge>
          </div>
          <CardTitle className="text-2xl">Compliance & Audit Checklist</CardTitle>
          <CardDescription>
            Regulatory compliance requirements, audit checklists, and documentation standards for performance management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-4']} />

          {/* Compliance Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">GDPR</div>
              <div className="text-xs text-muted-foreground">Compliant</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <Scale className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">EEOC</div>
              <div className="text-xs text-muted-foreground">Compliant</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">SOC 2</div>
              <div className="text-xs text-muted-foreground">Compliant</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Labor Law</div>
              <div className="text-xs text-muted-foreground">Compliant</div>
            </div>
          </div>

          <Tabs defaultValue="quarterly" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quarterly">Per-Cycle/Quarterly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory Mapping</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="quarterly" className="mt-4">
              <ChecklistCard 
                items={QUARTERLY_CHECKLIST} 
                title="Quarterly / Per-Cycle Audit Checklist"
                icon={<Calendar className="h-5 w-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="annual" className="mt-4">
              <ChecklistCard 
                items={ANNUAL_CHECKLIST} 
                title="Annual Compliance Review"
                icon={<ClipboardCheck className="h-5 w-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Scale className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Regulatory Requirements Mapping</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Regulation</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>System Control</TableHead>
                      <TableHead>Evidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REGULATORY_MAPPINGS.map((mapping, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{mapping.regulation}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{mapping.requirement}</TableCell>
                        <TableCell className="text-sm">{mapping.control}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mapping.evidence}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Required Documentation</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Document</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Review Cycle</TableHead>
                      <TableHead>Retention</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DOCUMENTATION_REQUIREMENTS.map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-sm">{doc.document}</TableCell>
                        <TableCell className="text-sm">{doc.purpose}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.owner}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{doc.review}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{doc.retention}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Audit Evidence Export */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Download className="h-5 w-5 text-primary" />
              Audit Evidence Export
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate compliance reports for external auditors with the following export options:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-background border rounded-lg">
                <div className="font-medium text-sm mb-1">Cycle Summary Report</div>
                <p className="text-xs text-muted-foreground">
                  Completion rates, score distributions, timeline adherence
                </p>
              </div>
              <div className="p-3 bg-background border rounded-lg">
                <div className="font-medium text-sm mb-1">Calibration Audit Trail</div>
                <p className="text-xs text-muted-foreground">
                  All adjustments with justifications and approvers
                </p>
              </div>
              <div className="p-3 bg-background border rounded-lg">
                <div className="font-medium text-sm mb-1">Bias Analysis Report</div>
                <p className="text-xs text-muted-foreground">
                  AI findings, resolutions, adverse impact statistics
                </p>
              </div>
            </div>
          </div>

          {/* Warning Section */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-700 dark:text-amber-400">Compliance Risks to Monitor</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-amber-600" />
                <span>Missing or incomplete calibration justifications may indicate compliance gaps</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-amber-600" />
                <span>Score distribution anomalies by demographic groups require immediate review</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-amber-600" />
                <span>Employee response records are legally required documentation in many jurisdictions</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
