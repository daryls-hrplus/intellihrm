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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ExecutiveOverview() {
  return (
    <div className="space-y-8" id="executive-overview">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
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
            Purpose-built for the Caribbean, Africa, and global expansion. Deep regional compliance 
            meets embedded intelligence for enterprise-grade workforce management.
          </p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
              <div className="text-3xl font-bold text-primary">18</div>
              <div className="text-sm text-muted-foreground">Core Modules</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
              <div className="text-3xl font-bold text-primary">450+</div>
              <div className="text-sm text-muted-foreground">Features</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">AI-Enhanced</div>
            </div>
          </div>
        </div>
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
              Deep compliance for Caribbean islands (Jamaica NIS/NHT/PAYE, Trinidad, Barbados) 
              and African markets (Ghana SSNIT, Nigeria). Built-in labor law intelligence.
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

      {/* The Employee Journey */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            The Employee Journey, HR-Enabled
          </h2>
          <p className="text-muted-foreground mb-6">
            This document follows the complete employee lifecycle, from attraction to exit, 
            showing how Intelli HRM supports every stage with integrated, intelligent capabilities.
          </p>
          
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20">
              Prologue: Foundation
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              Act 1: Attract & Onboard
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Act 2: Enable & Engage
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              Act 3: Pay & Reward
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              Act 4: Develop & Grow
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              Act 5: Protect & Support
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
              Epilogue: Excellence
            </Badge>
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
                <span className="text-sm">Native Caribbean & African compliance</span>
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
