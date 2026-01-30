import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Target, Search, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { LearningObjectives, InfoCallout, TipCallout } from '../../../manual/components';

const DIAGNOSTIC_METHODOLOGY = [
  { phase: '1. Identify', description: 'Recognize symptoms and gather initial information from user reports', time: '2-5 min' },
  { phase: '2. Diagnose', description: 'Analyze root cause using diagnostic checklists and database queries', time: '5-15 min' },
  { phase: '3. Resolve', description: 'Apply appropriate resolution steps from issue database', time: '5-30 min' },
  { phase: '4. Prevent', description: 'Document findings and implement preventive measures', time: '5-10 min' },
];

const SYMPTOM_TO_SECTION = [
  { symptom: 'Category not appearing in course dropdown', section: '9.2', category: 'Setup' },
  { symptom: 'Course not visible in catalog', section: '9.3', category: 'Enrollment' },
  { symptom: 'Self-enrollment button disabled', section: '9.3', category: 'Enrollment' },
  { symptom: 'Lesson progress not updating', section: '9.4', category: 'Progress' },
  { symptom: 'SCORM completion not syncing', section: '9.4', category: 'Progress' },
  { symptom: 'Quiz score incorrect', section: '9.5', category: 'Quiz' },
  { symptom: 'Certificate not generating', section: '9.6', category: 'Certificate' },
  { symptom: 'Compliance rule not auto-assigning', section: '9.7', category: 'Compliance' },
  { symptom: 'Vendor course not in catalog', section: '9.8', category: 'Vendor' },
  { symptom: 'Onboarding enrollment not triggering', section: '9.9', category: 'Integration' },
  { symptom: 'AI recommendations not appearing', section: '9.10', category: 'AI' },
  { symptom: 'Analytics dashboard timing out', section: '9.11', category: 'Performance' },
  { symptom: 'Screen reader not announcing content', section: '9.13', category: 'Accessibility' },
  { symptom: 'Mobile app progress not syncing', section: '9.13', category: 'Mobile' },
  { symptom: 'Content not in user preferred language', section: '9.13', category: 'Localization' },
  { symptom: 'GDPR data export incomplete', section: '9.14', category: 'Data Management' },
  { symptom: 'Audit log entries missing', section: '9.14', category: 'Data Management' },
];

const CROSS_REFERENCES = [
  { chapter: '2.1-2.16', title: 'Setup & Configuration Guide', scope: 'Inline troubleshooting for each configuration step' },
  { chapter: '4.1-4.28', title: 'Operational Workflows', scope: 'Workflow-specific issue resolution per ADDIE phase' },
  { chapter: '5.1-5.26', title: 'Compliance Training', scope: 'Compliance-specific diagnostic procedures' },
  { chapter: '8.12', title: 'Integration Troubleshooting', scope: 'Cross-module sync failure analysis' },
];

export function LndTroubleshootingOverview() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-1" data-manual-anchor="sec-9-1" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.1 Troubleshooting Overview</h3>
          <p className="text-muted-foreground mt-1">
            Diagnostic methodology, chapter scope, quick reference matrix, and escalation decision tree
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Apply the 4-phase diagnostic methodology (Identify → Diagnose → Resolve → Prevent)',
          'Navigate between Chapter 9 quick-reference and domain-specific troubleshooting sections',
          'Use the symptom-to-section matrix for rapid issue identification',
          'Determine when to self-service vs. escalate based on issue severity',
          'Understand issue ID conventions (LMS-XXX, ENR-XXX, etc.) for efficient support communication'
        ]}
      />

      {/* Chapter Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Chapter 9 Scope & Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chapter 9 serves as the <strong>consolidated troubleshooting hub</strong> for the Learning & Development module. 
            It covers <strong>144 documented issues</strong> across 14 functional domains with standardized resolution procedures.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Chapter 9 Provides:
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Setup & configuration issue resolution</li>
                <li>• Enrollment & access troubleshooting</li>
                <li>• Progress tracking diagnostics</li>
                <li>• Quiz, certificate, and compliance issues</li>
                <li>• AI/automation and integration failures</li>
                <li>• Escalation procedures and FAQs</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Domain Chapters Provide:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ch 2: Setup inline troubleshooting</li>
                <li>• Ch 4: Workflow-specific issues</li>
                <li>• Ch 5: Compliance diagnostics</li>
                <li>• Ch 6: AI feature troubleshooting</li>
                <li>• Ch 8.12: Integration failure analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            4-Phase Diagnostic Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {DIAGNOSTIC_METHODOLOGY.map((phase, index) => (
              <div key={phase.phase} className="relative">
                <div className="bg-muted/50 p-4 rounded-lg h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
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
            <Search className="h-5 w-5 text-primary" />
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
        <p className="text-sm mb-2">All 144 documented issues use standardized IDs for efficient support communication:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><code className="bg-muted px-1 rounded">LMS-XXX</code> Setup/Config</div>
          <div><code className="bg-muted px-1 rounded">ENR-XXX</code> Enrollment</div>
          <div><code className="bg-muted px-1 rounded">PRG-XXX</code> Progress</div>
          <div><code className="bg-muted px-1 rounded">QIZ-XXX</code> Quiz</div>
          <div><code className="bg-muted px-1 rounded">CRT-XXX</code> Certificate</div>
          <div><code className="bg-muted px-1 rounded">CMP-XXX</code> Compliance</div>
          <div><code className="bg-muted px-1 rounded">VND-XXX</code> Vendor</div>
          <div><code className="bg-muted px-1 rounded">INT-XXX</code> Integration</div>
          <div><code className="bg-muted px-1 rounded">AIA-XXX</code> AI/Automation</div>
          <div><code className="bg-muted px-1 rounded">PER-XXX</code> Performance</div>
          <div><code className="bg-muted px-1 rounded">ACC-XXX</code> Accessibility/Mobile</div>
          <div><code className="bg-muted px-1 rounded">DMC-XXX</code> Data Management</div>
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
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Self-Service (L1-L2)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Configuration adjustments (categories, courses, quizzes)</li>
                <li>• Single-user enrollment or access issues</li>
                <li>• Progress tracking discrepancies</li>
                <li>• Standard workflow troubleshooting</li>
                <li>• Documentation or how-to questions</li>
              </ul>
            </div>
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">⚠ Escalate (L3-L4)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Data corruption or integrity issues</li>
                <li>• System-wide performance degradation</li>
                <li>• SCORM/xAPI tracking failures across courses</li>
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
