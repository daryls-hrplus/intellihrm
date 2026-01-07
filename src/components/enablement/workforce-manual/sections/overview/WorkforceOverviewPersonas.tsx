import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Users, Shield, UserCog, Briefcase, User, 
  CheckCircle, ArrowRight
} from 'lucide-react';

export function WorkforceOverviewPersonas() {
  return (
    <Card id="wf-sec-1-4" data-manual-anchor="wf-sec-1-4" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.4</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">User Personas & Journeys</CardTitle>
        <CardDescription>Super Admin, HR Admin, HR Ops, Manager (MSS), Employee (ESS) workflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Persona Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Workforce User Personas
          </h3>
          <p className="text-muted-foreground mb-6">
            The Workforce module serves five primary personas, each with distinct responsibilities 
            and access patterns. The system uses progressive disclosure to show relevant features 
            based on the user's role.
          </p>

          <div className="grid gap-4">
            {/* Super Admin */}
            <div className="p-4 border rounded-lg bg-red-500/5 border-red-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Shield className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">Super Admin</h4>
                    <Badge variant="outline" className="text-xs">Full Access</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    System-wide configuration authority including territories, company groups, 
                    governance structures, and cross-company settings.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Territories', 'Company Groups', 'Governance', 'System Config'].map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* HR Admin */}
            <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <UserCog className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">HR Admin</h4>
                    <Badge variant="outline" className="text-xs">Company Scope</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Organization structure management within assigned companies including departments, 
                    job architecture, positions, and headcount planning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Departments', 'Jobs', 'Positions', 'Headcount', 'Analytics'].map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* HR Ops */}
            <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Briefcase className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">HR Ops</h4>
                    <Badge variant="outline" className="text-xs">Transactional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Day-to-day employee data management including new hires, transfers, 
                    terminations, and lifecycle workflow execution.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Employees', 'Transactions', 'Onboarding', 'Offboarding'].map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Manager (MSS) */}
            <div className="p-4 border rounded-lg bg-purple-500/5 border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">Manager (MSS)</h4>
                    <Badge variant="outline" className="text-xs">Team Scope</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Self-service access to view and manage direct reports, approve requests, 
                    and participate in onboarding/offboarding workflows.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['My Team', 'Approvals', 'New Hire Tasks', 'Exit Tasks'].map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Employee (ESS) */}
            <div className="p-4 border rounded-lg bg-amber-500/5 border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <User className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">Employee (ESS)</h4>
                    <Badge variant="outline" className="text-xs">Self Only</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Personal profile management, qualifications updates, transaction history 
                    viewing, and career path exploration.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['My Profile', 'My Qualifications', 'My History', 'Career Paths'].map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sample User Journeys */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sample User Journeys</h3>
          
          <div className="space-y-4">
            {/* HR Admin Journey */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">HR Admin: Create New Department</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">Workforce Dashboard</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Departments</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">+ Add Department</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Select Company</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Enter Details</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge className="bg-green-500">Save</Badge>
              </div>
            </div>

            {/* HR Ops Journey */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">HR Ops: Process New Hire</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">Employees</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">+ New Employee</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Personal Info</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Assign Position</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Start Onboarding</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge className="bg-green-500">Complete</Badge>
              </div>
            </div>

            {/* Manager Journey */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Manager: Complete Onboarding Tasks</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">MSS Dashboard</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Pending Tasks</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">New Hire Checklist</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Mark Complete</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge className="bg-green-500">Done</Badge>
              </div>
            </div>

            {/* Employee Journey */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Employee: Update Qualifications</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">ESS Portal</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">My Profile</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">Qualifications Tab</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline">+ Add Certification</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge className="bg-green-500">Save</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
