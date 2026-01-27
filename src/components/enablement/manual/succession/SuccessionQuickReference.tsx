import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Users, Shield, Building2, CheckCircle, Settings, Rocket, Calendar, Plug, Keyboard } from 'lucide-react';

const PERSONA_JOURNEYS = [
  {
    title: 'HR Administrator Journey',
    icon: Shield,
    color: 'purple',
    steps: [
      { step: 1, title: 'Configure Foundation', description: 'Set up assessor types, readiness bands, availability reasons', time: 'Day 1-2' },
      { step: 2, title: 'Setup Nine-Box', description: 'Configure rating sources and signal mappings', time: 'Day 3-4' },
      { step: 3, title: 'Build Assessment Forms', description: 'Create readiness indicators and forms by staff type', time: 'Day 5-7' },
      { step: 4, title: 'Create Talent Pools', description: 'Define pool types, criteria, and nomination rules', time: 'Week 2' },
      { step: 5, title: 'Identify Key Positions', description: 'Flag critical roles and assess vacancy risk', time: 'Week 2-3' },
      { step: 6, title: 'Build Succession Plans', description: 'Create plans and nominate candidates', time: 'Week 3-4' },
      { step: 7, title: 'Configure Integrations', description: 'Link to Performance, Learning, Compensation', time: 'Week 4' },
      { step: 8, title: 'Launch & Monitor', description: 'Go-live, train users, monitor dashboards', time: 'Ongoing' },
    ]
  },
  {
    title: 'Manager Journey',
    icon: Users,
    color: 'blue',
    steps: [
      { step: 1, title: 'Review Nine-Box', description: 'View team placement on Performance vs Potential grid', time: '10 min' },
      { step: 2, title: 'Nominate Successors', description: 'Identify potential successors for key team positions', time: '20 min' },
      { step: 3, title: 'Conduct Assessment', description: 'Complete readiness assessment for each candidate', time: '30 min/person' },
      { step: 4, title: 'Review Rankings', description: 'Validate candidate rankings with HR', time: '15 min' },
      { step: 5, title: 'Link Development', description: 'Connect gaps to IDP goals and learning', time: '20 min/person' },
      { step: 6, title: 'Monitor Flight Risk', description: 'Review retention indicators for key talent', time: 'Weekly' },
    ]
  },
  {
    title: 'Executive Journey',
    icon: Building2,
    color: 'amber',
    steps: [
      { step: 1, title: 'Review Talent Dashboard', description: 'Executive view of succession health metrics', time: '15 min' },
      { step: 2, title: 'Calibration Sessions', description: 'Participate in talent calibration reviews', time: '2-3 hours' },
      { step: 3, title: 'Approve HiPo Nominations', description: 'Validate high-potential talent pool members', time: '30 min' },
      { step: 4, title: 'Sponsor Key Successors', description: 'Provide executive mentorship to star candidates', time: 'Ongoing' },
      { step: 5, title: 'Review Bench Strength', description: 'Assess coverage for critical leadership roles', time: 'Quarterly' },
    ]
  },
  {
    title: 'Employee Journey',
    icon: Users,
    color: 'green',
    steps: [
      { step: 1, title: 'Explore Career Paths', description: 'View available progression options', time: '15 min' },
      { step: 2, title: 'Express Aspirations', description: 'Document career interests and goals', time: '10 min' },
      { step: 3, title: 'Review Development', description: 'See recommended learning and experiences', time: '20 min' },
      { step: 4, title: 'Join Mentorship', description: 'Participate in mentorship program', time: 'Ongoing' },
      { step: 5, title: 'Track Progress', description: 'Monitor development against career milestones', time: 'Monthly' },
    ]
  }
];

