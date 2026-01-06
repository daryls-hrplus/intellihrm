import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

import {
  SystemSettings,
  SystemLookupValues,
  SystemCurrencies,
  SystemCustomFields,
  SystemNotifications,
  SystemDashboardOrdering,
  SystemBulkOperations,
  SystemBranding,
  SystemTemplates,
  SystemWorkflows,
  SystemScheduledAutomation
} from './sections/system';

const SYSTEM_SECTIONS = [
  {
    id: 'admin-sec-5-1',
    sectionNumber: '5.1',
    title: 'System Settings',
    description: 'Global configuration for regional formats and feature toggles',
    readTimeMin: 10,
    Component: SystemSettings,
  },
  {
    id: 'admin-sec-5-2',
    sectionNumber: '5.2',
    title: 'Lookup Values',
    description: 'Manage dropdown options and standardized values',
    readTimeMin: 8,
    Component: SystemLookupValues,
  },
  {
    id: 'admin-sec-5-3',
    sectionNumber: '5.3',
    title: 'Currencies',
    description: 'Multi-currency configuration and exchange rates',
    readTimeMin: 8,
    Component: SystemCurrencies,
  },
  {
    id: 'admin-sec-5-4',
    sectionNumber: '5.4',
    title: 'Custom Fields',
    description: 'Extend entities with organization-specific data fields',
    readTimeMin: 12,
    Component: SystemCustomFields,
  },
  {
    id: 'admin-sec-5-5',
    sectionNumber: '5.5',
    title: 'Notifications',
    description: 'Configure notification templates and delivery channels',
    readTimeMin: 10,
    Component: SystemNotifications,
  },
  {
    id: 'admin-sec-5-6',
    sectionNumber: '5.6',
    title: 'Dashboard Ordering',
    description: 'Configure default dashboard layouts by role',
    readTimeMin: 8,
    Component: SystemDashboardOrdering,
  },
  {
    id: 'admin-sec-5-7',
    sectionNumber: '5.7',
    title: 'Bulk Operations',
    description: 'Import, export, and batch update capabilities',
    readTimeMin: 10,
    Component: SystemBulkOperations,
  },
  {
    id: 'admin-sec-5-8',
    sectionNumber: '5.8',
    title: 'Branding & Theming',
    description: 'Customize logos, colors, and visual identity',
    readTimeMin: 8,
    Component: SystemBranding,
  },
  {
    id: 'admin-sec-5-9',
    sectionNumber: '5.9',
    title: 'Communication Templates',
    description: 'Letter templates and email notification configuration',
    readTimeMin: 12,
    Component: SystemTemplates,
  },
  {
    id: 'admin-sec-5-10',
    sectionNumber: '5.10',
    title: 'Workflow Configuration',
    description: 'Approval chains and routing rules',
    readTimeMin: 15,
    Component: SystemWorkflows,
  },
  {
    id: 'admin-sec-5-11',
    sectionNumber: '5.11',
    title: 'Scheduled Automation',
    description: 'Scheduled reports, reminders, and background jobs',
    readTimeMin: 10,
    Component: SystemScheduledAutomation,
  },
] as const;

export function AdminManualSystemSection() {
  return (
    <div className="space-y-8">
      <Card id="admin-part-5" data-manual-anchor="admin-part-5" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 5: System Configuration</CardTitle>
          <CardDescription>
            System settings, lookup values, currencies, and custom fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure system-wide settings that affect all users including regional formats,
            dropdown values, multi-currency support, custom fields, and notification templates.
          </p>
        </CardContent>
      </Card>

      {SYSTEM_SECTIONS.map((section) => (
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
