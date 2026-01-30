import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accessibility, Clock, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ACCESSIBILITY_ISSUES = [
  {
    id: 'ACC-001',
    symptom: 'Screen reader not announcing course content correctly',
    severity: 'High',
    cause: 'Missing ARIA labels, improper heading hierarchy, dynamic content not announced.',
    resolution: [
      'Run accessibility audit with WAVE or axe-core tools',
      'Add aria-label and aria-describedby to interactive elements',
      'Ensure heading levels are sequential (h1 → h2 → h3)',
      'Use aria-live regions for dynamic content updates',
      'Test with NVDA, JAWS, and VoiceOver screen readers'
    ],
    prevention: 'Include accessibility testing in QA. Use semantic HTML elements.'
  },
  {
    id: 'ACC-002',
    symptom: 'Keyboard navigation failing in quiz player',
    severity: 'High',
    cause: 'Focus trapping in modal, tab order incorrect, or custom components not keyboard accessible.',
    resolution: [
      'Verify tab order follows logical content flow',
      'Add keyboard handlers (Enter, Space) to custom buttons',
      'Implement focus trapping for modals with Escape key exit',
      'Test complete quiz flow using only keyboard',
      'Add visible focus indicators to all interactive elements'
    ],
    prevention: 'Test keyboard navigation during development. Follow WCAG 2.1 guidelines.'
  },
  {
    id: 'ACC-003',
    symptom: 'Color contrast insufficient for visually impaired users',
    severity: 'Medium',
    cause: 'Text/background ratio below WCAG standards, brand colors not accessible.',
    resolution: [
      'Check contrast ratios using WebAIM contrast checker',
      'Ensure text meets 4.5:1 ratio (AA) or 7:1 (AAA)',
      'Use accessible color alternatives for brand colors',
      'Add text underlining or icons in addition to color',
      'Test with color blindness simulation tools'
    ],
    prevention: 'Establish accessible color palette during design. Test with real users.'
  },
  {
    id: 'ACC-004',
    symptom: 'Mobile app lesson progress not syncing to web platform',
    severity: 'High',
    cause: 'Offline mode sync pending, API authentication expired, or conflicting timestamps.',
    resolution: [
      'Force sync from mobile app settings',
      'Verify user is logged into same account on both platforms',
      'Check for pending offline actions in app storage',
      'Clear app cache and re-login',
      'Compare timestamps in lms_lesson_progress across devices'
    ],
    prevention: 'Implement real-time sync. Show sync status indicator in app.'
  },
  {
    id: 'ACC-005',
    symptom: 'Offline downloaded content corrupted or inaccessible',
    severity: 'Medium',
    cause: 'Download interrupted, storage quota exceeded, or content format incompatible.',
    resolution: [
      'Delete and re-download affected content',
      'Check device storage availability (minimum 500MB)',
      'Verify content formats are mobile-compatible',
      'Clear app cache and retry download',
      'Check download logs for error details'
    ],
    prevention: 'Validate downloads after completion. Show storage requirements before download.'
  },
  {
    id: 'ACC-006',
    symptom: 'Push notifications not delivering on mobile devices',
    severity: 'Medium',
    cause: 'Notification permissions denied, device token expired, or notification service outage.',
    resolution: [
      'Verify notification permissions in device settings',
      'Check app notification settings are enabled',
      'Re-register device token from app settings',
      'Test with push notification service dashboard',
      'Check if device is on Do Not Disturb mode'
    ],
    prevention: 'Request notification permission contextually. Monitor delivery rates.'
  },
  {
    id: 'ACC-007',
    symptom: 'Content not displaying in user\'s preferred language',
    severity: 'Medium',
    cause: 'User locale not detected, translation not available, or fallback not configured.',
    resolution: [
      'Verify user language preference in profile settings',
      'Check if course has translations for target language',
      'Configure fallback language in L&D settings',
      'Clear browser/app cache to refresh locale settings',
      'Test with browser language detection disabled'
    ],
    prevention: 'Create translations during content authoring. Test with multi-language users.'
  },
  {
    id: 'ACC-008',
    symptom: 'Timezone causing incorrect due date display',
    severity: 'Medium',
    cause: 'Server timezone mismatch, user timezone not detected, or DST not handled.',
    resolution: [
      'Verify user timezone in profile settings',
      'Check if due dates are stored in UTC and converted on display',
      'Test across different timezones',
      'Verify DST transition handling',
      'Show timezone indicator next to due dates'
    ],
    prevention: 'Store all dates in UTC. Always display with user\'s local timezone.'
  },
];

const QUICK_REFERENCE = [
  { id: 'ACC-001', symptom: 'Screen reader not announcing', severity: 'High' },
  { id: 'ACC-002', symptom: 'Keyboard navigation failing', severity: 'High' },
  { id: 'ACC-004', symptom: 'Mobile progress not syncing', severity: 'High' },
  { id: 'ACC-008', symptom: 'Timezone due date incorrect', severity: 'Medium' },
];

export function LndAccessibilityMobileIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-13" data-manual-anchor="sec-9-13" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.13 Accessibility, Mobile & Localization Issues</h3>
          <p className="text-muted-foreground mt-1">
            WCAG compliance, screen reader, keyboard navigation, mobile app sync, and timezone troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve screen reader and keyboard accessibility issues (WCAG 2.1)',
          'Troubleshoot mobile app synchronization and offline content problems',
          'Fix push notification delivery failures across devices',
          'Address content localization and language display issues',
          'Resolve timezone and regional formatting discrepancies'
        ]}
      />

      <InfoCallout title="WCAG 2.1 Compliance">
        ACC-001 and ACC-002 are critical for WCAG 2.1 Level AA compliance. Organizations subject to 
        accessibility regulations (ADA, Section 508) must prioritize these issues.
      </InfoCallout>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-primary" />
            Accessibility & Mobile Issues Quick Reference
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
                      <Badge variant={item.severity === 'High' ? 'destructive' : 'default'}>
                        {item.severity}
                      </Badge>
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
            <Smartphone className="h-5 w-5 text-primary" />
            Detailed Issue Resolution (8 Issues)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {ACCESSIBILITY_ISSUES.map((issue) => (
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

      <TipCallout title="Accessibility Testing Tools">
        Use automated tools (axe-core, WAVE) for initial audits, but always validate with manual testing 
        using actual assistive technologies. Include users with disabilities in usability testing.
      </TipCallout>
    </div>
  );
}
