import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

import {
  FoundationPrerequisites,
  FoundationTerritories,
  FoundationCompanyGroups,
  FoundationCompanies,
  FoundationDivisions,
  FoundationDepartments,
  FoundationSections,
  FoundationBranchLocations
} from './sections/foundation';

const FOUNDATION_SECTIONS = [
  {
    id: 'admin-sec-2-1',
    sectionNumber: '2.1',
    title: 'Prerequisites Checklist',
    description: 'Dependencies, data requirements, and pre-setup validation',
    readTimeMin: 10,
    Component: FoundationPrerequisites,
  },
  {
    id: 'admin-sec-2-2',
    sectionNumber: '2.2',
    title: 'Territories Configuration',
    description: 'Geographic regions for grouping companies and compliance boundaries',
    readTimeMin: 10,
    Component: FoundationTerritories,
  },
  {
    id: 'admin-sec-2-3',
    sectionNumber: '2.3',
    title: 'Company Groups Configuration',
    description: 'Holding company structures and group-level inheritance',
    readTimeMin: 10,
    Component: FoundationCompanyGroups,
  },
  {
    id: 'admin-sec-2-4',
    sectionNumber: '2.4',
    title: 'Companies Configuration',
    description: 'Individual legal entity setup with country-specific requirements',
    readTimeMin: 15,
    Component: FoundationCompanies,
  },
  {
    id: 'admin-sec-2-5',
    sectionNumber: '2.5',
    title: 'Divisions Configuration',
    description: 'Optional organizational layer for large enterprises',
    readTimeMin: 8,
    Component: FoundationDivisions,
  },
  {
    id: 'admin-sec-2-6',
    sectionNumber: '2.6',
    title: 'Departments Configuration',
    description: 'Mandatory business unit setup with cost center linking',
    readTimeMin: 15,
    Component: FoundationDepartments,
  },
  {
    id: 'admin-sec-2-7',
    sectionNumber: '2.7',
    title: 'Sections Configuration',
    description: 'Sub-department groupings and team-level organization',
    readTimeMin: 8,
    Component: FoundationSections,
  },
  {
    id: 'admin-sec-2-8',
    sectionNumber: '2.8',
    title: 'Branch Locations Configuration',
    description: 'Physical office setup with geofencing and time zones',
    readTimeMin: 12,
    Component: FoundationBranchLocations,
  },
] as const;

export function AdminManualFoundationSection() {
  return (
    <div className="space-y-8">
      <Card id="admin-part-2" data-manual-anchor="admin-part-2" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 2: Foundation Setup</CardTitle>
          <CardDescription>
            Complete organization hierarchy configuration from territories to sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Follow this sequence: Prerequisites → Territory → Company Group → Company → Division (optional)
            → Department → Section → Branch Location.
          </p>
        </CardContent>
      </Card>

      {FOUNDATION_SECTIONS.map((section) => (
        <Card
          key={section.id}
          id={section.id}
          data-manual-anchor={section.id}
          className="scroll-mt-32"
        >
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline">Section {section.sectionNumber}</Badge>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{section.readTimeMin} min read</span>
            </div>
            <CardTitle className="text-2xl">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <section.Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
