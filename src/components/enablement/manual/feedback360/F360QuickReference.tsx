import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Users, Briefcase, Shield, Clock, CheckCircle } from 'lucide-react';

interface JourneyStep {
  step: number;
  title: string;
  description: string;
  timeEstimate?: string;
  keyActions: string[];
  successCriteria: string;
}

const EMPLOYEE_JOURNEY: JourneyStep[] = [
  {
    step: 1,
    title: 'Receive Notification',
    description: 'Email or portal notification announces cycle launch',
    timeEstimate: 'Day 1',
    keyActions: ['Review cycle timeline and deadlines', 'Understand competencies being assessed', 'Identify potential raters from your work interactions'],
    successCriteria: 'Clear understanding of cycle purpose and timeline'
  },
  {
    step: 2,
    title: 'Nominate Raters',
    description: 'Select peers and external raters who can provide meaningful feedback',
    timeEstimate: '15-30 min',
    keyActions: ['Nominate 4-8 peers across different projects', 'Add external raters if enabled (clients, vendors)', 'Ensure minimum 3 months working relationship'],
    successCriteria: 'Nominations submitted and awaiting manager approval'
  },
  {
    step: 3,
    title: 'Complete Self-Assessment',
    description: 'Rate yourself on each competency with supporting evidence',
    timeEstimate: '30-45 min',
    keyActions: ['Review each competency and behavioral indicator', 'Provide honest self-ratings (1-5 scale)', 'Add specific examples and evidence for ratings', 'Submit before self-assessment deadline'],
    successCriteria: 'Self-assessment submitted with all required fields complete'
  },
  {
    step: 4,
    title: 'Monitor Nominations',
    description: 'Track manager approval status and declined raters',
    timeEstimate: 'Ongoing',
    keyActions: ['Check nomination approval status in portal', 'Nominate replacements for declined raters', 'Request manager clarification if nominations rejected'],
    successCriteria: 'All nominations approved or replaced'
  },
  {
    step: 5,
    title: 'Await Feedback',
    description: 'Wait for raters to complete their feedback submissions',
    timeEstimate: '2-4 weeks',
    keyActions: ['Do not contact raters about feedback content', 'Understand anonymity protections in place', 'Continue regular work responsibilities'],
    successCriteria: 'Cycle response deadline reached'
  },
  {
    step: 6,
    title: 'Receive Report',
    description: 'Access your individual feedback report when released',
    timeEstimate: 'After release',
    keyActions: ['Download PDF report from portal', 'Review overall scores and category breakdowns', 'Read qualitative comments carefully', 'Note blind spots (self vs rater gaps)'],
    successCriteria: 'Report reviewed and understood'
  },
  {
    step: 7,
    title: 'Manager Debrief',
    description: 'Discuss results with your manager in a development conversation',
    timeEstimate: '45-60 min',
    keyActions: ['Prepare questions and reflections', 'Discuss AI-generated development themes', 'Agree on 2-3 priority development areas', 'Discuss support and resources needed'],
    successCriteria: 'Development priorities agreed with manager'
  },
  {
    step: 8,
    title: 'Create Action Plan',
    description: 'Link development themes to IDP goals',
    timeEstimate: '30 min',
    keyActions: ['Review AI-generated themes in IDP', 'Create specific, measurable goals', 'Set target dates and milestones', 'Identify learning resources and training'],
    successCriteria: 'IDP goals created and linked to 360 themes'
  }
];

const RATER_JOURNEY: JourneyStep[] = [
  {
    step: 1,
    title: 'Receive Request',
    description: 'Email notification with feedback request details',
    timeEstimate: 'Day 1',
    keyActions: ['Review subject name and relationship', 'Note deadline for submission', 'Access feedback form via secure link'],
    successCriteria: 'Request acknowledged and access confirmed'
  },
  {
    step: 2,
    title: 'Accept or Decline',
    description: 'Confirm participation or provide reason for declining',
    timeEstimate: '2 min',
    keyActions: ['Assess if you can provide meaningful feedback', 'If declining, select reason from list', 'Understand substitute will be assigned'],
    successCriteria: 'Participation decision submitted'
  },
  {
    step: 3,
    title: 'Review Questions',
    description: 'Understand rating scale and competency definitions',
    timeEstimate: '5 min',
    keyActions: ['Read each competency description carefully', 'Understand 1-5 rating scale anchors', 'Note which questions require comments'],
    successCriteria: 'Clear understanding of rating expectations'
  },
  {
    step: 4,
    title: 'Provide Ratings',
    description: 'Complete numeric ratings for each competency',
    timeEstimate: '15-20 min',
    keyActions: ['Rate each competency based on observed behavior', 'Use full scale range (avoid all 3s or 4s)', 'Save progress if unable to complete in one session'],
    successCriteria: 'All ratings completed'
  },
  {
    step: 5,
    title: 'Add Comments',
    description: 'Provide qualitative feedback to support ratings',
    timeEstimate: '10-15 min',
    keyActions: ['Provide specific behavioral examples', 'Focus on observable actions, not personality', 'Balance positive feedback with development areas', 'Avoid identifying yourself in comments'],
    successCriteria: 'Required comments completed with specific examples'
  },
  {
    step: 6,
    title: 'Submit Feedback',
    description: 'Final review and submission',
    timeEstimate: '2 min',
    keyActions: ['Review all responses before submitting', 'Confirm submission is final (cannot edit after)', 'Receive confirmation email'],
    successCriteria: 'Feedback submitted successfully'
  }
];

