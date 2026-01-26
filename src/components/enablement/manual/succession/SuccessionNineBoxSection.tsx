import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GitBranch, Clock, Info, TrendingUp, Target, Settings } from 'lucide-react';

export function SuccessionNineBoxSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-3" data-manual-anchor="part-3" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <GitBranch className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">3. Nine-Box Assessment Configuration</h2>
            <p className="text-muted-foreground">
              Complete Nine-Box grid setup including rating sources, signal mappings, axis configuration, and label customization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~90 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      {/* Section 3.1: Nine-Box Model Overview */}
      <section id="sec-3-1" data-manual-anchor="sec-3-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">3.1 Nine-Box Model Overview</h3>
          <p className="text-muted-foreground">
            Performance vs. Potential matrix theory, box definitions, and strategic implications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>The McKinsey 9-Box Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square max-w-md mx-auto">
              <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full">
                {/* Top Row - High Potential */}
                <div className="bg-blue-500/20 border border-blue-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-blue-600 text-xs mb-1">Enigma</Badge>
                  <span className="text-xs text-muted-foreground">High Potential</span>
                  <span className="text-xs text-muted-foreground">Low Performance</span>
                </div>
                <div className="bg-green-500/20 border border-green-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-green-600 text-xs mb-1">Future Star</Badge>
                  <span className="text-xs text-muted-foreground">High Potential</span>
                  <span className="text-xs text-muted-foreground">Moderate Performance</span>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-emerald-600 text-xs mb-1">Star</Badge>
                  <span className="text-xs text-muted-foreground">High Potential</span>
                  <span className="text-xs text-muted-foreground">High Performance</span>
                </div>

                {/* Middle Row - Moderate Potential */}
                <div className="bg-amber-500/20 border border-amber-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-amber-600 text-xs mb-1">Inconsistent</Badge>
                  <span className="text-xs text-muted-foreground">Moderate Potential</span>
                  <span className="text-xs text-muted-foreground">Low Performance</span>
                </div>
                <div className="bg-gray-500/20 border border-gray-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-gray-600 text-xs mb-1">Core</Badge>
                  <span className="text-xs text-muted-foreground">Moderate Potential</span>
                  <span className="text-xs text-muted-foreground">Moderate Performance</span>
                </div>
                <div className="bg-cyan-500/20 border border-cyan-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-cyan-600 text-xs mb-1">High Impact</Badge>
                  <span className="text-xs text-muted-foreground">Moderate Potential</span>
                  <span className="text-xs text-muted-foreground">High Performance</span>
                </div>

                {/* Bottom Row - Low Potential */}
                <div className="bg-red-500/20 border border-red-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge variant="destructive" className="text-xs mb-1">Risk</Badge>
                  <span className="text-xs text-muted-foreground">Low Potential</span>
                  <span className="text-xs text-muted-foreground">Low Performance</span>
                </div>
                <div className="bg-orange-500/20 border border-orange-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-orange-600 text-xs mb-1">Dilemma</Badge>
                  <span className="text-xs text-muted-foreground">Low Potential</span>
                  <span className="text-xs text-muted-foreground">Moderate Performance</span>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/40 rounded p-2 flex flex-col justify-center items-center text-center">
                  <Badge className="bg-purple-600 text-xs mb-1">Workhouse</Badge>
                  <span className="text-xs text-muted-foreground">Low Potential</span>
                  <span className="text-xs text-muted-foreground">High Performance</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-muted-foreground">
              <span>← Low Performance</span>
              <span>Performance →</span>
              <span>High Performance →</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3.2: Rating Sources Configuration */}
      <section id="sec-3-2" data-manual-anchor="sec-3-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">3.2 Rating Sources Configuration</h3>
          <p className="text-muted-foreground">
            Configure appraisal scores, goal achievement, 360 feedback, and custom sources as inputs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Available Rating Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Source</th>
                    <th className="text-left py-2">Axis</th>
                    <th className="text-left py-2">Data Table</th>
                    <th className="text-left py-2">Default Weight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Appraisal Rating</td>
                    <td className="py-2">Performance</td>
                    <td className="py-2 font-mono text-xs">appraisal_participants.final_rating</td>
                    <td className="py-2">50%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Goal Achievement</td>
                    <td className="py-2">Performance</td>
                    <td className="py-2 font-mono text-xs">employee_goals.achievement_score</td>
                    <td className="py-2">30%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">360 Feedback Score</td>
                    <td className="py-2">Both</td>
                    <td className="py-2 font-mono text-xs">feedback_360_responses.overall_score</td>
                    <td className="py-2">20%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Learning Progress</td>
                    <td className="py-2">Potential</td>
                    <td className="py-2 font-mono text-xs">employee_learning_completions</td>
                    <td className="py-2">15%</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Leadership Assessment</td>
                    <td className="py-2">Potential</td>
                    <td className="py-2 font-mono text-xs">leadership_assessments.score</td>
                    <td className="py-2">25%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Database Table</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-mono text-xs">
            nine_box_rating_sources (source_type, source_table, source_column, axis, weight, is_active, company_id)
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 3.3: Signal Mappings */}
      <section id="sec-3-3" data-manual-anchor="sec-3-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">3.3 Signal Mappings</h3>
          <p className="text-muted-foreground">
            Map performance signals to Nine-Box axes with weighted calculations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Signal-to-Axis Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Signal mappings define how individual talent signals from various modules translate into Nine-Box axis scores.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Performance Axis Formula</h4>
                <code className="text-xs bg-muted p-2 rounded block">
                  Performance = (Appraisal × 0.5) + (Goals × 0.3) + (KPIs × 0.2)
                </code>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Potential Axis Formula</h4>
                <code className="text-xs bg-muted p-2 rounded block">
                  Potential = (Learning Agility × 0.3) + (Leadership × 0.4) + (360 Feedback × 0.3)
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Database Table</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-mono text-xs">
            nine_box_signal_mappings (signal_type, target_axis, weight, normalization_method, company_id)
          </AlertDescription>
        </Alert>
      </section>

      {/* Sections 3.4-3.6 - Placeholders */}
      <section id="sec-3-4" data-manual-anchor="sec-3-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">3.4 Box Labels & Descriptions</h3>
          <p className="text-muted-foreground">
            Customize 9 box labels, descriptions, and recommended actions per company
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Detailed content for box label customization will be populated in subsequent content iterations.
              This section covers company-specific terminology and action recommendations for each of the 9 boxes.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="sec-3-5" data-manual-anchor="sec-3-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">3.5 Performance Axis Sources</h3>
          <p className="text-muted-foreground">
            Configure performance axis inputs: appraisal ratings, goal completion, KPI achievement
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Detailed content for performance axis configuration will be populated in subsequent content iterations.
              This section covers data source selection, weighting, and normalization for the performance dimension.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="sec-3-6" data-manual-anchor="sec-3-6" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">3.6 Potential Axis Sources</h3>
          <p className="text-muted-foreground">
            Configure potential axis inputs: learning agility, leadership assessment, career aspirations
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Detailed content for potential axis configuration will be populated in subsequent content iterations.
              This section covers learning signals, leadership indicators, and career aspiration factors.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
