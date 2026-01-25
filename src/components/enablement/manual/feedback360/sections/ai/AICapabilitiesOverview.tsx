import { LearningObjectives } from '../../../components/LearningObjectives';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { Brain, Sparkles, MessageSquare, AlertCircle, TrendingUp, Users, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand the scope of AI capabilities in 360 feedback',
  'Explain the human-in-the-loop governance model',
  'Identify which AI features require consent',
  'Describe ISO 42001 compliance requirements'
];

const aiCapabilities = [
  {
    icon: Brain,
    title: 'Signal Processing',
    description: 'Transform feedback into quantified talent signals',
    consent: 'Signal Generation'
  },
  {
    icon: Sparkles,
    title: 'Theme Generation',
    description: 'Extract development themes from patterns',
    consent: 'AI Analysis'
  },
  {
    icon: MessageSquare,
    title: 'Writing Quality',
    description: 'Real-time feedback improvement suggestions',
    consent: 'None (optional use)'
  },
  {
    icon: AlertCircle,
    title: 'Bias Detection',
    description: 'Identify and flag potentially biased language',
    consent: 'None (system protection)'
  },
  {
    icon: TrendingUp,
    title: 'Blind Spot Analysis',
    description: 'Self vs. Others perception gap detection',
    consent: 'AI Analysis'
  },
  {
    icon: Users,
    title: 'Coaching Prompts',
    description: 'Manager conversation starters from themes',
    consent: 'AI Analysis'
  }
];

const isoPrinciples = [
  {
    principle: 'Transparency',
    description: 'All AI actions are logged with decision factors and confidence scores'
  },
  {
    principle: 'Human Oversight',
    description: 'Critical AI outputs require human review and confirmation'
  },
  {
    principle: 'Accountability',
    description: 'Human overrides documented with justification for audit trail'
  },
  {
    principle: 'Explainability',
    description: 'AI reasoning is available for inspection and challenge'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'AI analysis requires explicit consent',
    enforcement: 'System',
    description: 'Participants must grant AI Analysis consent before theme generation runs'
  },
  {
    rule: 'Human confirmation for high-stakes decisions',
    enforcement: 'Policy',
    description: 'AI-generated themes require manager/HR confirmation before IDP linking'
  },
  {
    rule: 'All AI actions are logged',
    enforcement: 'System',
    description: 'Every AI operation creates an audit entry in feedback_ai_action_logs'
  },
  {
    rule: 'Bias warnings are advisory',
    enforcement: 'Policy',
    description: 'Bias detection warns but does not block submission; pattern analysis informs training'
  },
  {
    rule: 'Model version tracking',
    enforcement: 'System',
    description: 'AI outputs include model version for reproducibility and audit'
  }
];

const measuredBenefits = [
  { metric: 'Feedback Quality', improvement: '+23%', description: 'Writing quality score improvement with AI assistance' },
  { metric: 'Bias Reduction', improvement: '-41%', description: 'Reduction in flagged bias incidents after warnings' },
  { metric: 'Theme Accuracy', improvement: '87%', description: 'Manager agreement rate with AI-generated themes' },
  { metric: 'Time Saved', improvement: '2.5 hrs', description: 'Per manager on coaching preparation with prompts' }
];

export function AICapabilitiesOverview() {
  return (
    <section id="sec-5-1" data-manual-anchor="sec-5-1" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          5.1 AI Capabilities Overview
        </h3>
        <p className="text-muted-foreground mt-2">
          Understanding the scope of AI-powered features, governance model, and compliance requirements for 360 feedback intelligence.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* AI Capabilities Grid */}
      <div>
        <h4 className="font-medium mb-4">Core AI Capabilities</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiCapabilities.map((cap) => (
            <Card key={cap.title}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <cap.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{cap.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{cap.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Consent: {cap.consent}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Human-in-the-Loop Model */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            Human-in-the-Loop Governance Model
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    AI GOVERNANCE FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │   Feedback   │────▶│  AI Engine   │────▶│   Output     │            │
│   │   Input      │     │  Processing  │     │   Generated  │            │
│   └──────────────┘     └──────────────┘     └──────┬───────┘            │
│                                                     │                    │
│                              ┌──────────────────────┴──────────────┐    │
│                              ▼                                      ▼    │
│                     ┌────────────────┐                 ┌────────────────┐│
│                     │  Low Stakes    │                 │  High Stakes   ││
│                     │  (Suggestions) │                 │  (Themes/Signals)│
│                     └───────┬────────┘                 └───────┬────────┘│
│                             │                                   │        │
│                             ▼                                   ▼        │
│                     ┌────────────────┐                 ┌────────────────┐│
│                     │ Direct Display │                 │ Human Review   ││
│                     │ (User Choice)  │                 │ Required       ││
│                     └────────────────┘                 └───────┬────────┘│
│                                                                 │        │
│                                           ┌────────────┬────────┴───────┐│
│                                           ▼            ▼                ▼│
│                                     ┌─────────┐  ┌──────────┐  ┌────────┐│
│                                     │ Confirm │  │ Override │  │ Reject ││
│                                     └────┬────┘  └────┬─────┘  └───┬────┘│
│                                          │            │             │    │
│                                          ▼            ▼             ▼    │
│                                     ┌────────────────────────────────────┐│
│                                     │          AUDIT LOG                 ││
│                                     │ (Action, User, Reason, Timestamp)  ││
│                                     └────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* ISO 42001 Governance */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4" />
          ISO 42001 AI Governance Principles
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {isoPrinciples.map((p) => (
            <div key={p.principle} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{p.principle}</span>
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Measured Benefits */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Measured Benefits</h4>
          <div className="grid md:grid-cols-4 gap-4">
            {measuredBenefits.map((b) => (
              <div key={b.metric} className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{b.improvement}</div>
                <div className="text-sm font-medium mt-1">{b.metric}</div>
                <p className="text-xs text-muted-foreground mt-2">{b.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />
    </section>
  );
}