const MANAGER_JOURNEY: JourneyStep[] = [
  {
    step: 1,
    title: 'Review Nominations',
    description: 'Approve or reject rater selections for direct reports',
    timeEstimate: '10 min/employee',
    keyActions: ['Review each nominated rater relationship', 'Reject inappropriate raters with reason', 'Suggest additional raters if needed'],
    successCriteria: 'All nominations processed within deadline'
  },
  {
    step: 2,
    title: 'Complete Manager Feedback',
    description: 'Provide your ratings as the manager rater',
    timeEstimate: '20-30 min/employee',
    keyActions: ['Rate each competency from manager perspective', 'Provide specific examples in comments', 'Focus on observable workplace behavior'],
    successCriteria: 'Manager feedback submitted for all direct reports'
  },
  {
    step: 3,
    title: 'Monitor Completion',
    description: 'Track team response rates and intervene if needed',
    timeEstimate: 'Weekly check',
    keyActions: ['Review team completion dashboard', 'Identify low-responding rater categories', 'Send targeted reminders to specific raters'],
    successCriteria: 'Team achieves 70%+ response rate'
  },
  {
    step: 4,
    title: 'Review Reports',
    description: 'Access team member feedback reports when released',
    timeEstimate: '30 min/employee',
    keyActions: ['Review overall scores and trends', 'Identify blind spots (self vs raters)', 'Note development themes for debrief'],
    successCriteria: 'All team reports reviewed before debriefs'
  },
  {
    step: 5,
    title: 'Conduct Debriefs',
    description: 'Facilitate development conversations with each team member',
    timeEstimate: '45-60 min/employee',
    keyActions: ['Create safe space for discussion', 'Help interpret results objectively', 'Focus on development, not judgment', 'Agree on priority areas together'],
    successCriteria: 'Debrief completed with documented outcomes'
  },
  {
    step: 6,
    title: 'Validate Themes',
    description: 'Confirm AI-generated development themes are appropriate',
    timeEstimate: '10 min/employee',
    keyActions: ['Review AI-suggested themes for each employee', 'Confirm or adjust theme prioritization', 'Add manager context if needed'],
    successCriteria: 'Themes validated and ready for IDP linking'
  },
  {
    step: 7,
    title: 'Link to IDP',
    description: 'Connect validated themes to development goals',
    timeEstimate: '15 min/employee',
    keyActions: ['Create or update IDP items from themes', 'Set realistic timelines and milestones', 'Identify resources and support'],
    successCriteria: 'IDP goals created and linked'
  },
  {
    step: 8,
    title: 'Use Coaching Prompts',
    description: 'Follow AI coaching suggestions in ongoing conversations',
    timeEstimate: 'Ongoing',
    keyActions: ['Review coaching prompts before 1:1s', 'Ask suggested development questions', 'Document progress and observations'],
    successCriteria: 'Coaching prompts used in regular conversations'
  },
  {
    step: 9,
    title: 'Track Progress',
    description: 'Monitor development against 360 themes',
    timeEstimate: 'Quarterly',
    keyActions: ['Review IDP goal progress', 'Check for behavioral changes', 'Adjust support as needed'],
    successCriteria: 'Progress documented quarterly'
  },
  {
    step: 10,
    title: 'Prepare Next Cycle',
    description: 'Inform next cycle based on current results',
    timeEstimate: 'Pre-cycle',
    keyActions: ['Identify continued development areas', 'Note rater suggestions for next cycle', 'Share feedback on cycle process with HR'],
    successCriteria: 'Ready for next 360 cycle'
  }
];

