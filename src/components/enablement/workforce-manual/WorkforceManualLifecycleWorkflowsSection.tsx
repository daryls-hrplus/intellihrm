import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import {
  LifecycleOverview,
  OnboardingWorkflowDesign,
  OnboardingTaskManagement,
  NewHirePortal,
  ManagerOnboardingView,
  OffboardingWorkflowDesign,
  ExitInterviewIntegration,
  RehireHandling,
  LifecycleAnalytics
} from './sections/lifecycle-workflows';

const LIFECYCLE_WORKFLOW_SECTIONS = [
  { id: 'wf-sec-5-1', num: '5.1', title: 'Lifecycle Overview', desc: 'Hire-to-retire journey stages', time: 8, Component: LifecycleOverview },
  { id: 'wf-sec-5-2', num: '5.2', title: 'Onboarding Workflow Design', desc: 'Creating templates with tasks and checklists', time: 12, Component: OnboardingWorkflowDesign },
  { id: 'wf-sec-5-3', num: '5.3', title: 'Onboarding Task Management', desc: 'HR, Manager, and Employee task assignments', time: 10, Component: OnboardingTaskManagement },
  { id: 'wf-sec-5-4', num: '5.4', title: 'New Hire Portal (ESS)', desc: 'Employee onboarding self-service', time: 8, Component: NewHirePortal },
  { id: 'wf-sec-5-5', num: '5.5', title: 'Manager Onboarding View (MSS)', desc: 'Manager oversight of new hire progress', time: 8, Component: ManagerOnboardingView },
  { id: 'wf-sec-5-6', num: '5.6', title: 'Offboarding Workflow Design', desc: 'Exit process templates, clearance checklists', time: 10, Component: OffboardingWorkflowDesign },
  { id: 'wf-sec-5-7', num: '5.7', title: 'Exit Interview Integration', desc: 'Automated exit interview scheduling', time: 8, Component: ExitInterviewIntegration },
  { id: 'wf-sec-5-8', num: '5.8', title: 'Rehire Handling', desc: 'Managing returning employees', time: 8, Component: RehireHandling },
  { id: 'wf-sec-5-9', num: '5.9', title: 'Lifecycle Analytics', desc: 'Onboarding completion rates, KPIs', time: 8, Component: LifecycleAnalytics },
];

export function WorkforceManualLifecycleWorkflowsSection() {
  return (
    <div className="space-y-8">
      <Card id="wf-part-5" data-manual-anchor="wf-part-5" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 5: Employee Lifecycle Workflows</CardTitle>
          <CardDescription>
            Onboarding, offboarding, and lifecycle process management from hire to retire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section covers the complete employee lifecycle including structured onboarding 
            workflows, offboarding processes, exit interviews, rehire handling, and analytics 
            to measure lifecycle effectiveness.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <Badge variant="outline">9 Sections</Badge>
            <Badge variant="outline">~80 min read</Badge>
            <Badge variant="outline">HR Admin, HR Ops, Manager</Badge>
          </div>
        </CardContent>
      </Card>

      {LIFECYCLE_WORKFLOW_SECTIONS.map((section) => (
        <Card key={section.id} id={section.id} data-manual-anchor={section.id} className="scroll-mt-32">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline">Section {section.num}</Badge>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{section.time} min read</span>
            </div>
            <CardTitle className="text-2xl">{section.title}</CardTitle>
            <CardDescription>{section.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <section.Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
