import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertCircle, CheckCircle, Lock, Eye } from 'lucide-react';
import { LearningObjectives, InfoCallout, WarningCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SECURITY_ISSUES = [
  {
    id: 'SEC-001',
    symptom: 'User cannot see succession data for their team',
    severity: 'High',
    cause: 'RLS policy requires manager relationship not established in profiles, or user lacks succession module permission.',
    resolution: [
      'Verify user has succession module permission in roles',
      'Check profiles.manager_id establishes reporting relationship',
      'Confirm user role includes succession.read permission',
      'Test with impersonation if available'
    ],
    prevention: 'Audit manager hierarchy data quality. Include permission verification in user onboarding.',
    crossRef: 'See Section 1.3 for User Personas & Access Matrix.'
  },
  {
    id: 'SEC-002',
    symptom: 'RLS policy blocking access for valid HR user',
    severity: 'High',
    cause: 'HR role not included in policy, or company scope mismatch. Policy may use is_admin_or_hr() incorrectly.',
    resolution: [
      'Verify user has HR role in user_roles table',
      'Check role_company_access includes target company',
      'Review RLS policy logic for succession tables',
      'Update policy to include HR role if missing'
    ],
    prevention: 'Test RLS policies with all persona types. Document policy logic for auditors.',
    crossRef: 'See governance documentation for RLS policy patterns.'
  },
  {
    id: 'SEC-003',
    symptom: 'Cross-company succession data visible unexpectedly',
    severity: 'Critical',
    cause: 'RLS policy missing company_id filter, or multi-company pool scope too broad. Data leakage security incident.',
    resolution: [
      'Immediately restrict access to affected data',
      'Review and fix RLS policy to enforce company_id',
      'Audit access logs for unauthorized viewing',
      'Report incident per security policy'
    ],
    prevention: 'Mandatory company_id filter in all succession RLS policies. Security review for policy changes.',
    crossRef: 'See security documentation for incident response.'
  },
  {
    id: 'SEC-004',
    symptom: 'Audit trail incomplete for sensitive succession changes',
    severity: 'High',
    cause: 'Audit trigger not configured for all succession tables, or application using SECURITY DEFINER bypass.',
    resolution: [
      'Identify tables missing audit triggers',
      'Create audit triggers for succession_candidates, succession_plans, flight_risk_assessments',
      'Review SECURITY DEFINER functions for audit gaps',
      'Manually log identifiable missing changes'
    ],
    prevention: 'Audit triggers mandatory for all succession tables. Include in SOC 2 control testing.',
    crossRef: 'See Section 9.11 for audit trail requirements.'
  },
  {
    id: 'SEC-005',
    symptom: 'Role permission changes not taking effect immediately',
    severity: 'Medium',
    cause: 'JWT token caching role claims. Session not refreshed after role update.',
    resolution: [
      'User should log out and log back in',
      'Clear browser session storage if persisted',
      'Verify role change in user_roles table',
      'Wait for token expiry if logout not possible'
    ],
    prevention: 'Communicate session refresh requirement when changing roles. Consider shorter token expiry.',
    crossRef: 'See authentication documentation for session management.'
  },
  {
    id: 'SEC-006',
    symptom: 'Manager can see succession data for non-direct reports',
    severity: 'Medium',
    cause: 'Manager hierarchy query traversing too many levels, or skip-level access incorrectly configured.',
    resolution: [
      'Verify profiles.manager_id chain is correct',
      'Check RLS policy depth parameter (direct vs. skip-level)',
      'Review succession_assessor_types for skip_level permissions',
      'Restrict access to direct reports only if required'
    ],
    prevention: 'Document access scope by role. Test with complex org structures during UAT.',
    crossRef: 'See Section 2.2 for Assessor Types Configuration.'
  },
  {
    id: 'SEC-007',
    symptom: 'Executive dashboard showing restricted individual data',
    severity: 'High',
    cause: 'Aggregation level insufficient to protect PII, or executive role has excessive granular permissions.',
    resolution: [
      'Review executive dashboard data granularity',
      'Ensure individual-level data requires explicit drill-down permission',
      'Implement k-anonymity (minimum 5 employees per group)',
      'Restrict PII fields from executive aggregations'
    ],
    prevention: 'Design dashboards with privacy-by-default. Separate aggregate and detail permissions.',
    crossRef: 'See Section 10.8 for Diversity & Inclusion Analytics privacy.'
  },
  {
    id: 'SEC-008',
    symptom: 'API returning 403 Forbidden for authenticated valid user',
    severity: 'High',
    cause: 'RLS policy evaluation failing silently, or API endpoint permission check mismatch with frontend.',
    resolution: [
      'Enable RLS debug logging temporarily',
      'Test query directly in SQL with auth.uid() set',
      'Verify API permission check matches RLS policy',
      'Check for policy typos (table name, column reference)'
    ],
    prevention: 'Unit test RLS policies. Log policy evaluation failures for debugging.',
    crossRef: 'See implementation guide for API security patterns.'
  },
];

const ACCESS_MATRIX = [
  { role: 'Employee (ESS)', own: 'Yes', team: 'No', company: 'No', cross: 'No' },
  { role: 'Manager (MSS)', own: 'Yes', team: 'Yes', company: 'No', cross: 'No' },
  { role: 'HR Partner', own: 'Yes', team: 'Yes', company: 'Yes', cross: 'Assigned' },
  { role: 'Executive', own: 'Yes', team: 'Yes', company: 'Aggregate', cross: 'Aggregate' },
  { role: 'Admin', own: 'Yes', team: 'Yes', company: 'Yes', cross: 'Yes' },
];

export function SecurityPermissionIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-8" data-manual-anchor="sec-11-8" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">11.8 Security & Permission Issues</h3>
          <p className="text-muted-foreground mt-1">
            RLS policies, role access, company scope, manager hierarchy, and audit trail troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Troubleshoot RLS policy blocking valid user access',
          'Resolve cross-company data visibility issues',
          'Fix manager hierarchy and reporting relationship problems',
          'Diagnose audit trail gaps and compliance issues',
          'Understand the succession access control matrix'
        ]}
      />

      {/* Access Matrix Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-600" />
            Succession Data Access Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-center py-2 font-medium">Own Data</th>
                  <th className="text-center py-2 font-medium">Team</th>
                  <th className="text-center py-2 font-medium">Company</th>
                  <th className="text-center py-2 font-medium">Cross-Company</th>
                </tr>
              </thead>
              <tbody>
                {ACCESS_MATRIX.map((row) => (
                  <tr key={row.role} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 font-medium">{row.role}</td>
                    <td className="py-2 text-center">
                      <Badge variant={row.own === 'Yes' ? 'default' : 'secondary'}>{row.own}</Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={row.team === 'Yes' ? 'default' : 'secondary'}>{row.team}</Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={row.company === 'Yes' ? 'default' : row.company === 'Aggregate' ? 'outline' : 'secondary'}>{row.company}</Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={row.cross === 'Yes' ? 'default' : row.cross === 'Assigned' || row.cross === 'Aggregate' ? 'outline' : 'secondary'}>{row.cross}</Badge>
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Detailed Issue Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {SECURITY_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'Critical' ? 'text-red-600' : issue.severity === 'High' ? 'text-destructive' : 'text-amber-500'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                    {issue.severity === 'Critical' && <Badge variant="destructive">Critical</Badge>}
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
                    {issue.crossRef && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📖 {issue.crossRef}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <WarningCallout title="Security Incident Response">
        SEC-003 (cross-company data leakage) is a Critical severity security incident. 
        Immediately escalate to security team, restrict access, and document for compliance reporting. 
        Do not attempt to fix without security oversight.
      </WarningCallout>

      <InfoCallout title="RLS Testing Pattern">
        Test RLS policies by setting auth.uid() and auth.jwt() claims in a test environment, 
        then querying tables directly. This validates policy logic before user reports issues.
      </InfoCallout>
    </div>
  );
}
