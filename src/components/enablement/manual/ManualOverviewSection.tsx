import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Target, Users, Layers, ArrowRight, CheckCircle,
  Lightbulb, AlertTriangle, Calendar, Building
} from 'lucide-react';

export function ManualOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1: Introduction */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.1</Badge>
            <span>•</span>
            <span>10 min read</span>
          </div>
          <CardTitle className="text-2xl">Introduction to Appraisals in HRplus</CardTitle>
          <CardDescription>
            Purpose, positioning, and key differentiators of the Appraisals module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The HRplus Appraisals module is an enterprise-grade performance evaluation system designed to support 
              organizations in conducting fair, transparent, and developmentally-focused performance reviews. Built 
              with AI-first principles, it goes beyond traditional performance management to provide predictive 
              insights, automated workflows, and seamless integration across the entire HR ecosystem.
            </p>
          </div>

          {/* Key Differentiators */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">AI-First Design</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Embedded intelligence for feedback generation, bias detection, and predictive analytics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Layers className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Cross-Module Orchestration</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatic data flow to Succession, Compensation, Learning, and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Building className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Regional Compliance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built-in support for Caribbean, African, and global labor law requirements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Benchmark Callout */}
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Industry Standard</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  HRplus Appraisals aligns with enterprise HRMS standards while providing unique AI capabilities 
                  and regional compliance support for the Caribbean, Africa, and global markets.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1.2: Core Concepts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.2</Badge>
            <span>•</span>
            <span>15 min read</span>
          </div>
          <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
          <CardDescription>
            CRGV Model, scoring methodology, and key definitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CRGV Model */}
          <div>
            <h3 className="text-lg font-semibold mb-4">The CRGV Model</h3>
            <p className="text-muted-foreground mb-4">
              HRplus uses the Competencies-Responsibilities-Goals-Values (CRGV) model as the foundation for 
              comprehensive performance evaluation:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { letter: 'C', title: 'Competencies', weight: '20%', desc: 'Behavioral skills and capabilities aligned to job requirements' },
                { letter: 'R', title: 'Responsibilities', weight: '30%', desc: 'Key Result Areas (KRAs) and job-specific duties' },
                { letter: 'G', title: 'Goals', weight: '40%', desc: 'SMART objectives cascaded from organizational strategy' },
                { letter: 'V', title: 'Values', weight: '10%', desc: 'Alignment with organizational culture and principles' }
              ].map((item) => (
                <div key={item.letter} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {item.letter}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge variant="secondary">{item.weight}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Key Terms */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Key Terminology</h3>
            <div className="space-y-3">
              {[
                { term: 'Appraisal Cycle', def: 'A defined evaluation period (typically annual or semi-annual) during which performance assessments are conducted.' },
                { term: 'Participant', def: 'An employee being evaluated within an appraisal cycle.' },
                { term: 'Evaluator', def: 'The person conducting the evaluation, typically the direct manager.' },
                { term: 'Rating Scale', def: 'The scoring system used to rate individual components (e.g., 1-5 scale).' },
                { term: 'Overall Rating Scale', def: 'The final performance categories (e.g., Exceptional, Exceeds, Meets, etc.).' },
                { term: 'Calibration', def: 'A process where managers collectively review and adjust ratings to ensure consistency and fairness.' },
                { term: 'Pre-calibration Score', def: 'The initial score before calibration adjustments.' },
                { term: 'Post-calibration Score', def: 'The final score after calibration has been applied.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium min-w-[180px]">{item.term}</span>
                  <span className="text-muted-foreground">{item.def}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Standard Callout */}
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Industry Standard Timing</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The 70-20-10 weight distribution (Goals-Responsibilities-Competencies) is an industry 
                  standard. Organizations may adjust based on role type (e.g., higher goal weight for sales roles).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1.3: System Architecture (Placeholder) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.3</Badge>
            <span>•</span>
            <span>20 min read</span>
          </div>
          <CardTitle className="text-2xl">System Architecture</CardTitle>
          <CardDescription>
            Data model, integration points, and technical overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Appraisals module consists of 14 core database tables with extensive integration points:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Core Tables</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> appraisal_cycles</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> appraisal_participants</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> appraisal_scores</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> appraisal_form_templates</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> appraisal_integration_rules</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> appraisal_outcome_action_rules</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">AI Edge Functions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-blue-500" /> appraisal-feedback-assistant</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-blue-500" /> calibration-ai-analyzer</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-blue-500" /> calibration-ai-suggester</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-blue-500" /> performance-comment-analyzer</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-blue-500" /> appraisal-integration-orchestrator</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
