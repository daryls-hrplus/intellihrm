import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Settings,
  Users,
  DollarSign,
  Clock,
  Heart,
  GraduationCap,
  Target,
  TrendingUp,
  Briefcase,
  Shield,
  MessageSquare,
  Package,
  Layers,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

interface PhaseItem {
  order: number;
  area: string;
  description: string;
}

interface Phase {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  prerequisite?: string;
  items: PhaseItem[];
}

const phases: Phase[] = [
  {
    id: "foundation",
    title: "Phase 1: Foundation (Admin & Security)",
    icon: Settings,
    description: "Must be completed first - all other modules depend on this",
    items: [
      { order: 1, area: "Territories", description: "Define geographic regions for company grouping" },
      { order: 2, area: "Company Groups", description: "Create organizational holding structures" },
      { order: 3, area: "Companies", description: "Add individual companies" },
      { order: 4, area: "Divisions", description: "Optional organizational layer" },
      { order: 5, area: "Departments", description: "Mandatory business units per company" },
      { order: 6, area: "Sections", description: "Optional sub-departments" },
      { order: 7, area: "Branch Locations", description: "Physical office locations per company" },
      { order: 8, area: "Roles", description: "Define roles with permissions & PII access" },
      { order: 9, area: "Users", description: "Create admin/HR users first" },
      { order: 10, area: "Lookup Values", description: "Configure statuses, types, reasons" },
      { order: 11, area: "Currencies", description: "Enable multi-currency if needed" },
      { order: 12, area: "System Settings", description: "Branding, notifications, video chat" },
    ],
  },
  {
    id: "workforce",
    title: "Phase 2: Workforce Core",
    icon: Users,
    description: "Core employee data and organizational structure",
    prerequisite: "Phase 1 complete",
    items: [
      { order: 1, area: "Job Families", description: "Group jobs by function/category" },
      { order: 2, area: "Jobs", description: "Define job definitions" },
      { order: 3, area: "Responsibilities", description: "Add responsibilities to jobs (weighted)" },
      { order: 4, area: "Competencies & Levels", description: "Define skill requirements" },
      { order: 5, area: "Job Competencies", description: "Link competencies to jobs (weighted)" },
      { order: 6, area: "Job Goals", description: "Define standard goals per job" },
      { order: 7, area: "Positions", description: "Create specific positions from jobs" },
      { order: 8, area: "Employees", description: "Add employee records" },
      { order: 9, area: "Employee Assignments", description: "Assign employees to positions" },
      { order: 10, area: "Onboarding Templates", description: "Per-job onboarding workflows" },
      { order: 11, area: "Offboarding Templates", description: "Exit process workflows" },
    ],
  },
  {
    id: "compensation",
    title: "Phase 3: Compensation & Payroll",
    icon: DollarSign,
    description: "Pay structures, grades, and payroll processing",
    prerequisite: "Employees exist",
    items: [
      { order: 1, area: "Pay Elements", description: "Base salary, allowances, deductions" },
      { order: 2, area: "Salary Grades", description: "Grade levels with min/mid/max" },
      { order: 3, area: "Position Compensation", description: "Link pay elements to positions" },
      { order: 4, area: "Pay Groups", description: "Group employees by pay frequency" },
      { order: 5, area: "Pay Periods", description: "Generate pay calendars" },
      { order: 6, area: "Tax Configuration", description: "Tax rates and rules" },
      { order: 7, area: "Bank File Config", description: "Payment file formats" },
      { order: 8, area: "Bonus Plans", description: "Performance-based bonuses" },
    ],
  },
  {
    id: "time-leave",
    title: "Phase 4: Time & Leave",
    icon: Clock,
    description: "Attendance tracking and leave management",
    prerequisite: "Can run parallel after Phase 2",
    items: [
      { order: 1, area: "Attendance Policies", description: "Grace periods, rounding rules" },
      { order: 2, area: "Work Schedules", description: "Shift patterns" },
      { order: 3, area: "Geofencing Locations", description: "Clock-in zones with face capture" },
      { order: 4, area: "Project/Client/Tasks", description: "For project time tracking" },
      { order: 5, area: "Leave Types", description: "Vacation, sick, personal, etc." },
      { order: 6, area: "Accrual Rules", description: "How leave is earned" },
      { order: 7, area: "Rollover Rules", description: "Carryover limits" },
      { order: 8, area: "Holidays", description: "Country & company holidays" },
      { order: 9, area: "Comp Time Policies", description: "Compensatory time rules" },
    ],
  },
  {
    id: "benefits-training",
    title: "Phase 5: Benefits & Training",
    icon: Heart,
    description: "Employee benefits and learning management",
    prerequisite: "Employees assigned to positions",
    items: [
      { order: 1, area: "Benefit Categories", description: "Health, retirement, life, wellness" },
      { order: 2, area: "Benefit Providers", description: "Insurance companies, vendors" },
      { order: 3, area: "Benefit Plans", description: "Specific plan offerings" },
      { order: 4, area: "Enrollment Periods", description: "Open enrollment windows" },
      { order: 5, area: "Auto-Enrollment Rules", description: "Automatic benefit assignment" },
      { order: 6, area: "Training Categories", description: "Course classifications" },
      { order: 7, area: "Training Programs", description: "Program definitions" },
      { order: 8, area: "LMS Courses", description: "Online courses" },
      { order: 9, area: "Modules & Lessons", description: "Course content structure" },
      { order: 10, area: "Quizzes", description: "Assessments and questions" },
    ],
  },
  {
    id: "performance",
    title: "Phase 6: Performance & Succession",
    icon: Target,
    description: "Performance management and talent planning",
    prerequisite: "Competencies, Jobs, Training configured",
    items: [
      { order: 1, area: "Goals (OKR/SMART)", description: "Goal frameworks" },
      { order: 2, area: "360 Feedback Cycles", description: "Multi-source feedback" },
      { order: 3, area: "Appraisal Cycles", description: "Formal reviews" },
      { order: 4, area: "Performance Improvement Plans", description: "For underperformers" },
      { order: 5, area: "Recognition Programs", description: "Awards and recognition" },
      { order: 6, area: "Nine Box Grid Config", description: "Talent assessment matrix" },
      { order: 7, area: "Talent Pools", description: "High-potential groupings" },
      { order: 8, area: "Key Positions", description: "Critical role identification" },
      { order: 9, area: "Succession Plans", description: "Successor assignments" },
      { order: 10, area: "Career Paths", description: "Job progression routes" },
      { order: 11, area: "Mentorship Programs", description: "Mentor-mentee pairing" },
    ],
  },
  {
    id: "auxiliary",
    title: "Phase 7: Auxiliary Modules",
    icon: Layers,
    description: "Supporting HR functions",
    prerequisite: "Can implement any time after Phase 2",
    items: [
      { order: 1, area: "Recruitment", description: "Job requisitions, candidates, interviews" },
      { order: 2, area: "Health & Safety", description: "Incidents, risks, PPE, compliance" },
      { order: 3, area: "Employee Relations", description: "Cases, disciplinary, recognition, surveys" },
      { order: 4, area: "Company Property", description: "Assets, assignments, maintenance" },
    ],
  },
  {
    id: "hr-hub",
    title: "Phase 8: HR Hub & Workflows",
    icon: Briefcase,
    description: "Final configuration layer",
    items: [
      { order: 1, area: "Workflow Templates", description: "Approval routing for all processes" },
      { order: 2, area: "Letter Templates", description: "Hire, promotion, termination letters" },
      { order: 3, area: "Policy Documents", description: "Upload company policies (RAG)" },
      { order: 4, area: "SOPs", description: "Standard operating procedures" },
      { order: 5, area: "Knowledge Base", description: "Help articles" },
      { order: 6, area: "Reminder Rules", description: "Automated notifications" },
      { order: 7, area: "Scheduled Reports", description: "Automated report delivery" },
      { order: 8, area: "AI Assistant Config", description: "Budget tiers, guardrails" },
    ],
  },
  {
    id: "billing",
    title: "Phase 9: Billing & Subscriptions",
    icon: CreditCard,
    description: "Subscription management and invoice processing",
    items: [
      { order: 1, area: "Subscription Tiers", description: "Define pricing tiers and module bundles" },
      { order: 2, area: "Invoice Settings", description: "Company billing address, logo, terms" },
      { order: 3, area: "Payment Methods", description: "Configure credit card or wire transfer options" },
      { order: 4, area: "Trial Management", description: "30-day trial with module selection" },
      { order: 5, area: "Grace Period Config", description: "7-day grace period after trial expiry" },
      { order: 6, area: "Invoice Generation", description: "Auto-generate on activation and before renewal" },
      { order: 7, area: "Payment Webhook", description: "Configure mail parsing service for auto-payment receipt" },
      { order: 8, area: "Multi-Currency Billing", description: "Group base currency and local currency setup" },
      { order: 9, area: "Employee Overage Rules", description: "Soft limit billing for count overages" },
      { order: 10, area: "Leave Buyout Config", description: "Negotiated rates for leave balance buyouts" },
      { order: 11, area: "Leave Payment Rules", description: "Tiered payment percentages by day range" },
    ],
  },
];