const CHECKLIST_CARDS = [
  {
    title: 'Configuration Checklist',
    icon: Settings,
    color: 'indigo',
    description: 'Pre-go-live validation for succession planning setup',
    items: [
      { item: 'Assessor types configured with weights summing to 100%', critical: true },
      { item: 'Readiness bands defined (Ready Now, 1-2 Years, 3-5 Years, Developing, Not a Successor)', critical: true },
      { item: 'At least 20 readiness indicators across 8 categories', critical: false },
      { item: 'Readiness forms created for each staff type', critical: true },
      { item: 'Nine-Box rating sources configured for both axes', critical: true },
      { item: 'Signal mappings linked to talent signal definitions', critical: false },
      { item: 'Box labels and descriptions customized', critical: false },
      { item: 'Availability reasons with urgency levels', critical: false },
      { item: 'Company-specific settings reviewed', critical: true },
      { item: 'SUCCESSION_READINESS_APPROVAL workflow configured', critical: true },
    ]
  },
  {
    title: 'Go-Live Readiness Checklist',
    icon: Rocket,
    color: 'emerald',
    description: 'Final validation before production launch',
    items: [
      { item: 'All configuration checklists completed', critical: true },
      { item: 'Test succession plan created and validated', critical: true },
      { item: 'Nine-Box placement calculated for test employee', critical: true },
      { item: 'Readiness assessment completed end-to-end', critical: true },
      { item: 'Talent pool nomination workflow tested', critical: true },
      { item: 'HR approval workflow verified', critical: true },
      { item: 'Integration data flowing from Performance module', critical: true },
      { item: 'User training completed for HR and Managers', critical: true },
      { item: 'Executive dashboard review scheduled', critical: false },
      { item: 'Support escalation path documented', critical: false },
    ]
  },
  {
    title: 'Annual Cycle Calendar',
    icon: Calendar,
    color: 'blue',
    description: '12-month succession planning timeline',
    items: [
      { item: 'Q1: Annual talent review kickoff, calibration preparation', critical: true },
      { item: 'Jan-Feb: Nine-Box assessments updated post-appraisal cycle', critical: true },
      { item: 'Mar: Executive calibration sessions, HiPo pool review', critical: true },
      { item: 'Q2: Development plan updates, mentorship pairings', critical: false },
      { item: 'Apr-May: Succession plan gap analysis', critical: false },
      { item: 'Jun: Mid-year readiness assessment refresh', critical: false },
      { item: 'Q3: Flight risk review, retention action planning', critical: true },
      { item: 'Jul-Aug: Key position criticality review', critical: false },
      { item: 'Sep: Vacancy forecast for next fiscal year', critical: true },
      { item: 'Q4: Year-end reporting, next-year planning', critical: false },
      { item: 'Oct-Nov: Pool graduation and promotion decisions', critical: true },
      { item: 'Dec: Configuration review and updates for next cycle', critical: false },
    ]
  },
  {
    title: 'Integration Validation Checklist',
    icon: Plug,
    color: 'violet',
    description: 'Cross-module sync verification',
    items: [
      { item: 'Performance → Nine-Box: Appraisal scores feeding Performance axis', critical: true },
      { item: 'Goals → Nine-Box: Goal achievement contributing to Performance axis', critical: false },
      { item: '360 Feedback → Nine-Box: Leadership signals feeding Potential axis', critical: true },
      { item: 'Talent Signals → Succession: Signal snapshots populating candidate evidence', critical: true },
      { item: 'IDP → Development: Gap-to-goal linking functional', critical: false },
      { item: 'Learning → Development: Course recommendations appearing', critical: false },
      { item: 'Workforce → Key Positions: Job changes updating succession plans', critical: true },
      { item: 'Compensation → Retention: Compa-ratio alerts triggering for flight risk', critical: false },
    ]
  },
  {
    title: 'Keyboard Shortcuts Reference',
    icon: Keyboard,
    color: 'slate',
    description: 'Navigation and bulk action shortcuts',
    items: [
      { item: 'Ctrl/Cmd + K: Open command palette (global search)', critical: false },
      { item: 'Tab / Shift+Tab: Navigate between form fields', critical: false },
      { item: 'Enter: Open selected row or confirm action', critical: false },
      { item: 'Escape: Close modal or cancel action', critical: false },
      { item: 'Ctrl/Cmd + S: Save current form', critical: false },
      { item: 'Ctrl/Cmd + Shift + A: Select all items in list', critical: false },
      { item: 'Arrow keys: Navigate grid/table cells', critical: false },
      { item: 'Space: Toggle checkbox selection', critical: false },
    ]
  }
];

export function SuccessionQuickReference() {
  return (
    <div className="space-y-8" id="quick-ref" data-manual-anchor="quick-ref">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Book className="h-6 w-6" />
          Appendix A: Quick Reference Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Persona-based journey guides and implementation checklists for succession planning
        </p>
      </div>

      {/* Persona Journeys */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Persona Journey Maps</h3>
        <div className="grid gap-6">
          {PERSONA_JOURNEYS.map((persona) => {
            const IconComponent = persona.icon;
            return (
              <Card key={persona.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-1.5 bg-${persona.color}-500/10 rounded`}>
                      <IconComponent className={`h-5 w-5 text-${persona.color}-600`} />
                    </div>
                    {persona.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {persona.steps.map((step) => (
                      <div key={step.step} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{step.step}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {step.time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Implementation Checklists */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Implementation Checklists</h3>
        <div className="grid gap-6">
          {CHECKLIST_CARDS.map((checklist) => {
            const IconComponent = checklist.icon;
            return (
              <Card key={checklist.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-1.5 bg-${checklist.color}-500/10 rounded`}>
                      <IconComponent className={`h-5 w-5 text-${checklist.color}-600`} />
                    </div>
                    {checklist.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{checklist.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg">
                        <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${item.critical ? 'text-destructive' : 'text-muted-foreground'}`} />
                        <span className="text-sm flex-1">{item.item}</span>
                        {item.critical && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
