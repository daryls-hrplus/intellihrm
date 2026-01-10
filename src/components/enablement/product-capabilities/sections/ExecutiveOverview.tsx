import { 
  Building2, 
  Users, 
  Shield, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Heart, 
  HelpCircle,
  Sparkles,
  Globe,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Briefcase,
  Target,
  Brain,
  Lightbulb,
  Zap,
  Quote,
  AlertTriangle,
  Rocket,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PersonaValueProps {
  icon: React.ElementType;
  persona: string;
  quote: string;
  color: string;
}

const PersonaValue = ({ icon: Icon, persona, quote, color }: PersonaValueProps) => (
  <div className={cn("p-4 rounded-xl border", color)}>
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <div className="font-semibold text-sm mb-1">{persona}</div>
        <p className="text-sm text-muted-foreground italic">"{quote}"</p>
      </div>
    </div>
  </div>
);

interface ActJourneyCardProps {
  act: string;
  title: string;
  narrative: string;
  outcome: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

const ActJourneyCard = ({ act, title, narrative, outcome, color, bgColor, icon: Icon }: ActJourneyCardProps) => (
  <div className={cn("p-4 rounded-lg border transition-all hover:shadow-md", bgColor)}>
    <div className="flex items-center gap-2 mb-2">
      <div className={cn("p-1.5 rounded-lg", bgColor.replace("/10", "/20"))}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <Badge variant="outline" className={cn("text-xs", bgColor, color)}>
        {act}
      </Badge>
    </div>
    <h4 className={cn("font-semibold text-sm mb-1", color)}>{title}</h4>
    <p className="text-xs text-muted-foreground mb-2">{narrative}</p>
    <div className="flex items-center gap-1.5 text-xs">
      <CheckCircle2 className={cn("h-3 w-3", color)} />
      <span className="font-medium">{outcome}</span>
    </div>
  </div>
);

export function ExecutiveOverview() {
  return (
    <div className="space-y-8" id="executive-overview">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Enterprise HRMS Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Intelli HRM
          </h1>
          <p className="text-xl text-primary font-medium mb-2">
            AI-First Human Resource Management System
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mb-8">
            Purpose-built for the Caribbean, Latin America, Africa, and global expansion. Deep regional compliance 
            meets embedded intelligence for enterprise-grade workforce management.
          </p>
          
          {/* Key Stats - Updated */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur border border-primary/10">
              <div className="text-3xl font-bold text-primary">25</div>
              <div className="text-sm text-muted-foreground">Core Modules</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur border border-primary/10">
              <div className="text-3xl font-bold text-primary">1,675+</div>
              <div className="text-sm text-muted-foreground">Capabilities</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur border border-primary/10">
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur border border-primary/10">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">AI-Enhanced</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transformation Story */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-red-600">The Challenge</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Global HR platforms fail locally. Caribbean tax rules don't fit North American templates. 
              African labor laws are missing. Latin American statutory requirements become manual spreadsheets. 
              You're left patching gaps, building workarounds, and risking compliance.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Jamaica NIS/NHT/PAYE missing from US-centric platforms</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Ghana SSNIT calculations require manual intervention</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Dominican Republic AFP/TSS compliance as spreadsheet workarounds</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Rocket className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-bold text-lg text-green-600">The Transformation</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              HRplus was built from the ground up for regional complexity—not adapted from US templates. 
              Every statutory deduction, every labor law nuance, every public holiday is native to the platform. 
              Compliance is a first-class citizen, not an afterthought.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Caribbean payroll with NIS, NHT, PAYE, HEART built-in</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>African compliance (Ghana, Nigeria) as first-class features</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Latin America (Dominican Republic, Mexico) fully supported</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Proposition */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Regional Expertise</h3>
            <p className="text-sm text-muted-foreground">
              Deep compliance for Caribbean islands (Jamaica NIS/NHT/PAYE, Trinidad, Barbados), 
              Latin America (Dominican Republic AFP/TSS, Mexico IMSS), and African markets 
              (Ghana SSNIT, Nigeria PFA). Built-in labor law intelligence.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI at the Core</h3>
            <p className="text-sm text-muted-foreground">
              Every module features predictive insights, prescriptive recommendations, 
              and automated actions. AI reduces thinking load, not just clicks.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Cross-Module Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              No module exists in isolation. Appraisals feed Succession, Compensation, 
              and Learning. Time data flows to Payroll, Wellness, and Compliance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Employee Journey */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            The Employee Journey, HR-Enabled
          </h2>
          <p className="text-muted-foreground mb-6">
            This document follows the complete employee lifecycle through seven acts, 
            showing how HRplus supports every stage with integrated, intelligent capabilities.
          </p>
          
          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-3">
            <ActJourneyCard
              act="Prologue"
              title="Setting the Stage"
              narrative="Where governance begins"
              outcome="Zero-trust security"
              color="text-slate-600"
              bgColor="bg-slate-500/10"
              icon={Shield}
            />
            <ActJourneyCard
              act="Act 1"
              title="Attract & Onboard"
              narrative="Where talent meets strategy"
              outcome="50% faster hiring"
              color="text-blue-600"
              bgColor="bg-blue-500/10"
              icon={UserPlus}
            />
            <ActJourneyCard
              act="Act 2"
              title="Enable & Engage"
              narrative="Where work flows freely"
              outcome="80% fewer inquiries"
              color="text-emerald-600"
              bgColor="bg-emerald-500/10"
              icon={Users}
            />
            <ActJourneyCard
              act="Act 3"
              title="Pay & Reward"
              narrative="Where trust is built"
              outcome="99.99% accuracy"
              color="text-amber-600"
              bgColor="bg-amber-500/10"
              icon={DollarSign}
            />
            <ActJourneyCard
              act="Act 4"
              title="Develop & Grow"
              narrative="Where potential becomes performance"
              outcome="90%+ succession"
              color="text-purple-600"
              bgColor="bg-purple-500/10"
              icon={GraduationCap}
            />
            <ActJourneyCard
              act="Act 5"
              title="Protect & Support"
              narrative="Where care becomes culture"
              outcome="60%+ safer workplace"
              color="text-red-600"
              bgColor="bg-red-500/10"
              icon={Heart}
            />
            <ActJourneyCard
              act="Epilogue"
              title="Excellence"
              narrative="Where support never stops"
              outcome="70%+ self-service"
              color="text-indigo-600"
              bgColor="bg-indigo-500/10"
              icon={HelpCircle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Persona Value Propositions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            What Each Persona Gains
          </h2>
          <p className="text-muted-foreground mb-6">
            HRplus delivers distinct value to every role in your organization.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <PersonaValue
              icon={Users}
              persona="Employee"
              quote="One portal for everything—from day one to retirement. I can see my pay, request leave, access learning, and manage my career all in one place."
              color="bg-blue-500/5 border-blue-500/20"
            />
            <PersonaValue
              icon={Briefcase}
              persona="Manager"
              quote="AI tells me what I didn't know to ask about my team. I see attrition risks, skill gaps, and performance trends before they become problems."
              color="bg-emerald-500/5 border-emerald-500/20"
            />
            <PersonaValue
              icon={Shield}
              persona="HR Partner"
              quote="Compliance is built-in, not bolted on. Every country's rules are native, every action is auditable, and every report is ready."
              color="bg-purple-500/5 border-purple-500/20"
            />
            <PersonaValue
              icon={Target}
              persona="Executive"
              quote="Strategic workforce insights, not operational noise. I see the pipeline, the costs, the risks—and what to do about them."
              color="bg-amber-500/5 border-amber-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Differentiator */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                AI-First Architecture
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Differentiator
                </Badge>
              </h2>
              <p className="text-muted-foreground mt-1">
                Not a chatbot bolt-on—intelligence at the core of every decision.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border">
              <Zap className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">Embedded Intelligence</h4>
              <p className="text-xs text-muted-foreground">AI in every module, not just a chat window</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <Lightbulb className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">Predictive Insights</h4>
              <p className="text-xs text-muted-foreground">See problems before they happen</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">Prescriptive Actions</h4>
              <p className="text-xs text-muted-foreground">Know what to do, not just what happened</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <Shield className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">Explainable AI</h4>
              <p className="text-xs text-muted-foreground">Full audit trails, human oversight, bias detection</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Positioning */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Enterprise Benchmark Alignment</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">SAP SuccessFactors – Enterprise configuration & governance</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Workday – Unified data model & intelligence</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Oracle HCM – Compliance & scale</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">ISO 27001 / SOC 2 – Security & controls</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Key Differentiators</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">AI embedded in every module, not bolted on</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm">Native Caribbean, Latin American & African compliance</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">Full audit trails with explainable AI</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Role-based simplicity with progressive depth</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}