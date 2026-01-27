import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Target, Search, ArrowRight, BookOpen } from 'lucide-react';
import { LearningObjectives, InfoCallout, TipCallout, WarningCallout } from '../../../components';

const DIAGNOSTIC_METHODOLOGY = [
  { phase: '1. Identify', description: 'Recognize symptoms and gather initial information', time: '2-5 min' },
  { phase: '2. Diagnose', description: 'Analyze root cause using diagnostic checklists', time: '5-15 min' },
  { phase: '3. Resolve', description: 'Apply appropriate resolution steps', time: '5-30 min' },
  { phase: '4. Prevent', description: 'Document findings and implement preventive measures', time: '5-10 min' },
];

const SYMPTOM_TO_SECTION = [
  { symptom: 'Assessor weights not summing to 100%', section: '11.2', category: 'Configuration' },
  { symptom: 'Nine-Box showing "No data" for axis', section: '11.3', category: 'Nine-Box' },
  { symptom: 'Readiness score calculation mismatch', section: '11.4', category: 'Readiness' },
  { symptom: 'Candidate not appearing in pool', section: '11.5', category: 'Talent Pool' },
  { symptom: 'Workflow stuck in pending state', section: '11.6', category: 'Workflow' },
  { symptom: 'Import file validation errors', section: '11.7', category: 'Data Quality' },
  { symptom: 'User cannot see succession data', section: '11.8', category: 'Security' },
  { symptom: 'AI suggestions not appearing', section: '11.9', category: 'AI/Automation' },
  { symptom: 'Performance data not syncing', section: '9.12', category: 'Integration' },
  { symptom: 'Flight risk assessment missing data', section: '7.10', category: 'Risk' },
];

const CROSS_REFERENCES = [
  { chapter: '7.10', title: 'Risk Management Troubleshooting', scope: '12 issues, 6 FAQs on flight risk and retention' },
  { chapter: '9.12', title: 'Integration Troubleshooting', scope: '8 issues, diagnostic checklist for cross-module sync' },
  { chapter: '10.12', title: 'Analytics Troubleshooting', scope: '10 issues, data quality checklist for reporting' },
];

export function TroubleshootingOverview() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-1" data-manual-anchor="sec-11-1" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">11.1 Troubleshooting Overview</h3>
          <p className="text-muted-foreground mt-1">
            Diagnostic methodology, chapter scope, quick reference matrix, and escalation decision tree
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Apply the 4-phase diagnostic methodology (Identify → Diagnose → Resolve → Prevent)',
          'Navigate between Chapter 11 quick-reference and domain-specific troubleshooting sections',
          'Use the symptom-to-section matrix for rapid issue identification',
          'Determine when to self-service vs. escalate based on issue severity',
          'Understand issue ID conventions (CFG-XXX, NBX-XXX, etc.) for efficient support communication'
        ]}
      />

      {/* Chapter Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-600" />
            Chapter 11 Scope & Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chapter 11 serves as the <strong>consolidated quick-reference hub</strong> for succession planning troubleshooting. 
            For deep-dive domain-specific issues, cross-reference the dedicated troubleshooting sections in Chapters 7, 9, and 10.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Chapter 11 Provides:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Consolidated quick-reference troubleshooting</li>
                <li>• Configuration and setup issue resolution</li>
                <li>• Workflow and approval diagnostics</li>
                <li>• Security and permission guidance</li>
                <li>• Escalation procedures and FAQ</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Domain Chapters Provide:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ch 7.10: Risk management deep-dive</li>
                <li>• Ch 9.12: Integration failure analysis</li>
                <li>• Ch 10.12: Analytics data quality</li>
                <li>• Inline troubleshooting per workflow section</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            4-Phase Diagnostic Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {DIAGNOSTIC_METHODOLOGY.map((phase, index) => (
              <div key={phase.phase} className="relative">
                <div className="bg-muted/50 p-4 rounded-lg h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{phase.phase.split('.')[1].trim()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{phase.description}</p>
                  <Badge variant="outline" className="text-xs">{phase.time}</Badge>
                </div>
                {index < DIAGNOSTIC_METHODOLOGY.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Symptom-to-Section Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-orange-600" />
            Quick Reference: Symptom → Section Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Symptom</th>
                  <th className="text-left py-2 font-medium">Section</th>
                  <th className="text-left py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {SYMPTOM_TO_SECTION.map((item, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">{item.symptom}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="font-mono">{item.section}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge variant="secondary">{item.category}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cross-References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Domain-Specific Troubleshooting Cross-References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CROSS_REFERENCES.map((ref) => (
              <div key={ref.chapter} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Badge className="bg-blue-600 flex-shrink-0">Ch {ref.chapter}</Badge>
                <div>
                  <p className="font-medium text-sm">{ref.title}</p>
                  <p className="text-xs text-muted-foreground">{ref.scope}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issue ID Convention */}
      <InfoCallout title="Issue ID Convention">
        <p className="text-sm mb-2">All documented issues use standardized IDs for efficient support communication:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><code className="bg-muted px-1 rounded">CFG-XXX</code> Configuration</div>
          <div><code className="bg-muted px-1 rounded">NBX-XXX</code> Nine-Box</div>
          <div><code className="bg-muted px-1 rounded">RDY-XXX</code> Readiness</div>
          <div><code className="bg-muted px-1 rounded">TPL-XXX</code> Talent Pool</div>
          <div><code className="bg-muted px-1 rounded">WKF-XXX</code> Workflow</div>
          <div><code className="bg-muted px-1 rounded">DTA-XXX</code> Data Quality</div>
          <div><code className="bg-muted px-1 rounded">SEC-XXX</code> Security</div>
          <div><code className="bg-muted px-1 rounded">AIA-XXX</code> AI/Automation</div>
        </div>
      </InfoCallout>

      {/* Escalation Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            When to Self-Service vs. Escalate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Self-Service (Tier 1-2)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Configuration adjustments (weights, bands, forms)</li>
                <li>• Single-user access issues</li>
                <li>• Data refresh timing questions</li>
                <li>• Standard workflow troubleshooting</li>
                <li>• Documentation clarification needs</li>
              </ul>
            </div>
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">⚠ Escalate (Tier 3-4)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Data corruption or integrity issues</li>
                <li>• System-wide performance degradation</li>
                <li>• Security breaches or access leaks</li>
                <li>• Integration failures affecting production</li>
                <li>• Issues persisting after 2+ resolution attempts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout title="Best Practice">
        Before escalating any issue, always document: (1) Steps to reproduce, (2) Expected vs. actual behavior, 
        (3) Screenshots or console logs, and (4) Issue ID from this chapter. This accelerates resolution time by 40%.
      </TipCallout>
    </div>
  );
}
