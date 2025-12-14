import { useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, Calendar, DollarSign, Clock, Heart, GraduationCap, Target, TrendingUp, Briefcase, Shield, UserCheck, Package } from "lucide-react";
import jsPDF from "jspdf";

const ModulesBrochurePage = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const modules = [
    {
      icon: Users,
      title: "Workforce Management",
      color: "bg-blue-500",
      features: [
        "Employee Profiles with 16+ data tabs",
        "Organizational Structure (Companies, Divisions, Departments, Sections)",
        "Job Families, Jobs, Positions & Competencies",
        "Employee Transactions (Hire, Promotion, Transfer, Termination)",
        "Onboarding & Offboarding Workflows",
        "Workforce Forecasting & Scenario Planning",
        "Monte Carlo Simulations & Sensitivity Analysis",
        "Interactive Organization Charts with date filtering"
      ]
    },
    {
      icon: Calendar,
      title: "Leave Management",
      color: "bg-green-500",
      features: [
        "Configurable Leave Types (Vacation, Sick, Personal, Custom)",
        "Accrual Rules by tenure, grade, and status",
        "Rollover Policies with limits and caps",
        "Leave Balance Recalculation Engine",
        "Holiday Management (Country & Company level)",
        "Compensatory Time Off Tracking",
        "Leave Analytics with trends and forecasting",
        "Workflow-based Request Approval"
      ]
    },
    {
      icon: DollarSign,
      title: "Compensation & Payroll",
      color: "bg-yellow-500",
      features: [
        "Pay Elements (Base, Allowances, Deductions)",
        "Salary Grades with min/mid/max ranges",
        "Position-based Compensation",
        "Pay Groups by frequency (Weekly, Biweekly, Monthly)",
        "Payroll Processing (In-house, Third-party, Hybrid)",
        "Tax Configuration & Calculations",
        "Bank File Generation (Multiple formats)",
        "Year-end Processing & Reporting"
      ]
    },
    {
      icon: Clock,
      title: "Time & Attendance",
      color: "bg-orange-500",
      features: [
        "Time Clock with Geofencing",
        "Face Capture Identification",
        "Project Time Tracking (Client > Project > Task)",
        "Timesheet Management with Workflows",
        "Attendance Policies & Exception Handling",
        "Overtime Calculations",
        "Work Schedules & Shift Management",
        "Real-time Attendance Monitoring"
      ]
    },
    {
      icon: Heart,
      title: "Benefits Administration",
      color: "bg-red-500",
      features: [
        "Health, Retirement, Life & Disability Plans",
        "Open Enrollment & Auto-Enrollment",
        "Benefit Providers Management",
        "Dependent Coverage Tracking",
        "Life Events Processing",
        "Claims Management",
        "Eligibility Audits",
        "Waiting Period Tracking"
      ]
    },
    {
      icon: GraduationCap,
      title: "Training & LMS",
      color: "bg-purple-500",
      features: [
        "Course Catalog & Categories",
        "Module & Lesson Management",
        "Quizzes & Assessments with scoring",
        "Training Requests with Approval",
        "Progress Tracking & Certificates",
        "Training Calendar",
        "Compliance Training Tracking",
        "ESS/MSS Training Portals"
      ]
    },
    {
      icon: Target,
      title: "Performance Management",
      color: "bg-indigo-500",
      features: [
        "Goal Management (SMART & OKR)",
        "Appraisal Cycles with weighted criteria",
        "360-Degree Feedback (Anonymous)",
        "Performance Improvement Plans (PIPs)",
        "Continuous Feedback & Check-ins",
        "Recognition & Awards",
        "Performance Analytics Dashboard",
        "Goal Interviews & Scheduling"
      ]
    },
    {
      icon: TrendingUp,
      title: "Succession Planning",
      color: "bg-teal-500",
      features: [
        "Nine Box Grid Assessment",
        "Talent Pools Management",
        "Succession Plans with readiness levels",
        "Key Position Risk Assessment",
        "Career Paths & Development",
        "Individual Development Plans (IDPs)",
        "Mentorship Programs",
        "Flight Risk Tracking"
      ]
    },
    {
      icon: Briefcase,
      title: "Recruitment & ATS",
      color: "bg-cyan-500",
      features: [
        "Job Requisitions with auto-numbering",
        "Candidate Management",
        "Application Tracking",
        "Interview Scheduling",
        "Assessments & Scoring",
        "Offer Letter Generation",
        "Job Board API Integration",
        "Recruitment Analytics"
      ]
    },
    {
      icon: Shield,
      title: "Health & Safety (HSE)",
      color: "bg-amber-500",
      features: [
        "Incident Management & Investigation",
        "Risk Assessments & Mitigation",
        "Safety Training & Compliance",
        "PPE Management",
        "Workplace Inspections",
        "Permit to Work & LOTO",
        "Near-Miss & Safety Observations",
        "OSHA/Regulatory Reporting",
        "Workers' Compensation",
        "SDS/Chemical Management",
        "Emergency Response Plans",
        "Toolbox Talks & First Aid"
      ]
    },
    {
      icon: UserCheck,
      title: "Employee Relations",
      color: "bg-pink-500",
      features: [
        "Case Management & Tracking",
        "Disciplinary Actions",
        "Recognition Programs",
        "Exit Interviews",
        "Employee Surveys",
        "Wellness Programs",
        "Union Management",
        "Grievance Procedures",
        "Collective Agreements",
        "Industrial Court Judgements"
      ]
    },
    {
      icon: Package,
      title: "Company Property",
      color: "bg-slate-500",
      features: [
        "Property Categories",
        "Asset Inventory Management",
        "Assignment Tracking",
        "Property Requests with Approval",
        "Maintenance Scheduling",
        "Asset Distribution Analytics"
      ]
    }
  ];

  const exportToPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Title Page
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.setFont("helvetica", "bold");
    pdf.text("HRplus Cerebra", pageWidth / 2, pageHeight / 2 - 20, { align: "center" });
    
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "normal");
    pdf.text("Complete Module Guide", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });
    
    pdf.setFontSize(14);
    pdf.text("12 Integrated Modules | 100+ Features", pageWidth / 2, pageHeight / 2 + 25, { align: "center" });

    // Module Pages
    modules.forEach((module, moduleIndex) => {
      pdf.addPage();
      yPos = margin;

      // Module Header
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 35, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text(module.title, pageWidth / 2, 22, { align: "center" });

      yPos = 50;

      // Features
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Features & Capabilities", margin, yPos);
      yPos += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      module.features.forEach((feature) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = margin;
        }
        
        pdf.setTextColor(99, 102, 241);
        pdf.text("•", margin, yPos);
        pdf.setTextColor(60, 60, 60);
        pdf.text(feature, margin + 8, yPos);
        yPos += 8;
      });

      // Module number indicator
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text(`Module ${moduleIndex + 1} of ${modules.length}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    });

    // Summary Page
    pdf.addPage();
    yPos = margin;

    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, pageWidth, 35, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("Platform Summary", pageWidth / 2, 22, { align: "center" });

    yPos = 50;

    const summaryItems = [
      { label: "Core Modules", value: "12" },
      { label: "Total Features", value: "100+" },
      { label: "Languages Supported", value: "4 (EN, ES, FR, AR)" },
      { label: "Multi-Currency", value: "Yes" },
      { label: "Multi-Company", value: "Yes" },
      { label: "AI-Powered", value: "Yes" },
      { label: "Workflow Engine", value: "Yes" },
      { label: "Mobile Responsive", value: "Yes" }
    ];

    pdf.setFontSize(12);
    summaryItems.forEach((item) => {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text(item.label + ":", margin, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(99, 102, 241);
      pdf.text(item.value, margin + 60, yPos);
      yPos += 10;
    });

    yPos += 10;

    // Additional Capabilities
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(14);
    pdf.text("Additional Capabilities", margin, yPos);
    yPos += 10;

    const additionalCaps = [
      "Employee Self-Service (ESS) Portal",
      "Manager Self-Service (MSS) Portal",
      "HR Hub Command Center",
      "BI Dashboards & Report Writer",
      "Knowledge Base & Help Center",
      "Document & Policy Management",
      "Configurable Workflows & Approvals",
      "Comprehensive Audit Logging",
      "GDPR & Compliance Features",
      "Real-time Notifications (In-app, Email)"
    ];

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    additionalCaps.forEach((cap) => {
      pdf.setTextColor(99, 102, 241);
      pdf.text("✓", margin, yPos);
      pdf.setTextColor(60, 60, 60);
      pdf.text(cap, margin + 8, yPos);
      yPos += 7;
    });

    // Footer
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text("www.hrpluscerebra.com | sales@hrpluscerebra.com", pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save("HRplus-Cerebra-Modules-Brochure.pdf");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin & Security", href: "/admin" },
            { label: "Modules Brochure" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Modules Brochure</h1>
            <p className="text-muted-foreground">Comprehensive guide to all HRplus Cerebra modules</p>
          </div>
          <Button onClick={exportToPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
        </div>

        <div ref={contentRef} className="space-y-6">
          {/* Hero */}
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Complete Module Guide</h2>
              <p className="text-lg opacity-90">12 Integrated Modules | 100+ Features</p>
            </CardContent>
          </Card>

          {/* Modules Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`${module.color} text-white`}>
                  <CardTitle className="flex items-center gap-3">
                    <module.icon className="h-6 w-6" />
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {module.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Capabilities */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Additional Platform Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Employee Self-Service (ESS) Portal",
                  "Manager Self-Service (MSS) Portal",
                  "HR Hub Command Center",
                  "BI Dashboards & Report Writer",
                  "Knowledge Base & Help Center",
                  "Document & Policy Management",
                  "Configurable Workflows & Approvals",
                  "Comprehensive Audit Logging",
                  "GDPR & Compliance Features",
                  "Real-time Notifications (In-app, Email)",
                  "AI-Powered Assistant",
                  "Multi-language Support"
                ].map((cap, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ModulesBrochurePage;
