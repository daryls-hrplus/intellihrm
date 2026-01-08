import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Clock, Users } from 'lucide-react';
import {
  LookupValuesSetup,
  GovernmentIdTypesSetup,
  DataImportSetup,
  IntegrationSettingsSetup
} from './sections/organization';

export function HRHubManualOrganizationSection() {
  return (
    <div className="space-y-8" data-manual-anchor="hh-part-2">
      {/* Chapter Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50/50 to-background dark:from-purple-950/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-purple-600 border-purple-300">Chapter 2</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  45 min read
                </Badge>
              </div>
              <CardTitle className="text-2xl">Organization Configuration</CardTitle>
              <p className="text-muted-foreground mt-1">
                Foundational setup for lookup values, government IDs, data imports, and integrations
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              HR Administrator
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              System Administrator
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              Implementation Consultant
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This chapter covers the foundational configuration that must be completed before 
            other HR Hub modules can function properly. Complete these sections in order during 
            initial implementation, then return as needed for maintenance.
          </p>
        </CardContent>
      </Card>

      {/* Section 2.1: Lookup Values */}
      <LookupValuesSetup />

      {/* Section 2.2: Government ID Types */}
      <GovernmentIdTypesSetup />

      {/* Section 2.3: Data Import Tools */}
      <DataImportSetup />

      {/* Section 2.4: Integration Settings */}
      <IntegrationSettingsSetup />
    </div>
  );
}
