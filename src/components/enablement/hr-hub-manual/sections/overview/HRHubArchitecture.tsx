import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, FileText, ArrowRight, Database, 
  Users, BarChart3, Shield, Settings, CheckSquare
} from 'lucide-react';
import { ModuleIntegrationMap } from '@/components/enablement/shared';
import { WarningCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';

export function HRHubArchitecture() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-1-3">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 1.3</Badge>
            <Badge variant="secondary">8 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">System Architecture</h2>
          <p className="text-muted-foreground mt-1">
            Integration with Workforce, data flows, module dependencies
          </p>
        </div>
      </div>

      <WarningCallout title="Workforce Module Required">
        HR Hub depends on the Workforce module for organization structure, employee data, 
        and job architecture. Complete Workforce setup before configuring HR Hub.
      </WarningCallout>

      {/* Module Integration Map */}
      <ModuleIntegrationMap
        currentModule="hr_hub"
        integrations={[
          {
            module: 'workforce',
            points: [
              { sourceSection: 'hh-sec-3-4', targetSection: 'wf-sec-2-1', type: 'prerequisite', label: 'Org structure for SOPs' },
              { sourceSection: 'hh-sec-4-1', targetSection: 'wf-sec-2-8', type: 'data_flow', label: 'Branch locations for calendar' },
              { sourceSection: 'hh-sec-5-1', targetSection: 'wf-sec-2-4', type: 'prerequisite', label: 'Company setup for compliance' },
              { sourceSection: 'hh-sec-5-2', targetSection: 'wf-sec-2-6', type: 'data_flow', label: 'Department hierarchy for workflows' }
            ]
          },
          {
            module: 'appraisals',
            points: [
              { sourceSection: 'hh-sec-4-3', targetSection: 'ap-sec-2-1', type: 'data_flow', label: 'Milestones trigger reviews' },
              { sourceSection: 'hh-sec-5-1', targetSection: 'ap-sec-4-1', type: 'bidirectional', label: 'Compliance feeds performance' }
            ]
          },
          {
            module: 'learning',
            points: [
              { sourceSection: 'hh-sec-5-1', targetSection: 'lms-sec-3-1', type: 'data_flow', label: 'Compliance training assignment' }
            ]
          }
        ]}
        title="HR Hub Integration Points"
      />

      {/* Data Flow Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Layer 1: Foundation */}
            <div className="p-4 rounded-lg border-2 border-blue-500/30 bg-blue-500/5">
              <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Foundation Layer (Workforce Module)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Companies
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Departments
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Employees
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Jobs & Positions
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
            </div>

            {/* Layer 2: HR Hub Core */}
            <div className="p-4 rounded-lg border-2 border-purple-500/30 bg-purple-500/5">
              <h4 className="font-medium text-purple-600 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                HR Hub Core Layer
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Help Desk
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Knowledge Base
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Documents
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Compliance
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Task Comments
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
            </div>

            {/* Layer 3: Automation */}
            <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/5">
              <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Automation Layer
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Workflows
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Milestones
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Reminders
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Tasks
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Recurring Tasks
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
            </div>

            {/* Layer 4: Insights */}
            <div className="p-4 rounded-lg border-2 border-amber-500/30 bg-amber-500/5">
              <h4 className="font-medium text-amber-600 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Insights Layer
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Sentiment
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Recognition
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Audit Logs
                </div>
                <div className="p-2 bg-background rounded border text-center text-sm">
                  Dashboards
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle>Key Dependencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border">
              <Shield className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Compliance → Companies</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Compliance rules are company-specific due to varying jurisdictions. 
                  Each legal entity may have different regulatory requirements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border">
              <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Workflows → Departments</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Approval routing uses the department hierarchy. Changes to org structure 
                  automatically reflect in workflow routing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border">
              <Building2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Calendar → Branch Locations</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Holiday calendars and events are location-aware. Branch setup in Workforce 
                  enables location-specific event management.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border">
              <CheckSquare className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Tasks → Team Profiles</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Task assignment uses active employee profiles. Recurring tasks respect 
                  company and team structure for automatic routing.
                </p>
              </div>
            </div>
          </div>

          <InfoCallout title="Cascading Updates" className="mt-4">
            When you update organization structure in Workforce, HR Hub automatically inherits 
            those changes. Workflow routing, content targeting, and compliance assignments 
            update in real-time.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
}
