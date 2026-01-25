import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Callout, TipCallout } from '@/components/enablement/manual/components/Callout';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { 
  Radar, 
  Target, 
  Shield, 
  Brain, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Clock,
  Lightbulb,
  AlertTriangle,
  FileText,
  Link2,
  Eye,
  Lock
} from 'lucide-react';

export function F360Introduction() {
  return (
    <div className="space-y-6">
      {/* Part Header */}
      <div data-manual-anchor="part-1" id="part-1">
        <h2 className="text-2xl font-bold mb-4">Part 1: Module Overview & Conceptual Foundation</h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive introduction to 360 Feedback in Intelli HRM, covering multi-rater philosophy, 
          core concepts, system architecture, user personas, and implementation planning.
        </p>
      </div>

      {/* Section 1.1 Title */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Radar className="h-5 w-5 text-cyan-600" />
        1.1 Introduction to 360 Feedback
      </h3>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The 360-Degree Feedback module in Intelli HRM delivers <strong>enterprise-grade multi-rater assessments</strong> that 
            provide comprehensive insights into employee competencies, behaviors, and performance. By collecting confidential 
            feedback from managers, peers, direct reports, and self-assessment, organizations gain a holistic view that 
            single-rater evaluations cannot provide.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
              <p className="text-2xl font-bold text-cyan-600">40%</p>
              <p className="text-sm text-muted-foreground">Reduction in single-rater bias</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-2xl font-bold text-emerald-600">85%</p>
              <p className="text-sm text-muted-foreground">Average participant satisfaction</p>
            </div>
            <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
              <p className="text-2xl font-bold text-violet-600">5</p>
              <p className="text-sm text-muted-foreground">Configurable rater categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Value Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Business Value Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-destructive">The Challenge</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  Single-rater evaluations miss critical blind spots
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  Manager bias can skew performance assessments
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  Employees lack visibility into peer perceptions
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  Development planning based on incomplete data
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-emerald-600">The Solution</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Multi-perspective feedback from 5 rater categories
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Configurable anonymity protects honest feedback
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  AI-powered signal processing identifies patterns
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Automated development theme generation
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Role</th>
                  <th className="text-left py-2 font-semibold">Primary Sections</th>
                  <th className="text-left py-2 font-semibold">Time Investment</th>
                  <th className="text-left py-2 font-semibold">Key Outcomes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/30">
                      HR Administrator
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">Parts 1-6 (Full manual)</td>
                  <td className="py-3 text-muted-foreground">6-8 hours</td>
                  <td className="py-3 text-muted-foreground">End-to-end cycle management</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                      Employee (Subject)
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">Parts 1, 3, 5</td>
                  <td className="py-3 text-muted-foreground">1-2 hours</td>
                  <td className="py-3 text-muted-foreground">Participate & understand results</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                      Manager
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">Parts 1, 3, 5, 6</td>
                  <td className="py-3 text-muted-foreground">2-3 hours</td>
                  <td className="py-3 text-muted-foreground">Review team & coach development</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-700 border-teal-500/30">
                      Implementation Consultant
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">All sections</td>
                  <td className="py-3 text-muted-foreground">8-10 hours</td>
                  <td className="py-3 text-muted-foreground">Configure & deploy module</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/30">
                      Executive Sponsor
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">Parts 1, 6</td>
                  <td className="py-3 text-muted-foreground">30-45 minutes</td>
                  <td className="py-3 text-muted-foreground">Strategic oversight & integration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Document Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                This Manual Covers
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 360 cycle configuration and lifecycle management</li>
                <li>• Rater category setup with weights and anonymity</li>
                <li>• Question bank design and competency mapping</li>
                <li>• Peer nomination workflows and approvals</li>
                <li>• Feedback collection and response tracking</li>
                <li>• AI-powered signal processing and themes</li>
                <li>• Report generation and audience templates</li>
                <li>• Investigation mode and governance controls</li>
                <li>• Integration with Appraisals, IDP, and Succession</li>
                <li>• 34+ database tables with field specifications</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Out of Scope
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Appraisal form configuration (see Appraisals Manual)</li>
                <li>• Competency framework design (see Workforce Manual)</li>
                <li>• Compensation planning workflows</li>
                <li>• Learning content creation (see L&D Manual)</li>
                <li>• Individual Development Plan authoring</li>
                <li>• Succession pool management</li>
                <li>• Third-party survey tool integrations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Differentiators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Enterprise Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-cyan-600" />
                <h4 className="font-semibold">AI-Powered Signal Processing</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Automated extraction of talent signals from feedback data. AI identifies patterns, 
                generates development themes, and flags writing quality concerns.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-gradient-to-br from-violet-500/5 to-violet-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-violet-600" />
                <h4 className="font-semibold">Configurable Anonymity</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Threshold-based anonymity protection (minimum 3 raters per category). 
                Category-specific settings with investigation mode for exceptional circumstances.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <h4 className="font-semibold">Governance-First Design</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                GDPR-compliant consent tracking, full audit trails, data retention policies, 
                and role-based access controls throughout the feedback lifecycle.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-500/5 to-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold">Cross-Module Integration</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Seamless data flow to Appraisals (CRGV 360 component), Succession (Nine-Box signals), 
                Learning (training recommendations), and Individual Development Plans.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Explain the multi-rater philosophy and benefits of 360-degree feedback",
          "Describe the anonymity threshold mechanism and its governance implications",
          "Identify the 34+ database tables and their relationships in the 360 module",
          "Map persona journeys from cycle invitation through results acknowledgement",
          "Configure rater categories with appropriate weights and visibility rules",
          "Understand AI signal processing and development theme generation",
        ]}
      />

      {/* Document Conventions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Conventions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This manual uses the following visual conventions to highlight important information:
          </p>
          
          <div className="space-y-3">
            <TipCallout title="Best Practice">
              Green callouts indicate recommended approaches and optimization tips.
            </TipCallout>
            
            <Callout variant="warning" title="Caution">
              Amber callouts highlight potential pitfalls or configuration considerations.
            </Callout>
            
            <Callout variant="critical" title="Critical Warning">
              Red callouts indicate actions that may cause data loss or compliance issues.
            </Callout>
            
            <Callout variant="info" title="System Path">
              Blue callouts reference navigation paths: <code className="text-xs bg-muted px-1 py-0.5 rounded">Performance → 360 Feedback → Cycles</code>
            </Callout>
            
            <Callout variant="integration" title="Integration Point">
              Violet callouts indicate cross-module data flows and dependencies.
            </Callout>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Estimated reading time: 15-20 minutes</span>
        </div>
        <Badge variant="outline">Section 1.1 of 1.5</Badge>
      </div>
    </div>
  );
}
