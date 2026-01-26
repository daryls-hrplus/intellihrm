import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Users,
  Info,
  Settings,
  AlertTriangle,
  Lightbulb,
  Database
} from 'lucide-react';

export function FoundationAssessorTypes() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.2 Assessor Types Configuration</h3>
        <p className="text-muted-foreground">
          Configure Manager, HR, Executive, and Skip-Level assessor roles with permissions and weights
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
              <span>Configure assessor roles for readiness assessments</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand required vs. optional assessor designation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Set up staff-type restrictions for assessor scope</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Define weight guidance for multi-assessor consolidation</span>
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
              <span className="font-medium">Assessor Types</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=assessor-types
          </div>
        </CardContent>
      </Card>

      {/* Database Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Table: succession_assessor_types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="text-left py-2 px-3 font-medium">Default</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">id</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">Primary key</td>
                  <td className="py-2 px-3 text-muted-foreground">Auto-generated</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">company_id</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">Organization scope</td>
                  <td className="py-2 px-3 text-muted-foreground">Current company</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">type_code</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Unique identifier</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">type_label</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Display name</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">is_required</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Boolean</td>
                  <td className="py-2 px-3 text-muted-foreground">Must complete assessment</td>
                  <td className="py-2 px-3 text-muted-foreground">false</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">weight_percentage</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Score contribution weight (0-100)</td>
                  <td className="py-2 px-3 text-muted-foreground">null</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">applies_to_staff_types</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">Text[]</td>
                  <td className="py-2 px-3 text-muted-foreground">Restrict to specific staff types</td>
                  <td className="py-2 px-3 text-muted-foreground">null (all)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">can_view_other_assessments</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Boolean</td>
                  <td className="py-2 px-3 text-muted-foreground">See other assessor ratings</td>
                  <td className="py-2 px-3 text-muted-foreground">false</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">can_override_score</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Boolean</td>
                  <td className="py-2 px-3 text-muted-foreground">Adjust final score</td>
                  <td className="py-2 px-3 text-muted-foreground">false</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Default Assessor Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Default Assessor Types Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            System seeds 4 default assessor types following industry best practices:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Type Code</th>
                  <th className="text-left py-2 px-3 font-medium">Label</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                  <th className="text-left py-2 px-3 font-medium">Weight</th>
                  <th className="text-left py-2 px-3 font-medium">Staff Types</th>
                  <th className="text-left py-2 px-3 font-medium">View Others</th>
                  <th className="text-left py-2 px-3 font-medium">Override</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">manager</td>
                  <td className="py-2 px-3 font-medium">Direct Manager</td>
                  <td className="py-2 px-3"><Badge className="bg-green-500 text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">40%</td>
                  <td className="py-2 px-3 text-muted-foreground">All</td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">hr</td>
                  <td className="py-2 px-3 font-medium">HR Partner</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">25%</td>
                  <td className="py-2 px-3 text-muted-foreground">All</td>
                  <td className="py-2 px-3"><Badge className="bg-blue-500 text-xs">Yes</Badge></td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">executive</td>
                  <td className="py-2 px-3 font-medium">Executive Reviewer</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">20%</td>
                  <td className="py-2 px-3 text-muted-foreground">Executive, Director</td>
                  <td className="py-2 px-3"><Badge className="bg-blue-500 text-xs">Yes</Badge></td>
                  <td className="py-2 px-3"><Badge className="bg-amber-500 text-xs">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">skip_level</td>
                  <td className="py-2 px-3 font-medium">Skip-Level Manager</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">15%</td>
                  <td className="py-2 px-3 text-muted-foreground">Manager, Director</td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weight Distribution Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Distribution Best Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────┐
│                 ASSESSOR WEIGHT DISTRIBUTION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Direct Manager (40%)     ████████████████████                  │
│  HR Partner (25%)         ████████████                          │
│  Executive (20%)          ██████████                            │
│  Skip-Level (15%)         ███████                               │
│                           ─────────────────────────────────     │
│                           Total: 100%                           │
│                                                                 │
│  RATIONALE:                                                     │
│  • Manager has most direct observation (highest weight)         │
│  • HR provides cross-organizational perspective                 │
│  • Executive validates strategic readiness                      │
│  • Skip-level offers secondary leadership view                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Step-by-Step Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium w-12">Step</th>
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                  <th className="text-left py-2 px-3 font-medium">Details</th>
                  <th className="text-left py-2 px-3 font-medium">Validation</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">1</td>
                  <td className="py-2 px-3">Navigate to Setup</td>
                  <td className="py-2 px-3 text-muted-foreground">Succession → Setup → Assessor Types tab</td>
                  <td className="py-2 px-3 text-muted-foreground">Page loads with table view</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">2</td>
                  <td className="py-2 px-3">Review defaults</td>
                  <td className="py-2 px-3 text-muted-foreground">Check if system has seeded default types</td>
                  <td className="py-2 px-3 text-muted-foreground">4 default types present</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">3</td>
                  <td className="py-2 px-3">Initialize if empty</td>
                  <td className="py-2 px-3 text-muted-foreground">Click "Initialize Default Types" button</td>
                  <td className="py-2 px-3 text-muted-foreground">Types created with defaults</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">4</td>
                  <td className="py-2 px-3">Enable/disable types</td>
                  <td className="py-2 px-3 text-muted-foreground">Toggle is_enabled for each type</td>
                  <td className="py-2 px-3 text-muted-foreground">At least 1 type enabled</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">5</td>
                  <td className="py-2 px-3">Set required flag</td>
                  <td className="py-2 px-3 text-muted-foreground">Mark manager type as required (typical)</td>
                  <td className="py-2 px-3 text-muted-foreground">Required assessor exists</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">6</td>
                  <td className="py-2 px-3">Configure weights</td>
                  <td className="py-2 px-3 text-muted-foreground">Enter weight_percentage for each enabled type</td>
                  <td className="py-2 px-3 text-muted-foreground">Weights sum to 100%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">7</td>
                  <td className="py-2 px-3">Set staff type restrictions</td>
                  <td className="py-2 px-3 text-muted-foreground">Limit executive type to senior roles</td>
                  <td className="py-2 px-3 text-muted-foreground">Array populated or null</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">8</td>
                  <td className="py-2 px-3">Configure visibility</td>
                  <td className="py-2 px-3 text-muted-foreground">Enable "View Others" for HR/Executive</td>
                  <td className="py-2 px-3 text-muted-foreground">Checkbox toggled</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">9</td>
                  <td className="py-2 px-3">Enable override (optional)</td>
                  <td className="py-2 px-3 text-muted-foreground">Allow executives to adjust final scores</td>
                  <td className="py-2 px-3 text-muted-foreground">Use sparingly</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">10</td>
                  <td className="py-2 px-3">Set sort order</td>
                  <td className="py-2 px-3 text-muted-foreground">Arrange display sequence</td>
                  <td className="py-2 px-3 text-muted-foreground">Numbers 1-4 assigned</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">11</td>
                  <td className="py-2 px-3">Add custom types</td>
                  <td className="py-2 px-3 text-muted-foreground">Create additional types if needed</td>
                  <td className="py-2 px-3 text-muted-foreground">Unique type_code</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">12</td>
                  <td className="py-2 px-3">Save and validate</td>
                  <td className="py-2 px-3 text-muted-foreground">Confirm changes saved</td>
                  <td className="py-2 px-3 text-muted-foreground">Success toast displayed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Business Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Rule</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="text-left py-2 px-3 font-medium">Enforcement</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2.1</td>
                  <td className="py-2 px-3 text-muted-foreground">At least one assessor type must be enabled</td>
                  <td className="py-2 px-3 text-muted-foreground">Save blocked if all disabled</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2.2</td>
                  <td className="py-2 px-3 text-muted-foreground">Type codes must be unique within company</td>
                  <td className="py-2 px-3 text-muted-foreground">Database constraint</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2.3</td>
                  <td className="py-2 px-3 text-muted-foreground">Required types must have assessments before band assignment</td>
                  <td className="py-2 px-3 text-muted-foreground">Workflow validation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2.4</td>
                  <td className="py-2 px-3 text-muted-foreground">Weight percentages should sum to 100%</td>
                  <td className="py-2 px-3 text-muted-foreground">Warning if not (allows partial)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2.5</td>
                  <td className="py-2 px-3 text-muted-foreground">Staff type restrictions use OR logic</td>
                  <td className="py-2 px-3 text-muted-foreground">Employee matches any listed type</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">BR-2.2.6</td>
                  <td className="py-2 px-3 text-muted-foreground">Override permission requires View Others</td>
                  <td className="py-2 px-3 text-muted-foreground">Dependency validation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Best Practices (Industry-Aligned)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Practice</th>
                  <th className="text-left py-2 px-3 font-medium">Rationale</th>
                  <th className="text-left py-2 px-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Start with Manager as only required type</td>
                  <td className="py-2 px-3 text-muted-foreground">Reduces assessment burden while ensuring core input</td>
                  <td className="py-2 px-3 text-muted-foreground">SAP SuccessFactors</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Enable HR for calibration purposes</td>
                  <td className="py-2 px-3 text-muted-foreground">HR provides cross-organizational perspective</td>
                  <td className="py-2 px-3 text-muted-foreground">Workday Best Practices</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Reserve Executive review for C-suite succession</td>
                  <td className="py-2 px-3 text-muted-foreground">Focus senior leader time on critical roles</td>
                  <td className="py-2 px-3 text-muted-foreground">SHRM Succession Guide</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Set skip-level as optional enhancement</td>
                  <td className="py-2 px-3 text-muted-foreground">Valuable input but not always practical</td>
                  <td className="py-2 px-3 text-muted-foreground">DDI Leadership Research</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Weight Manager at 40-50%</td>
                  <td className="py-2 px-3 text-muted-foreground">Closest observer of daily performance</td>
                  <td className="py-2 px-3 text-muted-foreground">Talent Management Institute</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Keep total enabled types ≤ 4</td>
                  <td className="py-2 px-3 text-muted-foreground">Avoid assessment fatigue</td>
                  <td className="py-2 px-3 text-muted-foreground">Corporate Leadership Council</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Example 1: Lean Startup (2 Assessor Types)</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">Enabled Types:</span> manager (required, 70%), hr (optional, 30%)</p>
              <p><span className="font-medium">Rationale:</span> Small team, HR knows everyone</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Example 2: Enterprise Multi-Level (4 Assessor Types)</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">Enabled Types:</span></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>manager (required, 40%)</li>
                <li>hr (optional, 25%)</li>
                <li>executive (optional for Director+, 20%)</li>
                <li>skip_level (optional for Manager+, 15%)</li>
              </ul>
              <p><span className="font-medium">Rationale:</span> Complex hierarchy, multiple perspectives valuable</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Example 3: Flat Organization (3 Assessor Types)</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">Enabled Types:</span></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>manager (required, 50%)</li>
                <li>peer_panel (custom type, optional, 30%)</li>
                <li>hr (optional, 20%)</li>
              </ul>
              <p><span className="font-medium">Rationale:</span> Peer input valued in collaborative culture</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Issue</th>
                  <th className="text-left py-2 px-3 font-medium">Cause</th>
                  <th className="text-left py-2 px-3 font-medium">Resolution</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Cannot save assessor type</td>
                  <td className="py-2 px-3 text-muted-foreground">Duplicate type_code</td>
                  <td className="py-2 px-3 text-muted-foreground">Change to unique code</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Weight warning appears</td>
                  <td className="py-2 px-3 text-muted-foreground">Percentages don't sum to 100</td>
                  <td className="py-2 px-3 text-muted-foreground">Adjust weights or acknowledge warning</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Type not appearing in forms</td>
                  <td className="py-2 px-3 text-muted-foreground">is_enabled = false</td>
                  <td className="py-2 px-3 text-muted-foreground">Enable the assessor type</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Executive type shown for all employees</td>
                  <td className="py-2 px-3 text-muted-foreground">staff_type restriction not set</td>
                  <td className="py-2 px-3 text-muted-foreground">Add staff type array filter</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Cannot delete assessor type</td>
                  <td className="py-2 px-3 text-muted-foreground">Existing assessments reference it</td>
                  <td className="py-2 px-3 text-muted-foreground">Disable instead of delete</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
