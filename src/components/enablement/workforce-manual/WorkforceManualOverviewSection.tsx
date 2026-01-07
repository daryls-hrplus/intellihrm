import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Target, Users, CheckCircle, Lightbulb, 
  Building2, Clock, GraduationCap, FileText, HelpCircle, Briefcase, Calendar
} from 'lucide-react';

export function WorkforceManualOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1: Introduction */}
      <Card id="wf-sec-1-1" data-manual-anchor="wf-sec-1-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.1</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>10 min read</span>
          </div>
          <CardTitle className="text-2xl">Introduction to Workforce in HRplus</CardTitle>
          <CardDescription>Executive summary, business value, and key differentiators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The HRplus Workforce module is the core foundation of your HRMS, managing organization 
                  structure, job architecture, employee records, and lifecycle processes. It provides 
                  enterprise-grade position control and headcount management for organizations across 
                  the Caribbean, Africa, and global regions.
                </p>
                <div className="mt-4 grid md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">10</div>
                    <div className="text-xs text-muted-foreground">Org Hierarchy Levels</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-xs text-muted-foreground">Position Control</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">ESS/MSS</div>
                    <div className="text-xs text-muted-foreground">Self-Service</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">AI</div>
                    <div className="text-xs text-muted-foreground">Workforce Forecasting</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Business Value Statement
            </h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-4">
                Enterprise workforce management requires robust organization structures and employee data governance. 
                The HRplus Workforce module addresses these challenges:
              </p>
              <ul className="space-y-3 list-none pl-0">
                {[
                  'Multi-level organization hierarchy from territories to sections',
                  'Comprehensive job architecture with job families, jobs, and positions',
                  'Position-based headcount control and budget alignment',
                  'Complete employee lifecycle management from hire to retire',
                  'ESS/MSS capabilities for employee and manager self-service'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Target Audience Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-medium">Role</th>
                    <th className="border p-3 text-left font-medium">Primary Sections</th>
                    <th className="border p-3 text-left font-medium">Key Responsibilities</th>
                    <th className="border p-3 text-left font-medium">Time Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { role: 'Super Admin', primary: 'All Sections', responsibilities: 'Full system configuration', time: '8-10 hours' },
                    { role: 'HR Admin', primary: 'Sections 2-7', responsibilities: 'Org structure, job architecture', time: '6-8 hours' },
                    { role: 'HR Ops', primary: 'Sections 4-5', responsibilities: 'Employee records, lifecycle', time: '4-5 hours' },
                    { role: 'Workforce Planner', primary: 'Sections 6-7', responsibilities: 'Headcount, forecasting', time: '3-4 hours' },
                    { role: 'Manager (MSS)', primary: 'Section 8', responsibilities: 'Team management', time: '1-2 hours' },
                    { role: 'Employee (ESS)', primary: 'Section 8', responsibilities: 'Self-service', time: '30 min' }
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="border p-3 font-medium">{row.role}</td>
                      <td className="border p-3 text-muted-foreground">{row.primary}</td>
                      <td className="border p-3 text-muted-foreground">{row.responsibilities}</td>
                      <td className="border p-3 text-muted-foreground">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1.2: Core Concepts */}
      <Card id="wf-sec-1-2" data-manual-anchor="wf-sec-1-2" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.2</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>12 min read</span>
          </div>
          <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
          <CardDescription>Organization hierarchy, job architecture, position vs job vs employee</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Organization Hierarchy
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Territory:</strong> Geographic region (Caribbean, Africa)</li>
                <li><strong>Company Group:</strong> Holding company structure</li>
                <li><strong>Company:</strong> Legal entity with tax registration</li>
                <li><strong>Division:</strong> Optional large org layer</li>
                <li><strong>Department:</strong> Business unit with cost center</li>
                <li><strong>Section:</strong> Sub-department team</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Job Architecture
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Job Family:</strong> Career stream (e.g., Engineering)</li>
                <li><strong>Job:</strong> Generic role definition</li>
                <li><strong>Position:</strong> Specific seat in the org</li>
                <li><strong>Assignment:</strong> Employee-to-position link</li>
                <li><strong>FTE:</strong> Full-Time Equivalent (1.0 = 100%)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <span className="font-semibold text-sm">Key Distinction</span>
                <p className="text-sm text-muted-foreground mt-1">
                  A <strong>Job</strong> is a template (e.g., "Software Engineer"), while a <strong>Position</strong> 
                  is a specific instance (e.g., "Software Engineer in Finance Dept, Reporting to CTO"). 
                  One job can have many positions across the organization.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1.3-1.5 placeholders */}
      <Card id="wf-sec-1-3" data-manual-anchor="wf-sec-1-3" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.3</Badge>
          </div>
          <CardTitle className="text-2xl">System Architecture</CardTitle>
          <CardDescription>Data model from territories to employees, integration points</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed architecture documentation coming soon.</p>
        </CardContent>
      </Card>

      <Card id="wf-sec-1-4" data-manual-anchor="wf-sec-1-4" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.4</Badge>
          </div>
          <CardTitle className="text-2xl">User Personas & Journeys</CardTitle>
          <CardDescription>Super Admin, HR Admin, HR Ops, Manager, Employee workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User journey documentation coming soon.</p>
        </CardContent>
      </Card>

      <Card id="wf-sec-1-5" data-manual-anchor="wf-sec-1-5" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.5</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Workforce Management Calendar
          </CardTitle>
          <CardDescription>Annual org review cycles, headcount planning, budget alignment</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar documentation coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
