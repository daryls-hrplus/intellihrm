import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Brain, BarChart3, FilePlus } from 'lucide-react';
import {
  ESSOverview,
  MyProfilePersonalInfo,
  MyQualifications,
  MyTransactionsHistory,
  MyCareerPaths,
  ManagerTeamView,
  TeamOnboardingOversight,
  TeamOffboardingOversight,
  RecruitmentIntegration,
  MyCompetenciesSkills,
  TeamAnalyticsAccess,
  PositionRequestInitiation
} from './sections/ess-mss';

const ESS_MSS_SECTIONS = [
  { id: 'wf-sec-8-1', num: '8.1', title: 'Employee Self-Service Overview', desc: 'ESS modules for workforce data - employee empowerment', time: 5, Component: ESSOverview },
  { id: 'wf-sec-8-2', num: '8.2', title: 'My Profile & Personal Info (ESS)', desc: 'Updating personal details, addresses, contacts', time: 5, Component: MyProfilePersonalInfo },
  { id: 'wf-sec-8-3', num: '8.3', title: 'My Qualifications (ESS)', desc: 'Adding certifications, education, licenses', time: 5, Component: MyQualifications },
  { id: 'wf-sec-8-4', num: '8.4', title: 'My Transactions History (ESS)', desc: 'Viewing employment history, role changes', time: 5, Component: MyTransactionsHistory },
  { id: 'wf-sec-8-5', num: '8.5', title: 'My Career Paths (ESS)', desc: 'Exploring progression opportunities', time: 5, Component: MyCareerPaths },
  { id: 'wf-sec-8-6', num: '8.6', title: 'My Competencies & Skills (ESS)', desc: 'Skill assessments linked to workforce competency framework', time: 5, Component: MyCompetenciesSkills },
  { id: 'wf-sec-8-7', num: '8.7', title: 'Manager Team View (MSS)', desc: 'Viewing and managing direct reports', time: 5, Component: ManagerTeamView },
  { id: 'wf-sec-8-8', num: '8.8', title: 'Team Onboarding Oversight (MSS)', desc: 'Manager tasks for new hires', time: 5, Component: TeamOnboardingOversight },
  { id: 'wf-sec-8-9', num: '8.9', title: 'Team Offboarding Oversight (MSS)', desc: 'Managing departing team members', time: 5, Component: TeamOffboardingOversight },
  { id: 'wf-sec-8-10', num: '8.10', title: 'Recruitment Integration (MSS)', desc: 'Participating in hiring for team', time: 5, Component: RecruitmentIntegration },
  { id: 'wf-sec-8-11', num: '8.11', title: 'Team Analytics Access (MSS)', desc: 'Manager view of workforce analytics for team', time: 5, Component: TeamAnalyticsAccess },
  { id: 'wf-sec-8-12', num: '8.12', title: 'Position Request Initiation (MSS)', desc: 'Requesting new positions and backfills', time: 5, Component: PositionRequestInitiation },
];

export const WorkforceManualESSMSSSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Part 8: ESS & MSS Workforce Features</CardTitle>
              <CardDescription>
                Employee and Manager Self-Service capabilities for workforce data management
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 60 min read</span>
            <span>Target: Employee, Manager, HR Admin</span>
          </div>
        </CardHeader>
      </Card>

      {ESS_MSS_SECTIONS.map(({ id, num, title, desc, time, Component }) => (
        <Card key={id} id={id} data-manual-anchor={id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{num} {title}</CardTitle>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {time} min
              </span>
            </div>
            <CardDescription>{desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
