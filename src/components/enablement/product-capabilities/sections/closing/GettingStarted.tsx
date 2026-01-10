import { 
  ArrowRight, 
  Calendar, 
  FileText, 
  Users, 
  Rocket,
  CheckCircle2,
  Clock,
  Shield,
  Globe,
  Brain,
  Sparkles,
  Building2,
  HeartHandshake,
  Award,
  Phone,
  Mail,
  MessageSquare,
  Download,
  Play,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhaseProps {
  phase: number;
  title: string;
  duration: string;
  description: string;
  activities: string[];
  color: string;
}

const ImplementationPhase = ({ phase, title, duration, description, activities, color }: PhaseProps) => (
  <div className="relative">
    <div className={cn(
      "absolute left-0 top-0 bottom-0 w-1 rounded-full",
      color
    )} />
    <div className="pl-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold",
          color
        )}>
          {phase}
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="grid grid-cols-2 gap-1">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className={cn("h-3 w-3", color.replace("bg-", "text-"))} />
            <span>{activity}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface DifferentiatorProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const Differentiator = ({ icon: Icon, title, description }: DifferentiatorProps) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const GettingStarted = () => {
  return (
    <section id="getting-started" className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 border border-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative text-center space-y-4">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Your Journey Starts Here
          </Badge>
          <h2 className="text-3xl font-bold">Ready to Transform Your HR?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join organizations across the Caribbean, Latin America, Africa, and beyond who have transformed 
            their HR operations with HRplus. Our proven implementation methodology ensures 
            rapid time-to-value with minimal disruption.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12-16</div>
              <div className="text-xs text-muted-foreground">Weeks to Go-Live</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-xs text-muted-foreground">Implementation Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.8/5</div>
              <div className="text-xs text-muted-foreground">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-xs text-muted-foreground">Successful Deployments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Implementation Journey */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-1">Implementation Journey</h3>
              <p className="text-sm text-muted-foreground">
                Our phased approach ensures smooth transitions and rapid adoption
              </p>
            </div>
            
            <div className="space-y-6">
              <ImplementationPhase
                phase={1}
                title="Discovery & Planning"
                duration="2-3 Weeks"
                description="Deep dive into your current processes, pain points, and future vision."
                activities={[
                  "Requirements gathering",
                  "Process mapping",
                  "Data audit",
                  "Integration planning",
                  "Success metrics",
                  "Timeline finalization",
                ]}
                color="bg-blue-500"
              />
              
              <ImplementationPhase
                phase={2}
                title="Configuration & Setup"
                duration="4-6 Weeks"
                description="Configure HRplus to match your policies, structures, and workflows."
                activities={[
                  "Org structure setup",
                  "Policy configuration",
                  "Workflow design",
                  "Data migration",
                  "Integration build",
                  "Security setup",
                ]}
                color="bg-emerald-500"
              />
              
              <ImplementationPhase
                phase={3}
                title="Testing & Training"
                duration="3-4 Weeks"
                description="Comprehensive testing and role-based training for all user groups."
                activities={[
                  "UAT execution",
                  "Admin training",
                  "HR user training",
                  "Manager training",
                  "Employee comms",
                  "Go-live prep",
                ]}
                color="bg-amber-500"
              />
              
              <ImplementationPhase
                phase={4}
                title="Go-Live & Optimization"
                duration="2-3 Weeks + Ongoing"
                description="Phased rollout with hypercare support and continuous improvement."
                activities={[
                  "Phased rollout",
                  "Hypercare support",
                  "Issue resolution",
                  "Adoption tracking",
                  "Optimization",
                  "Success review",
                ]}
                color="bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Why HRplus & CTA */}
        <div className="space-y-6">
          {/* Differentiators */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-xl">Why HRplus?</h3>
              
              <div className="grid gap-3">
                <Differentiator
                  icon={Globe}
                  title="Deep Regional Expertise"
                  description="Built for Caribbean, Latin America, and Africa with local compliance, tax rules, and labor laws baked in—not adapted from US templates."
                />
                <Differentiator
                  icon={Brain}
                  title="AI-First Architecture"
                  description="Intelligence embedded at every decision point with explainability, human oversight, and bias detection built in."
                />
                <Differentiator
                  icon={Building2}
                  title="Unified Platform"
                  description="All 25 modules share data seamlessly, eliminating silos and reducing manual work across the employee lifecycle."
                />
                <Differentiator
                  icon={Shield}
                  title="Enterprise-Grade Security"
                  description="SOC 2, GDPR, and ISO 27001 aligned with complete audit trails, SSO, MFA, and role-based access control."
                />
                <Differentiator
                  icon={Rocket}
                  title="Rapid Time-to-Value"
                  description="Pre-configured templates for Caribbean, Latin American, and African organizations accelerate deployment by 40%."
                />
                <Differentiator
                  icon={HeartHandshake}
                  title="Partnership Approach"
                  description="Dedicated success managers, 24/7 support, and continuous optimization based on your evolving needs."
                />
              </div>
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Start Your Transformation</h3>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule a Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Overview
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <Button variant="ghost" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Case Studies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Have Questions?</h3>
              <p className="text-sm text-muted-foreground">
                Our team is ready to help you explore how HRplus can transform your organization.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a 
                href="mailto:sales@hrplus.com" 
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                sales@hrplus.com
              </a>
              <a 
                href="tel:+18001234567" 
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                +1 (800) 123-4567
              </a>
              <a 
                href="#" 
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <div className="text-center py-8 space-y-4">
        <p className="text-xl font-semibold">
          1,675+ capabilities. 25 modules. One unified platform.
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Built for the Caribbean, Latin America, Africa, and global operations. 
          AI-first. Enterprise-ready. Human-centered.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">This is HRplus.</span>
        </div>
      </div>
    </section>
  );
};
