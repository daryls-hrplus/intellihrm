import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileQuestion, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const QUIZ_ISSUES = [
  {
    id: 'QIZ-001',
    symptom: 'Quiz score not calculating correctly',
    severity: 'High',
    cause: 'Question weights misconfigured, partial credit logic error, or correct_option_index mismatch.',
    resolution: [
      'Review question weights in lms_quiz_questions table',
      'Verify correct_option_index matches the correct answer position',
      'Check if partial credit is enabled for multiple-select questions',
      'Recalculate score using: (points_earned / total_points) * 100',
      'Compare expected vs actual scoring in quiz attempt details'
    ],
    prevention: 'Test all quizzes with known answers before publishing. Use consistent scoring formulas.'
  },
  {
    id: 'QIZ-002',
    symptom: 'Time limit not enforcing auto-submit',
    severity: 'High',
    cause: 'Client-side timer disconnected, server-side validation disabled, or browser timezone mismatch.',
    resolution: [
      'Verify time_limit_minutes is set on the quiz',
      'Check if auto_submit_on_timeout is enabled',
      'Test timer in incognito mode to rule out extensions',
      'Verify server and client clocks are synchronized',
      'Check for JavaScript errors in browser console'
    ],
    prevention: 'Enable server-side time validation. Test timers across different browsers.'
  },
  {
    id: 'QIZ-003',
    symptom: 'Retake attempts exceeded but quiz still allowing attempts',
    severity: 'Medium',
    cause: 'max_attempts not configured, or attempt count query incorrect, or admin override enabled.',
    resolution: [
      'Verify max_attempts is set on the quiz configuration',
      'Count existing attempts in lms_quiz_attempts table',
      'Check if admin override is allowing extra attempts',
      'Verify attempt counting includes failed attempts',
      'Reset attempt count if legitimate retake is needed'
    ],
    prevention: 'Set max_attempts during quiz creation. Document retake policy clearly.'
  },
  {
    id: 'QIZ-004',
    symptom: 'Shuffled questions showing same order every time',
    severity: 'Low',
    cause: 'shuffle_questions not enabled, or random seed is deterministic, or cache serving same order.',
    resolution: [
      'Verify shuffle_questions = true in quiz settings',
      'Clear browser cache and retry',
      'Check if quiz is cached at CDN level',
      'Verify random seed is not using user ID deterministically'
    ],
    prevention: 'Enable true randomization. Test shuffling with multiple attempts.'
  },
  {
    id: 'QIZ-005',
    symptom: 'Correct answers displayed before submission',
    severity: 'High',
    cause: 'show_correct_answers setting misconfigured, or answers exposed in page source, or security bypass.',
    resolution: [
      'Verify show_correct_answers = "after_submission" or "never"',
      'Check that correct answers are not in client-side JavaScript',
      'Review quiz API response for answer leakage',
      'Enable server-side answer validation only'
    ],
    prevention: 'Never send correct answers to client before submission. Use server-side validation.'
  },
  {
    id: 'QIZ-006',
    symptom: 'Essay/open-ended questions not submitting',
    severity: 'High',
    cause: 'Text area validation failing, character limit exceeded, or special characters causing parse error.',
    resolution: [
      'Check character count against max_length limit',
      'Remove any special characters or formatting',
      'Try submitting shorter response as test',
      'Check browser console for submission errors',
      'Verify essay question type is properly configured'
    ],
    prevention: 'Set reasonable character limits. Show character count to users.'
  },
  {
    id: 'QIZ-007',
    symptom: 'Quiz attempt not saving on network interruption',
    severity: 'High',
    cause: 'Auto-save disabled, or offline mode not enabled, or session expired during attempt.',
    resolution: [
      'Check if auto-save interval is configured',
      'Verify local storage has attempt backup',
      'Look for partial attempt in lms_quiz_attempts table',
      'Enable auto-save with 30-second interval',
      'Consider allowing attempt resume if partially saved'
    ],
    prevention: 'Enable auto-save for all timed quizzes. Implement attempt recovery mechanism.'
  },
  {
    id: 'QIZ-008',
    symptom: 'Passing score not updating enrollment status to completed',
    severity: 'High',
    cause: 'Quiz is not set as course completion criteria, or status update trigger failing, or passing_score mismatch.',
    resolution: [
      'Verify quiz is linked to course completion criteria',
      'Check passing_score threshold matches configuration',
      'Verify enrollment status update trigger is active',
      'Manually update enrollment status as workaround',
      'Check for errors in completion status trigger logs'
    ],
    prevention: 'Link quizzes to completion criteria during course setup. Test pass/fail scenarios.'
  },
  {
    id: 'QIZ-009',
    symptom: 'AI-generated quiz questions missing difficulty balance',
    severity: 'Medium',
    cause: 'Bloom taxonomy distribution not specified, or source content too narrow, or AI model limitations.',
    resolution: [
      'Review bloom_taxonomy_distribution in generation request',
      'Provide more comprehensive source content for generation',
      'Manually adjust question difficulty after generation',
      'Use difficulty_score field to rebalance question pool'
    ],
    prevention: 'Specify Bloom taxonomy targets. Review and edit AI-generated questions before publishing.'
  },
  {
    id: 'QIZ-010',
    symptom: 'Question pool not randomizing selection correctly',
    severity: 'Low',
    cause: 'Pool size equals display count, or selection algorithm not working, or same seed used.',
    resolution: [
      'Verify question pool size > questions to display',
      'Check question_pool_size and questions_per_attempt settings',
      'Test with larger pool to verify randomization',
      'Clear any quiz caching if enabled'
    ],
    prevention: 'Ensure pool size is at least 2x display count. Test randomization with multiple users.'
  },
  {
    id: 'QIZ-011',
    symptom: 'Partial credit not calculating for multiple-select questions',
    severity: 'Medium',
    cause: 'Partial credit disabled, or scoring formula incorrect, or all-or-nothing mode enabled.',
    resolution: [
      'Verify partial_credit_enabled = true for the question',
      'Check scoring formula: points = (correct_selected / total_correct) * max_points',
      'Verify question is configured as multiple-select type',
      'Test with known answer combinations'
    ],
    prevention: 'Enable partial credit during question creation. Document scoring formula to users.'
  },
  {
    id: 'QIZ-012',
    symptom: 'Quiz review mode showing blank answers',
    severity: 'Medium',
    cause: 'Answers not stored in attempt record, or review mode fetching wrong attempt, or data migration issue.',
    resolution: [
      'Verify user_answers JSON is populated in lms_quiz_attempts',
      'Check review mode is loading correct attempt ID',
      'Verify question IDs match between attempt and current quiz',
      'If data missing, attempt review may not be possible'
    ],
    prevention: 'Always store complete answer data with attempts. Test review mode before go-live.'
  },
];

