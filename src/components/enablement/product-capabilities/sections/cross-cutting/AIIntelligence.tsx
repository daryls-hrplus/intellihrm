import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Zap, 
  MessageSquare, 
  Shield,
  Sparkles,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { ChallengePromise } from "../../components/ChallengePromise";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";

export const AIIntelligence = () => {
  return (
    <section id="ai-intelligence" className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mb-2 border-primary/50 bg-primary/5">
          <Brain className="h-3 w-3 mr-1" />
          AI-First Platform
        </Badge>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold">Embedded AI Intelligence</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20">55+</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI is woven throughout the platform—not as an add-on, but as the intelligence layer that reduces thinking load and drives better decisions
        </p>
      </div>

      <ChallengePromise
        challenge="AI hype outpaces AI reality. Chatbots that can't answer questions. Predictions that aren't actionable. Automation that creates more problems than it solves. When AI is bolted on without purpose, it becomes a feature checkbox, not a capability multiplier."
        promise="HRplus embeds AI at every decision point—not as a feature, but as the intelligence layer that amplifies human capability. Predictions that prevent problems. Recommendations that save hours. Automation that actually works. And always with explainability, human oversight, and bias detection built in. This is responsible AI that delivers real value."
      />

      <KeyOutcomeMetrics
        outcomes={[
          { value: "40%+", label: "Decision Time Reduction", description: "AI-powered recommendations" },
          { value: "85%+", label: "Prediction Accuracy", description: "Validated ML models" },
          { value: "100%", label: "Explainability", description: "Every AI output traceable" },
          { value: "Zero", label: "Unreviewed High-Risk", description: "Human-in-the-loop" }
        ]}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/30">
        <div className="text-center p-3">
          <p className="text-sm font-medium">HR Partner</p>
          <p className="text-xs text-muted-foreground italic">"I get recommendations, not just data"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">Manager</p>
          <p className="text-xs text-muted-foreground italic">"AI tells me what I didn't know to ask"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">CHRO</p>
          <p className="text-xs text-muted-foreground italic">"AI amplifies our team without replacing judgment"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">Compliance Officer</p>
          <p className="text-xs text-muted-foreground italic">"Every AI decision is auditable"</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CapabilityCategory title="Predictive Intelligence" icon={TrendingUp} accentColor="text-blue-500">
          <CapabilityItem>Attrition risk scoring with confidence levels</CapabilityItem>
          <CapabilityItem>Workforce demand forecasting</CapabilityItem>
          <CapabilityItem>Performance trajectory prediction</CapabilityItem>
          <CapabilityItem>Incident likelihood by location/role/time</CapabilityItem>
          <CapabilityItem>Budget variance predictions</CapabilityItem>
          <CapabilityItem>Time-to-fill estimations</CapabilityItem>
          <CapabilityItem>Flight risk detection</CapabilityItem>
          <CapabilityItem>Skill gap projections</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Prescriptive Recommendations" icon={Lightbulb} accentColor="text-purple-500">
          <CapabilityItem>Compensation adjustment recommendations</CapabilityItem>
          <CapabilityItem>Successor matching for critical positions</CapabilityItem>
          <CapabilityItem>Personalized learning path suggestions</CapabilityItem>
          <CapabilityItem>Optimal scheduling recommendations</CapabilityItem>
          <CapabilityItem>Pay equity remediation guidance</CapabilityItem>
          <CapabilityItem>Interview panel suggestions</CapabilityItem>
          <CapabilityItem>Development action recommendations</CapabilityItem>
          <CapabilityItem>Staffing optimization suggestions</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Intelligent Automation" icon={Zap} accentColor="text-amber-500">
          <CapabilityItem>Ticket auto-categorization and routing</CapabilityItem>
          <CapabilityItem>Anomaly detection in payroll and attendance</CapabilityItem>
          <CapabilityItem>Document classification and extraction</CapabilityItem>
          <CapabilityItem>Workflow routing optimization</CapabilityItem>
          <CapabilityItem>Compliance deadline monitoring</CapabilityItem>
          <CapabilityItem>Data validation and cleansing</CapabilityItem>
          <CapabilityItem>Duplicate detection</CapabilityItem>
          <CapabilityItem>Pattern-based alerting</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Conversational AI" icon={MessageSquare} accentColor="text-green-500">
          <CapabilityItem>Policy Q&A with natural language</CapabilityItem>
          <CapabilityItem>HR chatbot for employee queries</CapabilityItem>
          <CapabilityItem>Natural language report generation</CapabilityItem>
          <CapabilityItem>Voice-enabled interactions</CapabilityItem>
          <CapabilityItem>Intelligent search across all modules</CapabilityItem>
          <CapabilityItem>Context-aware responses</CapabilityItem>
          <CapabilityItem>Multi-language support</CapabilityItem>
          <CapabilityItem>Sentiment detection</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Generative AI" icon={Sparkles} accentColor="text-pink-500">
          <CapabilityItem>Job description generation</CapabilityItem>
          <CapabilityItem>Performance narrative generation</CapabilityItem>
          <CapabilityItem>Learning content generation</CapabilityItem>
          <CapabilityItem>Report narrative generation</CapabilityItem>
          <CapabilityItem>Email draft generation</CapabilityItem>
          <CapabilityItem>Policy summary generation</CapabilityItem>
          <CapabilityItem>Goal suggestion generation</CapabilityItem>
          <CapabilityItem>Interview question generation</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="AI Analytics" icon={BarChart3} accentColor="text-cyan-500">
          <CapabilityItem>AI usage dashboards</CapabilityItem>
          <CapabilityItem>Model performance monitoring</CapabilityItem>
          <CapabilityItem>Prediction accuracy tracking</CapabilityItem>
          <CapabilityItem>Recommendation acceptance rates</CapabilityItem>
          <CapabilityItem>Cost and usage analytics</CapabilityItem>
          <CapabilityItem>A/B testing results</CapabilityItem>
          <CapabilityItem>Continuous improvement metrics</CapabilityItem>
        </CapabilityCategory>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            Responsible AI Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Every AI capability is built with governance, transparency, and human oversight at its core. Our Responsible AI framework ensures trust while delivering value.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Explainability</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Every prediction with reasoning</li>
                <li>• Feature importance visibility</li>
                <li>• Decision path transparency</li>
                <li>• Plain language explanations</li>
                <li>• Explainability logging</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Human-in-the-Loop</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Approval gates for high-risk decisions</li>
                <li>• Override capability with documentation</li>
                <li>• Escalation triggers</li>
                <li>• Human override tracking</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Bias Detection</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Bias monitoring in hiring, performance, compensation</li>
                <li>• Demographic parity analysis</li>
                <li>• Disparate impact detection</li>
                <li>• Bias incident tracking</li>
                <li>• Mitigation recommendations</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Governance</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• AI model registry</li>
                <li>• Version control</li>
                <li>• Risk assessments</li>
                <li>• Usage policies and guardrails</li>
                <li>• Budget controls</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary">Explainable Outputs</Badge>
            <Badge variant="secondary">Human-in-the-Loop</Badge>
            <Badge variant="secondary">Bias Detection</Badge>
            <Badge variant="secondary">Full Audit Trail</Badge>
            <Badge variant="secondary">ISO 42001 Aligned</Badge>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
