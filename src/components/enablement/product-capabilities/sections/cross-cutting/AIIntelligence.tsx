import { Brain, TrendingUp, Lightbulb, Zap, MessageSquare, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AICapabilityCard = ({ 
  icon: Icon, 
  title, 
  description,
  examples,
  color
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  examples: string[];
  color: string;
}) => (
  <Card className="border-border/50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {title}
      </CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent>
      <ul className="space-y-1.5">
        {examples.map((example, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            {example}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export const AIIntelligence = () => {
  return (
    <section id="ai-intelligence" className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mb-2 border-primary/50 bg-primary/5">
          <Brain className="h-3 w-3 mr-1" />
          AI-First Platform
        </Badge>
        <h2 className="text-2xl font-bold">Embedded AI Intelligence</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI is woven throughout the platform—not as an add-on, but as the intelligence layer that reduces thinking load and drives better decisions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AICapabilityCard
          icon={TrendingUp}
          title="Predictive Intelligence"
          description="Anticipate what's coming before it happens"
          examples={[
            "Attrition risk scoring for key employees",
            "Workforce demand forecasting",
            "Incident likelihood by location/role",
            "Budget variance predictions",
            "Time-to-fill estimations for requisitions"
          ]}
          color="bg-blue-500"
        />

        <AICapabilityCard
          icon={Lightbulb}
          title="Prescriptive Recommendations"
          description="Know what action to take and why"
          examples={[
            "Compensation adjustment recommendations",
            "Successor matching for critical positions",
            "Personalized learning path suggestions",
            "Optimal scheduling recommendations",
            "Pay equity remediation guidance"
          ]}
          color="bg-purple-500"
        />

        <AICapabilityCard
          icon={Zap}
          title="Intelligent Automation"
          description="Reduce manual work with smart automation"
          examples={[
            "Ticket auto-categorization and routing",
            "Anomaly detection in payroll and attendance",
            "Workflow routing optimization",
            "Document classification and extraction",
            "Compliance deadline monitoring"
          ]}
          color="bg-amber-500"
        />

        <AICapabilityCard
          icon={MessageSquare}
          title="Conversational AI"
          description="Natural language interaction with HR systems"
          examples={[
            "Policy Q&A with natural language",
            "HR chatbot for employee queries",
            "Natural language report generation",
            "Voice-enabled time tracking",
            "Intelligent search across all modules"
          ]}
          color="bg-green-500"
        />
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Responsible AI by Design</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Every AI output is traceable and explainable. Human approval gates are enforced for high-risk decisions. Bias detection is built into hiring, performance, and compensation recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Explainable Outputs</Badge>
                <Badge variant="secondary">Human-in-the-Loop</Badge>
                <Badge variant="secondary">Bias Detection</Badge>
                <Badge variant="secondary">Audit Trail</Badge>
                <Badge variant="secondary">ISO 42001 Aligned</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
