import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const PROGRESS_ISSUES = [
  {
    id: 'PRG-001',
    symptom: 'Lesson marked complete but course progress not updating',
    severity: 'High',
    cause: 'Progress aggregation trigger not running, or lesson completion not committed to database, or cache stale.',
    resolution: [
      'Verify lesson progress record exists in lms_lesson_progress table',
      'Check if progress_percentage in lms_enrollments is recalculating',
      'Force refresh the progress aggregation by re-opening the course',
      'Clear browser cache and local storage',
      'Check for any database trigger errors in system logs'
    ],
    prevention: 'Ensure progress aggregation triggers are enabled. Monitor progress sync health dashboard.'
  },
  {
    id: 'PRG-002',
    symptom: 'Course progress percentage showing incorrect value',
    severity: 'High',
    cause: 'Lesson weighting misconfigured, or some lessons excluded from calculation, or module progress not aggregating.',
    resolution: [
      'Review lesson count and completed lesson count',
      'Check if all lessons are included in progress calculation',
      'Verify module_progress records are updating correctly',
      'Recalculate progress using admin progress sync tool',
      'Compare expected vs actual formula: (completed_lessons / total_lessons) * 100'
    ],
    prevention: 'Use uniform lesson weighting. Test progress calculation with sample completions before go-live.'
  },
  {
    id: 'PRG-003',
    symptom: 'Video playback not recording completion',
    severity: 'High',
    cause: 'Video player completion threshold not met (default 90%), or player events not firing, or network interruption.',
    resolution: [
      'Verify video was watched to completion threshold (configurable %)',
      'Check if video player is sending completion events to LMS',
      'Test with different browser or device',
      'Verify network connectivity during playback',
      'Check video lesson configuration for completion criteria'
    ],
    prevention: 'Set appropriate completion thresholds. Use progress save points for long videos.'
  },
  {
    id: 'PRG-004',
    symptom: 'SCORM completion status not syncing to LMS',
    severity: 'High',
    cause: 'SCORM API communication failing, or package using non-standard completion criteria, or browser blocking postMessage.',
    resolution: [
      'Check lms_scorm_tracking table for latest statement',
      'Verify SCORM package is sending cmi.core.lesson_status correctly',
      'Test in different browser (disable extensions)',
      'Check browser console for SCORM API errors',
      'Re-upload SCORM package with correct completion settings'
    ],
    prevention: 'Test SCORM packages in SCORM Cloud before deploying. Use standardized completion criteria.'
  },
  {
    id: 'PRG-005',
    symptom: 'Multiple browser tabs causing progress conflicts',
    severity: 'Medium',
    cause: 'Concurrent session detection not enabled, or race condition in progress updates, or browser sync conflict.',
    resolution: [
      'Close all browser tabs except one',
      'Wait 30 seconds for session to stabilize',
      'Refresh the remaining tab and continue course',
      'If conflict persists, clear browser data and restart',
      'Consider enabling concurrent session blocking in LMS settings'
    ],
    prevention: 'Enable single-session enforcement for courses. Warn users about multi-tab issues.'
  },
  {
    id: 'PRG-006',
    symptom: 'Progress resetting after browser refresh',
    severity: 'High',
    cause: 'Progress not saved to server before refresh, or bookmark feature not enabled, or session expired.',
    resolution: [
      'Verify auto-save interval is configured (default 30 seconds)',
      'Check if lesson bookmark is being created on exit',
      'Review session timeout settings',
      'Test progress persistence with manual save before refresh',
      'Check for JavaScript errors preventing progress save'
    ],
    prevention: 'Enable auto-save with 15-30 second intervals. Implement exit save handlers.'
  },
  {
    id: 'PRG-007',
    symptom: 'Offline mode progress not syncing on reconnect',
    severity: 'Medium',
    cause: 'Offline queue corrupted, or sync endpoint unreachable, or local storage cleared.',
    resolution: [
      'Verify offline queue exists in browser local storage',
      'Check network connectivity to sync endpoint',
      'Manually trigger offline sync from course player settings',
      'If queue is corrupted, may need to redo offline progress',
      'Check browser storage limits for the domain'
    ],
    prevention: 'Communicate offline sync requirements. Test offline workflow before rollout.'
  },
  {
    id: 'PRG-008',
    symptom: 'Module unlock not triggering after prerequisite module completion',
    severity: 'High',
    cause: 'Module prerequisite relationship not configured, or completion status not propagating, or unlock logic error.',
    resolution: [
      'Verify prerequisite module relationship in course structure',
      'Check prerequisite module status is "completed"',
      'Force refresh course structure to re-evaluate unlock logic',
      'Check for any conditional unlock rules that may be blocking',
      'Review module unlock trigger in system logs'
    ],
    prevention: 'Test module unlock sequences before publishing. Document prerequisite chains.'
  },
  {
    id: 'PRG-009',
    symptom: 'Learning path progress not aggregating course completions',
    severity: 'High',
    cause: 'Learning path progress trigger not running, or course completion not linked to path, or calculation error.',
    resolution: [
      'Verify course enrollment is linked to learning path enrollment',
      'Check learning_path_course_progress table for completion records',
      'Force recalculate learning path progress via admin tool',
      'Verify all path courses are using same completion criteria',
      'Check for any errors in path progress aggregation job'
    ],
    prevention: 'Test path progress with sample completions. Monitor path completion analytics.'
  },
  {
    id: 'PRG-010',
    symptom: 'Time spent tracking showing inaccurate values',
    severity: 'Low',
    cause: 'Idle timeout not configured, or browser tab tracking inaccurate, or time sync issues.',
    resolution: [
      'Review idle timeout configuration (default 15 minutes)',
      'Check if time tracking includes background tab time',
      'Compare server-side vs client-side time calculations',
      'Reset time tracking for affected enrollments if needed',
      'Consider using video playback time as more accurate metric'
    ],
    prevention: 'Configure appropriate idle timeout. Use activity-based rather than session-based tracking.'
  },
];

const QUICK_REFERENCE = [
  { id: 'PRG-001', symptom: 'Progress not updating', severity: 'High' },
  { id: 'PRG-004', symptom: 'SCORM not syncing', severity: 'High' },
  { id: 'PRG-006', symptom: 'Progress resetting on refresh', severity: 'High' },
  { id: 'PRG-008', symptom: 'Module not unlocking', severity: 'High' },
  { id: 'PRG-009', symptom: 'Path progress not aggregating', severity: 'High' },
];

export function LndProgressTrackingIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-4" data-manual-anchor="sec-9-4" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.4 Progress Tracking Issues</h3>
          <p className="text-muted-foreground mt-1">
            Lesson completion, SCORM sync, progress calculation, module unlock, and time tracking troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose lesson and course progress calculation errors',
          'Troubleshoot SCORM/xAPI completion status synchronization',
          'Resolve progress persistence and browser refresh issues',
          'Fix module prerequisite unlock failures',
          'Address learning path progress aggregation problems'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Issues Quick Reference
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

      <WarningCallout title="SCORM Tracking Critical">
        SCORM completion issues are the most common progress tracking problem. Always test SCORM packages 
        with a dedicated SCORM validation tool (like SCORM Cloud) before uploading to production LMS.
      </WarningCallout>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution (10 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {PROGRESS_ISSUES.map((issue) => (
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

      <TipCallout title="Progress Diagnostics Query">
        Use this diagnostic query to identify progress mismatches:{' '}
        <code className="text-xs bg-muted px-1 rounded">
          SELECT enrollment_id, expected_progress, actual_progress FROM progress_audit_view WHERE mismatch = true
        </code>
      </TipCallout>
    </div>
  );
}
