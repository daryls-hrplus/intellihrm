import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, FileText, HelpCircle, CheckSquare } from 'lucide-react';

export function LndAIContentGeneration() {
  return (
    <section id="sec-6-6" data-manual-anchor="sec-6-6" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.6 AI Content Generation</h2>
        <p className="text-muted-foreground">
          AI-assisted content creation capabilities for course development, quiz generation, and learning material authoring.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Understand available AI content generation capabilities</li>
            <li>Recognize the current manual vs. future AI-assisted workflows</li>
            <li>Apply human oversight requirements to AI-generated content</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current Capabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Current Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The following AI-assisted content generation features are available through the Documentation Agent
            and Content Studio:
          </p>
          
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Course Outline Generation</p>
                <p className="text-xs text-muted-foreground">
                  Generate structured course outlines from learning objectives or topic descriptions.
                  Available via Enablement Center → Content Studio.
                </p>
                <Badge className="mt-2">Available</Badge>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Quiz Question Generation</p>
                <p className="text-xs text-muted-foreground">
                  Create quiz questions from course content using Bloom's Taxonomy alignment.
                  Supports multiple choice, true/false, and short answer formats.
                </p>
                <Badge variant="outline" className="mt-2">Planned Enhancement</Badge>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <CheckSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Learning Objective Suggestions</p>
                <p className="text-xs text-muted-foreground">
                  AI suggests SMART learning objectives based on course topic and target audience.
                </p>
                <Badge variant="outline" className="mt-2">Planned Enhancement</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual vs AI-Assisted Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Manual Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Manual Course Creation Workflow:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Define Learning Objectives                                  │
│     └── SME provides topic list, L&D writes objectives          │
│                                                                 │
│  2. Create Course Outline                                       │
│     └── L&D structures modules/lessons manually                 │
│                                                                 │
│  3. Develop Content                                             │
│     └── Write lesson text, create visuals, record videos        │
│                                                                 │
│  4. Create Assessments                                          │
│     └── Write quiz questions manually (50+ per course typical)  │
│                                                                 │
│  5. Review & Publish                                            │
│     └── SME review, compliance check, publish                   │
│                                                                 │
│  Average Time: 40-80 hours per 1-hour course                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Future AI-Assisted Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Future AI-Assisted Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`AI-Assisted Course Creation Workflow (Planned):
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Define Learning Objectives                                  │
│     └── AI suggests objectives → SME refines                    │
│                                                                 │
│  2. Create Course Outline                                       │
│     └── AI generates outline → L&D adjusts structure            │
│                                                                 │
│  3. Develop Content                                             │
│     └── AI drafts content → L&D edits and enhances              │
│                                                                 │
│  4. Create Assessments                                          │
│     └── AI generates questions → L&D validates correctness      │
│                                                                 │
│  5. Review & Publish                                            │
│     └── Human review REQUIRED → compliance check → publish      │
│                                                                 │
│  Target Time: 15-30 hours per 1-hour course (60%+ reduction)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Human Oversight Requirements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Human Oversight Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Per ISO 42001 AI governance requirements, all AI-generated training content must undergo human review
            before publication.
          </p>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
              Mandatory Review Checklist:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Factual accuracy verification by SME</li>
              <li>Bias and fairness review</li>
              <li>Brand and tone consistency check</li>
              <li>Regulatory compliance validation (for compliance training)</li>
              <li>Accessibility standards confirmation</li>
            </ul>
          </div>
          
          <p className="text-xs text-muted-foreground">
            See Section 6.7 (AI Governance & Explainability) for complete oversight workflow documentation.
          </p>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Content Generation Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge>Q1 2025</Badge>
              <span className="text-sm text-muted-foreground">Quiz question generation from course content</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Q2 2025</Badge>
              <span className="text-sm text-muted-foreground">Learning objective auto-suggestion</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">Q3 2025</Badge>
              <span className="text-sm text-muted-foreground">Full course content drafting with AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">Q4 2025</Badge>
              <span className="text-sm text-muted-foreground">Video script generation and localization</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
