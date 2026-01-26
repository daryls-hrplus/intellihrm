import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Settings,
  Bell,
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Building,
  Network,
  Shield,
  UserCog,
  FileCheck,
  ClipboardList,
  Lightbulb,
  Info
} from 'lucide-react';

export function FoundationPrerequisites() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.1 Prerequisites Checklist</h3>
        <p className="text-muted-foreground">
          Required configurations from Core Framework, Workforce, Performance, and Competency modules before succession setup
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Identify all required prerequisites before succession configuration</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand module dependencies and integration points</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Verify organizational data readiness for succession planning</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Recognize common prerequisite gaps and remediation steps</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-300">System Path:</span>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span>Succession</span>
              <ArrowRight className="h-3 w-3" />
              <span>Setup</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">Prerequisites Check</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=prerequisites
          </div>
        </CardContent>
      </Card>

      {/* Core Framework Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" />
            Core Framework Prerequisites (Shared Setup)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These shared configurations must be completed before succession-specific setup begins.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Item</th>
                  <th className="text-left py-3 px-4 font-medium">Path</th>
                  <th className="text-left py-3 px-4 font-medium">Details</th>
                  <th className="text-left py-3 px-4 font-medium">Validation Check</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Approval Workflows</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Core Framework → Workflows</td>
                  <td className="py-3 px-4 text-muted-foreground">SUCCESSION_READINESS_APPROVAL workflow configured</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Active workflow template exists with succession event type</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Notification Rules</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Core Framework → Notifications</td>
                  <td className="py-3 px-4 text-muted-foreground">Succession event notifications (assessment_requested, assessment_completed)</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Notification templates exist for each event</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Competency Framework</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Core Framework → Competencies</td>
                  <td className="py-3 px-4 text-muted-foreground">Leadership competencies identified and active</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">At least 5 leadership competencies marked active</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Performance Trends</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Core Framework → Performance Index</td>
                  <td className="py-3 px-4 text-muted-foreground">Succession signals contributing to index</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">succession_weight &gt; 0 in index settings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Critical Prerequisites */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Critical Prerequisites (Must Complete Before Setup)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Item</th>
                  <th className="text-left py-3 px-4 font-medium">Path</th>
                  <th className="text-left py-3 px-4 font-medium">Details</th>
                  <th className="text-left py-3 px-4 font-medium">Validation</th>
                  <th className="text-left py-3 px-4 font-medium">Remediation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Workforce Data</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Employees</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Active employees with manager hierarchy</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">reporting_manager_id populated for 95%+ employees</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Run hierarchy validation report</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Job Architecture</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Jobs</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Job families, grades, is_key_position flags</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">At least 10 jobs marked is_key_position = true</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Review strategic roles with leadership</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Position Structure</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Positions</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Positions linked to jobs with incumbents</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">position.job_id not null for all positions</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Complete position-job mapping</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Organizational Units</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Org Structure</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Departments, divisions established</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">org_units hierarchy complete to 3 levels</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Import org chart from HRIS</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">User Roles</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Admin → Access Management</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">HR Admin, Manager roles with succession permissions</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Succession module access granted to HR roles</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Update role permissions</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Staff Types</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Staff Types</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Executive, Manager, Professional, etc. defined</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">At least 3 staff types active</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Configure staff type hierarchy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Recommended Prerequisites (Enhance Functionality)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Item</th>
                  <th className="text-left py-3 px-4 font-medium">Benefit</th>
                  <th className="text-left py-3 px-4 font-medium">If Missing</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Competency Mappings</td>
                  <td className="py-3 px-4 text-muted-foreground">Enables gap analysis in readiness assessments</td>
                  <td className="py-3 px-4 text-muted-foreground">Manual gap identification required</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Performance Cycle Complete</td>
                  <td className="py-3 px-4 text-muted-foreground">Provides appraisal data for Nine-Box performance axis</td>
                  <td className="py-3 px-4 text-muted-foreground">Manual performance input needed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">360 Feedback Results</td>
                  <td className="py-3 px-4 text-muted-foreground">Multi-rater signals for potential assessment</td>
                  <td className="py-3 px-4 text-muted-foreground">Single-source potential rating only</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Goal Achievement Data</td>
                  <td className="py-3 px-4 text-muted-foreground">Performance axis enrichment</td>
                  <td className="py-3 px-4 text-muted-foreground">Appraisal-only performance data</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Skills Inventory</td>
                  <td className="py-3 px-4 text-muted-foreground">Technical readiness assessment</td>
                  <td className="py-3 px-4 text-muted-foreground">Competency-only assessment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dependency Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Configuration Dependency Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION DEPENDENCY CHAIN                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: Core Framework (Shared - Complete First)                          │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐   ┌────────────────┐    │
│  │Workflows │ → │Notifications │ → │Competencies │ → │Perf. Trends    │    │
│  └──────────┘   └──────────────┘   └─────────────┘   └────────────────┘    │
│                                                                             │
│  PHASE 2: Foundation Configuration (This Chapter)                           │
│  ┌──────────────┐   ┌────────────────┐   ┌────────────────────┐            │
│  │Assessor Types│ → │Readiness Bands │ → │Readiness Categories│            │
│  └──────────────┘   └────────────────┘   └─────────┬──────────┘            │
│                                                     │                       │
│                                                     ▼                       │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │Readiness         │ → │Readiness Forms   │ → │Availability      │        │
│  │Indicators        │   │(Link to Indicat.)│   │Reasons           │        │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘        │
│                                                                             │
│  PHASE 3: Nine-Box Configuration (Chapter 3)                                │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │Rating Sources    │ → │Signal Mappings   │ → │Indicator Labels  │        │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Assessment Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Readiness Assessment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Data Readiness
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Key positions identified (minimum 10 strategic roles)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Employee data complete (name, job, manager, department)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Staff types assigned to all employees
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Reporting relationships established (95%+ coverage)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Competency profiles linked to key positions
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Process Readiness
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                HR Administrator trained on succession module
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Manager communication plan prepared
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Executive sponsor identified
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Timeline for first assessment cycle defined
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Success metrics established
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Technical Readiness
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                User roles configured with succession permissions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Notification templates customized with branding
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Approval workflow tested with sample data
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Common Prerequisite Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Common Prerequisite Gaps & Remediation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Issue</th>
                  <th className="text-left py-3 px-4 font-medium">Symptom</th>
                  <th className="text-left py-3 px-4 font-medium">Root Cause</th>
                  <th className="text-left py-3 px-4 font-medium">Fix</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Missing job architecture</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Cannot identify key positions</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Jobs not flagged as critical</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Jobs → Edit → Enable "Key Position" flag</td>
                  <td className="py-3 px-4"><Badge variant="destructive">Critical</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">No position hierarchy</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Succession plans lack target position</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Position-job relationship missing</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Positions → Link to Job</td>
                  <td className="py-3 px-4"><Badge variant="destructive">Critical</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">No appraisal data</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Nine-Box has no performance input</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">No completed appraisal cycles</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Complete at least one appraisal cycle or use manual entry</td>
                  <td className="py-3 px-4"><Badge className="bg-amber-500">High</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Incomplete org structure</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Cannot cascade by department</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Org units not established</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Org Structure → Import hierarchy</td>
                  <td className="py-3 px-4"><Badge className="bg-amber-500">High</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Missing staff types</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Forms cannot be assigned</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Staff type configuration empty</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Workforce → Staff Types → Create types</td>
                  <td className="py-3 px-4"><Badge variant="secondary">Medium</Badge></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">No competency framework</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Gap analysis unavailable</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Competencies not defined</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Core Framework → Competencies → Configure</td>
                  <td className="py-3 px-4"><Badge variant="secondary">Medium</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Validation Report */}
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Pre-Configuration Validation</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <p className="mb-2">
            The system provides an automated prerequisite check accessible via:
          </p>
          <code className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
            Path: Succession → Setup → Run Validation
          </code>
          <p className="mt-2 text-sm">
            This generates a report showing:
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span>Passing checks (green) - Ready to proceed</span>
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span>Warnings (amber) - Can proceed but functionality limited</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>Blockers (red) - Must resolve before proceeding</span>
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
