import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Radio, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, Brain, Zap } from 'lucide-react';

export function F360SignalDefinitions() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.9 Signal Definitions Setup</h3>
        <p className="text-muted-foreground">
          Signal definitions configure how 360 feedback data is processed into talent signals. 
          These signals feed into talent profiles, nine-box placements, and succession planning.
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
            <li>• Understand talent signal categories and their applications</li>
            <li>• Configure signal aggregation methods</li>
            <li>• Set confidence thresholds for signal validity</li>
            <li>• Map signals to talent management workflows</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Navigation:</span>
            <span className="text-muted-foreground">
              Performance → Setup → 360 Feedback → Signal Definitions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Table: talent_signal_definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Field</TableHead>
                  <TableHead className="w-[80px]">Required</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'code', required: true, type: 'Text', desc: 'Unique signal identifier (e.g., "LEADERSHIP_360")' },
                  { field: 'name', required: true, type: 'Text', desc: 'Display name for reports and UI' },
                  { field: 'description', required: false, type: 'Text', desc: 'Signal purpose and interpretation guide' },
                  { field: 'signal_category', required: true, type: 'Enum', desc: 'leadership, teamwork, technical, values, general' },
                  { field: 'source_type', required: true, type: 'Enum', desc: 'feedback_360, appraisal, continuous, combined' },
                  { field: 'aggregation_method', required: true, type: 'Enum', desc: 'weighted_average, simple_average, median, max, min' },
                  { field: 'confidence_threshold', required: true, type: 'Number', desc: 'Min confidence for valid signal (0.0-1.0)' },
                  { field: 'min_data_points', required: true, type: 'Number', desc: 'Min responses for signal generation' },
                  { field: 'weight_by_category', required: false, type: 'JSON', desc: 'Category-specific weights for aggregation' },
                  { field: 'is_system_defined', required: true, type: 'Boolean', desc: 'Read-only system signal' },
                  { field: 'feeds_nine_box', required: false, type: 'Boolean', desc: 'Contributes to nine-box placement' },
                  { field: 'feeds_succession', required: false, type: 'Boolean', desc: 'Contributes to succession readiness' },
                  { field: 'is_active', required: true, type: 'Boolean', desc: 'Signal is being processed' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{row.field}</TableCell>
                    <TableCell>
                      <Badge variant={row.required ? 'default' : 'secondary'} className="text-xs">
                        {row.required ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Signal Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5" />
            Signal Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                category: 'Leadership',
                code: 'leadership',
                color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
                signals: ['Strategic Thinking', 'People Development', 'Decision Making', 'Change Leadership'],
                ninebox: 'Potential axis'
              },
              {
                category: 'Teamwork',
                code: 'teamwork',
                color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
                signals: ['Collaboration', 'Communication', 'Conflict Resolution', 'Team Building'],
                ninebox: 'Performance axis'
              },
              {
                category: 'Technical',
                code: 'technical',
                color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
                signals: ['Domain Expertise', 'Problem Solving', 'Innovation', 'Quality Focus'],
                ninebox: 'Performance axis'
              },
              {
                category: 'Values',
                code: 'values',
                color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300',
                signals: ['Integrity', 'Customer Focus', 'Accountability', 'Respect'],
                ninebox: 'Cultural fit indicator'
              },
              {
                category: 'General',
                code: 'general',
                color: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300',
                signals: ['Overall Effectiveness', 'Development Readiness', 'Role Fit'],
                ninebox: 'Composite'
              }
            ].map((cat) => (
              <div key={cat.code} className={`p-4 rounded-lg border ${cat.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">{cat.code}</Badge>
                  <span className="font-semibold">{cat.category}</span>
                </div>
                <div className="text-xs mb-2">
                  <span className="font-medium">Signals:</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {cat.signals.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Nine-Box:</span> {cat.ninebox}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aggregation Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            Aggregation Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Use Case</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  {
                    method: 'weighted_average',
                    desc: 'Uses rater category weights (Manager 25%, Peer 30%, etc.)',
                    useCase: 'Most 360 signals—balanced multi-rater input'
                  },
                  {
                    method: 'simple_average',
                    desc: 'Equal weight for all responses regardless of rater type',
                    useCase: 'Peer-only or single-category signals'
                  },
                  {
                    method: 'median',
                    desc: 'Middle value of all responses (outlier resistant)',
                    useCase: 'Signals where extreme ratings should not skew'
                  },
                  {
                    method: 'max',
                    desc: 'Highest rating received across all raters',
                    useCase: 'Identifying peak performance or potential'
                  },
                  {
                    method: 'min',
                    desc: 'Lowest rating received across all raters',
                    useCase: 'Risk signals—identifying development needs'
                  },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono">{row.method}</TableCell>
                    <TableCell className="text-muted-foreground">{row.desc}</TableCell>
                    <TableCell className="text-xs">{row.useCase}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5" />
            AI Signal Processing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The AI signal processing pipeline transforms raw 360 feedback into actionable talent signals.
            </p>
            
            <div className="flex items-center gap-2 flex-wrap text-sm">
              {[
                'Raw Responses',
                'Response Validation',
                'Category Aggregation',
                'Signal Calculation',
                'Confidence Scoring',
                'Talent Signal Snapshot'
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full border bg-muted/50 text-xs">
                    {step}
                  </div>
                  {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Edge Function: feedback-signal-processor</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Triggered on cycle close or manual processing</li>
                <li>• Applies configured aggregation methods</li>
                <li>• Calculates confidence based on response count and variance</li>
                <li>• Creates talent_signal_snapshots records</li>
                <li>• Updates talent_profiles with latest signals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confidence Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Confidence scores indicate signal reliability. Signals below threshold are flagged for review.
          </p>
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { level: 'Low', threshold: '0.3-0.5', color: 'bg-red-100 dark:bg-red-900/30', desc: 'Limited data, high variance' },
              { level: 'Moderate', threshold: '0.5-0.7', color: 'bg-amber-100 dark:bg-amber-900/30', desc: 'Acceptable for directional use' },
              { level: 'Good', threshold: '0.7-0.85', color: 'bg-blue-100 dark:bg-blue-900/30', desc: 'Reliable for most decisions' },
              { level: 'High', threshold: '0.85-1.0', color: 'bg-green-100 dark:bg-green-900/30', desc: 'Strong consensus, low variance' },
            ].map((item) => (
              <div key={item.level} className={`p-3 rounded-lg border ${item.color} text-center`}>
                <div className="font-semibold text-sm mb-1">{item.level}</div>
                <div className="text-lg font-bold mb-1">{item.threshold}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Configure a Signal Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Performance → Setup → 360 Feedback → Signal Definitions', result: 'Displays signal list' },
              { step: 2, action: 'Click "Add Signal Definition"', result: 'Opens signal configuration form' },
              { step: 3, action: 'Enter code and display name', result: 'e.g., "LEADERSHIP_360", "360 Leadership Signal"' },
              { step: 4, action: 'Select signal category', result: 'leadership, teamwork, technical, values, or general' },
              { step: 5, action: 'Set source type to "feedback_360"', result: 'Signal derives from 360 feedback' },
              { step: 6, action: 'Choose aggregation method', result: 'weighted_average recommended for balanced input' },
              { step: 7, action: 'Set confidence threshold (default: 0.6)', result: 'Minimum confidence for valid signal' },
              { step: 8, action: 'Set minimum data points (default: 5)', result: 'Min responses for signal generation' },
              { step: 9, action: 'Configure downstream feeds (nine-box, succession)', result: 'Where signal data flows' },
              { step: 10, action: 'Save and activate', result: 'Signal available for processing' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.result}</p>
                </div>
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
              <span>Use weighted_average for most signals—honors rater category importance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Set confidence threshold to 0.6 minimum—lower values produce unreliable signals</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Require minimum 5 data points—fewer responses produce high variance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Create separate signals for leadership vs. technical competencies</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Enable nine-box feed for leadership signals; succession feed for readiness</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                issue: 'Signal not generating after cycle close',
                cause: 'Minimum data points not met or signal inactive',
                solution: 'Verify min_data_points threshold and is_active flag'
              },
              {
                issue: 'Signal confidence always low',
                cause: 'High variance in rater responses or few responses',
                solution: 'Review response quality; consider median aggregation'
              },
              {
                issue: 'Signal not appearing in nine-box',
                cause: 'feeds_nine_box flag disabled or signal category mismatch',
                solution: 'Enable feeds_nine_box and verify category mapping'
              },
              {
                issue: 'Weights not applying correctly',
                cause: 'weight_by_category not configured or malformed JSON',
                solution: 'Verify JSON structure matches rater category codes'
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-amber-300 bg-white dark:bg-background">
                <div className="font-medium text-sm">{item.issue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Cause:</span> {item.cause}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Solution:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
