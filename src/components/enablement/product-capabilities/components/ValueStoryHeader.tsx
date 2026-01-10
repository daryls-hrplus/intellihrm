import { AlertTriangle, Sparkles, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Outcome {
  metric: string;
  label: string;
  description: string;
}

interface Persona {
  role: string;
  value: string;
}

interface ValueStoryHeaderProps {
  challenge: string;
  promise: string;
  outcomes: Outcome[];
  personas: Persona[];
}

export function ValueStoryHeader({ challenge, promise, outcomes, personas }: ValueStoryHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Challenge & Promise */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-semibold text-destructive mb-2">The Challenge</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{challenge}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">The Promise</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{promise}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Outcomes */}
      <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h4 className="font-semibold text-emerald-600">Key Outcomes</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {outcomes.map((outcome, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{outcome.metric}</div>
              <div className="text-sm font-medium text-foreground">{outcome.label}</div>
              <div className="text-xs text-muted-foreground">{outcome.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Persona Value Cards */}
      <Card className="p-4 bg-violet-500/5 border-violet-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-violet-600" />
          <h4 className="font-semibold text-violet-600">Value by Role</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {personas.map((persona, index) => (
            <div key={index} className="p-3 rounded-lg bg-background/50 border border-violet-200/50">
              <div className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">
                {persona.role}
              </div>
              <div className="text-sm text-foreground italic">"{persona.value}"</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
