import { ArrowRight, Calendar, FileText, Users, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Step = ({ 
  number, 
  icon: Icon, 
  title, 
  description 
}: { 
  number: number;
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
      {number}
    </div>
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const GettingStarted = () => {
  return (
    <section id="getting-started" className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mb-2">Next Steps</Badge>
        <h2 className="text-2xl font-bold">Ready to Transform Your HR?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start your journey to intelligent HR management with our proven implementation approach
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-6">
            <h3 className="font-semibold text-lg">Implementation Journey</h3>
            
            <div className="space-y-6">
              <Step
                number={1}
                icon={Calendar}
                title="Discovery & Planning"
                description="We analyze your current processes, identify requirements, and create a tailored implementation roadmap."
              />
              
              <Step
                number={2}
                icon={FileText}
                title="Configuration & Setup"
                description="Configure modules to match your policies, import data, and set up integrations with existing systems."
              />
              
              <Step
                number={3}
                icon={Users}
                title="Training & Enablement"
                description="Role-based training for administrators, HR users, managers, and employees with comprehensive documentation."
              />
              
              <Step
                number={4}
                icon={Rocket}
                title="Go-Live & Optimization"
                description="Phased rollout with dedicated support, followed by continuous optimization based on usage insights."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Why Choose Intelli HRM?</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Deep Regional Expertise:</strong> Built for Caribbean and Africa with local compliance baked in</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>AI-First Architecture:</strong> Intelligence embedded throughout, not bolted on</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Unified Platform:</strong> All modules share data, reducing silos and manual work</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Enterprise-Ready:</strong> Security, scalability, and governance from day one</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Rapid Deployment:</strong> Pre-configured templates accelerate time-to-value</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button className="w-full" size="lg">
                Schedule a Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full">
                Download PDF Brochure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Have questions? Contact our sales team at{" "}
          <a href="mailto:sales@intellihrm.com" className="text-primary hover:underline">
            sales@intellihrm.com
          </a>
        </p>
      </div>
    </section>
  );
};
