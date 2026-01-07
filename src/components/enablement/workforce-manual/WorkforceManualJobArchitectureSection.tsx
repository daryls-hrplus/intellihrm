import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import {
  JobArchitectureOverview,
  JobArchitectureFamilies,
  JobArchitectureJobs,
  JobArchitectureSkills,
  JobArchitectureQualifications,
  JobArchitectureResponsibilities,
  JobArchitecturePositions,
  JobArchitectureBudgeting,
  JobArchitectureMapping
} from './sections/job-architecture';

const JOB_ARCHITECTURE_SECTIONS = [
  { id: 'wf-sec-3-1', num: '3.1', title: 'Job Architecture Overview', desc: 'Job families, jobs, positions hierarchy explained', time: 10, Component: JobArchitectureOverview },
  { id: 'wf-sec-3-2', num: '3.2', title: 'Job Families Configuration', desc: 'Creating career streams and progression paths', time: 10, Component: JobArchitectureFamilies },
  { id: 'wf-sec-3-3', num: '3.3', title: 'Jobs Setup', desc: 'Defining job codes, titles, grades, and descriptions', time: 15, Component: JobArchitectureJobs },
  { id: 'wf-sec-3-4', num: '3.4', title: 'Skills & Competencies Library', desc: 'Building the organizational competency framework', time: 12, Component: JobArchitectureSkills },
  { id: 'wf-sec-3-5', num: '3.5', title: 'Qualifications Management', desc: 'Academic qualifications, certifications, licenses', time: 10, Component: JobArchitectureQualifications },
  { id: 'wf-sec-3-6', num: '3.6', title: 'Responsibilities Templates', desc: 'Standard responsibility sets for positions', time: 10, Component: JobArchitectureResponsibilities },
  { id: 'wf-sec-3-7', num: '3.7', title: 'Position Creation & Management', desc: 'Creating positions linked to jobs and departments', time: 12, Component: JobArchitecturePositions },
  { id: 'wf-sec-3-8', num: '3.8', title: 'Position Budgeting', desc: 'Headcount budget allocation per position', time: 8, Component: JobArchitectureBudgeting },
  { id: 'wf-sec-3-9', num: '3.9', title: 'Job-to-Position Mapping', desc: 'Connecting job definitions to active positions', time: 8, Component: JobArchitectureMapping },
];

export function WorkforceManualJobArchitectureSection() {
  return (
    <div className="space-y-8">
      <Card id="wf-part-3" data-manual-anchor="wf-part-3" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 3: Job Architecture Setup</CardTitle>
          <CardDescription>
            Complete job architecture configuration from job families to position mapping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Follow this sequence: Job Architecture Overview → Job Families → Jobs → Skills & Competencies
            → Qualifications → Responsibilities → Positions → Budgeting → Mapping.
          </p>
        </CardContent>
      </Card>

      {JOB_ARCHITECTURE_SECTIONS.map((section) => (
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
