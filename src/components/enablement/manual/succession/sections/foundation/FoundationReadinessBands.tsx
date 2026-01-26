import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Database,
  Settings,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  Sprout,
  XCircle
} from 'lucide-react';

export function FoundationReadinessBands() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.3 Readiness Rating Bands</h3>
        <p className="text-muted-foreground">
          Define Ready Now, 1-3 Years, 3-5 Years, Developing, and Not a Successor bands with score ranges
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
              <span>Configure the 5-band readiness model</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Define score ranges for each band</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand band-to-action mapping</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Customize labels and colors for organizational terminology</span>
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
              <span className="font-medium">Readiness Bands</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=readiness-bands
          </div>
        </CardContent>
      </Card>

      {/* Database Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Table: readiness_rating_bands
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
                  <td className="py-2 px-3 text-muted-foreground">Primary key (auto-generated)</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">company_id</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">Organization scope</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">rating_label</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Display name (max 50 chars)</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">min_percentage</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Lower bound (inclusive, 0-100)</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">max_percentage</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Upper bound (inclusive, 0-100)</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">color_code</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Hex color for UI</td>
                  <td className="py-2 px-3 text-muted-foreground">#6b7280</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">is_successor_eligible</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Boolean</td>
                  <td className="py-2 px-3 text-muted-foreground">Can be designated as successor</td>
                  <td className="py-2 px-3 text-muted-foreground">true</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">sort_order</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Display sequence</td>
                  <td className="py-2 px-3 text-muted-foreground">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">created_at</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Timestamp</td>
                  <td className="py-2 px-3 text-muted-foreground">Record creation time</td>
                  <td className="py-2 px-3 text-muted-foreground">Auto</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5-Band Model Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            5-Band Readiness Model (Industry Standard)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-600">Ready Now</Badge>
              </div>
              <span className="text-sm font-medium">85-100%</span>
              <span className="text-sm text-muted-foreground flex-1">Can assume role within 0-12 months</span>
              <Badge variant="outline" className="text-green-600">Eligible</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <Badge className="bg-blue-600">Ready 1-3 Years</Badge>
              </div>
              <span className="text-sm font-medium">70-84%</span>
              <span className="text-sm text-muted-foreground flex-1">Strong candidate requiring targeted development</span>
              <Badge variant="outline" className="text-blue-600">Eligible</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <Badge className="bg-amber-600">Ready 3-5 Years</Badge>
              </div>
              <span className="text-sm font-medium">55-69%</span>
              <span className="text-sm text-muted-foreground flex-1">Long-term pipeline with foundational gaps</span>
              <Badge variant="outline" className="text-amber-600">Eligible</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-orange-600" />
                <Badge className="bg-orange-600">Developing</Badge>
              </div>
              <span className="text-sm font-medium">40-54%</span>
              <span className="text-sm text-muted-foreground flex-1">Early career or significant gaps to close</span>
              <Badge variant="outline" className="text-orange-600">Conditional</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <Badge variant="destructive">Not a Successor</Badge>
              </div>
              <span className="text-sm font-medium">0-39%</span>
              <span className="text-sm text-muted-foreground flex-1">Not suitable for this succession path</span>
              <Badge variant="outline" className="text-red-600">Not Eligible</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Implications */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Implications by Band</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Band</th>
                  <th className="text-left py-3 px-4 font-medium">Strategic Implication</th>
                  <th className="text-left py-3 px-4 font-medium">Recommended Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge className="bg-green-600">Ready Now</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Can assume role within 0-12 months with minimal transition risk</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Stretch assignments, exposure to board/executives, shadow current incumbent</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge className="bg-blue-600">Ready 1-3 Years</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Strong candidate requiring targeted development</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Leadership development program, cross-functional projects, mentorship pairing</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge className="bg-amber-600">Ready 3-5 Years</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Long-term pipeline with foundational gaps</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Skills training, rotational assignments, formal education sponsorship</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge className="bg-orange-600">Developing</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Early career or significant gaps to close</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Core competency development, performance improvement, career pathing</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><Badge variant="destructive">Not a Successor</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Not suitable for this specific succession path</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Redirect to alternative career paths, consider lateral moves, role realignment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Score Calculation Formula */}
      <Card>
        <CardHeader>
          <CardTitle>Score Calculation Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────────────────┐