const dependencies = [
  { module: "Workforce", dependsOn: "Admin (companies, departments)" },
  { module: "Compensation", dependsOn: "Workforce (jobs, positions)" },
  { module: "Payroll", dependsOn: "Compensation (pay elements, grades)" },
  { module: "Leave", dependsOn: "Workforce (employees)" },
  { module: "Benefits", dependsOn: "Workforce (employees, positions)" },
  { module: "Training", dependsOn: "Workforce (employees)" },
  { module: "Performance", dependsOn: "Workforce + Training (competencies)" },
  { module: "Succession", dependsOn: "Performance (assessments)" },
  { module: "All ESS/MSS", dependsOn: "User accounts + Role assignments" },
  { module: "Billing", dependsOn: "Admin (companies, currencies)" },
  { module: "Invoices", dependsOn: "Billing (subscriptions, tiers)" },
  { module: "Leave Buyout", dependsOn: "Leave + Payroll (pay groups)" },
];

export default function ImplementationHandbookPage() {
  const { t } = useTranslation();
  const [activePhase, setActivePhase] = useState("foundation");
  const contentRef = useRef<HTMLDivElement>(null);

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("HRplus Cerebra", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;
      doc.setFontSize(18);
      doc.text("Implementation Handbook", pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 20;

      // Phases
      phases.forEach((phase, phaseIndex) => {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }

        // Phase title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(phase.title, margin, yPos);
        yPos += 7;

        // Description
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(phase.description, margin, yPos);
        yPos += 5;

        if (phase.prerequisite) {
          doc.text(`Prerequisite: ${phase.prerequisite}`, margin, yPos);
          yPos += 5;
        }
        yPos += 3;

        // Items table header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Order", margin, yPos);
        doc.text("Area", margin + 15, yPos);
        doc.text("Description", margin + 60, yPos);
        yPos += 5;

        // Draw header line
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;

        // Items
        doc.setFont("helvetica", "normal");
        phase.items.forEach((item) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = margin;
          }

          doc.text(item.order.toString(), margin + 5, yPos);
          doc.text(item.area, margin + 15, yPos);
          
          // Handle long descriptions
          const maxDescWidth = pageWidth - margin - 65;
          const splitDesc = doc.splitTextToSize(item.description, maxDescWidth);
          doc.text(splitDesc, margin + 60, yPos);
          yPos += splitDesc.length * 4 + 2;
        });

        yPos += 10;
      });

      // Dependencies page
      doc.addPage();
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Key Dependencies Summary", margin, yPos);
      yPos += 15;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Module", margin, yPos);
      doc.text("Depends On", margin + 50, yPos);
      yPos += 5;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      dependencies.forEach((dep) => {
        doc.text(dep.module, margin, yPos);
        doc.text(dep.dependsOn, margin + 50, yPos);
        yPos += 6;
      });

      doc.save("HRplus_Cerebra_Implementation_Handbook.pdf");
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const currentPhase = phases.find((p) => p.id === activePhase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Implementation Handbook</h1>
          <p className="text-muted-foreground">
            Step-by-step guide for configuring HRplus Cerebra
          </p>
        </div>
        <Button onClick={exportToPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" ref={contentRef}>
        {/* Phase Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Implementation Phases</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 p-4 pt-0">
                {phases.map((phase, index) => {
                  const Icon = phase.icon;
                  return (
                    <button
                      key={phase.id}
                      onClick={() => setActivePhase(phase.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        activePhase === phase.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        activePhase === phase.id 
                          ? "bg-primary-foreground/20" 
                          : "bg-muted"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Phase {index + 1}</p>
                        <p className={`text-xs truncate ${
                          activePhase === phase.id 
                            ? "text-primary-foreground/80" 
                            : "text-muted-foreground"
                        }`}>
                          {phase.title.replace(`Phase ${index + 1}: `, "")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Phase Details */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-3">
              {currentPhase && <currentPhase.icon className="h-6 w-6 text-primary" />}
              <div>
                <CardTitle>{currentPhase?.title}</CardTitle>
                <CardDescription>{currentPhase?.description}</CardDescription>
              </div>
            </div>
            {currentPhase?.prerequisite && (
              <Badge variant="outline" className="w-fit mt-2">
                Prerequisite: {currentPhase.prerequisite}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {currentPhase?.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {item.order}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.area}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dependencies Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Key Dependencies Summary
          </CardTitle>
          <CardDescription>
            Understanding which modules depend on others helps plan implementation order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dependencies.map((dep, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <Badge variant="secondary">{dep.module}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{dep.dependsOn}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
