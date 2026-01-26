import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Grid3X3, 
  Target, 
  Calculator, 
  BookOpen,
  Info,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';

export function SuccessionCoreConcepts() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">1.2 Core Concepts & Terminology</h3>
        <p className="text-muted-foreground mt-1">
          Foundational models, scoring methodologies, and key terminology
        </p>
      </div>

      {/* Nine-Box Model Deep Dive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-orange-600" />
            The Nine-Box Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm">
            The Nine-Box Grid is the industry-standard talent assessment framework used by organizations 
            worldwide. It plots employees on two dimensions: <strong>Performance</strong> (current contribution) 
            and <strong>Potential</strong> (future capability), creating 9 distinct talent segments.
          </p>

          {/* Visual Nine-Box Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-1 min-w-[500px] text-xs">
              {/* Header Row */}
              <div className="p-2"></div>
              <div className="p-2 text-center font-semibold bg-red-500/10 rounded-t">Low Performance</div>
              <div className="p-2 text-center font-semibold bg-amber-500/10 rounded-t">Medium Performance</div>
              <div className="p-2 text-center font-semibold bg-green-500/10 rounded-t">High Performance</div>

              {/* High Potential Row */}
              <div className="p-2 font-semibold bg-green-500/10 rounded-l text-right pr-3 flex items-center justify-end">
                High Potential
              </div>
              <div className="p-3 bg-amber-500/20 rounded border border-amber-500/30">
                <div className="font-semibold text-amber-700">Inconsistent Player</div>
                <div className="text-muted-foreground mt-1">High potential but underperforming. Investigate barriers.</div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded border border-blue-500/30">
                <div className="font-semibold text-blue-700">Future Star</div>
                <div className="text-muted-foreground mt-1">Emerging leader. Accelerate development.</div>
              </div>
              <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                <div className="font-semibold text-green-700">Star</div>
                <div className="text-muted-foreground mt-1">Top talent. Ready for promotion. High retention priority.</div>
              </div>

              {/* Medium Potential Row */}
              <div className="p-2 font-semibold bg-amber-500/10 text-right pr-3 flex items-center justify-end">
                Medium Potential
              </div>
              <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                <div className="font-semibold text-red-700">Risk</div>
                <div className="text-muted-foreground mt-1">May need role change or exit plan.</div>
              </div>
              <div className="p-3 bg-muted rounded border">
                <div className="font-semibold">Core Player</div>
                <div className="text-muted-foreground mt-1">Solid contributor. Maintain and develop.</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <div className="font-semibold text-blue-700">High Performer</div>
                <div className="text-muted-foreground mt-1">Strong current impact. Stretch assignments.</div>
              </div>

              {/* Low Potential Row */}
              <div className="p-2 font-semibold bg-red-500/10 rounded-bl text-right pr-3 flex items-center justify-end">
                Low Potential
              </div>
              <div className="p-3 bg-red-500/20 rounded-bl border border-red-500/30">
                <div className="font-semibold text-red-700">Underperformer</div>
                <div className="text-muted-foreground mt-1">Performance improvement plan or transition.</div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                <div className="font-semibold text-amber-700">Effective</div>
                <div className="text-muted-foreground mt-1">Valuable in current role. Limited growth.</div>
              </div>
              <div className="p-3 bg-teal-500/10 rounded-br border border-teal-500/20">
                <div className="font-semibold text-teal-700">Trusted Professional</div>
                <div className="text-muted-foreground mt-1">Expert contributor. May mentor others.</div>
              </div>
            </div>
          </div>

          {/* Axis Explanations */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Performance Axis (X-Axis)
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Measures current contribution and results. Typically derived from:
              </p>
              <ul className="text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Appraisal overall ratings (primary source)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Goal achievement percentages</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>360 feedback scores (results-focused competencies)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>KPI/metric achievement</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Potential Axis (Y-Axis)
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Assesses future growth capability. Typically derived from:
              </p>
              <ul className="text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Learning agility assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Leadership competency scores</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>360 feedback (leadership behaviors)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Career aspiration alignment</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Assessment Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Readiness Assessment Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm">
            The 5-band readiness model evaluates how prepared a succession candidate is to assume 
            a target role. Each band represents a distinct level of readiness with corresponding 
            development implications.
          </p>

          {/* Readiness Bands Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Band</th>
                  <th className="text-left p-3 font-semibold">Label</th>
                  <th className="text-center p-3 font-semibold">Score Range</th>
                  <th className="text-left p-3 font-semibold">Development Implication</th>
                  <th className="text-left p-3 font-semibold">Typical Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge className="bg-green-600">1</Badge>
                  </td>
                  <td className="p-3 font-semibold text-green-700">Ready Now</td>
                  <td className="p-3 text-center">90-100%</td>
                  <td className="p-3">Fully prepared for immediate transition</td>
                  <td className="p-3">Maintain engagement, assign interim duties</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge className="bg-blue-600">2</Badge>
                  </td>
                  <td className="p-3 font-semibold text-blue-700">Ready 1-2 Years</td>
                  <td className="p-3 text-center">70-89%</td>
                  <td className="p-3">Minor gaps; targeted development needed</td>
                  <td className="p-3">Stretch assignments, shadowing, mentorship</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge className="bg-amber-600">3</Badge>
                  </td>
                  <td className="p-3 font-semibold text-amber-700">Ready 3+ Years</td>
                  <td className="p-3 text-center">50-69%</td>
                  <td className="p-3">Significant development required</td>
                  <td className="p-3">Formal training, cross-functional moves</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge className="bg-orange-600">4</Badge>
                  </td>
                  <td className="p-3 font-semibold text-orange-700">Developing</td>
                  <td className="p-3 text-center">30-49%</td>
                  <td className="p-3">Early-stage pipeline candidate</td>
                  <td className="p-3">Long-term IDP, foundational experiences</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge variant="outline">5</Badge>
                  </td>
                  <td className="p-3 font-semibold text-muted-foreground">Not a Successor</td>
                  <td className="p-3 text-center">0-29%</td>
                  <td className="p-3">Not suitable for this succession path</td>
                  <td className="p-3">Alternative career path, lateral moves</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Alert className="border-amber-500/30 bg-amber-500/5">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Best Practice</AlertTitle>
            <AlertDescription className="text-amber-600/80">
              Organizations typically aim for 2-3 "Ready Now" or "Ready 1-2 Years" candidates 
              per critical position to ensure adequate bench strength. The goal is not to fill 
              all bands but to maintain succession coverage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Scoring Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            Scoring Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nine-Box Calculation */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Nine-Box Score Calculation</h4>
            <div className="bg-background p-3 rounded border font-mono text-xs mb-3">
              <div className="text-muted-foreground">// For each axis (Performance & Potential):</div>
              <div className="mt-2">Axis Score = Σ (Source Score × Source Weight) / Σ Weights</div>
              <div className="mt-2 text-muted-foreground">// Then map to 1-3 rating:</div>
              <div className="mt-1">If Axis Score {"<"} 33% → Rating = 1 (Low)</div>
              <div>If Axis Score 33-66% → Rating = 2 (Medium)</div>
              <div>If Axis Score {">"} 66% → Rating = 3 (High)</div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <strong>Example:</strong> An employee has:
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Appraisal Rating: 4.2/5 (84%) with weight 50%</li>
                <li>Goal Achievement: 90% with weight 30%</li>
                <li>360 Feedback: 3.8/5 (76%) with weight 20%</li>
              </ul>
              <div className="mt-2">
                Performance Score = (84×0.5 + 90×0.3 + 76×0.2) / 1.0 = <strong>84.2%</strong> → Rating = 3 (High)
              </div>
            </div>
          </div>

          {/* Readiness Calculation */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Readiness Score Calculation</h4>
            <div className="bg-background p-3 rounded border font-mono text-xs mb-3">
              <div className="text-muted-foreground">// For weighted indicators:</div>
              <div className="mt-2">Readiness % = Σ (Indicator Score × Indicator Weight) / Σ Weights × 100</div>
              <div className="mt-2 text-muted-foreground">// Multi-assessor consolidation:</div>
              <div className="mt-1">Final Score = Σ (Assessor Score × Assessor Weight) / Σ Assessor Weights</div>
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Example:</strong> A candidate is assessed by 3 assessors:
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Manager (weight 40%): 78% readiness</li>
                <li>HR Partner (weight 35%): 82% readiness</li>
                <li>Executive (weight 25%): 70% readiness</li>
              </ul>
              <div className="mt-2">
                Final Readiness = (78×0.4 + 82×0.35 + 70×0.25) = <strong>77.4%</strong> → "Ready 1-2 Years"
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Terminology Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            Key Terminology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Core Succession Terms */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Core Succession Terms
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Successor', definition: 'An employee identified as a potential replacement for a key position' },
                  { term: 'Succession Plan', definition: 'A documented strategy for filling a specific position with qualified candidates' },
                  { term: 'Pipeline', definition: 'The collection of succession candidates at various readiness levels for a position or role family' },
                  { term: 'Bench Strength', definition: 'The depth and quality of succession candidates available for critical positions' },
                  { term: 'Key Position', definition: 'A role designated as critical to organizational success, requiring succession coverage' },
                  { term: 'Slate', definition: 'The ranked list of succession candidates for a specific position' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded border">
                    <div className="font-semibold text-sm">{item.term}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.definition}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nine-Box Terms */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-blue-600" />
                Nine-Box Assessment Terms
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Performance Rating', definition: 'The 1-3 score on the X-axis reflecting current job contribution' },
                  { term: 'Potential Rating', definition: 'The 1-3 score on the Y-axis reflecting future growth capability' },
                  { term: 'Talent Quadrant', definition: 'One of the 9 boxes representing the intersection of performance and potential' },
                  { term: 'Rating Source', definition: 'A data input (appraisal, goals, 360) used to calculate axis scores' },
                  { term: 'Signal Mapping', definition: 'The configuration that translates source scores to Nine-Box ratings' },
                  { term: 'Calibration', definition: 'The process of reviewing and adjusting Nine-Box placements across the organization' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded border">
                    <div className="font-semibold text-sm">{item.term}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.definition}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness Terms */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Readiness Assessment Terms
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Readiness Band', definition: 'A category (Ready Now, 1-2 Years, etc.) indicating succession preparedness' },
                  { term: 'Readiness Indicator', definition: 'A specific question or criterion used to assess candidate readiness' },
                  { term: 'Indicator Weight', definition: 'The relative importance of an indicator in calculating overall readiness' },
                  { term: 'Assessor Type', definition: 'The role (Manager, HR, Executive) of the person conducting the assessment' },
                  { term: 'Assessment Event', definition: 'An instance of a readiness assessment for a specific candidate' },
                  { term: 'Readiness Form', definition: 'A configured template containing indicators for a specific staff type' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded border">
                    <div className="font-semibold text-sm">{item.term}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.definition}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Management Terms */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" />
                Risk Management Terms
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Flight Risk', definition: 'The likelihood of an employee leaving the organization voluntarily' },
                  { term: 'Vacancy Risk', definition: 'The probability and impact of a key position becoming vacant' },
                  { term: 'Retention Risk', definition: 'The combination of flight risk factors and organizational impact' },
                  { term: 'Risk Factor', definition: 'A specific indicator (compensation, engagement, tenure) contributing to flight risk' },
                  { term: 'Criticality Level', definition: 'The assessed importance of a position (Low, Medium, High, Critical)' },
                  { term: 'Replacement Difficulty', definition: 'How hard it is to fill a position from internal or external sources' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded border">
                    <div className="font-semibold text-sm">{item.term}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle States */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Entity Lifecycle States
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Nine-Box Assessment Lifecycle */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Nine-Box Assessment</h4>
              <div className="space-y-2">
                {[
                  { state: 'Pending', color: 'bg-muted', desc: 'Awaiting data sources' },
                  { state: 'Calculated', color: 'bg-blue-500/20 text-blue-700', desc: 'Auto-computed from sources' },
                  { state: 'Calibrated', color: 'bg-amber-500/20 text-amber-700', desc: 'Adjusted by manager/HR' },
                  { state: 'Finalized', color: 'bg-green-500/20 text-green-700', desc: 'Locked for period' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className={item.color}>{item.state}</Badge>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Succession Plan Lifecycle */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Succession Plan</h4>
              <div className="space-y-2">
                {[
                  { state: 'Draft', color: 'bg-muted', desc: 'In development' },
                  { state: 'Active', color: 'bg-green-500/20 text-green-700', desc: 'Current plan' },
                  { state: 'Under Review', color: 'bg-amber-500/20 text-amber-700', desc: 'Being updated' },
                  { state: 'Archived', color: 'bg-muted', desc: 'Historical record' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className={item.color}>{item.state}</Badge>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness Assessment Lifecycle */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Readiness Assessment</h4>
              <div className="space-y-2">
                {[
                  { state: 'Initiated', color: 'bg-muted', desc: 'Event created' },
                  { state: 'In Progress', color: 'bg-blue-500/20 text-blue-700', desc: 'Assessors responding' },
                  { state: 'Pending Review', color: 'bg-amber-500/20 text-amber-700', desc: 'Awaiting HR review' },
                  { state: 'Completed', color: 'bg-green-500/20 text-green-700', desc: 'Band assigned' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className={item.color}>{item.state}</Badge>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
