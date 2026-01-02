import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, MessageSquare, AlertTriangle, TrendingUp, Clock, CheckCircle, Shield, Users, BarChart3, Target, FileText } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';

const BUSINESS_RULES = [
  { rule: 'AI suggestions require human approval', enforcement: 'System' as const, description: 'All AI-generated content must be reviewed and accepted by the manager before inclusion.' },
  { rule: 'AI cannot access cross-company data', enforcement: 'System' as const, description: 'Data isolation ensures AI only uses data from the current organization.' },
  { rule: 'Confidence scores must be displayed', enforcement: 'Policy' as const, description: 'ISO 42001 requires transparency about AI certainty levels.' },
  { rule: 'AI usage is logged for audit', enforcement: 'System' as const, description: 'All AI interactions are recorded for governance and compliance purposes.' }
];

export function AIFeedbackOverview() {
  return (
    <Card id="sec-5-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.1</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager / HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">AI Feedback Assistant Overview</CardTitle>
        <CardDescription>Introduction to AI-powered evaluation assistance and intelligent feedback generation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-1']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the AI Feedback Assistant's capabilities and limitations</li>
            <li>Learn how AI reduces evaluation time while improving quality</li>
            <li>Grasp the human-in-the-loop governance model</li>
            <li>Navigate the AI assistant interface confidently</li>
          </ul>
        </div>

        {/* What is the AI Feedback Assistant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            What is the AI Feedback Assistant?
          </h3>
          <p className="text-muted-foreground">
            The AI Feedback Assistant is an intelligent coaching tool that helps managers write better, 
            more constructive performance feedback. It analyzes ratings, goals, and existing comments to 
            generate contextual suggestions while reducing evaluation time by 30-40%.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Core Principle</p>
            <p className="text-sm text-muted-foreground mt-1">
              "AI assists, humans decide." Every suggestion requires manager review and approval—
              the AI never writes directly to the official evaluation record.
            </p>
          </div>
        </div>

        {/* Key Capabilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Capabilities</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Sparkles, title: 'Generate Strength Statements', desc: 'AI crafts positive feedback based on high-rated competencies and goal achievements', benefit: 'Saves 5-10 min per evaluation' },
              { icon: TrendingUp, title: 'Development Suggestions', desc: 'Actionable improvement recommendations aligned to gaps and career goals', benefit: 'Links to IDP and learning paths' },
              { icon: MessageSquare, title: 'Improve Comments', desc: 'Enhance clarity, specificity, and professionalism of existing feedback', benefit: 'Improves comment quality scores' },
              { icon: AlertTriangle, title: 'Bias Detection', desc: 'Scan for gender-coded, age-related, or vague language patterns', benefit: 'EEOC compliance support' },
              { icon: FileText, title: 'Evidence Suggestions', desc: 'Recommend missing evidence based on competency requirements', benefit: 'Strengthens evaluation validity' },
              { icon: BarChart3, title: 'Summary Generation', desc: 'Create cohesive performance summary from individual ratings', benefit: 'Consistent narrative quality' }
            ].map((item) => (
              <Card key={item.title} className="bg-gradient-to-br from-background to-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <Badge variant="outline" className="mt-2 text-xs">{item.benefit}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How AI Assists the Workflow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How AI Integrates with Your Workflow</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Enter Ratings', description: 'Complete goal and competency ratings as normal. AI observes context.' },
              { step: '2', title: 'Request Assistance', description: 'Click any AI button to generate suggestions based on your ratings.' },
              { step: '3', title: 'Review Suggestions', description: 'Each suggestion shows confidence score and reasoning. Edit as needed.' },
              { step: '4', title: 'Accept or Modify', description: 'Click Accept to copy to comment field, or Edit to customize first.' },
              { step: '5', title: 'Human Signs Off', description: 'Final content is your decision—AI suggestions are never auto-applied.' }
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

        {/* ISO 42001 Compliance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            ISO 42001 Governance Model
          </h3>
          <p className="text-muted-foreground">
            The AI Feedback Assistant is designed to meet ISO 42001 AI Management System requirements:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { principle: 'Human Oversight', detail: 'All AI outputs require explicit human approval before use' },
              { principle: 'Transparency', detail: 'Confidence scores and reasoning visible for every suggestion' },
              { principle: 'Audit Trail', detail: 'Full logging of AI requests, responses, and human decisions' },
              { principle: 'Bias Monitoring', detail: 'Continuous detection and incident tracking for AI bias' }
            ].map((item) => (
              <div key={item.principle} className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm">{item.principle}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Statistics */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
          <h4 className="font-semibold mb-3">Measured Benefits</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { stat: '30-40%', label: 'Time Saved' },
              { stat: '25%', label: 'Quality Improvement' },
              { stat: '60%', label: 'Bias Reduction' },
              { stat: '95%', label: 'Manager Satisfaction' }
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-bold text-primary">{item.stat}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          Use the AI assistant early in your evaluation process—generating strength statements first 
          helps you structure your thinking before tackling development areas.
        </TipCallout>

        <WarningCallout title="Important Limitation">
          AI suggestions are based on available data. If an employee has limited goal tracking or 
          evidence uploads, suggestions may be less specific. Always supplement with your direct observations.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
