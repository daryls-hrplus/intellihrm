import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, Brain, Target, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';

const BUSINESS_RULES = [
  { rule: 'AI insights require minimum data threshold', enforcement: 'System' as const, description: 'Strengths/gaps not generated unless sufficient rating data exists.' },
  { rule: 'Confidence levels displayed for all insights', enforcement: 'Policy' as const, description: 'ISO 42001 transparency requirement for AI-generated analysis.' },
  { rule: 'IDP linking is optional but recommended', enforcement: 'System' as const, description: 'Gaps can be converted to development goals with one click.' },
  { rule: 'Evidence links are preserved', enforcement: 'System' as const, description: 'Each insight traces back to the rating data that informed it.' }
];

const STRENGTHS_GAPS_FIELDS: FieldDefinition[] = [
  { name: 'participant_id', required: true, type: 'uuid', description: 'Reference to the appraisal participant' },
  { name: 'insight_type', required: true, type: 'select', description: 'Whether this is a strength or gap', validation: 'strength | gap' },
  { name: 'category', required: true, type: 'select', description: 'Category of insight (goals, competencies, responsibilities, values)', defaultValue: 'competencies' },
  { name: 'title', required: true, type: 'text', description: 'Brief title for the strength or gap', validation: 'Max 100 characters' },
  { name: 'description', required: true, type: 'text', description: 'Detailed explanation of the insight' },
  { name: 'evidence_sources', required: true, type: 'json', description: 'Array of rating IDs and data points that support this insight' },
  { name: 'ai_confidence', required: true, type: 'number', description: 'AI confidence level for this insight (0-100)', validation: '0-100' },
  { name: 'ai_reasoning', required: false, type: 'text', description: 'AI explanation of why this was identified' },
  { name: 'priority_level', required: false, type: 'select', description: 'Priority for addressing gaps', defaultValue: 'medium', validation: 'high | medium | low' },
  { name: 'linked_idp_goal_id', required: false, type: 'uuid', description: 'If gap was converted to an IDP goal, reference here' },
  { name: 'is_acknowledged', required: true, type: 'boolean', description: 'Whether manager/employee has reviewed this insight', defaultValue: 'false' }
];

export function StrengthsGapsAnalysis() {
  return (
    <Card id="sec-5-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.5</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~7 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager / HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Strengths & Gaps Analysis</CardTitle>
        <CardDescription>AI-powered identification of employee strengths and development opportunities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-5'] || ['Appraisals Manual', 'Chapter 5: AI Features', 'Strengths & Gaps Analysis']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how AI identifies strengths and gaps from performance data</li>
            <li>Interpret confidence scores and evidence linkages</li>
            <li>Convert gaps into actionable IDP goals</li>
            <li>Prioritize development areas effectively</li>
          </ul>
        </div>

        {/* What is Strengths & Gaps Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            What is Strengths & Gaps Analysis?
          </h3>
          <p className="text-muted-foreground">
            The AI Strengths & Gaps Analysis automatically examines all performance data—goals, 
            competencies, responsibilities, and values ratings—to identify patterns that reveal 
            where an employee excels and where development is needed. This replaces manual 
            synthesis and ensures no important patterns are overlooked.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Strengths</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Areas where the employee consistently performs above expectations. 
                  Used for recognition, role placement, and mentoring assignments.
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold">Gaps</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Areas requiring development attention. Prioritized by impact on 
                  role success and linked to learning recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Categories Analyzed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Categories Analyzed
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { category: 'Goals', description: 'Achievement rates, milestone completion, stretch goal performance', example: 'Strength: Exceeded 4 of 5 goals by >20%' },
              { category: 'Competencies', description: 'Behavioral proficiency across job-required competencies', example: 'Gap: "Strategic Thinking" rated 2.5 vs role requirement of 4.0' },
              { category: 'Responsibilities', description: 'Execution quality on core job accountabilities', example: 'Strength: Consistently exceeds in "Client Management"' },
              { category: 'Values', description: 'Alignment with organizational values and culture', example: 'Gap: "Collaboration" rated below peer average' }
            ].map((item) => (
              <div key={item.category} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-1">{item.category}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="text-xs p-2 bg-muted/50 rounded italic">{item.example}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            How AI Identifies Insights
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Data Aggregation', description: 'AI collects all ratings, comments, and evidence from the current appraisal cycle' },
              { step: '2', title: 'Pattern Recognition', description: 'Identifies consistent high or low scores across related items' },
              { step: '3', title: 'Threshold Analysis', description: 'Compares scores against role requirements, peer averages, and historical trends' },
              { step: '4', title: 'Context Enrichment', description: 'Examines manager comments for additional context and nuance' },
              { step: '5', title: 'Insight Generation', description: 'Produces ranked strengths and prioritized gaps with evidence links' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gap to IDP Workflow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Converting Gaps to IDP Goals
          </h3>
          <p className="text-muted-foreground">
            Identified gaps can be converted directly into Individual Development Plan goals:
          </p>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Badge>1</Badge>
              <span className="text-sm">Review the identified gap and AI reasoning</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>2</Badge>
              <span className="text-sm">Click "Create IDP Goal" button on the gap card</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>3</Badge>
              <span className="text-sm">AI pre-populates goal with title, description, and suggested learning activities</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>4</Badge>
              <span className="text-sm">Customize timeline, milestones, and success criteria</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>5</Badge>
              <span className="text-sm">Save to IDP—gap is now linked to the development goal</span>
            </div>
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">appraisal_strengths_gaps</Badge>
              <span className="text-sm text-muted-foreground">Identified strengths and gaps</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">ai_explainability_records</Badge>
              <span className="text-sm text-muted-foreground">Confidence and reasoning data</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">idp_goals</Badge>
              <span className="text-sm text-muted-foreground">Linked development goals</span>
            </div>
          </div>
        </div>

        {/* Priority Levels */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Gap Priority Levels
          </h3>
          <div className="space-y-2">
            {[
              { level: 'High', criteria: 'Gap in core job requirement or competency rated 2+ levels below requirement', action: 'Immediate development plan required', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
              { level: 'Medium', criteria: 'Gap in important but not critical area, 1 level below requirement', action: 'Include in next IDP cycle', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
              { level: 'Low', criteria: 'Minor gap in nice-to-have skill or emerging requirement', action: 'Monitor and address as capacity allows', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
            ].map((item) => (
              <div key={item.level} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={item.color}>{item.level} Priority</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1"><strong>Criteria:</strong> {item.criteria}</p>
                <p className="text-sm text-primary"><strong>Action:</strong> {item.action}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={STRENGTHS_GAPS_FIELDS} title="Strengths & Gaps Record Fields Reference" />

        <TipCallout title="Best Practice">
          Review strengths and gaps with the employee during the performance discussion. 
          Collaborative prioritization of development areas increases engagement and ownership.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          AI-identified gaps should inform, not replace, manager judgment. Context matters—a 
          temporary performance dip may not indicate a true development gap.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
