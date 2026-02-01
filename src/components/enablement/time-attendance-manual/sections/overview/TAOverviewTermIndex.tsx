import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, Database, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';

// Alphabetically sorted term index with table references
const TERM_INDEX = [
  { term: 'Attendance Exception', table: 'attendance_exceptions', section: 'ta-sec-1-2' },
  { term: 'Attendance Policy', table: 'attendance_policies', section: 'ta-sec-1-2' },
  { term: 'Attendance Summary', table: 'attendance_summary', section: 'ta-sec-1-2' },
  { term: 'Bradford Factor', table: 'employee_bradford_scores', section: 'ta-sec-1-2' },
  { term: 'Bradford Threshold', table: 'bradford_factor_thresholds', section: 'ta-sec-1-2' },
  { term: 'Break Record', table: 'time_clock_breaks', section: 'ta-sec-1-2' },
  { term: 'CBA Time Rule', table: 'cba_time_rules', section: 'ta-sec-1-2' },
  { term: 'CBA Violation', table: 'cba_violations', section: 'ta-sec-1-2' },
  { term: 'Clock Entry', table: 'time_clock_entries', section: 'ta-sec-1-2' },
  { term: 'Clock Method', table: 'time_clock_entries.clock_method', section: 'ta-sec-1-2' },
  { term: 'Comp Time', table: 'comp_time_balances', section: 'ta-sec-1-2' },
  { term: 'Coverage Snapshot', table: 'coverage_snapshots', section: 'ta-sec-1-2' },
  { term: 'Delegation', table: 'timekeeper_assignments', section: 'ta-sec-1-2' },
  { term: 'Employee Schedule', table: 'employee_schedules', section: 'ta-sec-1-2' },
  { term: 'Face Enrollment', table: 'employee_face_enrollments', section: 'ta-sec-1-2' },
  { term: 'Face Verification Log', table: 'face_verification_logs', section: 'ta-sec-1-2' },
  { term: 'Geofence Location', table: 'geofence_locations', section: 'ta-sec-1-2' },
  { term: 'Geofence Validation', table: 'geofence_validations', section: 'ta-sec-1-2' },
  { term: 'Geofence Violation', table: 'geofence_violations', section: 'ta-sec-1-2' },
  { term: 'Grace Period', table: 'attendance_policies.grace_period_minutes', section: 'ta-sec-1-2' },
  { term: 'Liveness Detection', table: 'face_verification_logs.liveness_passed', section: 'ta-sec-1-2' },
  { term: 'Open Shift', table: 'open_shifts', section: 'ta-sec-1-2' },
  { term: 'Open Shift Claim', table: 'open_shift_claims', section: 'ta-sec-1-2' },
  { term: 'Overtime Rate Tier', table: 'overtime_rate_tiers', section: 'ta-sec-1-2' },
  { term: 'Overtime Request', table: 'overtime_requests', section: 'ta-sec-1-2' },
  { term: 'Overtime Risk Alert', table: 'overtime_risk_alerts', section: 'ta-sec-1-2' },
  { term: 'Payroll Sync', table: 'payroll_sync_logs', section: 'ta-sec-1-2' },
  { term: 'Period Finalization', table: 'timekeeper_period_finalizations', section: 'ta-sec-1-2' },
  { term: 'Project Time Entry', table: 'project_time_entries', section: 'ta-sec-1-2' },
  { term: 'Punch Import', table: 'punch_import_batches', section: 'ta-sec-1-2' },
  { term: 'Punch Queue', table: 'timeclock_punch_queue', section: 'ta-sec-1-2' },
  { term: 'Regularization Request', table: 'attendance_regularization_requests', section: 'ta-sec-1-2' },
  { term: 'Rest Period', table: 'cba_time_rules.rest_period_hours', section: 'ta-sec-1-2' },
  { term: 'Rotation Pattern', table: 'shift_rotation_patterns', section: 'ta-sec-1-2' },
  { term: 'Rounding Rule', table: 'shift_rounding_rules', section: 'ta-sec-1-2' },
  { term: 'Shift', table: 'shifts', section: 'ta-sec-1-2' },
  { term: 'Shift Assignment', table: 'employee_shift_assignments', section: 'ta-sec-1-2' },
  { term: 'Shift Bid', table: 'shift_bids', section: 'ta-sec-1-2' },
  { term: 'Shift Differential', table: 'shift_differentials', section: 'ta-sec-1-2' },
  { term: 'Shift Swap', table: 'shift_swap_requests', section: 'ta-sec-1-2' },
  { term: 'Shift Template', table: 'shift_templates', section: 'ta-sec-1-2' },
  { term: 'Shift Template Entry', table: 'shift_template_entries', section: 'ta-sec-1-2' },
  { term: 'Timeclock Device', table: 'timeclock_devices', section: 'ta-sec-1-2' },
  { term: 'Timekeeper Assignment', table: 'timekeeper_assignments', section: 'ta-sec-1-2' },
  { term: 'Timesheet Approval History', table: 'timesheet_approval_history', section: 'ta-sec-1-2' },
  { term: 'Timesheet Entry', table: 'timesheet_entries', section: 'ta-sec-1-2' },
  { term: 'Timesheet Submission', table: 'timesheet_submissions', section: 'ta-sec-1-2' },
  { term: 'Verification Threshold', table: 'attendance_policies.face_match_threshold', section: 'ta-sec-1-2' },
  { term: 'Wellness Indicator', table: 'employee_wellness_indicators', section: 'ta-sec-1-2' },
  { term: 'Work Schedule', table: 'work_schedules', section: 'ta-sec-1-2' },
];

