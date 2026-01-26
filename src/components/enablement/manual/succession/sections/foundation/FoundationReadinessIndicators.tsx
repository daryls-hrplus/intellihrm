import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Database,
  Lightbulb,
  Brain,
  Users,
  TrendingUp,
  Zap,
  BookOpen,
  Wrench,
  Heart,
  Trophy,
  Info
} from 'lucide-react';

export function FoundationReadinessIndicators() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.4 Readiness Indicators & BARS</h3>
        <p className="text-muted-foreground">
          Design readiness assessment questions aligned to competencies with behavioral anchors (BARS)
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
              <span>Design readiness assessment questions aligned to competencies</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure indicator weights for scoring</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Create behavioral anchors (BARS) for consistent rating</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Organize indicators into categories</span>
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
              <span className="font-medium">Indicators</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=readiness-indicators
          </div>
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Table: readiness_assessment_indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">Primary key (auto-generated)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">form_id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">FK to readiness_assessment_forms</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">indicator_name</td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Question/statement text (max 500 chars)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">category_id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">FK to readiness_assessment_categories</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">weight_percent</td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Contribution to score (0-100)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">rating_scale_max</td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Max rating value (3, 4, 5, or 7)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">assessor_type</td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Which assessor type uses this indicator</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">scoring_guide_low</td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">BARS anchor for low ratings (1-2)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">scoring_guide_mid</td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">BARS anchor for mid ratings (3)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">scoring_guide_high</td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">BARS anchor for high ratings (4-5)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">sort_order</td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Display sequence within category</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">created_at</td>
                  <td className="py-2 px-3">Timestamp</td>
                  <td className="py-2 px-3 text-muted-foreground">Record creation time</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weight Summary */}
      <Card>
        <CardHeader>
          <CardTitle>8 Categories, 32 Indicators - Weight Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Category</th>
                  <th className="text-left py-2 px-3 font-medium">Icon</th>
                  <th className="text-left py-2 px-3 font-medium">Weight</th>
                  <th className="text-left py-2 px-3 font-medium">Indicators</th>
                  <th className="text-left py-2 px-3 font-medium">Avg per Indicator</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Strategic Mindset</td>
                  <td className="py-2 px-3"><Brain className="h-4 w-4 text-purple-500" /></td>
                  <td className="py-2 px-3">15%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">3.75%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Leadership & Influence</td>
                  <td className="py-2 px-3"><Users className="h-4 w-4 text-blue-500" /></td>
                  <td className="py-2 px-3">15%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">3.75%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Business Acumen</td>
                  <td className="py-2 px-3"><TrendingUp className="h-4 w-4 text-green-500" /></td>
                  <td className="py-2 px-3">15%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">3.75%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Change Leadership</td>
                  <td className="py-2 px-3"><Zap className="h-4 w-4 text-amber-500" /></td>
                  <td className="py-2 px-3">12%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">3.0%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Learning Agility</td>
                  <td className="py-2 px-3"><BookOpen className="h-4 w-4 text-cyan-500" /></td>
                  <td className="py-2 px-3">12%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">3.0%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Technical/Functional</td>
                  <td className="py-2 px-3"><Wrench className="h-4 w-4 text-gray-500" /></td>
                  <td className="py-2 px-3">10%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">2.5%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Interpersonal Effectiveness</td>
                  <td className="py-2 px-3"><Heart className="h-4 w-4 text-pink-500" /></td>
                  <td className="py-2 px-3">10%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">2.5%</td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-2 px-3">Results Orientation</td>
                  <td className="py-2 px-3"><Trophy className="h-4 w-4 text-yellow-500" /></td>
                  <td className="py-2 px-3">11%</td>
                  <td className="py-2 px-3">4</td>
                  <td className="py-2 px-3 text-muted-foreground">2.75%</td>
                </tr>
                <tr className="bg-muted/50 font-semibold">
                  <td className="py-2 px-3">Total</td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3">100%</td>
                  <td className="py-2 px-3">32</td>
                  <td className="py-2 px-3">3.125%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category 1: Strategic Mindset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Category 1: Strategic Mindset (15% weight, 4 indicators)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Indicator</th>
                  <th className="text-left py-2 px-3 font-medium w-12">Wt</th>
                  <th className="text-left py-2 px-3 font-medium">BARS Low (1-2)</th>
                  <th className="text-left py-2 px-3 font-medium">BARS Mid (3)</th>
                  <th className="text-left py-2 px-3 font-medium">BARS High (4-5)</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Demonstrates long-term strategic thinking</td>
                  <td className="py-2 px-3">4%</td>
                  <td className="py-2 px-3 text-muted-foreground">Focuses only on immediate tasks; rarely considers future implications</td>
                  <td className="py-2 px-3 text-muted-foreground">Sometimes considers strategic implications but inconsistently applies strategic lens</td>
                  <td className="py-2 px-3 text-muted-foreground">Consistently anticipates future trends and aligns decisions with long-term strategy</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Identifies emerging trends and opportunities</td>
                  <td className="py-2 px-3">4%</td>
                  <td className="py-2 px-3 text-muted-foreground">Misses market signals; reactive to changes</td>
                  <td className="py-2 px-3 text-muted-foreground">Recognizes trends when pointed out; moderate proactivity</td>
                  <td className="py-2 px-3 text-muted-foreground">Proactively identifies trends before competitors; creates opportunity from disruption</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Balances short-term results with long-term value</td>
                  <td className="py-2 px-3">4%</td>
                  <td className="py-2 px-3 text-muted-foreground">Sacrifices long-term for short-term gains</td>
                  <td className="py-2 px-3 text-muted-foreground">Manages tension but sometimes favors one over other</td>
                  <td className="py-2 px-3 text-muted-foreground">Skillfully balances both; makes principled trade-offs with clear rationale</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Translates strategy into actionable plans</td>
                  <td className="py-2 px-3">3%</td>
                  <td className="py-2 px-3 text-muted-foreground">Cannot connect strategy to execution</td>
                  <td className="py-2 px-3 text-muted-foreground">Creates plans but gaps exist between strategy and action</td>
                  <td className="py-2 px-3 text-muted-foreground">Seamlessly converts strategy into executable plans with clear milestones</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category 2: Leadership & Influence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Category 2: Leadership & Influence (15% weight, 4 indicators)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Indicator</th>
                  <th className="text-left py-2 px-3 font-medium w-12">Wt</th>
                  <th className="text-left py-2 px-3 font-medium">BARS Low (1-2)</th>
                  <th className="text-left py-2 px-3 font-medium">BARS Mid (3)</th>
                  <th className="text-left py-2 px-3 font-medium">BARS High (4-5)</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Inspires and motivates others toward shared goals</td>
                  <td className="py-2 px-3">4%</td>
                  <td className="py-2 px-3 text-muted-foreground">Team lacks direction; low engagement</td>
                  <td className="py-2 px-3 text-muted-foreground">Provides direction but inspiration inconsistent</td>
                  <td className="py-2 px-3 text-muted-foreground">Creates compelling vision; team highly engaged and aligned</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Develops talent and builds capable teams</td>
                  <td className="py-2 px-3">4%</td>
                  <td className="py-2 px-3 text-muted-foreground">Neglects development; hoards knowledge</td>
                  <td className="py-2 px-3 text-muted-foreground">Develops some team members; uneven investment</td>
                  <td className="py-2 px-3 text-muted-foreground">Actively develops all team members; known for building strong teams</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Demonstrates executive presence</td>
                  <td className="py-2 px-3">4%</td>
                  <td className="py-2 px-3 text-muted-foreground">Lacks confidence in senior settings; poor impression</td>
                  <td className="py-2 px-3 text-muted-foreground">Adequate presence but not memorable</td>
                  <td className="py-2 px-3 text-muted-foreground">Commands attention; credible with executives and board</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Navigates organizational politics effectively</td>
                  <td className="py-2 px-3">3%</td>
                  <td className="py-2 px-3 text-muted-foreground">Naive to politics; undermined by organizational dynamics</td>
                  <td className="py-2 px-3 text-muted-foreground">Recognizes politics but sometimes outmaneuvered</td>
                  <td className="py-2 px-3 text-muted-foreground">Masters organizational dynamics; builds coalitions effectively</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category 5: Learning Agility (NEW) */}
      <Card className="border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-500" />
            Category 5: Learning Agility (12% weight, 4 indicators)
            <Badge className="bg-cyan-500 ml-2">NEW - Gap 5 Closure</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Indicator</th>
                  <th className="text-left py-2 px-3 font-medium w-12">Wt</th>
                  <th className="text-left py-2 px-3 font-medium">BARS Low (1-2)</th>
                  <th className="text-left py-2 px-3 font-medium">BARS Mid (3)</th>
                  <th className="text-left py-2 px-3 font-medium">BARS High (4-5)</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Demonstrates intellectual curiosity</td>
                  <td className="py-2 px-3">3%</td>
                  <td className="py-2 px-3 text-muted-foreground">Rarely seeks new knowledge; satisfied with current skills</td>
                  <td className="py-2 px-3 text-muted-foreground">Learns when required; moderate curiosity</td>
                  <td className="py-2 px-3 text-muted-foreground">Voracious learner; constantly seeks new knowledge and perspectives</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Applies learnings from diverse experiences</td>
                  <td className="py-2 px-3">3%</td>
                  <td className="py-2 px-3 text-muted-foreground">Cannot transfer skills across contexts</td>
                  <td className="py-2 px-3 text-muted-foreground">Sometimes applies past learnings</td>
                  <td className="py-2 px-3 text-muted-foreground">Rapidly transfers insights across domains; sees patterns others miss</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Seeks and acts on feedback</td>
                  <td className="py-2 px-3">3%</td>
                  <td className="py-2 px-3 text-muted-foreground">Defensive to feedback; dismisses input</td>
                  <td className="py-2 px-3 text-muted-foreground">Accepts feedback but selective action</td>
                  <td className="py-2 px-3 text-muted-foreground">Actively solicits feedback; visibly acts on input</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Experiments with new approaches</td>
                  <td className="py-2 px-3">3%</td>
                  <td className="py-2 px-3 text-muted-foreground">Risk-averse; sticks to proven methods</td>
                  <td className="py-2 px-3 text-muted-foreground">Tries new things occasionally</td>
                  <td className="py-2 px-3 text-muted-foreground">Regularly experiments; embraces calculated risks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* BARS Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            BARS (Behaviorally Anchored Rating Scales) Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">BARS Design Principles</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li><span className="font-medium text-foreground">Observable Behaviors:</span> Describe what you would SEE, not infer</li>
              <li><span className="font-medium text-foreground">Specific Examples:</span> Concrete actions, not vague traits</li>
              <li><span className="font-medium text-foreground">Mutually Exclusive:</span> Each level distinct from adjacent levels</li>
              <li><span className="font-medium text-foreground">Progressive Difficulty:</span> Clear escalation from low to high</li>
              <li><span className="font-medium text-foreground">Job-Relevant:</span> Anchored in actual role requirements</li>
            </ol>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre">{`Template for Creating BARS:

