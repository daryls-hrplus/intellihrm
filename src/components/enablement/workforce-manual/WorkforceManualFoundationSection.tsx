import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import {
  FoundationPrerequisites,
  FoundationTerritories,
  FoundationCompanyGroups,
  FoundationCompanies,
  FoundationDivisions,
  FoundationDepartments,
  FoundationSections,
  FoundationBranchLocations,
  FoundationOrgChart,
  FoundationGovernance
} from './sections/foundation';

const FOUNDATION_SECTIONS = [
  { id: 'wf-sec-2-1', num: '2.1', title: 'Prerequisites Checklist', desc: 'Dependencies, data requirements, legal entity information', time: 8, Component: FoundationPrerequisites },
  { id: 'wf-sec-2-2', num: '2.2', title: 'Territories Configuration', desc: 'Geographic regions for grouping companies', time: 8, Component: FoundationTerritories },
  { id: 'wf-sec-2-3', num: '2.3', title: 'Company Groups Setup', desc: 'Holding company structures and inheritance', time: 8, Component: FoundationCompanyGroups },
  { id: 'wf-sec-2-4', num: '2.4', title: 'Companies Configuration', desc: 'Legal entity setup with country requirements', time: 12, Component: FoundationCompanies },
  { id: 'wf-sec-2-5', num: '2.5', title: 'Divisions Configuration', desc: 'Optional layer for large enterprises', time: 6, Component: FoundationDivisions },
  { id: 'wf-sec-2-6', num: '2.6', title: 'Departments Configuration', desc: 'Business unit setup with cost centers', time: 10, Component: FoundationDepartments },
  { id: 'wf-sec-2-7', num: '2.7', title: 'Sections Configuration', desc: 'Sub-department team groupings', time: 6, Component: FoundationSections },
  { id: 'wf-sec-2-8', num: '2.8', title: 'Branch Locations Setup', desc: 'Physical offices with geofencing', time: 10, Component: FoundationBranchLocations },
  { id: 'wf-sec-2-9', num: '2.9', title: 'Org Chart Configuration', desc: 'Visualization and display options', time: 6, Component: FoundationOrgChart },
  { id: 'wf-sec-2-10', num: '2.10', title: 'Governance & Board Setup', desc: 'Company boards and management teams', time: 8, Component: FoundationGovernance },
];

export function WorkforceManualFoundationSection() {
  return (
    <div className="space-y-8">
      <Card id="wf-part-2" data-manual-anchor="wf-part-2" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 2: Foundation Setup - Organization Hierarchy</CardTitle>
          <CardDescription>
            Complete organization hierarchy configuration from territories to sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Follow this sequence: Prerequisites → Territory → Company Group → Company → Division (optional)
            → Department → Section → Branch Location → Org Chart → Governance.
          </p>
        </CardContent>
      </Card>

      {FOUNDATION_SECTIONS.map((section) => (
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
