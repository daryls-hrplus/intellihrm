import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Shield, 
  GitBranch,
  ArrowRight,
  ArrowDown,
  Lock,
  Eye,
  Edit,
  Trash2,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';

export function BenefitsOverviewArchitecture() {
  const coreTables = [
    { 
      name: 'benefit_categories', 
      description: 'Top-level groupings (Medical, Dental, Vision, etc.)', 
      keyFields: 'id, code, name, is_active',
      rowEstimate: '10-20',
      icon: '📁'
    },
    { 
      name: 'benefit_providers', 
      description: 'Insurance carriers and administrators', 
      keyFields: 'id, category_id, name, contact_info',
      rowEstimate: '20-50',
      icon: '🏢'
    },
    { 
      name: 'benefit_plans', 
      description: 'Specific offerings with coverage terms', 
      keyFields: 'id, provider_id, name, coverage_levels, rates',
      rowEstimate: '50-200',
      icon: '📋'
    },
    { 
      name: 'benefit_enrollments', 
      description: 'Employee participation records', 
      keyFields: 'id, employee_id, plan_id, coverage_level, status',
      rowEstimate: '5K-500K',
      icon: '👤'
    },
    { 
      name: 'benefit_claims', 
      description: 'Reimbursement and service requests', 
      keyFields: 'id, enrollment_id, amount, status, submitted_at',
      rowEstimate: '10K-1M',
      icon: '💰'
    },
    { 
      name: 'benefit_life_events', 
      description: 'Qualifying change events', 
      keyFields: 'id, employee_id, event_type, event_date, status',
      rowEstimate: '1K-50K',
      icon: '🎉'
    },
    { 
      name: 'open_enrollment_periods', 
      description: 'Annual enrollment windows', 
      keyFields: 'id, company_id, start_date, end_date, status',
      rowEstimate: '10-50',
      icon: '📅'
    },
    { 
      name: 'waiting_period_tracking', 
      description: 'Employee eligibility countdown', 
      keyFields: 'id, employee_id, plan_id, eligible_date',
      rowEstimate: '1K-100K',
      icon: '⏱️'
    },
  ];

  const enrollmentLifecycle = [
    { stage: 'Draft', description: 'Initial selection, not submitted', color: 'bg-slate-500', next: 'Pending' },
    { stage: 'Pending', description: 'Submitted, awaiting approval/effective date', color: 'bg-amber-500', next: 'Active' },
    { stage: 'Active', description: 'Currently in effect', color: 'bg-emerald-500', next: 'On Hold / Terminated' },
    { stage: 'On Hold', description: 'Temporarily suspended (LOA, etc.)', color: 'bg-blue-500', next: 'Active / Terminated' },
    { stage: 'Terminated', description: 'Ended, may trigger COBRA', color: 'bg-rose-500', next: 'COBRA' },
    { stage: 'COBRA', description: 'Continuation coverage post-termination', color: 'bg-purple-500', next: 'Expired' },
  ];

  const securityRoles = [
    { 
      role: 'Employee', 
      view: ['Own enrollments', 'Own claims', 'Available plans'],
      create: ['Own enrollments', 'Own claims', 'Life events'],
      update: ['Own pending enrollments'],
      delete: ['Own draft claims'],
    },
    { 
      role: 'Manager', 
      view: ['Team enrollment status', 'Team completion rates'],
      create: [],
      update: [],
      delete: [],
    },
    { 
      role: 'HR Admin', 
      view: ['All enrollments', 'All claims', 'Reports'],
      create: ['Enrollments on behalf', 'Life events'],
      update: ['Enrollment status', 'Claim status'],
      delete: ['Draft records'],
    },
    { 
      role: 'Benefits Admin', 
      view: ['Everything'],
      create: ['Plans', 'Providers', 'OE periods', 'All records'],
      update: ['Plan configuration', 'All records'],
      delete: ['Inactive plans', 'All draft records'],
    },
  ];

  const aiServices = [
    {
      name: 'benefits-cost-projector',
      description: 'Forecasts annual benefits costs based on enrollment patterns, demographics, and utilization trends.',
      inputs: ['Current enrollments', 'Historical claims', 'Rate changes', 'Headcount forecasts'],
      outputs: ['12-month cost projection', 'Variance analysis', 'Budget recommendations'],
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      name: 'enrollment-anomaly-detector',
      description: 'Identifies unusual enrollment patterns that may indicate errors or fraud.',
      inputs: ['Enrollment changes', 'Coverage selections', 'Timing patterns'],
      outputs: ['Anomaly alerts', 'Risk scores', 'Investigation recommendations'],
      icon: AlertTriangle,
      color: 'bg-amber-500',
    },
    {
      name: 'eligibility-validator',
      description: 'Validates enrollment eligibility against plan rules and employment criteria.',
      inputs: ['Employee data', 'Plan rules', 'Life event documentation'],
      outputs: ['Eligibility status', 'Missing requirements', 'Remediation steps'],
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
    {
      name: 'claims-fraud-detector',
      description: 'Analyzes claims patterns to identify potentially fraudulent submissions.',
      inputs: ['Claim details', 'Provider patterns', 'Historical behavior'],
      outputs: ['Fraud probability score', 'Red flag indicators', 'Audit recommendations'],
      icon: Shield,
      color: 'bg-rose-500',
    },
  ];

  const auditEvents = [
    { event: 'Enrollment Created', data: 'Employee, Plan, Coverage Level, Effective Date' },
    { event: 'Enrollment Modified', data: 'Changed fields, Previous values, Modified by' },
    { event: 'Enrollment Terminated', data: 'Termination reason, Last coverage date, COBRA eligible' },
    { event: 'Claim Submitted', data: 'Claim type, Amount, Supporting documents' },
    { event: 'Claim Approved/Denied', data: 'Reviewer, Decision reason, Approval amount' },
    { event: 'Life Event Processed', data: 'Event type, Documentation, Resulting changes' },
    { event: 'Plan Configuration Changed', data: 'Changed fields, Effective date, Changed by' },
    { event: 'Open Enrollment Opened/Closed', data: 'Period dates, Eligible employees, Completion rate' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 1</span>
          <span>•</span>
          <span>Section 1.3</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">System Architecture</h2>
        <p className="text-muted-foreground mt-1">
          Technical foundation, data flows, and integration points
        </p>
      </div>

      {/* Entity Relationship Diagram */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Entity Relationship Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-foreground whitespace-pre">
{`┌─────────────────────────┐
│   benefit_categories    │◄──────────────────────────────┐
│  (Medical, Dental...)   │                               │
└───────────┬─────────────┘                               │
            │ 1:N                                          │
            ▼                                              │
┌─────────────────────────┐     ┌─────────────────────────┐
│   benefit_providers     │────►│    benefit_plans        │
│  (Aetna, Guardian...)   │ 1:N │  (Gold PPO, Basic...)   │
└─────────────────────────┘     └───────────┬─────────────┘
                                            │ 1:N
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
      ┌─────────────────────────┐              ┌─────────────────────────┐
      │  benefit_enrollments    │              │  waiting_period_tracking │
      │  (employee_id, plan_id, │              │  (eligibility countdown)│
      │   coverage_level)       │              └─────────────────────────┘
      └───────────┬─────────────┘
                  │ 1:N
                  ▼
      ┌─────────────────────────┐     ┌─────────────────────────┐
      │    benefit_claims       │     │   benefit_life_events   │
      │  (expense submissions)  │     │  (qualifying changes)   │
      └─────────────────────────┘     └─────────────────────────┘

                  ┌─────────────────────────┐
                  │  open_enrollment_periods │
                  │   (annual OE windows)    │
                  └─────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Core Tables Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Core Database Tables</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Table</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground hidden md:table-cell">Key Fields</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Est. Rows</th>
                </tr>
              </thead>
              <tbody>
                {coreTables.map((table, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{table.icon}</span>
                        <code className="text-primary font-medium">{table.name}</code>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{table.description}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{table.keyFields}</code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" className="font-mono text-xs">{table.rowEstimate}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Data Flow & Integration Points</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Upstream */}
            <div className="border rounded-lg p-4 bg-blue-50/50">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <ArrowDown className="h-4 w-4 rotate-180" />
                Upstream Inputs
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Workforce:</strong> Employee records, job assignments, hire dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Settings className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Job Classifications:</strong> FT/PT status, union affiliation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Payroll Schedule:</strong> Pay frequencies, deduction timing</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Documents:</strong> Life event documentation, EOI forms</span>
                </li>
              </ul>
            </div>

            {/* Core Module */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <h4 className="font-semibold text-primary mb-3 flex items-center justify-center gap-2">
                <Database className="h-4 w-4" />
                Benefits Module
              </h4>
              <div className="space-y-2 text-sm text-center">
                <Badge className="w-full justify-center">Plan Configuration</Badge>
                <Badge className="w-full justify-center">Enrollment Processing</Badge>
                <Badge className="w-full justify-center">Claims Management</Badge>
                <Badge className="w-full justify-center">Life Event Handling</Badge>
                <Badge className="w-full justify-center">Open Enrollment</Badge>
                <Badge className="w-full justify-center">Analytics & Reporting</Badge>
              </div>
            </div>

            {/* Downstream */}
            <div className="border rounded-lg p-4 bg-emerald-50/50">
              <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Downstream Outputs
              </h4>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <Database className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Payroll:</strong> Deduction amounts, arrears calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Carrier Feeds:</strong> 834 files, enrollment exports</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Cost Reports:</strong> Utilization, budget tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Compliance:</strong> ACA, ERISA, regional filings</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Enrollment Lifecycle Stages</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {enrollmentLifecycle.map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-2">
                <div className={`px-4 py-2 rounded-lg ${stage.color} text-white text-sm font-medium`}>
                  {stage.stage}
                </div>
                {index < enrollmentLifecycle.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {enrollmentLifecycle.map((stage) => (
              <div key={stage.stage} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="font-medium text-foreground">{stage.stage}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Model */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-rose-600" />
            <CardTitle className="text-lg">Security Model (Role-Based Access)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    <Eye className="h-4 w-4 inline mr-1" /> View
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    <Edit className="h-4 w-4 inline mr-1" /> Create
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    <Settings className="h-4 w-4 inline mr-1" /> Update
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {securityRoles.map((role, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium text-foreground">{role.role}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {role.view.length > 0 ? role.view.join(', ') : '—'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {role.create.length > 0 ? role.create.join(', ') : '—'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {role.update.length > 0 ? role.update.join(', ') : '—'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {role.delete.length > 0 ? role.delete.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg">Audit Trail Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            All significant actions are logged for compliance and accountability. The following events 
            are captured with timestamps, user identity, and detailed change data.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {auditEvents.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground text-sm">{item.event}</div>
                  <div className="text-xs text-muted-foreground">{item.data}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Services Architecture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">AI Services Architecture</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            The Benefits module leverages four specialized AI agents that run continuously to provide 
            predictive insights, automate validations, and detect anomalies.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {aiServices.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${service.color} flex items-center justify-center`}>
                    <service.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <code className="text-primary font-medium">{service.name}</code>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-1">INPUTS</div>
                    <ul className="text-xs space-y-0.5">
                      {service.inputs.map((input, i) => (
                        <li key={i} className="text-foreground">• {input}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary/5 rounded p-2">
                    <div className="text-xs font-medium text-primary mb-1">OUTPUTS</div>
                    <ul className="text-xs space-y-0.5">
                      {service.outputs.map((output, i) => (
                        <li key={i} className="text-foreground">• {output}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
