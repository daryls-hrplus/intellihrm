import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Callout, TipCallout, WarningCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Radar, 
  Users, 
  Calculator, 
  Lock, 
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Shield,
  Scale,
  Brain,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Percent,
  Hash
} from 'lucide-react';

export function F360CoreConcepts() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        1.2 Core Concepts & Terminology
      </h3>
      
      <p className="text-muted-foreground">
        Understanding the foundational concepts of 360-degree feedback is essential for effective 
        implementation and administration. This section covers the multi-rater model, scoring methodology, 
        anonymity architecture, and key terminology.
      </p>

      {/* Multi-Rater Model Deep Dive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            Multi-Rater Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The 360 Feedback module supports <strong>5 configurable rater categories</strong>, each with 
            independent weight settings, anonymity rules, and minimum response thresholds.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-semibold">Category</th>
                  <th className="text-left py-2 px-3 font-semibold">Code</th>
                  <th className="text-center py-2 px-3 font-semibold">Default Weight</th>
                  <th className="text-center py-2 px-3 font-semibold">Anonymity</th>
                  <th className="text-center py-2 px-3 font-semibold">Min. Threshold</th>
                  <th className="text-left py-2 px-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Manager</td>
                  <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">MGR</code></td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="secondary">25-35%</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                      <Eye className="h-3 w-3 mr-1" />Named
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">1</td>
                  <td className="py-2 px-3 text-muted-foreground">Direct supervisor's evaluation</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Peer</td>
                  <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">PEER</code></td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="secondary">25-35%</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      <EyeOff className="h-3 w-3 mr-1" />Anonymous
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">3</td>
                  <td className="py-2 px-3 text-muted-foreground">Colleagues at same level</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Direct Report</td>
                  <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">DR</code></td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="secondary">15-25%</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      <EyeOff className="h-3 w-3 mr-1" />Anonymous
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">3</td>
                  <td className="py-2 px-3 text-muted-foreground">Employees reporting to subject</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Self</td>
                  <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">SELF</code></td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="secondary">10-20%</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                      <Eye className="h-3 w-3 mr-1" />Named
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">1</td>
                  <td className="py-2 px-3 text-muted-foreground">Subject's self-assessment</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">External/Customer</td>
                  <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">EXT</code></td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="secondary">0-15%</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      <EyeOff className="h-3 w-3 mr-1" />Anonymous
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">2</td>
                  <td className="py-2 px-3 text-muted-foreground">External stakeholders or customers</td>
                </tr>
              </tbody>
            </table>
          </div>

          <TipCallout title="Weight Configuration">
            Category weights must sum to 100%. Self-assessment can optionally be excluded from the 
            overall average calculation while still being displayed for comparison purposes.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Scoring Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-violet-600" />
            Scoring Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The 360 Feedback module calculates scores using a <strong>weighted category average</strong> approach 
            that respects anonymity thresholds and handles missing data gracefully.
          </p>

          {/* Formula Box */}
          <div className="p-4 rounded-lg bg-muted/50 border font-mono text-sm">
            <p className="mb-2"><strong>Category Score Calculation:</strong></p>
            <code className="block mb-4 text-primary">
              Category_Score = Σ(response_ratings) / response_count
            </code>
            
            <p className="mb-2"><strong>Overall Score Calculation:</strong></p>
            <code className="block text-primary">
              Overall_Score = Σ(Category_Score × Category_Weight) / Σ(Active_Weights)
            </code>
          </div>

          {/* Calculation Example */}
          <div className="space-y-3">
            <h4 className="font-semibold">Calculation Example</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-center py-2 px-3">Responses</th>
                    <th className="text-center py-2 px-3">Avg Rating</th>
                    <th className="text-center py-2 px-3">Weight</th>
                    <th className="text-center py-2 px-3">Weighted Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3">Manager</td>
                    <td className="py-2 px-3 text-center">1</td>
                    <td className="py-2 px-3 text-center">4.2</td>
                    <td className="py-2 px-3 text-center">30%</td>
                    <td className="py-2 px-3 text-center font-medium">1.26</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Peer</td>
                    <td className="py-2 px-3 text-center">4</td>
                    <td className="py-2 px-3 text-center">3.8</td>
                    <td className="py-2 px-3 text-center">30%</td>
                    <td className="py-2 px-3 text-center font-medium">1.14</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Direct Report</td>
                    <td className="py-2 px-3 text-center">3</td>
                    <td className="py-2 px-3 text-center">4.0</td>
                    <td className="py-2 px-3 text-center">20%</td>
                    <td className="py-2 px-3 text-center font-medium">0.80</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Self</td>
                    <td className="py-2 px-3 text-center">1</td>
                    <td className="py-2 px-3 text-center">4.5</td>
                    <td className="py-2 px-3 text-center">20%</td>
                    <td className="py-2 px-3 text-center font-medium">0.90</td>
                  </tr>
                  <tr className="bg-primary/5 font-semibold">
                    <td className="py-2 px-3" colSpan={3}>Overall Score</td>
                    <td className="py-2 px-3 text-center">100%</td>
                    <td className="py-2 px-3 text-center text-primary">4.10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <InfoCallout title="Appraisal Integration">
            When integrated with the CRGV appraisal model, the 360 score is normalized to match the 
            appraisal rating scale (e.g., 1-5) and contributes to the "Values" component weight.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Anonymity Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-600" />
            Anonymity Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The anonymity system protects rater identity through <strong>threshold-based aggregation</strong>. 
            Individual responses are only revealed when category response counts fall below the minimum threshold.
          </p>

          {/* Threshold Rules */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <h4 className="font-semibold text-emerald-700 flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                Anonymous (≥ Threshold)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Responses aggregated by category</li>
                <li>• Individual rater names hidden</li>
                <li>• Only average scores displayed</li>
                <li>• Comments shown without attribution</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/5">
              <h4 className="font-semibold text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Named (Below Threshold)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Category results suppressed</li>
                <li>• Subject cannot view category data</li>
                <li>• HR Admin sees warning indicator</li>
                <li>• Data preserved for investigation mode</li>
              </ul>
            </div>
          </div>

          {/* Decision Tree */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Anonymity Decision Flow</h4>
            <div className="font-mono text-xs space-y-1">
              <p>IF category.is_anonymous = TRUE:</p>
              <p className="pl-4">IF response_count ≥ category.min_threshold:</p>
              <p className="pl-8">→ Display aggregated results (anonymous)</p>
              <p className="pl-4">ELSE:</p>
              <p className="pl-8">→ Suppress category from subject view</p>
              <p>ELSE:</p>
              <p className="pl-4">→ Display individual responses (named)</p>
            </div>
          </div>

          <WarningCallout title="Investigation Mode">
            HR Administrators can request Investigation Mode access to view individual responses 
            regardless of anonymity settings. This requires documented justification, creates an 
            audit trail, and is logged in <code className="text-xs">feedback_investigation_access_log</code>.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Key Terminology */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Key Terminology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { term: 'Rater Category', desc: 'Grouping of feedback providers (Manager, Peer, DR, Self, External)' },
              { term: 'Subject', desc: 'The employee receiving 360 feedback' },
              { term: 'Rater', desc: 'Person providing feedback on a subject' },
              { term: 'Anonymity Threshold', desc: 'Minimum raters per category for identity protection (default: 3)' },
              { term: 'Feedback Request', desc: 'Invitation sent to a rater to provide feedback' },
              { term: 'Review Cycle', desc: 'Time-bound period for 360 feedback collection' },
              { term: 'Peer Nomination', desc: 'Subject-initiated peer rater suggestions' },
              { term: 'Nomination Approval', desc: 'Manager review of peer nominations' },
              { term: 'Response Window', desc: 'Timeframe for raters to submit feedback' },
              { term: 'Signal Processing', desc: 'AI extraction of talent signals from feedback data' },
              { term: 'Development Theme', desc: 'AI-identified growth area from feedback patterns' },
              { term: 'Writing Quality Score', desc: 'AI assessment of feedback text quality' },
              { term: 'Talent Signal', desc: 'Computed indicator (e.g., leadership potential)' },
              { term: 'Report Template', desc: 'Audience-specific results presentation format' },
              { term: 'Visibility Rules', desc: 'Role-based access control for results viewing' },
              { term: 'Consent Record', desc: 'GDPR-compliant data processing acknowledgement' },
              { term: 'Investigation Mode', desc: 'Authorized access to bypass anonymity' },
              { term: 'Data Policy', desc: 'Retention and governance rules for feedback data' },
              { term: 'Rater Relationship', desc: 'Contextual metadata about rater-subject connection' },
              { term: 'External Rater', desc: 'Non-employee providing customer/stakeholder feedback' },
              { term: 'Question Bank', desc: 'Library of feedback questions organized by competency' },
              { term: 'Competency Mapping', desc: 'Link between questions and competency framework' },
              { term: 'Results Release', desc: 'HR action to make results visible to subjects' },
              { term: 'Acknowledgement', desc: "Subject's confirmation of reviewing results" },
              { term: 'Calibration Session', desc: 'Cross-team review of 360 scores for fairness' },
              { term: 'Score Normalization', desc: 'Adjusting 360 scores to match appraisal scales' },
              { term: 'Category Weight', desc: 'Percentage contribution of category to overall score' },
              { term: 'Exception Request', desc: 'Formal request to deviate from standard rules' },
              { term: 'Audit Trail', desc: 'Complete log of all system actions and changes' },
              { term: 'Nine-Box Integration', desc: 'Flow of 360 signals to succession planning' },
            ].map((item) => (
              <div key={item.term} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                <h5 className="font-medium text-sm text-foreground">{item.term}</h5>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle States */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Feedback Request Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 justify-center py-4">
            {[
              { status: 'pending', color: 'bg-slate-500' },
              { status: 'accepted', color: 'bg-blue-500' },
              { status: 'in_progress', color: 'bg-amber-500' },
              { status: 'completed', color: 'bg-emerald-500' },
              { status: 'declined', color: 'bg-rose-500' },
            ].map((state, index) => (
              <div key={state.status} className="flex items-center gap-2">
                <Badge className={`${state.color} text-white`}>
                  {state.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {index < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <ul className="space-y-1">
              <li><strong>Pending:</strong> Request sent, awaiting rater acknowledgement</li>
              <li><strong>Accepted:</strong> Rater agreed to provide feedback</li>
              <li><strong>In Progress:</strong> Rater has started but not submitted</li>
              <li><strong>Completed:</strong> Feedback submitted successfully</li>
              <li><strong>Declined:</strong> Rater opted out of providing feedback</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Section Footer */}
      <div className="flex items-center justify-end text-sm text-muted-foreground border-t pt-4">
        <Badge variant="outline">Section 1.2 of 1.5</Badge>
      </div>
    </div>
  );
}
