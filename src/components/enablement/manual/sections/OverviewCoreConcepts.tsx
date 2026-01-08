import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Calculator, Scale, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

export function OverviewCoreConcepts() {
  return (
    <Card id="sec-1-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>20 min read</span>
        </div>
        <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
        <CardDescription>
          CRGV Model, scoring methodology, calibration theory, and key definitions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* CRGV Model Deep Dive */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            The CRGV Model - Deep Dive
          </h3>
          <p className="text-muted-foreground mb-4">
            Intelli HRM uses the Competencies-Responsibilities-Goals-Values (CRGV) model as the foundation for 
            comprehensive performance evaluation. Each component captures a different dimension of employee 
            contribution and can be weighted differently based on organizational priorities.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { 
                letter: 'C', 
                title: 'Competencies', 
                defaultWeight: '20%', 
                range: '10-30%',
                desc: 'Behavioral skills and capabilities aligned to job requirements',
                details: 'Measures HOW work is done. Includes technical skills, soft skills, and leadership competencies. Typically derived from job profiles or competency frameworks.',
                example: 'Communication, Problem Solving, Leadership, Technical Expertise'
              },
              { 
                letter: 'R', 
                title: 'Responsibilities', 
                defaultWeight: '30%', 
                range: '20-40%',
                desc: 'Key Result Areas (KRAs) and job-specific duties',
                details: 'Measures WHAT the employee is accountable for in their role. Based on job descriptions and position requirements.',
                example: 'Budget Management, Team Supervision, Client Relations, Quality Assurance'
              },
              { 
                letter: 'G', 
                title: 'Goals', 
                defaultWeight: '40%', 
                range: '30-60%',
                desc: 'SMART objectives cascaded from organizational strategy',
                details: 'Measures achievement of specific, time-bound objectives. Should be aligned with departmental and organizational goals.',
                example: 'Increase sales by 15%, Complete project by Q3, Reduce errors by 20%'
              },
              { 
                letter: 'V', 
                title: 'Values', 
                defaultWeight: '10%', 
                range: '5-20%',
                desc: 'Alignment with organizational culture and principles',
                details: 'Measures demonstration of core organizational values. Important for culture reinforcement and succession decisions.',
                example: 'Integrity, Innovation, Customer Focus, Teamwork'
              }
            ].map((item) => (
              <div key={item.letter} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {item.letter}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-lg">{item.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="default">{item.defaultWeight}</Badge>
                        <Badge variant="outline">Range: {item.range}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                    <p className="text-sm text-muted-foreground mb-2">{item.details}</p>
                    <p className="text-xs text-muted-foreground italic">Examples: {item.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weight Configuration Best Practices */}
          <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Weight Configuration Best Practices</h4>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• <strong>Sales/Revenue roles:</strong> Higher Goals weight (50-60%) to emphasize measurable outcomes</li>
                  <li>• <strong>Management roles:</strong> Higher Competencies weight (25-35%) for leadership behaviors</li>
                  <li>• <strong>Technical roles:</strong> Balanced Responsibilities + Goals (35% + 40%)</li>
                  <li>• <strong>Customer-facing roles:</strong> Include Values weight (15-20%) for culture/service emphasis</li>
                  <li>• <strong>Probation reviews:</strong> Consider 100% Responsibilities weight for role fit assessment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Scoring Methodology */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Scoring Methodology
          </h3>
          
          <div className="space-y-6">
            {/* Formula */}
            <div className="p-4 bg-muted rounded-lg font-mono text-sm">
              <p className="text-muted-foreground mb-2">Overall Score Formula:</p>
              <code className="text-primary">
                Overall Score = (C × W<sub>c</sub>) + (R × W<sub>r</sub>) + (G × W<sub>g</sub>) + (V × W<sub>v</sub>)
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Where C, R, G, V are component scores (1-5) and W<sub>x</sub> are weights (must sum to 100%)
              </p>
            </div>

            {/* Calculation Example */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium">Calculation Example</div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Consider an employee with the following scores and default weights:
                </p>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Component</th>
                      <th className="border p-2 text-center">Score (1-5)</th>
                      <th className="border p-2 text-center">Weight</th>
                      <th className="border p-2 text-center">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Competencies</td>
                      <td className="border p-2 text-center">4.0</td>
                      <td className="border p-2 text-center">20%</td>
                      <td className="border p-2 text-center">0.80</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="border p-2">Responsibilities</td>
                      <td className="border p-2 text-center">3.5</td>
                      <td className="border p-2 text-center">30%</td>
                      <td className="border p-2 text-center">1.05</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Goals</td>
                      <td className="border p-2 text-center">4.5</td>
                      <td className="border p-2 text-center">40%</td>
                      <td className="border p-2 text-center">1.80</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="border p-2">Values</td>
                      <td className="border p-2 text-center">5.0</td>
                      <td className="border p-2 text-center">10%</td>
                      <td className="border p-2 text-center">0.50</td>
                    </tr>
                    <tr className="bg-primary/10 font-medium">
                      <td className="border p-2">Overall Score</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center">100%</td>
                      <td className="border p-2 text-center text-primary">4.15</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-muted-foreground">
                  This score of 4.15 would typically map to "Exceeds Expectations" on a standard 5-point overall rating scale.
                </p>
              </div>
            </div>

            {/* Rating Scale Types */}
            <div>
              <h4 className="font-medium mb-3">Rating Scale Types</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Numeric Scales</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    Simple 1-5 or 1-10 scales where each number represents a performance level.
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="w-10 h-10 flex items-center justify-center border rounded bg-muted text-sm font-medium">
                        {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Best for: Simple evaluations, mathematical precision</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Behaviorally Anchored (BARS)</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    Each rating level has specific behavioral descriptions to guide evaluation.
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="flex gap-2"><Badge variant="outline">5</Badge> Consistently exceeds all expectations</div>
                    <div className="flex gap-2"><Badge variant="outline">3</Badge> Meets role requirements reliably</div>
                    <div className="flex gap-2"><Badge variant="outline">1</Badge> Significant improvement needed</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Best for: Reducing subjectivity, manager guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Calibration Theory */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Calibration Theory
          </h3>
          <p className="text-muted-foreground mb-4">
            Calibration is the process of reviewing and adjusting performance ratings across a group of employees 
            to ensure consistency, reduce bias, and align ratings with organizational standards.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Open Calibration</h4>
              <p className="text-sm text-muted-foreground mb-2">
                No forced distribution. Managers discuss and justify ratings, adjustments based on discussion only.
              </p>
              <Badge variant="outline">Flexibility: High</Badge>
            </div>
            <div className="p-4 border rounded-lg bg-primary/5">
              <h4 className="font-medium mb-2">Guided Distribution</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Target percentages provided as guidelines but not enforced. Deviations require justification.
              </p>
              <Badge variant="default">Recommended</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Forced Distribution</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Strict percentages enforced. System prevents submission until distribution matches targets.
              </p>
              <Badge variant="outline">Flexibility: Low</Badge>
            </div>
          </div>

          {/* Distribution Example */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="bg-muted px-4 py-2 font-medium">Typical Bell Curve Distribution</div>
            <div className="p-4">
              <div className="flex items-end justify-center gap-2 h-32 mb-4">
                {[
                  { label: 'Needs Improvement', pct: 5, height: '20%' },
                  { label: 'Below Expectations', pct: 15, height: '40%' },
                  { label: 'Meets Expectations', pct: 60, height: '100%' },
                  { label: 'Exceeds Expectations', pct: 15, height: '40%' },
                  { label: 'Exceptional', pct: 5, height: '20%' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ width: '18%' }}>
                    <div 
                      className="w-full bg-primary/80 rounded-t" 
                      style={{ height: item.height }}
                    />
                    <span className="text-xs font-medium">{item.pct}%</span>
                    <span className="text-xs text-muted-foreground text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-l-4 border-l-red-500 bg-muted/50 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Caution: Forced Distribution Risks</h4>
                <p className="text-sm text-foreground">
                  While forced distribution can prevent rating inflation, it can also create issues in 
                  high-performing teams where artificially labeling employees as "below expectations" 
                  damages morale and may not reflect actual performance. Consider using guided distribution 
                  with override approval for exceptional teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Key Terminology - Expanded */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Terminology</h3>
          <div className="space-y-3">
            {[
              { term: 'Appraisal Cycle', def: 'A defined evaluation period (typically annual or semi-annual) during which performance assessments are conducted. Each cycle has a start date, end date, and evaluation deadline.' },
              { term: 'Participant', def: 'An employee being evaluated within an appraisal cycle. Participants are enrolled either automatically based on eligibility rules or manually by HR.' },
              { term: 'Evaluator', def: 'The person conducting the evaluation, typically the direct manager. Some cycles may include additional evaluators (dotted-line managers, project leads).' },
              { term: 'Rating Scale', def: 'The scoring system used to rate individual components (e.g., 1-5 scale). Can be numeric or behaviorally anchored with descriptive labels.' },
              { term: 'Overall Rating Scale', def: 'The final performance categories that map from the calculated overall score (e.g., Exceptional, Exceeds, Meets, Below, Needs Improvement).' },
              { term: 'Calibration', def: 'A process where managers collectively review and adjust ratings to ensure consistency and fairness across teams and departments.' },
              { term: 'Pre-calibration Score', def: 'The initial calculated score before any calibration adjustments. This score is preserved for audit purposes.' },
              { term: 'Post-calibration Score', def: 'The final score after calibration has been applied. This is the score used for downstream actions like compensation.' },
              { term: 'Nine-Box Grid', def: 'A 3×3 matrix plotting Performance (X-axis) against Potential (Y-axis) to categorize employees for talent decisions. Generated from appraisal data.' },
              { term: 'Forced Distribution', def: 'A calibration method requiring ratings to match predefined percentages (e.g., 5% Exceptional, 15% Exceeds, 60% Meets, 15% Below, 5% Needs Improvement).' },
              { term: 'Self-Assessment', def: 'The employee\'s own evaluation of their performance, typically completed before the manager evaluation as input.' },
              { term: 'Acknowledgment', def: 'The formal employee confirmation that they have reviewed their final evaluation. May include agreement/disagreement options.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <span className="font-medium min-w-[200px]">{item.term}</span>
                <span className="text-muted-foreground">{item.def}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
