import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, Users, Target, TrendingUp, Shield } from 'lucide-react';

export function LndAIOverview() {
  return (
    <section id="sec-6-1" data-manual-anchor="sec-6-1" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.1 Overview & Architecture</h2>
        <p className="text-muted-foreground">
          Introduction to AI-powered learning intelligence capabilities within the L&D module.
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
            <li>Understand the AI capabilities available within the L&D module</li>
            <li>Identify integration points between AI features and other HRplus modules</li>
            <li>Recognize how skill gaps flow through the recommendation engine</li>
            <li>Understand role-based access to AI features</li>
          </ul>
        </CardContent>
      </Card>

      {/* AI Feature Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Feature Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The L&D module leverages AI to enhance learning outcomes through intelligent gap detection,
            personalized recommendations, and predictive analytics. All AI features comply with ISO 42001
            governance requirements.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Skill Gap Detection</p>
                <p className="text-xs text-muted-foreground">Automated identification of competency gaps from multiple sources</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Course Recommendations</p>
                <p className="text-xs text-muted-foreground">Gap-triggered course suggestions mapped to competencies</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Training Needs Analysis</p>
                <p className="text-xs text-muted-foreground">Organizational and departmental gap aggregation</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Governance</p>
                <p className="text-xs text-muted-foreground">Explainability, bias monitoring, and human oversight</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Architecture */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Flow Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────┐
│                    AI-Powered Learning Data Flow                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Performance │    │    360      │    │   Skills    │                 │
│  │  Appraisals │    │  Feedback   │    │ Assessments │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         └──────────────────┼──────────────────┘                         │
│                            ▼                                            │
│              ┌─────────────────────────┐                               │
│              │   employee_skill_gaps   │                               │
│              │   (Gap Detection Store) │                               │
│              └────────────┬────────────┘                               │
│                           │                                             │
│         ┌─────────────────┼─────────────────┐                          │
│         ▼                 ▼                 ▼                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Training   │  │    Course    │  │     IDP      │                 │
│  │    Needs     │  │ Recommender  │  │   Linking    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Module Integration Points */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Module Integration Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline">Performance</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Appraisal ratings feed skill gap detection</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline">Succession</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Readiness gaps trigger development recommendations</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline">IDP</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Skill gaps link directly to development plan items</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline">Recruitment</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Onboarding gaps drive initial training assignments</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Access */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Role-Based Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">AI Features Access</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">Employee (ESS)</td>
                  <td className="py-2">View own skill gaps, receive course recommendations</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Manager (MSS)</td>
                  <td className="py-2">Team gap analysis, training needs requests, recommendation review</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">HR Partner</td>
                  <td className="py-2">Org-wide analytics, training needs analysis, governance dashboard</td>
                </tr>
                <tr>
                  <td className="py-2">L&D Admin</td>
                  <td className="py-2">Full access including model configuration, content generation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