const QUICK_REFERENCE = [
  { id: 'QIZ-001', symptom: 'Score calculating incorrectly', severity: 'High' },
  { id: 'QIZ-002', symptom: 'Timer not auto-submitting', severity: 'High' },
  { id: 'QIZ-005', symptom: 'Answers exposed before submission', severity: 'High' },
  { id: 'QIZ-007', symptom: 'Attempt lost on network issue', severity: 'High' },
  { id: 'QIZ-008', symptom: 'Pass not updating completion', severity: 'High' },
];

export function LndQuizAssessmentIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-5" data-manual-anchor="sec-9-5" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~12 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin</span>
          </div>
          <h3 className="text-xl font-semibold">9.5 Quiz & Assessment Issues</h3>
          <p className="text-muted-foreground mt-1">
            Scoring, timing, retakes, randomization, answer security, and AI quiz generation troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve quiz scoring calculation errors',
          'Troubleshoot time limit enforcement and auto-submit issues',
          'Fix question randomization and pool selection problems',
          'Address answer security and exposure vulnerabilities',
          'Resolve AI-generated quiz quality and balance issues'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Quiz Issues Quick Reference
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

      <WarningCallout title="Answer Security Critical">
        QIZ-005 (answers exposed before submission) is a critical security issue. If detected, immediately 
        disable the quiz, investigate the exposure, and consider voiding affected attempts.
      </WarningCallout>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution (12 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {QUIZ_ISSUES.map((issue) => (
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

      <TipCallout title="Quiz Testing Checklist">
        Before publishing any quiz: (1) Take the quiz as a test user, (2) Verify scoring formula, 
        (3) Test time limit enforcement, (4) Confirm retake policy, (5) Review answer display settings.
      </TipCallout>
    </div>
  );
}
