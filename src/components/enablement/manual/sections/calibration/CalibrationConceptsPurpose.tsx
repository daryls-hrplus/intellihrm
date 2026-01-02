import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Brain, Shield, CheckCircle, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';

const BUSINESS_RULES = [
  { rule: 'Calibration requires minimum of 3 participants', enforcement: 'System' as const, description: 'Sessions with fewer participants do not provide meaningful comparison data.' },
  { rule: 'Calibration must occur before cycle closure', enforcement: 'System' as const, description: 'Ratings cannot be adjusted after the cycle is closed and locked.' },
  { rule: 'All adjustments require documented justification', enforcement: 'Policy' as const, description: 'Audit requirements mandate written rationale for any rating changes.' },
  { rule: 'Manager attendance is mandatory for their direct reports', enforcement: 'Policy' as const, description: 'Managers must be present when their team members are discussed.' }
];

export function CalibrationConceptsPurpose() {
  return (
    <Card id="sec-4-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.1</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~6 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin / Leadership</Badge>
        </div>
        <CardTitle className="text-2xl">Calibration Concepts & Purpose</CardTitle>
        <CardDescription>Understanding why calibration matters and how it ensures fair, consistent performance evaluations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-1']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the purpose and benefits of performance calibration</li>
            <li>Identify common rating biases that calibration addresses</li>
            <li>Learn the roles and responsibilities in calibration sessions</li>
            <li>Grasp the connection between calibration and organizational fairness</li>
          </ul>
        </div>

        {/* What is Calibration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What is Performance Calibration?</h3>
          <p className="text-muted-foreground">
            Calibration is a structured, collaborative process where managers and HR leaders review 
            performance ratings across teams to ensure consistency, fairness, and alignment with 
            organizational standards. It transforms individual manager assessments into a coherent, 
            organization-wide evaluation framework.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Key Principle</p>
            <p className="text-sm text-muted-foreground mt-1">
              "A 'Meets Expectations' rating should mean the same thing whether the employee works 
              in Finance, Operations, or IT—calibration makes this possible."
            </p>
          </div>
        </div>

        {/* Why Calibration Matters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Why Calibration Matters</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Target, title: 'Reduces Rating Bias', desc: 'Eliminates leniency, strictness, central tendency, and recency bias that distort individual manager ratings' },
              { icon: Users, title: 'Ensures Consistency', desc: 'Aligns rating standards across managers, departments, and regions for a unified performance culture' },
              { icon: Brain, title: 'Enables AI Insights', desc: 'Provides data foundation for AI-powered anomaly detection and pattern recognition' },
              { icon: Shield, title: 'Supports Compliance', desc: 'Creates documented audit trail required for legal defensibility and regulatory requirements' },
              { icon: TrendingUp, title: 'Improves Talent Decisions', desc: 'Produces reliable data for compensation, promotion, and succession planning' },
              { icon: BarChart3, title: 'Identifies High Performers', desc: 'Surfaces true stars and enables differentiated recognition and development' }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Common Rating Biases */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Common Rating Biases Addressed by Calibration</h3>
          <div className="space-y-3">
            {[
              { bias: 'Leniency Bias', description: 'Manager rates everyone high to avoid difficult conversations', indicator: 'Department average significantly above org average', solution: 'Forced distribution awareness, comparison with peers' },
              { bias: 'Strictness Bias', description: 'Manager applies unrealistically high standards', indicator: 'Department average significantly below org average', solution: 'Cross-team comparison, standard clarification' },
              { bias: 'Central Tendency', description: 'Manager avoids extremes, clusters all ratings in middle', indicator: 'Low variance, few exceptional or poor ratings', solution: 'Distribution analysis, differentiation encouragement' },
              { bias: 'Recency Bias', description: 'Recent events disproportionately influence full-year rating', indicator: 'Rating doesn\'t align with documented performance', solution: 'Evidence review, goal achievement analysis' },
              { bias: 'Halo/Horn Effect', description: 'One strong/weak trait influences perception of all areas', indicator: 'Identical scores across different competencies', solution: 'Competency-level review, specific evidence requests' }
            ].map((item) => (
              <div key={item.bias} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold">{item.bias}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                  <div><strong>Indicator:</strong> {item.indicator}</div>
                  <div><strong>Solution:</strong> {item.solution}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles in Calibration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Roles & Responsibilities</h3>
          <div className="space-y-3">
            {[
              { role: 'Calibration Facilitator (HR)', responsibilities: ['Prepares data and analytics', 'Manages session agenda', 'Documents decisions', 'Ensures objectivity'] },
              { role: 'Session Chair (Senior Leader)', responsibilities: ['Leads discussion', 'Makes final decisions on disputed ratings', 'Enforces time management', 'Ensures all voices are heard'] },
              { role: 'Presenting Manager', responsibilities: ['Justifies ratings with evidence', 'Responds to peer challenges', 'Accepts or appeals adjustments', 'Updates ratings post-session'] },
              { role: 'Peer Managers', responsibilities: ['Provide cross-team perspective', 'Challenge inconsistencies', 'Share relevant observations', 'Support fair outcomes'] }
            ].map((item) => (
              <div key={item.role} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{item.role}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {item.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Success Factor">
          The most effective calibration sessions focus on the ratings themselves, not the personalities of employees or managers. 
          Keep discussions evidence-based and tied to documented performance examples.
        </TipCallout>

        <WarningCallout title="Common Pitfall">
          Avoid "horse-trading" where managers trade high ratings for their favorites in exchange for accepting lower 
          ratings on others. This defeats the purpose of calibration and introduces new biases.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
