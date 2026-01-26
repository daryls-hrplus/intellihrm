import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Users, Shield, Building2, CheckCircle } from 'lucide-react';

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

export function SuccessionQuickReference() {
  return (
    <div className="space-y-8" id="quick-ref" data-manual-anchor="quick-ref">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Book className="h-6 w-6" />
          Appendix A: Quick Reference Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Persona-based journey guides for succession planning workflows
        </p>
      </div>

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
  );
}
