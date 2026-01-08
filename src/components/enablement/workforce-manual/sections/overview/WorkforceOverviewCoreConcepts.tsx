import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Clock, Briefcase, Users, Lightbulb, 
  Network, UserCheck, ArrowRight, Layers
} from 'lucide-react';

export function WorkforceOverviewCoreConcepts() {
  return (
    <Card id="wf-sec-1-2" data-manual-anchor="wf-sec-1-2" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
        <CardDescription>Organization hierarchy model, job architecture, position vs job vs employee</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Organization Hierarchy Model */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Organization Hierarchy Model
          </h3>
          <p className="text-muted-foreground mb-4">
            Intelli HRM uses a 10-level organizational hierarchy that supports multi-territory, multi-company 
            operations. Each level inherits settings from its parent and can override specific configurations.
          </p>
          
          {/* Hierarchy Visual */}
          <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
            <div className="flex items-center gap-2 text-sm min-w-max">
              <Badge variant="outline" className="bg-red-500/10 text-red-600">Territory</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600">Company Group</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Company</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">Division</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-green-500/10 text-green-600">Department</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="bg-teal-500/10 text-teal-600">Section</Badge>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Level</th>
                  <th className="border p-3 text-left font-medium">Purpose</th>
                  <th className="border p-3 text-left font-medium">Example</th>
                  <th className="border p-3 text-left font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { level: 'Territory', purpose: 'Geographic region for compliance boundaries', example: 'Caribbean, West Africa', required: 'Optional' },
                  { level: 'Company Group', purpose: 'Holding company for consolidated reporting', example: 'ABC Holdings Ltd', required: 'Optional' },
                  { level: 'Company', purpose: 'Legal entity with tax/labor registration', example: 'ABC Jamaica Ltd', required: 'Required' },
                  { level: 'Division', purpose: 'Major business segment', example: 'Retail Operations', required: 'Optional' },
                  { level: 'Department', purpose: 'Functional unit with cost center', example: 'Human Resources', required: 'Required' },
                  { level: 'Section', purpose: 'Sub-department team grouping', example: 'Talent Acquisition', required: 'Optional' },
                  { level: 'Branch Location', purpose: 'Physical office with geofencing', example: 'Kingston HQ', required: 'Optional' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.level}</td>
                    <td className="border p-3 text-muted-foreground">{row.purpose}</td>
                    <td className="border p-3 text-muted-foreground">{row.example}</td>
                    <td className="border p-3">
                      <Badge variant={row.required === 'Required' ? 'default' : 'secondary'} className="text-xs">
                        {row.required}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Job Architecture */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Architecture Model
          </h3>
          <p className="text-muted-foreground mb-4">
            The job architecture provides a structured framework for defining roles, responsibilities, 
            and career paths across the organization.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg bg-teal-500/5 border-teal-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-teal-500" />
                <h4 className="font-medium">Job Family</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                A grouping of related jobs that share similar competencies and career progression.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Examples:</strong> Engineering, Finance, Operations, Human Resources
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                <h4 className="font-medium">Job</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                A generic role definition with title, grade, competencies, and responsibilities.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Examples:</strong> Software Engineer, HR Manager, Accountant
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Position</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                A specific seat in the organization linked to a job and department.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Examples:</strong> SE-001 in Finance, HR-MGR-01 in Corporate
              </div>
            </div>
          </div>

          {/* Key Distinction Callout */}
          <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <span className="font-semibold text-sm">Key Distinction: Job vs Position</span>
                <p className="text-sm text-muted-foreground mt-1">
                  A <strong>Job</strong> is a template (e.g., "Software Engineer") that defines the role's 
                  competencies, responsibilities, and grade level. A <strong>Position</strong> is a specific 
                  instance of that job within the org structure (e.g., "Software Engineer in Finance Dept, 
                  Reporting to Tech Director"). One job can have many positions across the organization.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Position vs Job vs Employee */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            The Position-Job-Employee Relationship
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Entity</th>
                  <th className="border p-3 text-left font-medium">Definition</th>
                  <th className="border p-3 text-left font-medium">Cardinality</th>
                  <th className="border p-3 text-left font-medium">Lifecycle</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-background">
                  <td className="border p-3 font-medium">Job</td>
                  <td className="border p-3 text-muted-foreground">Template defining role requirements</td>
                  <td className="border p-3 text-muted-foreground">1 Job → Many Positions</td>
                  <td className="border p-3 text-muted-foreground">Long-lived, rarely changes</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-3 font-medium">Position</td>
                  <td className="border p-3 text-muted-foreground">Specific seat in org structure</td>
                  <td className="border p-3 text-muted-foreground">1 Position → 0-1 Employee (typically)</td>
                  <td className="border p-3 text-muted-foreground">Medium-lived, may be vacated/filled</td>
                </tr>
                <tr className="bg-background">
                  <td className="border p-3 font-medium">Employee</td>
                  <td className="border p-3 text-muted-foreground">Person assigned to position(s)</td>
                  <td className="border p-3 text-muted-foreground">1 Employee → 1-N Positions</td>
                  <td className="border p-3 text-muted-foreground">Hire to termination</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-3 font-medium">Assignment</td>
                  <td className="border p-3 text-muted-foreground">Link between employee and position</td>
                  <td className="border p-3 text-muted-foreground">M:N (many-to-many)</td>
                  <td className="border p-3 text-muted-foreground">Per transaction (hire, transfer, etc.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Key Terminology */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Terminology</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { term: 'FTE', definition: 'Full-Time Equivalent. 1.0 FTE = 100% of standard hours. Used for headcount budgeting and position allocation.' },
              { term: 'Headcount', definition: 'The count of filled positions. Can be measured as actual or budgeted.' },
              { term: 'Vacancy', definition: 'An approved, budgeted position that is currently unfilled.' },
              { term: 'Cost Center', definition: 'A financial code linked to departments for budget tracking and GL integration.' },
              { term: 'Primary Assignment', definition: 'The main position for an employee. Determines manager, department, and default policies.' },
              { term: 'Secondary Assignment', definition: 'Additional positions held by an employee (multi-position scenarios).' },
              { term: 'Acting Assignment', definition: 'Temporary assignment to a position, typically during absence or transition.' },
              { term: 'Transaction', definition: 'Any employment change: hire, promotion, transfer, demotion, separation.' }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <span className="font-medium text-sm">{item.term}</span>
                <p className="text-xs text-muted-foreground mt-1">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
