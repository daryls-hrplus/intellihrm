import { useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, 
  Brain, 
  Shield, 
  Globe, 
  Users, 
  BarChart3, 
  Workflow, 
  MessageSquare,
  Clock,
  FileText,
  Zap,
  Lock,
  Cloud,
  Smartphone
} from "lucide-react";
import jsPDF from "jspdf";

const FeaturesBrochurePage = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const highlights = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Built-in AI assistant with guardrails, policy awareness, and SOP integration. Budget-controlled usage tiers ensure cost management.",
      color: "text-purple-600"
    },
    {
      icon: Globe,
      title: "Multi-Territory Operations",
      description: "Support for multiple companies, territories, currencies, and languages (English, Spanish, French, Arabic with RTL).",
      color: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Granular role-based permissions, PII protection, comprehensive audit logging, and GDPR compliance features.",
      color: "text-green-600"
    },
    {
      icon: Workflow,
      title: "Configurable Workflows",
      description: "Multi-step approval routing with delegation, escalation, auto-termination, and digital signatures.",
      color: "text-orange-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "BI dashboards, AI-powered report generation, workforce forecasting, and Monte Carlo simulations.",
      color: "text-indigo-600"
    },
    {
      icon: MessageSquare,
      title: "Unified Communications",
      description: "In-app messaging with 1:1, group chats, channels, video integration, and real-time notifications.",
      color: "text-pink-600"
    }
  ];

  const capabilities = [
    { icon: Clock, label: "Real-time Data Sync" },
    { icon: FileText, label: "Document Management" },
    { icon: Zap, label: "Automated Workflows" },
    { icon: Lock, label: "Data Encryption" },
    { icon: Cloud, label: "Cloud-Native" },
    { icon: Smartphone, label: "Mobile Responsive" }
  ];

  const modules = [
    "Workforce Management",
    "Leave Management", 
    "Compensation & Payroll",
    "Time & Attendance",
    "Benefits Administration",
    "Training & LMS",
    "Performance Management",
    "Succession Planning",
    "Recruitment & ATS",
    "Health & Safety (HSE)",
    "Employee Relations",
    "Company Property"
  ];

  const exportToPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Header with gradient effect (simulated with colored rectangles)
    pdf.setFillColor(99, 102, 241); // Indigo
    pdf.rect(0, 0, pageWidth, 50, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text("Intelli HRM", pageWidth / 2, 25, { align: "center" });
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text("Enterprise Human Resource Management System", pageWidth / 2, 35, { align: "center" });

    yPos = 65;

    // Tagline
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "italic");
    pdf.text("Empowering organizations with intelligent, scalable HR solutions", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Key Highlights Section
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Key Highlights", margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    highlights.forEach((highlight, index) => {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(99, 102, 241);
      pdf.text(`• ${highlight.title}`, margin, yPos);
      yPos += 5;
      
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      const lines = pdf.splitTextToSize(highlight.description, pageWidth - margin * 2 - 5);
      pdf.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 5;
    });

    yPos += 5;

    // Core Modules Section
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("12 Comprehensive Modules", margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const columnWidth = (pageWidth - margin * 2) / 2;
    modules.forEach((module, index) => {
      const xPos = index % 2 === 0 ? margin : margin + columnWidth;
      const adjustedY = yPos + Math.floor(index / 2) * 7;
      pdf.setTextColor(80, 80, 80);
      pdf.text(`✓ ${module}`, xPos, adjustedY);
    });
    yPos += Math.ceil(modules.length / 2) * 7 + 10;

    // Platform Capabilities
    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Platform Capabilities", margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const capColWidth = (pageWidth - margin * 2) / 3;
    capabilities.forEach((cap, index) => {
      const xPos = margin + (index % 3) * capColWidth;
      const adjustedY = yPos + Math.floor(index / 3) * 7;
      pdf.setTextColor(80, 80, 80);
      pdf.text(`• ${cap.label}`, xPos, adjustedY);
    });
    yPos += Math.ceil(capabilities.length / 3) * 7 + 15;

    // Why Choose Section
    pdf.setFillColor(245, 245, 250);
    pdf.rect(margin - 5, yPos - 5, pageWidth - margin * 2 + 10, 45, "F");
    
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Why Choose Intelli HRM?", margin, yPos + 5);
    yPos += 12;

    const benefits = [
      "✓ Reduce administrative overhead by up to 60%",
      "✓ Ensure compliance with built-in audit trails",
      "✓ Scale from 50 to 50,000+ employees seamlessly",
      "✓ Deploy in weeks, not months"
    ];

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    benefits.forEach((benefit) => {
      pdf.text(benefit, margin, yPos);
      yPos += 6;
    });

    // Footer
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text("www.intellihrm.net | sales@intellihrm.net", pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save("Intelli-HRM-Features-Brochure.pdf");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin & Security", href: "/admin" },
            { label: "Features Brochure" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Features Brochure</h1>
            <p className="text-muted-foreground">Marketing summary of Intelli HRM capabilities</p>
          </div>
          <Button onClick={exportToPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
        </div>

        <div ref={contentRef} className="space-y-8">
          {/* Hero Section */}
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-8 text-center">
              <h2 className="text-4xl font-bold mb-2">Intelli HRM</h2>
              <p className="text-xl opacity-90">Enterprise Human Resource Management System</p>
              <p className="mt-4 text-lg opacity-80 italic">
                Empowering organizations with intelligent, scalable HR solutions
              </p>
            </CardContent>
          </Card>

          {/* Key Highlights */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Key Highlights</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((highlight, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <highlight.icon className={`h-10 w-10 ${highlight.color} mb-3`} />
                    <h4 className="font-semibold text-lg mb-2">{highlight.title}</h4>
                    <p className="text-muted-foreground text-sm">{highlight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Modules Overview */}
          <div>
            <h3 className="text-2xl font-bold mb-4">12 Comprehensive Modules</h3>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {modules.map((module, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{module}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Platform Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {capabilities.map((cap, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <cap.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">{cap.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Section */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Why Choose Intelli HRM?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                  <p>Reduce administrative overhead by up to 60%</p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <p>Ensure compliance with built-in audit trails</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <p>Scale from 50 to 50,000+ employees seamlessly</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                  <p>Deploy in weeks, not months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default FeaturesBrochurePage;
