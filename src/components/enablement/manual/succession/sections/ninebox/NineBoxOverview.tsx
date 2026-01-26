// Section 3.1: Nine-Box Model Overview
// McKinsey 9-Box theory, strategic value, cross-module integration

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  IndustryCallout,
  IntegrationCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  WarningFeatureCard,
  InfoFeatureCard,
} from '../../../components';
import { Grid3X3, TrendingUp, Target, Users, ArrowRight, BarChart3, Brain } from 'lucide-react';

export function NineBoxOverview() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the McKinsey 9-Box Grid methodology and its strategic value in talent management",
          "Differentiate between Performance (current contribution) and Potential (future capability) axes",
          "Identify the strategic implications and development actions for each of the 9 quadrants",
          "Recognize how Nine-Box integrates with Appraisals, 360 Feedback, and Succession Planning modules"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Nine-Box Grid
        </code>
      </InfoCallout>

      {/* Strategic Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Strategic Value of Nine-Box Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Nine-Box Grid is an industry-standard talent assessment framework developed by McKinsey & Company 
            and widely adopted by SAP SuccessFactors, Workday, and leading organizations worldwide. It provides 
            a visual matrix for plotting employees based on two dimensions:
          </p>

          <FeatureCardGrid columns={2}>
            <PrimaryFeatureCard
              icon={BarChart3}
              title="Performance Axis (X)"
              description="Measures current contribution to the organization through appraisal scores, goal achievement, and competency ratings. Answers: 'How well is this person performing today?'"
            />
            <SuccessFeatureCard
              icon={Brain}
              title="Potential Axis (Y)"
              description="Measures future capability and growth capacity through leadership signals, learning agility, and career aspirations. Answers: 'How much can this person grow?'"
            />
          </FeatureCardGrid>

          <IndustryCallout>
            <strong>Industry Benchmark:</strong> According to SHRM, organizations with formal Nine-Box talent 
            reviews have 40% better succession pipeline visibility and 25% higher internal promotion rates.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* The Nine-Box Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            The McKinsey Nine-Box Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Each employee is placed in one of nine quadrants based on their Performance (1-3) and Potential (1-3) 
            ratings. Click any quadrant in the UI to customize labels, colors, and suggested actions.
          </p>

          {/* Interactive Grid */}
          <div className="aspect-square max-w-lg mx-auto mb-6">
            <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full">
              {/* Top Row - High Potential */}
              <div className="bg-amber-500/20 border border-amber-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-amber-600 text-xs mb-1">Inconsistent</Badge>
                <span className="text-xs text-muted-foreground">Potential: High</span>
                <span className="text-xs text-muted-foreground">Performance: Low</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(1,3)</span>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-blue-600 text-xs mb-1">High Potential</Badge>
                <span className="text-xs text-muted-foreground">Potential: High</span>
                <span className="text-xs text-muted-foreground">Performance: Moderate</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(2,3)</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-emerald-600 text-xs mb-1">Star Performer</Badge>
                <span className="text-xs text-muted-foreground">Potential: High</span>
                <span className="text-xs text-muted-foreground">Performance: High</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(3,3)</span>
              </div>

              {/* Middle Row - Moderate Potential */}
              <div className="bg-orange-500/20 border border-orange-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-orange-600 text-xs mb-1">Underperformer</Badge>
                <span className="text-xs text-muted-foreground">Potential: Moderate</span>
                <span className="text-xs text-muted-foreground">Performance: Low</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(1,2)</span>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-purple-600 text-xs mb-1">Solid Contributor</Badge>
                <span className="text-xs text-muted-foreground">Potential: Moderate</span>
                <span className="text-xs text-muted-foreground">Performance: Moderate</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(2,2)</span>
              </div>
              <div className="bg-cyan-500/20 border border-cyan-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-cyan-600 text-xs mb-1">Core Player</Badge>
                <span className="text-xs text-muted-foreground">Potential: Moderate</span>
                <span className="text-xs text-muted-foreground">Performance: High</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(3,2)</span>
              </div>

              {/* Bottom Row - Low Potential */}
              <div className="bg-red-500/20 border border-red-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge variant="destructive" className="text-xs mb-1">Low Performer</Badge>
                <span className="text-xs text-muted-foreground">Potential: Low</span>
                <span className="text-xs text-muted-foreground">Performance: Low</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(1,1)</span>
              </div>
              <div className="bg-slate-500/20 border border-slate-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-slate-600 text-xs mb-1">Average Performer</Badge>
                <span className="text-xs text-muted-foreground">Potential: Low</span>
                <span className="text-xs text-muted-foreground">Performance: Moderate</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(2,1)</span>
              </div>
              <div className="bg-teal-500/20 border border-teal-500/40 rounded p-3 flex flex-col justify-center items-center text-center">
                <Badge className="bg-teal-600 text-xs mb-1">Technical Expert</Badge>
                <span className="text-xs text-muted-foreground">Potential: Low</span>
                <span className="text-xs text-muted-foreground">Performance: High</span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">(3,1)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mb-4">
            <span>← Low Performance</span>
            <span>Performance (X-Axis)</span>
            <span>High Performance →</span>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            ↑ Potential (Y-Axis) ↑
          </div>
        </CardContent>
      </Card>

      {/* Strategic Implications by Quadrant */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Implications by Quadrant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Quadrant</th>
                  <th className="text-left py-3 px-4 font-medium">Position</th>
                  <th className="text-left py-3 px-4 font-medium">Strategic Implication</th>
                  <th className="text-left py-3 px-4 font-medium">Recommended Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Star Performer</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(3,3)</td>
                  <td className="py-3 px-4">Top talent—ready for advancement</td>
                  <td className="py-3 px-4">Accelerate development, key role assignments, retention focus</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">High Potential</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(2,3)</td>
                  <td className="py-3 px-4">Future leader needing performance boost</td>
                  <td className="py-3 px-4">Stretch assignments, targeted coaching, skill gaps</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">Inconsistent</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(1,3)</td>
                  <td className="py-3 px-4">High potential but underdelivering</td>
                  <td className="py-3 px-4">Performance coaching, identify blockers, leverage potential</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-cyan-600">Core Player</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(3,2)</td>
                  <td className="py-3 px-4">Strong performer, limited growth</td>
                  <td className="py-3 px-4">Maintain engagement, consider technical track</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-600">Solid Contributor</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(2,2)</td>
                  <td className="py-3 px-4">Reliable performer, steady state</td>
                  <td className="py-3 px-4">Continue development, explore lateral moves</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-orange-600">Underperformer</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(1,2)</td>
                  <td className="py-3 px-4">Performance gap with moderate potential</td>
                  <td className="py-3 px-4">PIP, root cause analysis, role fit assessment</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-teal-600">Technical Expert</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(3,1)</td>
                  <td className="py-3 px-4">High performer, individual contributor track</td>
                  <td className="py-3 px-4">Technical leadership, subject matter expert path</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-slate-600">Average Performer</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(2,1)</td>
                  <td className="py-3 px-4">Meeting expectations, no growth indicators</td>
                  <td className="py-3 px-4">Set clear expectations, provide support</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge variant="destructive">Low Performer</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">(1,1)</td>
                  <td className="py-3 px-4">Critical intervention needed</td>
                  <td className="py-3 px-4">Immediate action, assess role fit, exit if necessary</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Module Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Cross-Module Data Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Nine-Box assessments aggregate data from multiple HRplus modules to calculate axis ratings:
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <FeatureCardGrid columns={1}>
              <InfoFeatureCard
                icon={TrendingUp}
                title="Performance Axis Inputs"
                description="Appraisal overall scores (50%), Goal achievement rates (30%), Competency assessment averages (20%)"
              />
            </FeatureCardGrid>
            <FeatureCardGrid columns={1}>
              <InfoFeatureCard
                icon={Brain}
                title="Potential Axis Inputs"
                description="Potential assessments (40%), Leadership signals from 360 (40%), Values & adaptability signals (20%)"
              />
            </FeatureCardGrid>
          </div>

          <IntegrationCallout>
            <strong>Module Prerequisites:</strong> Before configuring Nine-Box, ensure the following modules 
            are active: Performance Appraisals (for scores), Goals & OKRs (for achievement), 360 Feedback 
            (for signals), and Potential Assessments (for readiness indicators).
          </IntegrationCallout>

          {/* Data Flow Diagram */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap">
{`┌──────────────────┐    ┌──────────────────┐
│   Appraisals     │───►│                  │
│  (Overall Score) │    │                  │
└──────────────────┘    │                  │
                        │                  │
┌──────────────────┐    │                  │    ┌──────────────────┐
│      Goals       │───►│   Nine-Box       │───►│  Succession      │
│  (Achievement %) │    │   Assessment     │    │  Plans           │
└──────────────────┘    │                  │    └──────────────────┘
                        │                  │
┌──────────────────┐    │                  │    ┌──────────────────┐
│  360 Feedback    │───►│                  │───►│  Talent Pools    │
│  (Signals)       │    │                  │    │                  │
└──────────────────┘    │                  │    └──────────────────┘
                        │                  │
┌──────────────────┐    │                  │
│   Potential      │───►│                  │
│  Assessments     │    │                  │
└──────────────────┘    └──────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Nine-Box Reviews">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Conduct calibration sessions to ensure consistent ratings across managers</li>
          <li>Review Nine-Box placements quarterly to track movement</li>
          <li>Use AI-suggested ratings as a starting point, not a final decision</li>
          <li>Document override reasons for audit trail compliance</li>
          <li>Link development actions to succession planning for Stars and High Potentials</li>
        </ul>
      </TipCallout>
    </div>
  );
}
