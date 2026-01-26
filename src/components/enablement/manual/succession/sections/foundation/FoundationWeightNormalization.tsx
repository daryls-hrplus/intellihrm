import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  CheckCircle, 
  Calculator,
  AlertTriangle,
  Info
} from 'lucide-react';

export function FoundationWeightNormalization() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.4a Weight Normalization & Calculation Rules</h3>
        <p className="text-muted-foreground">
          Understand how indicator weights are normalized and calculated when not all indicators are answered
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
              <span>Understand how indicator weights are normalized</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure handling for skipped or N/A indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Troubleshoot weight calculation issues</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Normalization Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Standard Normalization Formula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
            <pre className="whitespace-pre">{`When total configured weights ≠ 100%:

Normalized Weight = (Indicator Weight / Total Configured Weights) × 100%

Example:
- Strategic Thinking: 4% (configured)
- Leadership: 4% (configured)
- Business Acumen: 3% (configured)
- Total Configured: 11%

Normalized:
- Strategic Thinking: (4/11) × 100 = 36.4%
- Leadership: (4/11) × 100 = 36.4%
- Business Acumen: (3/11) × 100 = 27.3%`}</pre>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Normalization ensures that scores are always calculated relative to answered indicators,
              preventing candidates from being penalized for indicators that don't apply to their role.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Handling Skipped Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Handling Skipped Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Scenario</th>
                  <th className="text-left py-3 px-4 font-medium">Handling</th>
                  <th className="text-left py-3 px-4 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Indicator marked N/A</td>
                  <td className="py-3 px-4 text-muted-foreground">Excluded from calculation</td>
                  <td className="py-3 px-4 text-muted-foreground">Weight redistributed to remaining indicators</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Indicator left blank</td>
                  <td className="py-3 px-4 text-muted-foreground">Validation error (if required)</td>
                  <td className="py-3 px-4 text-muted-foreground">Cannot submit assessment</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Indicator not applicable to role</td>
                  <td className="py-3 px-4 text-muted-foreground">Pre-filtered by staff type</td>
                  <td className="py-3 px-4 text-muted-foreground">Not shown to assessor</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Assessor type mismatch</td>
                  <td className="py-3 px-4 text-muted-foreground">Excluded for that assessor</td>
                  <td className="py-3 px-4 text-muted-foreground">Weight adjusted per assessor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weight Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Validation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Rule</th>
                  <th className="text-left py-3 px-4 font-medium">Validation</th>
                  <th className="text-left py-3 px-4 font-medium">Error Message</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Total weight = 0</td>
                  <td className="py-3 px-4"><Badge variant="destructive">Block save</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">"At least one indicator must have weight &gt; 0"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Single indicator &gt; 50%</td>
                  <td className="py-3 px-4"><Badge className="bg-amber-500">Warning</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">"Single indicator has majority weight influence"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Category total &gt; 40%</td>
                  <td className="py-3 px-4"><Badge className="bg-amber-500">Warning</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">"Category may have outsized impact on score"</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">All indicators equal weight</td>
                  <td className="py-3 px-4"><Badge variant="secondary">Info</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">"Consider differentiating weights by importance"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Relative vs Absolute Weights */}
      <Card>
        <CardHeader>
          <CardTitle>Relative vs Absolute Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge className="bg-primary">Absolute Weights</Badge>
                <span className="text-xs text-muted-foreground">(Default)</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Weights entered as percentages (e.g., 4%, 3%)</li>
                <li>• Must sum to exactly 100% for full form</li>
                <li>• Warning displayed if sum ≠ 100%</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="secondary">Relative Weights</Badge>
                <span className="text-xs text-muted-foreground">(Alternative)</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Weights entered as points (e.g., 4, 3, 2)</li>
                <li>• System normalizes to 100% at calculation time</li>
                <li>• More flexible for variable indicator counts</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre">{`Configuration Toggle:
Path: Succession → Setup → Forms → Advanced Settings
Setting: weight_mode = 'absolute' | 'relative'`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
