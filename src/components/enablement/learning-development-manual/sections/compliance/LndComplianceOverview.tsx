import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Scale, FileCheck, AlertTriangle } from 'lucide-react';

export function LndComplianceOverview() {
  return (
    <section id="sec-5-1" data-manual-anchor="sec-5-1" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.1 Regulatory Compliance Overview</h2>
          <p className="text-muted-foreground">Framework, governance structure, and regulatory drivers</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Understand the compliance training program governance structure</li>
            <li>Identify key regulatory drivers across jurisdictions (OSHA, Caribbean labor laws, GDPR)</li>
            <li>Navigate between L&D compliance and HSE safety training integration</li>
            <li>Configure organization-wide compliance policies and enforcement rules</li>
            <li>Establish audit-ready compliance documentation practices</li>
          </ul>
        </CardContent>
      </Card>

      {/* Compliance Program Governance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Program Governance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The compliance training program operates within a multi-tier governance structure that ensures 
            regulatory alignment, organizational accountability, and audit readiness.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE GOVERNANCE HIERARCHY                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EXECUTIVE LEVEL                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Chief Compliance Officer / HR Director                               │   │
│   │ ├── Sets organizational compliance policy                            │   │
│   │ ├── Approves mandatory training requirements                         │   │
│   │ └── Reviews executive compliance dashboards (Section 5.11)          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│   OPERATIONAL LEVEL                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ L&D Administrator / Compliance Manager                               │   │
│   │ ├── Configures compliance training rules (Chapter 2.8)              │   │
│   │ ├── Manages bulk assignments (Section 5.4)                          │   │
│   │ ├── Monitors compliance dashboards (Section 5.8)                    │   │
│   │ └── Coordinates with HSE for safety training (Section 5.20)         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│   MANAGER LEVEL                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Department Managers / Team Leads                                     │   │
│   │ ├── Receives escalation notifications (Section 5.12)                │   │
│   │ ├── Approves exemption requests (Section 5.6)                       │   │
│   │ ├── Views team compliance status (Section 5.10)                     │   │
│   │ └── Ensures team completion before deadlines                         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│   EMPLOYEE LEVEL                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ All Employees                                                        │   │
│   │ ├── Receives assignment notifications                                │   │
│   │ ├── Completes required training by due date                         │   │
│   │ ├── Maintains certifications (Section 4.17)                         │   │
│   │ └── Requests exemptions when applicable (Section 5.6)               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Regulatory Drivers by Jurisdiction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Regulatory Framework</TableHead>
                <TableHead>Key Training Requirements</TableHead>
                <TableHead>Penalty Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">United States</TableCell>
                <TableCell>OSHA 29 CFR 1910/1926</TableCell>
                <TableCell>Hazard Communication, LOTO, Confined Space, PPE</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Trinidad & Tobago</TableCell>
                <TableCell>OSH Act 2004</TableCell>
                <TableCell>Safety induction, Fire safety, First aid</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jamaica</TableCell>
                <TableCell>OSHA Jamaica Act</TableCell>
                <TableCell>Workplace safety, Chemical handling</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Barbados</TableCell>
                <TableCell>Safety & Health at Work Act</TableCell>
                <TableCell>General safety, Machinery operation</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dominican Republic</TableCell>
                <TableCell>Código de Trabajo</TableCell>
                <TableCell>Occupational health, Risk prevention</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">European Union</TableCell>
                <TableCell>GDPR, EU-OSHA</TableCell>
                <TableCell>Data protection, Privacy awareness</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Financial Services</TableCell>
                <TableCell>AML/KYC Regulations</TableCell>
                <TableCell>Anti-money laundering, Know your customer</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Healthcare</TableCell>
                <TableCell>HIPAA, Bloodborne Pathogens</TableCell>
                <TableCell>Patient privacy, Infection control</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Database Schema Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database Schema: compliance_training</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Core table for defining organizational compliance training requirements.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>PK</TableCell>
                <TableCell>Unique compliance rule identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Multi-tenant company isolation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">name</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Compliance requirement name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">description</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Detailed requirement description</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Linked LMS course (lms_courses)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">frequency_type</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>one_time, annual, biannual, quarterly, monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">frequency_months</TableCell>
                <TableCell>INTEGER</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Custom frequency in months</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">target_departments</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Targeted department IDs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">target_positions</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Targeted job position IDs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">target_locations</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Targeted work location IDs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">is_mandatory</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Enforced completion requirement</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">grace_period_days</TableCell>
                <TableCell>INTEGER</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Days allowed after due date (default: 0)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">regulatory_body</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>No</TableCell>
                <TableCell>External regulatory reference (OSHA, GDPR, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">region_code</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Regional applicability (JM, TT, BB, US, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">is_active</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Active enforcement status</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">effective_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Requirement effective start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">expiry_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Requirement sunset date</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Compliance vs HSE Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            L&D Compliance vs HSE Safety Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Understanding the distinction and integration between L&D compliance training and HSE safety training 
            is critical for proper system configuration.
          </p>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aspect</TableHead>
                <TableHead>L&D Compliance Training</TableHead>
                <TableHead>HSE Safety Training</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Primary Table</TableCell>
                <TableCell className="font-mono text-xs">compliance_training</TableCell>
                <TableCell className="font-mono text-xs">hse_safety_training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Assignment Table</TableCell>
                <TableCell className="font-mono text-xs">compliance_training_assignments</TableCell>
                <TableCell className="font-mono text-xs">hse_training_records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Scope</TableCell>
                <TableCell>All regulatory training (AML, GDPR, etc.)</TableCell>
                <TableCell>Workplace safety and health only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Integration</TableCell>
                <TableCell>References lms_courses directly</TableCell>
                <TableCell>lms_course_id links to LMS courses</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Incident Trigger</TableCell>
                <TableCell>Not incident-driven</TableCell>
                <TableCell>Can be triggered by safety incidents</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Documentation</TableCell>
                <TableCell>This chapter (5.1-5.19)</TableCell>
                <TableCell>Section 5.20-5.23 + HSE Module</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-amber-600 mb-2">Integration Note</h4>
            <p className="text-sm">
              When <code className="bg-muted px-1 rounded">hse_safety_training.lms_course_id</code> is set, 
              the HSE requirement becomes visible in L&D compliance dashboards. Completion syncs bidirectionally 
              between <code className="bg-muted px-1 rounded">hse_training_records</code> and 
              <code className="bg-muted px-1 rounded">lms_enrollments</code>. 
              See <strong>Section 5.20</strong> for detailed integration workflows.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Industry Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Target compliance rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">14 days</div>
              <div className="text-sm text-muted-foreground">Average completion time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">30 days</div>
              <div className="text-sm text-muted-foreground">Recommended assignment lead time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
