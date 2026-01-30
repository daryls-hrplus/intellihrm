import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Info, ArrowRight, Database, Settings, Users, FileText, Mail, Shield, Target, Lightbulb } from 'lucide-react';

export function F360Prerequisites() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.1 Pre-requisites Checklist</h3>
        <p className="text-muted-foreground">
          Before configuring 360 feedback cycles, ensure all dependent modules and data are properly set up.
          This checklist ensures a smooth implementation and prevents configuration errors.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Identify all required prerequisites for 360 feedback configuration</li>
            <li>• Understand module dependencies (Workforce, Competencies, Job Profiles)</li>
            <li>• Verify organizational readiness for cycle launch</li>
            <li>• Recognize common prerequisite gaps and remediation steps</li>
          </ul>
        </CardContent>
      </Card>

      {/* Core Framework Prerequisites */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Core Framework Prerequisites (Shared Setup)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            These shared configurations are managed in <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Performance → Setup → Core Framework</code> and 
            apply across all Performance modules (Goals, Appraisals, 360 Feedback, Recognition).
          </p>
          {[
            {
              item: 'Approval Workflows Configured',
              path: 'Core Framework → Workflows',
              details: 'At least one 360-applicable workflow configured (e.g., Results Release, Nomination Approval)',
              validation: 'Workflow template with category "360 Feedback" exists and is active',
              section: 'See Section 2.8'
            },
            {
              item: 'Notification Rules Defined',
              path: 'Core Framework → Notifications',
              details: 'Reminder rules for 360 event types (invitations, deadlines, results release)',
              validation: 'Event types with category "performance_360" have associated rules',
              section: 'See Section 2.9'
            },
            {
              item: 'Competency Framework Active',
              path: 'Core Framework → Competencies',
              details: 'Competency library with behavioral indicators for question linking and structured feedback',
              validation: 'At least one competency framework is active with defined competencies',
              section: 'See Section 2.4'
            },
            {
              item: 'Performance Index Configured',
              path: 'Core Framework → Performance Trends',
              details: 'Decision on whether 360 scores contribute to Performance Index and at what weight',
              validation: 'Performance Index settings include 360 weight configuration',
              section: 'See Section 2.13'
            }
          ].map((prereq, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-background">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{prereq.item}</span>
                  <Badge className="text-xs bg-primary/10 text-primary">{prereq.path}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{prereq.details}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Validation:</span> {prereq.validation}
                  </p>
                  <Badge variant="outline" className="text-xs">{prereq.section}</Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Critical Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Critical Prerequisites (Must Complete)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              item: 'Workforce Data Loaded',
              path: 'Workforce → Employees',
              details: 'Employee records with manager hierarchy, department assignments, and active status',
              validation: 'At least one employee exists with an assigned manager'
            },
            {
              item: 'Manager Hierarchy Established',
              path: 'Workforce → Employees → Reporting Structure',
              details: 'All employees have reports_to relationships configured for proper rater assignment',
              validation: 'No orphan employees without manager assignments (except CEO/top-level)'
            },
            {
              item: 'Rating Scales Defined',
              path: 'Performance → Setup → Core Framework → Rating Scales',
              details: 'At least one 360-compatible rating scale (typically 1-5) with behavioral descriptions',
              validation: 'Scale with purpose "360_feedback" or "universal" exists and is active'
            },
            {
              item: 'User Roles & Permissions Configured',
              path: 'Admin → Access Management → Role Configuration',
              details: 'HR Admin, Manager, and Employee roles with appropriate 360 feedback permissions',
              validation: 'At least one user has 360 Admin permissions'
            },
            {
              item: 'Email Templates Configured',
              path: 'Admin → Communications → Email Templates',
              details: 'Templates for invitation, reminder, completion, and results release notifications',
              validation: 'Minimum 4 email templates with 360 feedback category'
            }
          ].map((prereq, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{prereq.item}</span>
                  <Badge variant="outline" className="text-xs">{prereq.path}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{prereq.details}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Validation:</span> {prereq.validation}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-blue-500" />
            Recommended Prerequisites (Enhances Functionality)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              item: 'Competency Framework Configured',
              path: 'Performance → Setup → Competencies',
              details: 'Competency library with behavioral indicators for question linking',
              benefit: 'Enables competency-based questions and signal alignment'
            },
            {
              item: 'Job Families Linked to Competencies',
              path: 'Workforce → Setup → Job Families',
              details: 'Job family to competency mappings for role-specific questions',
              benefit: 'Allows automatic question filtering by job family'
            },
            {
              item: 'Company Anonymity Policy Configured',
              path: 'Admin → Governance → Privacy Settings',
              details: 'Organization-wide anonymity thresholds and investigation policies',
              benefit: 'Provides consistent anonymity rules across all cycles'
            },
            {
              item: 'Consent Management Templates Prepared',
              path: 'Admin → Governance → Consent Templates',
              details: 'GDPR-compliant consent text for rater participation',
              benefit: 'Required for external raters and some jurisdictions'
            },
            {
              item: 'Integration Decisions Made',
              path: 'N/A (Planning Activity)',
              details: 'Decisions on feeding 360 data to appraisals, nine-box, succession',
              benefit: 'Enables proper cycle configuration flags'
            }
          ].map((prereq, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
              <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{prereq.item}</span>
                  <Badge variant="secondary" className="text-xs">{prereq.path}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{prereq.details}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Benefit:</span> {prereq.benefit}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dependency Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Configuration Dependency Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Follow this sequence to ensure proper configuration dependencies. Each step builds on the previous.
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border bg-primary/5">
              <p className="text-xs font-medium text-primary mb-2">Phase 1: Core Framework (Shared)</p>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                {[
                  { label: 'Workflows', icon: Settings },
                  { label: 'Notifications', icon: Mail },
                  { label: 'Competencies', icon: Target },
                  { label: 'Performance Trends', icon: Settings }
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background">
                      <step.icon className="h-3.5 w-3.5" />
                      <span>{step.label}</span>
                    </div>
                    {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Phase 2: 360-Specific Configuration</p>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                {[
                  { label: 'Rating Scales', icon: Settings },
                  { label: 'Question Bank', icon: FileText },
                  { label: 'Rater Categories', icon: Users },
                  { label: 'Visibility Rules', icon: Shield },
                  { label: 'Report Templates', icon: FileText },
                  { label: 'Cycle Config', icon: Settings }
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-muted/50">
                      <step.icon className="h-3.5 w-3.5" />
                      <span>{step.label}</span>
                    </div>
                    {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Readiness Assessment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Data Readiness</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Employee count: minimum 10 for meaningful feedback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Manager hierarchy: complete with no circular references
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Department structure: at least 2 levels for aggregation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Email addresses: valid for all participants
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Process Readiness</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  HR Admin identified with training complete
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Manager communication plan prepared
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Employee awareness campaign scheduled
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Escalation procedures documented
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Common Prerequisite Gaps & Remediation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                issue: 'Missing manager assignments',
                symptom: 'Employees cannot be enrolled or assigned manager raters',
                fix: 'Update profiles with reports_to field or bulk import hierarchy'
              },
              {
                issue: 'No rating scale with 360 purpose',
                symptom: 'Cannot create questions with rating response type',
                fix: 'Create or clone a rating scale and assign "360_feedback" purpose'
              },
              {
                issue: 'Email templates not configured',
                symptom: 'System cannot send invitations or reminders',
                fix: 'Clone system templates and customize for organization branding'
              },
              {
                issue: 'Permission gaps for HR Admin',
                symptom: 'HR Admin cannot access setup screens or manage cycles',
                fix: 'Assign 360 Feedback Admin role or add specific permissions'
              }
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-amber-300 bg-white dark:bg-background">
                <div className="font-medium text-sm">{item.issue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Symptom:</span> {item.symptom}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Fix:</span> {item.fix}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Complete all prerequisites at least 2 weeks before planned cycle launch</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Run a pilot cycle with a small group (10-20 employees) before organization-wide rollout</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Document any customizations to system defaults for audit and troubleshooting</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Validate email deliverability by sending test invitations to HR team</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
