import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const PERFORMANCE_ISSUES = [
  {
    id: 'PER-001',
    symptom: 'Course catalog loading slowly (>5 seconds)',
    severity: 'Medium',
    cause: 'Too many courses without pagination, unoptimized queries, or missing database indexes.',
    resolution: [
      'Implement pagination for course catalog (20-50 per page)',
      'Review catalog query execution plan for bottlenecks',
      'Add indexes on frequently filtered columns (category_id, status)',
      'Enable query caching for catalog requests',
      'Consider lazy loading for course thumbnails'
    ],
    prevention: 'Design for scale from start. Monitor query performance regularly.'
  },
  {
    id: 'PER-002',
    symptom: 'Analytics dashboard timing out or very slow',
    severity: 'High',
    cause: 'Complex aggregations on large datasets, no materialized views, or concurrent user load.',
    resolution: [
      'Create materialized views for common analytics queries',
      'Add date range limits to default dashboard view',
      'Implement async loading for heavy widgets',
      'Review and optimize slow queries',
      'Consider caching dashboard data with 15-min refresh'
    ],
    prevention: 'Use materialized views for analytics. Schedule off-peak refresh jobs.'
  },
  {
    id: 'PER-003',
    symptom: 'Training history showing duplicate enrollment records',
    severity: 'Medium',
    cause: 'Multiple enrollment sources creating duplicates, or re-enrollment logic error.',
    resolution: [
      'Query for duplicate employee-course combinations',
      'Identify source of duplicates (manual, bulk, integration)',
      'Merge or delete duplicate records as appropriate',
      'Add unique constraint on employee_id + course_id',
      'Review enrollment creation logic to prevent future duplicates'
    ],
    prevention: 'Implement unique constraint on enrollments. Validate before creating new records.'
  },
  {
    id: 'PER-004',
    symptom: 'Report export truncating at 1000 rows',
    severity: 'Medium',
    cause: 'Default query limit applied, or export limit configured, or Supabase row limit.',
    resolution: [
      'Increase export row limit in report configuration',
      'Use pagination for exports (1000 rows per batch)',
      'Implement async export for large datasets',
      'Check Supabase query default limit settings',
      'Consider streaming export for very large reports'
    ],
    prevention: 'Configure appropriate export limits. Warn users about large exports.'
  },
  {
    id: 'PER-005',
    symptom: 'Real-time progress updates not reflecting immediately',
    severity: 'Medium',
    cause: 'Realtime subscription not active, or progress event not broadcasting, or connection dropped.',
    resolution: [
      'Verify realtime subscription is connected',
      'Check progress update events are being broadcast',
      'Test with manual event trigger',
      'Reconnect realtime channel if connection dropped',
      'Implement polling fallback for realtime failures'
    ],
    prevention: 'Monitor realtime connection health. Implement reconnection logic.'
  },
  {
    id: 'PER-006',
    symptom: 'Browser memory leak during long video playback sessions',
    severity: 'Medium',
    cause: 'Video player not releasing memory, too many listeners, or progress tracking accumulating.',
    resolution: [
      'Ensure video player cleanup on unmount',
      'Remove event listeners properly when leaving course',
      'Limit progress tracking frequency (e.g., every 30 seconds)',
      'Monitor browser memory usage in dev tools',
      'Recommend users refresh browser for long sessions'
    ],
    prevention: 'Test video player memory usage. Implement proper cleanup handlers.'
  },
  {
    id: 'PER-007',
    symptom: 'Search not finding newly created courses',
    severity: 'Medium',
    cause: 'Search index not updated, indexing job delayed, or course not meeting index criteria.',
    resolution: [
      'Check search index last update time',
      'Manually trigger search reindex for new courses',
      'Verify course status is "Published" (may filter unpublished)',
      'Review search indexing criteria',
      'Wait for next scheduled index refresh (typically 15 min)'
    ],
    prevention: 'Schedule frequent search index updates. Index on course publish.'
  },
  {
    id: 'PER-008',
    symptom: 'Data migration causing orphaned enrollments or progress records',
    severity: 'High',
    cause: 'Migration script missing foreign key checks, or source data inconsistent, or rollback incomplete.',
    resolution: [
      'Identify orphaned records with no matching parent',
      'Decide: link to correct parent, archive, or delete',
      'Run data quality cleanup script',
      'Verify foreign key constraints are intact',
      'Document cleanup actions for audit'
    ],
    prevention: 'Validate migration scripts in test environment. Include rollback procedures.'
  },
];

const QUICK_REFERENCE = [
  { id: 'PER-001', symptom: 'Catalog loading slowly', severity: 'Medium' },
  { id: 'PER-002', symptom: 'Analytics timing out', severity: 'High' },
  { id: 'PER-008', symptom: 'Orphaned records from migration', severity: 'High' },
];

export function LndPerformanceDataIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-11" data-manual-anchor="sec-9-11" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~8 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.11 Performance & Data Issues</h3>
          <p className="text-muted-foreground mt-1">
            Page loading, analytics performance, data duplicates, exports, realtime sync, and migration troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve page loading and catalog performance issues',
          'Troubleshoot analytics dashboard timeout and slow queries',
          'Fix duplicate data and orphaned record problems',
          'Address report export truncation and search indexing delays',
          'Resolve realtime sync and memory management issues'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Performance Issues Quick Reference
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
          <CardTitle>Detailed Issue Resolution (8 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {PERFORMANCE_ISSUES.map((issue) => (
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

      <TipCallout title="Performance Monitoring">
        Monitor database query performance using EXPLAIN ANALYZE. Set up alerts for queries 
        exceeding 1 second. Review slow query logs weekly.
      </TipCallout>
    </div>
  );
}
