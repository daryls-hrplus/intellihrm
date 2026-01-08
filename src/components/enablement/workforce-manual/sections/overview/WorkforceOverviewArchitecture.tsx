import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Database, ArrowRight, Layers, Server, 
  Users, Briefcase, Building2, Network, Link2
} from 'lucide-react';

export function WorkforceOverviewArchitecture() {
  return (
    <Card id="wf-sec-1-3" data-manual-anchor="wf-sec-1-3" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">System Architecture</CardTitle>
        <CardDescription>Data model from territories to employees, integration points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Data Model Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Core Data Model
          </h3>
          <p className="text-muted-foreground mb-4">
            The Workforce module uses a hierarchical data model where organization structure entities 
            flow from territories down to employees. Each entity maintains relationships with its 
            parent and child levels.
          </p>

          {/* Data Flow Diagram */}
          <div className="p-6 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-4 text-center">Organization to Employee Data Flow</h4>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Territory</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Company Group</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Company</Badge>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Division</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Department</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-teal-500/20 text-teal-600 border-teal-500/30">Section</Badge>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Job Family</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-indigo-500/20 text-indigo-600 border-indigo-500/30">Job</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-violet-500/20 text-violet-600 border-violet-500/30">Position</Badge>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Assignment</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge className="bg-pink-500/20 text-pink-600 border-pink-500/30">Employee</Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Core Tables */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Core Database Tables
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Table</th>
                  <th className="border p-3 text-left font-medium">Purpose</th>
                  <th className="border p-3 text-left font-medium">Key Relationships</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { table: 'territories', purpose: 'Geographic regions', relations: 'Parent-child hierarchy, companies' },
                  { table: 'company_groups', purpose: 'Holding company structures', relations: 'companies, territories' },
                  { table: 'companies', purpose: 'Legal entities', relations: 'company_groups, divisions, departments' },
                  { table: 'divisions', purpose: 'Business segments', relations: 'companies, departments' },
                  { table: 'departments', purpose: 'Functional units', relations: 'companies, divisions, sections, positions' },
                  { table: 'sections', purpose: 'Sub-department teams', relations: 'departments' },
                  { table: 'branch_locations', purpose: 'Physical offices', relations: 'companies' },
                  { table: 'job_families', purpose: 'Career streams', relations: 'jobs' },
                  { table: 'jobs', purpose: 'Role definitions', relations: 'job_families, positions, competencies' },
                  { table: 'positions', purpose: 'Org chart seats', relations: 'jobs, departments, assignments' },
                  { table: 'profiles', purpose: 'Employee records', relations: 'assignments, companies, departments' },
                  { table: 'employee_assignments', purpose: 'Position-employee links', relations: 'profiles, positions' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-mono text-xs">{row.table}</td>
                    <td className="border p-3 text-muted-foreground">{row.purpose}</td>
                    <td className="border p-3 text-muted-foreground text-xs">{row.relations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Integration Points */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Module Integration Points
          </h3>
          <p className="text-muted-foreground mb-4">
            Workforce data flows to and from other Intelli HRM modules. Understanding these integration 
            points is critical for system configuration.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { module: 'Recruitment', flow: 'Outbound', description: 'Position requisitions, job requirements, hiring manager data' },
              { module: 'Payroll', flow: 'Outbound', description: 'Employee master data, position grades, cost centers' },
              { module: 'Benefits', flow: 'Outbound', description: 'Employment type, eligibility status, dependents' },
              { module: 'Leave & Time', flow: 'Outbound', description: 'Position-based policies, department calendars, shift eligibility' },
              { module: 'Performance', flow: 'Bidirectional', description: 'Job competencies, position goals, manager relationships' },
              { module: 'Learning', flow: 'Outbound', description: 'Job training requirements, competency gaps, certifications' },
              { module: 'Compensation', flow: 'Bidirectional', description: 'Position grades, salary bands, compa-ratio data' },
              { module: 'Succession', flow: 'Outbound', description: 'Position criticality, incumbent data, org relationships' }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{item.module}</span>
                  <Badge variant="outline" className={
                    item.flow === 'Outbound' 
                      ? 'bg-blue-500/10 text-blue-600' 
                      : 'bg-green-500/10 text-green-600'
                  }>
                    {item.flow}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Technical Considerations */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Technical Considerations</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Network className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">Multi-Tenancy</h4>
              <p className="text-xs text-muted-foreground">
                Data is isolated by company_id with Row Level Security (RLS) policies.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Layers className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">Soft Deletes</h4>
              <p className="text-xs text-muted-foreground">
                Records use is_active flags rather than hard deletes for audit compliance.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Database className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">Date Effectivity</h4>
              <p className="text-xs text-muted-foreground">
                Positions and assignments use start_date/end_date for historical tracking.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