Rating 1-2 (Low): [Behavior that indicates lack of competency]
  Pattern: "Rarely/Never [positive behavior]" or "Often [negative behavior]"
  Example: "Rarely considers strategic implications; focuses only on immediate tasks"

Rating 3 (Mid): [Behavior showing developing competency]
  Pattern: "Sometimes [positive behavior]" or "Inconsistently [demonstrates skill]"
  Example: "Sometimes considers strategic implications but application is inconsistent"

Rating 4-5 (High): [Behavior showing mastery]
  Pattern: "Consistently/Always [positive behavior]" or "Role model for [skill]"
  Example: "Consistently anticipates trends and aligns decisions with strategy"`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Additional Categories Summary */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Additional Categories</AlertTitle>
        <AlertDescription className="text-sm">
          <p className="mb-2">The remaining categories follow the same BARS structure:</p>
          <ul className="space-y-1">
            <li>• <span className="font-medium">Business Acumen (15%):</span> Financial drivers, data-driven decisions, market dynamics, customer focus</li>
            <li>• <span className="font-medium">Change Leadership (12%):</span> Drives change, navigates ambiguity, learns from failures, challenges status quo</li>
            <li>• <span className="font-medium">Technical/Functional (10%):</span> Deep expertise, stays current, solves complex problems, transfers knowledge</li>
            <li>• <span className="font-medium">Interpersonal Effectiveness (10%):</span> Builds trust, communicates with clarity, collaborates across boundaries, EQ</li>
            <li>• <span className="font-medium">Results Orientation (11%):</span> Delivers on commitments, sets ambitious goals, accountability, resource efficiency</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
