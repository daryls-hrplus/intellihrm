import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Scale, Users, BarChart3, Bell, FileSearch } from 'lucide-react';

// Section A: Compliance Program Framework (5.1-5.3)
import { LndComplianceOverview } from './sections/compliance/LndComplianceOverview';
import { LndComplianceCategories } from './sections/compliance/LndComplianceCategories';
import { LndComplianceCalendar } from './sections/compliance/LndComplianceCalendar';

// Section B: Assignment Management (5.4-5.7)
import { LndComplianceBulkAssignments } from './sections/compliance/LndComplianceBulkAssignments';
import { LndComplianceIndividualAssignments } from './sections/compliance/LndComplianceIndividualAssignments';
import { LndComplianceExemptions } from './sections/compliance/LndComplianceExemptions';
import { LndComplianceStatusLifecycle } from './sections/compliance/LndComplianceStatusLifecycle';

// Section C: Monitoring & Dashboards (5.8-5.11)
import { LndComplianceDashboardAnalytics } from './sections/compliance/LndComplianceDashboardAnalytics';
import { LndComplianceRiskIndicators } from './sections/compliance/LndComplianceRiskIndicators';
import { LndComplianceManagerView } from './sections/compliance/LndComplianceManagerView';
import { LndComplianceExecutiveReports } from './sections/compliance/LndComplianceExecutiveReports';

export function LndComplianceSection() {
  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <Card id="lnd-ch-5" data-manual-anchor="lnd-ch-5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Chapter 5: Compliance Training Operations</CardTitle>
              <CardDescription>
                Regulatory compliance, assignment management, monitoring, and HSE integration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">L&D Administrator</Badge>
            <Badge variant="outline">Compliance Officer</Badge>
            <Badge variant="outline">HR Manager</Badge>
            <Badge variant="outline">HSE Officer</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This chapter covers the operational aspects of compliance training management, 
            from assignment workflows to executive reporting. It integrates with the HSE module 
            for safety-critical training and provides comprehensive audit trail capabilities.
          </p>
        </CardContent>
      </Card>

      {/* Section A: Compliance Program Framework */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Section A: Compliance Program Framework (5.1-5.3)</CardTitle>
          </div>
          <CardDescription>Regulatory drivers, training categories, and calendar management</CardDescription>
        </CardHeader>
      </Card>
      
      <LndComplianceOverview />
      <Separator />
      <LndComplianceCategories />
      <Separator />
      <LndComplianceCalendar />

      {/* Section B: Assignment Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Section B: Assignment Management (5.4-5.7)</CardTitle>
          </div>
          <CardDescription>Bulk operations, individual management, exemptions, and status lifecycle</CardDescription>
        </CardHeader>
      </Card>
      
      <Separator />
      <LndComplianceBulkAssignments />
      <Separator />
      <LndComplianceIndividualAssignments />
      <Separator />
      <LndComplianceExemptions />
      <Separator />
      <LndComplianceStatusLifecycle />

      {/* Section C: Monitoring & Dashboards */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Section C: Monitoring & Dashboards (5.8-5.11)</CardTitle>
          </div>
          <CardDescription>Analytics, risk indicators, manager view, and executive reporting</CardDescription>
        </CardHeader>
      </Card>
      
      <Separator />
      <LndComplianceDashboardAnalytics />
      <Separator />
      <LndComplianceRiskIndicators />
      <Separator />
      <LndComplianceManagerView />
      <Separator />
      <LndComplianceExecutiveReports />

      {/* Placeholder for Sections D, E, F - To be completed */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Section D: Escalation & Enforcement (5.12-5.15)</CardTitle>
          </div>
          <CardDescription>Escalation rules, grace periods, non-compliance, and HR intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Documentation in progress. See Section 5.7 for status lifecycle including escalation triggers.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Section E: Audit & Reporting (5.16-5.19)</CardTitle>
          </div>
          <CardDescription>Audit trail, regulatory reports, evidence packages, and historical records</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Documentation in progress. See Section 5.11 for executive reporting capabilities.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Section F: HSE & Industry Compliance (5.20-5.23)</CardTitle>
          </div>
          <CardDescription>HSE integration, incident-triggered training, OSHA, and Caribbean regional requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Documentation in progress. HSE integration details are referenced throughout Sections A-C. 
            See Chapter 8 Integration Section for HSE module data flow architecture.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
