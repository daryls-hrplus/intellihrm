import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

import {
  UsersAdminLevels,
  UsersRoleArchitecture,
  UsersRoleManagement,
  UsersPermissionGroups,
  UsersGranularPermissions,
  UsersAccountManagement,
  UsersAccessRequest,
  UsersAutoApproval
} from './sections/users';

const USERS_SECTIONS = [
  {
    id: 'admin-sec-3-1',
    sectionNumber: '3.1',
    title: 'Administrator Levels',
    description: 'Four-tier administrator hierarchy and capability matrix',
    readTimeMin: 12,
    Component: UsersAdminLevels,
  },
  {
    id: 'admin-sec-3-2',
    sectionNumber: '3.2',
    title: 'Role Architecture',
    description: 'System roles, custom roles, and inheritance patterns',
    readTimeMin: 15,
    Component: UsersRoleArchitecture,
  },
  {
    id: 'admin-sec-3-3',
    sectionNumber: '3.3',
    title: 'Role Management',
    description: 'Creating, cloning, and managing user roles',
    readTimeMin: 12,
    Component: UsersRoleManagement,
  },
  {
    id: 'admin-sec-3-4',
    sectionNumber: '3.4',
    title: 'Permission Groups',
    description: 'Module-based permission bundling and assignment',
    readTimeMin: 10,
    Component: UsersPermissionGroups,
  },
  {
    id: 'admin-sec-3-5',
    sectionNumber: '3.5',
    title: 'Granular Permissions',
    description: 'Fine-grained access control and field-level security',
    readTimeMin: 15,
    Component: UsersGranularPermissions,
  },
  {
    id: 'admin-sec-3-6',
    sectionNumber: '3.6',
    title: 'User Account Management',
    description: 'User lifecycle, provisioning, and deprovisioning',
    readTimeMin: 12,
    Component: UsersAccountManagement,
  },
  {
    id: 'admin-sec-3-7',
    sectionNumber: '3.7',
    title: 'Access Request Workflow',
    description: 'Self-service access requests and approval chains',
    readTimeMin: 10,
    Component: UsersAccessRequest,
  },
  {
    id: 'admin-sec-3-8',
    sectionNumber: '3.8',
    title: 'Auto-Approval Rules',
    description: 'Automated access provisioning based on criteria',
    readTimeMin: 8,
    Component: UsersAutoApproval,
  },
] as const;

export function AdminManualUsersSection() {
  return (
    <div className="space-y-8">
      <Card id="admin-part-3" data-manual-anchor="admin-part-3" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 3: Users & Roles Configuration</CardTitle>
          <CardDescription>
            Complete user management, role architecture, and permission configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Follow this sequence: Admin Levels → Role Architecture → Role Management → Permission Groups
            → Granular Permissions → Account Management → Access Requests → Auto-Approval.
          </p>
        </CardContent>
      </Card>

      {USERS_SECTIONS.map((section) => (
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