const HR_ADMIN_JOURNEY: JourneyStep[] = [
  {
    step: 1,
    title: 'Plan Cycle',
    description: 'Define scope, timeline, and governance settings',
    timeEstimate: '2-4 weeks before',
    keyActions: ['Set cycle dates avoiding peak periods', 'Define participant groups', 'Configure anonymity thresholds', 'Select competency framework'],
    successCriteria: 'Cycle plan approved by leadership'
  },
  {
    step: 2,
    title: 'Configure Cycle',
    description: 'Set up all cycle parameters in system',
    timeEstimate: '1-2 hours',
    keyActions: ['Create cycle with correct dates', 'Assign questions and frameworks', 'Configure rater categories and weights', 'Set up notification templates'],
    successCriteria: 'Cycle validated and ready for activation'
  },
  {
    step: 3,
    title: 'Communicate Launch',
    description: 'Send launch communications to all stakeholders',
    timeEstimate: '1 day',
    keyActions: ['Send participant notifications', 'Brief managers on their responsibilities', 'Publish FAQ and help resources', 'Announce timeline and deadlines'],
    successCriteria: 'All stakeholders informed of cycle launch'
  },
  {
    step: 4,
    title: 'Activate Cycle',
    description: 'Transition cycle from draft to active',
    timeEstimate: '15 min',
    keyActions: ['Run readiness check for validation', 'Activate cycle to enable nominations', 'Verify notifications sent correctly'],
    successCriteria: 'Cycle active and nominations open'
  },
  {
    step: 5,
    title: 'Monitor Nominations',
    description: 'Track nomination submission and approval progress',
    timeEstimate: 'Daily during nomination',
    keyActions: ['Monitor nomination completion rates', 'Identify blocked participants', 'Escalate manager approval delays'],
    successCriteria: 'All participants have approved raters'
  },
  {
    step: 6,
    title: 'Monitor Collection',
    description: 'Track response rates and send reminders',
    timeEstimate: 'Daily during collection',
    keyActions: ['Monitor response rate dashboard', 'Send targeted reminders', 'Handle declined rater replacements', 'Process deadline extensions'],
    successCriteria: '70%+ response rate achieved'
  },
  {
    step: 7,
    title: 'Process Results',
    description: 'Trigger aggregation and signal processing',
    timeEstimate: '1-2 hours',
    keyActions: ['Close collection phase', 'Trigger score aggregation', 'Monitor signal processing status', 'Verify anonymity thresholds respected'],
    successCriteria: 'All reports generated successfully'
  },
  {
    step: 8,
    title: 'Review Before Release',
    description: 'Quality check reports before distribution',
    timeEstimate: '2-4 hours',
    keyActions: ['Sample review reports for accuracy', 'Check anonymity is preserved', 'Verify AI themes are appropriate', 'Prepare release schedule'],
    successCriteria: 'Reports approved for release'
  },
  {
    step: 9,
    title: 'Release Results',
    description: 'Execute staged release to different audiences',
    timeEstimate: '1 day',
    keyActions: ['Release to managers first (optional)', 'Release to employees 24-48 hours later', 'Monitor access and feedback', 'Handle any concerns'],
    successCriteria: 'All audiences have received reports'
  },
  {
    step: 10,
    title: 'Support Debriefs',
    description: 'Provide guidance and handle escalations',
    timeEstimate: '2-4 weeks',
    keyActions: ['Offer interpretation sessions', 'Handle investigation requests if needed', 'Support managers with difficult conversations', 'Escalate concerns to HR leadership'],
    successCriteria: 'Debriefs completed with minimal escalations'
  },
  {
    step: 11,
    title: 'Analyze Trends',
    description: 'Review aggregate data for organizational insights',
    timeEstimate: '4-8 hours',
    keyActions: ['Run aggregate analytics reports', 'Identify organizational trends', 'Compare to previous cycles', 'Prepare leadership summary'],
    successCriteria: 'Organizational insights report delivered'
  },
  {
    step: 12,
    title: 'Close Cycle',
    description: 'Archive cycle and document learnings',
    timeEstimate: '1-2 hours',
    keyActions: ['Close cycle in system', 'Archive data per retention policy', 'Document process improvements', 'Plan next cycle improvements'],
    successCriteria: 'Cycle closed with retrospective complete'
  }
];

interface PersonaCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  journey: JourneyStep[];
  totalTime: string;
  color: string;
}

function PersonaCard({ title, description, icon: Icon, journey, totalTime, color }: PersonaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{description}</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalTime}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {journey.map((step) => (
            <div key={step.step} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox id={`step-${title}-${step.step}`} />
                  <Badge variant="secondary">{step.step}</Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    {step.timeEstimate && (
                      <span className="text-xs text-muted-foreground">{step.timeEstimate}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Key Actions:</span>
                      <ul className="mt-1 space-y-0.5">
                        {step.keyActions.map((action, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span>•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-start gap-1 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong>Success:</strong> {step.successCriteria}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function F360QuickReference() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Reference Cards</h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive role-based journey maps for the 360 feedback process. Each card includes
          step-by-step procedures, time estimates, key actions, and success criteria.
          Use the checkboxes to track progress through each journey.
        </p>
      </div>

      <PersonaCard
        title="Employee (Subject) Journey"
        description="Complete guide for employees receiving 360 feedback"
        icon={User}
        journey={EMPLOYEE_JOURNEY}
        totalTime="~4-5 hours total"
        color="text-blue-500"
      />

      <PersonaCard
        title="Rater Journey"
        description="Guide for providing feedback on colleagues"
        icon={Users}
        journey={RATER_JOURNEY}
        totalTime="~45-60 min"
        color="text-purple-500"
      />

      <PersonaCard
        title="Manager Journey"
        description="Guide for managers with direct reports in cycle"
        icon={Briefcase}
        journey={MANAGER_JOURNEY}
        totalTime="~4-6 hours per employee"
        color="text-amber-500"
      />

      <PersonaCard
        title="HR Administrator Journey"
        description="Complete cycle management from planning to closure"
        icon={Shield}
        journey={HR_ADMIN_JOURNEY}
        totalTime="~40-60 hours per cycle"
        color="text-green-500"
      />
    </div>
  );
}