// Group terms by first letter
function groupTermsByLetter(terms: typeof TERM_INDEX, filter: string) {
  const filtered = filter 
    ? terms.filter(t => t.term.toLowerCase().includes(filter.toLowerCase()))
    : terms;
  
  const groups: Record<string, typeof TERM_INDEX> = {};
  
  filtered.forEach(term => {
    const letter = term.term[0].toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(term);
  });
  
  return groups;
}

export function TAOverviewTermIndex() {
  const [searchFilter, setSearchFilter] = useState('');
  const groupedTerms = groupTermsByLetter(TERM_INDEX, searchFilter);
  const letters = Object.keys(groupedTerms).sort();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-manual-anchor="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card id="ta-sec-1-7" data-manual-anchor="ta-sec-1-7" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.7</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>5 min read</span>
        </div>
        <CardTitle className="text-2xl">Terminology Index (A-Z)</CardTitle>
        <CardDescription>Quick alphabetical reference to all T&A terms with database table mappings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LearningObjectives objectives={[
          'Quickly locate any T&A term by alphabetical order',
          'Identify the backing database table for each term',
          'Navigate to detailed definitions in Section 1.2',
        ]} />

        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter terms..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Term Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" />
          <span>
            {searchFilter 
              ? `Showing ${Object.values(groupedTerms).flat().length} of ${TERM_INDEX.length} terms`
              : `${TERM_INDEX.length} terms across ${letters.length} letters`
            }
          </span>
        </div>

        {/* Letter Quick Jump */}
        <div className="flex flex-wrap gap-2">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
            <Badge
              key={letter}
              variant={groupedTerms[letter] ? 'default' : 'outline'}
              className={`cursor-pointer ${!groupedTerms[letter] ? 'opacity-30' : 'hover:bg-primary/80'}`}
              onClick={() => {
                if (groupedTerms[letter]) {
                  const element = document.getElementById(`term-group-${letter}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {letter}
            </Badge>
          ))}
        </div>

        {/* Alphabetical Term Grid */}
        <div className="space-y-6">
          {letters.map((letter) => (
            <div key={letter} id={`term-group-${letter}`} className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{letter}</span>
                </div>
                <div className="h-px flex-1 bg-border" />
                <Badge variant="outline" className="text-xs">
                  {groupedTerms[letter].length} {groupedTerms[letter].length === 1 ? 'term' : 'terms'}
                </Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {groupedTerms[letter].map((item) => (
                  <div
                    key={item.term}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => scrollToSection(item.section)}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm truncate block">{item.term}</span>
                      <code className="text-xs text-muted-foreground truncate block">{item.table}</code>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {letters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No terms match "{searchFilter}"</p>
            <button
              className="text-primary text-sm mt-2 hover:underline"
              onClick={() => setSearchFilter('')}
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Cross-Reference Note */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <strong>Usage:</strong> Click any term to jump to its full definition in{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => scrollToSection('ta-sec-1-2')}
            >
              Section 1.2: Core Concepts & Terminology
            </button>
            . Each term includes detailed descriptions, examples, and related concepts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