│                       READINESS SCORE CALCULATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: Calculate Indicator Scores                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  For each indicator:                                                        │
│    Normalized Score = (Rating Given / Max Rating) × 100%                    │
│                                                                             │
│  STEP 2: Apply Indicator Weights                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Weighted Score = Normalized Score × (Indicator Weight / 100)               │
│                                                                             │
│  STEP 3: Sum and Normalize                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Total Score = Σ (Weighted Scores) / Σ (Active Weights) × 100              │
│                                                                             │
│  STEP 4: Map to Band                                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Find band where: min_percentage ≤ Total Score ≤ max_percentage            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Worked Example */}
      <Card>
        <CardHeader>
          <CardTitle>Worked Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`Candidate: Marcus Johnson
Form: Executive Readiness Assessment (5 indicators)

Indicator               Rating  Max  Normalized  Weight  Weighted
────────────────────────────────────────────────────────────────────
Strategic Thinking      4       5    80%         25%     20.0
Leadership Presence     5       5    100%        20%     20.0
Business Acumen         3       5    60%         20%     12.0
Change Management       4       5    80%         20%     16.0
Results Orientation     4       5    80%         15%     12.0
────────────────────────────────────────────────────────────────────
                                      Total:     100%    80.0%

Total Score: 80.0%
Band Assignment: Ready 1-3 Years (70-84%)`}</pre>
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
                  <td className="py-2 px-3 text-muted-foreground">Succession → Setup → Readiness Bands</td>
                  <td className="py-2 px-3 text-muted-foreground">Page loads</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">2</td>
                  <td className="py-2 px-3">Review defaults</td>
                  <td className="py-2 px-3 text-muted-foreground">Check 5 default bands</td>
                  <td className="py-2 px-3 text-muted-foreground">Bands display in table</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">3</td>
                  <td className="py-2 px-3">Initialize if empty</td>
                  <td className="py-2 px-3 text-muted-foreground">Click "Initialize Default Bands"</td>
                  <td className="py-2 px-3 text-muted-foreground">5 bands created</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">4</td>
                  <td className="py-2 px-3">Verify coverage</td>
                  <td className="py-2 px-3 text-muted-foreground">Ensure 0-100% covered without gaps</td>
                  <td className="py-2 px-3 text-muted-foreground">No overlaps or gaps</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">5</td>
                  <td className="py-2 px-3">Adjust ranges</td>
                  <td className="py-2 px-3 text-muted-foreground">Modify min/max if org uses different thresholds</td>
                  <td className="py-2 px-3 text-muted-foreground">Ranges validated</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">6</td>
                  <td className="py-2 px-3">Customize labels</td>
                  <td className="py-2 px-3 text-muted-foreground">Change "Ready Now" to org terminology</td>
                  <td className="py-2 px-3 text-muted-foreground">Labels updated</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">7</td>
                  <td className="py-2 px-3">Add descriptions</td>
                  <td className="py-2 px-3 text-muted-foreground">Write strategic implications</td>
                  <td className="py-2 px-3 text-muted-foreground">Text saved</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">8</td>
                  <td className="py-2 px-3">Set colors</td>
                  <td className="py-2 px-3 text-muted-foreground">Choose brand-aligned colors</td>
                  <td className="py-2 px-3 text-muted-foreground">Valid hex codes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">9</td>
                  <td className="py-2 px-3">Configure eligibility</td>
                  <td className="py-2 px-3 text-muted-foreground">Mark bottom bands as not successor-eligible</td>
                  <td className="py-2 px-3 text-muted-foreground">Flags set</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">10</td>
                  <td className="py-2 px-3">Save and preview</td>
                  <td className="py-2 px-3 text-muted-foreground">Confirm in readiness form preview</td>
                  <td className="py-2 px-3 text-muted-foreground">Bands appear correctly</td>
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
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.3.1</td>
                  <td className="py-2 px-3 text-muted-foreground">Bands must cover 0-100% without gaps</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.3.2</td>
                  <td className="py-2 px-3 text-muted-foreground">Bands must not overlap</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.3.3</td>
                  <td className="py-2 px-3 text-muted-foreground">At least 3 bands required</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.3.4</td>
                  <td className="py-2 px-3 text-muted-foreground">Maximum 7 bands allowed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.3.5</td>
                  <td className="py-2 px-3 text-muted-foreground">At least 1 band must be successor-eligible</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">BR-2.3.6</td>
                  <td className="py-2 px-3 text-muted-foreground">Band codes must be unique within company</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Models */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">3-Band Model (Simplified)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Band</th>
                    <th className="text-left py-2">Range</th>
                    <th className="text-left py-2">Use Case</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b">
                    <td className="py-2">Ready</td>
                    <td className="py-2">70-100%</td>
                    <td className="py-2 text-muted-foreground">Immediate successors</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Developing</td>
                    <td className="py-2">40-69%</td>
                    <td className="py-2 text-muted-foreground">Pipeline with development</td>
                  </tr>
                  <tr>
                    <td className="py-2">Not Ready</td>
                    <td className="py-2">0-39%</td>
                    <td className="py-2 text-muted-foreground">Redirect or exit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">4-Band Model (SAP SuccessFactors Pattern)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Band</th>
                    <th className="text-left py-2">Range</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b">
                    <td className="py-2">Ready Now</td>
                    <td className="py-2">80-100%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Ready 1-2 Years</td>
                    <td className="py-2">60-79%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Ready 3+ Years</td>
                    <td className="py-2">40-59%</td>
                  </tr>
                  <tr>
                    <td className="py-2">Not a Successor</td>
                    <td className="py-2">0-39%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
