import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PrintableGuide } from "@/components/enablement/PrintableGuide";
import { AllStagesChecklist } from "@/components/enablement/StageChecklist";
import {
  ArrowLeft,
  BookOpen,
  Workflow,
  Target,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  FileText,
  Video,
  Package,
  Sparkles,
  Calendar,
  BarChart3,
  Clock,
  Rocket,
  Printer,
} from "lucide-react";

export default function EnablementGuidePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "User Guide" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Enablement Hub User Guide
              </h1>
              <p className="text-muted-foreground mt-1">
                Best practices for content generation aligned with industry standards
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Guide
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          {/* Table of Contents */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-1">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "workflow", label: "Recommended Workflow" },
                      { id: "content-types", label: "Content Types" },
                      { id: "ai-tools", label: "AI Automation Tools" },
                      { id: "release-process", label: "Release Process" },
                      { id: "best-practices", label: "Best Practices" },
                      { id: "metrics", label: "Success Metrics" },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block px-3 py-2 rounded-md hover:bg-muted text-sm"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Stage Checklists - Interactive checklist panel */}
            <AllStagesChecklist onNavigate={(path) => navigate(path)} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <Card id="overview">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  The Enablement Hub is HRplus Cerebra's central platform for creating, managing, and
                  distributing training content and documentation. Following <strong>industry-proven
                  methodology</strong>, we implement a release-driven content strategy that
                  ensures all stakeholders receive timely, accurate enablement materials.
                </p>

                <div className="grid grid-cols-2 gap-4 not-prose mt-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-semibold text-blue-600 mb-2">Industry Alignment</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Release-based content planning</li>
                      <li>• Role-based learning paths</li>
                      <li>• Multi-format content delivery</li>
                      <li>• Continuous improvement cycle</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="font-semibold text-green-600 mb-2">Key Capabilities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• AI-powered content generation</li>
                      <li>• SCORM-Lite LMS packages</li>
                      <li>• Articulate Rise integration</li>
                      <li>• DAP in-app guidance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Workflow */}
            <Card id="workflow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-primary" />
                  Recommended Workflow
                </CardTitle>
                <CardDescription>
                  Industry-aligned content development lifecycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      phase: "1. Planning",
                      icon: Calendar,
                      color: "bg-blue-500",
                      steps: [
                        "Create a new release version for the upcoming product update",
                        "Run AI Content Gap Analysis to identify documentation needs",
                        "Use Compliance Impact Detector for regulatory changes",
                        "Prioritize content items in the Workflow Board (Backlog column)",
                      ],
                    },
                    {
                      phase: "2. Development",
                      icon: FileText,
                      color: "bg-amber-500",
                      steps: [
                        "Move items to 'In Progress' as work begins",
                        "Use Documentation Generator for initial drafts",
                        "Generate contextual help (tooltips, walkthroughs)",
                        "Create voice-over scripts for video content",
                        "Use Content Effectiveness Scorer to validate quality",
                      ],
                    },
                    {
                      phase: "3. Review",
                      icon: Users,
                      color: "bg-purple-500",
                      steps: [
                        "Move completed items to 'Review' column",
                        "Subject matter experts validate accuracy",
                        "Run effectiveness scoring on final content",
                        "Address AI-suggested improvements",
                      ],
                    },
                    {
                      phase: "4. Publication",
                      icon: Rocket,
                      color: "bg-green-500",
                      steps: [
                        "Move approved items to 'Published'",
                        "Generate SCORM packages for LMS",
                        "Link videos from Trupeer/Guidde",
                        "Configure DAP guides in UserGuiding",
                        "Generate release notes automatically",
                      ],
                    },
                    {
                      phase: "5. Maintenance",
                      icon: BarChart3,
                      color: "bg-cyan-500",
                      steps: [
                        "Monitor content analytics",
                        "Run Change Detection after product updates",
                        "Generate FAQs from support tickets",
                        "Update learning paths based on feedback",
                      ],
                    },
                  ].map((phase, idx) => {
                    const Icon = phase.icon;
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full ${phase.color} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {idx < 4 && <div className="w-0.5 h-full bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-6">
                          <h4 className="font-semibold mb-2">{phase.phase}</h4>
                          <ul className="space-y-1.5 text-sm text-muted-foreground">
                            {phase.steps.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content Types */}
            <Card id="content-types">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Content Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      type: "Documentation",
                      icon: FileText,
                      description: "Step-by-step guides and reference materials",
                      formats: ["Markdown", "PDF", "HTML"],
                      use: "Feature documentation, SOPs, user guides",
                    },
                    {
                      type: "SCORM-Lite Packages",
                      icon: Package,
                      description: "Lightweight LMS-compatible training modules",
                      formats: ["SCORM 1.2", "SCORM 2004"],
                      use: "Self-paced learning, compliance training",
                    },
                    {
                      type: "Articulate Rise Courses",
                      icon: BookOpen,
                      description: "Interactive, mobile-responsive courses",
                      formats: ["Rise 360 export"],
                      use: "Comprehensive training programs",
                    },
                    {
                      type: "Video Content",
                      icon: Video,
                      description: "Screen recordings and tutorial videos",
                      formats: ["Trupeer", "Guidde", "YouTube"],
                      use: "Visual demonstrations, quick how-tos",
                    },
                    {
                      type: "DAP Guides",
                      icon: Sparkles,
                      description: "In-app walkthroughs and tooltips",
                      formats: ["UserGuiding"],
                      use: "Contextual help, onboarding flows",
                    },
                    {
                      type: "Release Notes",
                      icon: Rocket,
                      description: "Automated change documentation",
                      formats: ["Markdown", "HTML"],
                      use: "Version updates, feature announcements",
                    },
                  ].map((content, idx) => {
                    const Icon = content.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{content.type}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {content.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {content.formats.map((format) => (
                                <Badge key={format} variant="secondary" className="text-xs">
                                  {format}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              <strong>Best for:</strong> {content.use}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Tools */}
            <Card id="ai-tools">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Automation Tools
                </CardTitle>
                <CardDescription>
                  Leverage AI to accelerate content creation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Enablement Hub includes 12 AI-powered tools to automate various aspects of
                  content development. Access them from the{" "}
                  <strong>AI Automation Tools</strong> page.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: "Generate All Feature Docs", desc: "Bulk generate documentation" },
                    { name: "Application Change Report", desc: "Track UI & backend changes" },
                    { name: "Content Gap Analysis", desc: "Identify missing documentation" },
                    { name: "Change Detection", desc: "Track features needing updates" },
                    { name: "Contextual Help Generator", desc: "Create tooltips & walkthroughs" },
                    { name: "FAQ Generator", desc: "Convert tickets to FAQs" },
                    { name: "Learning Path Optimizer", desc: "Personalized training paths" },
                    { name: "Voice-Over Script Generator", desc: "Video narration scripts" },
                    { name: "Content Effectiveness Scorer", desc: "Quality analysis" },
                    { name: "Compliance Impact Detector", desc: "Regulatory change alerts" },
                    { name: "Cross-Module Integration", desc: "Suggest module integrations" },
                    { name: "Guide Sync Checker", desc: "Auto-update guide on changes" },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={() => navigate("/enablement/ai-tools")} className="mt-4">
                  Open AI Tools
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Release Process */}
            <Card id="release-process">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Release Process
                </CardTitle>
                <CardDescription>Following industry release-driven approach</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <h4>Release Lifecycle</h4>
                <ol>
                  <li>
                    <strong>Planning</strong> - Create release, identify scope, assign content owners
                  </li>
                  <li>
                    <strong>Preview</strong> - Content available for internal review and testing
                  </li>
                  <li>
                    <strong>Released</strong> - Content published to production
                  </li>
                  <li>
                    <strong>Archived</strong> - Historical reference, superseded by newer versions
                  </li>
                </ol>

                <div className="not-prose mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-600">Pro Tip</h4>
                      <p className="text-sm mt-1">
                        Use the Release Manager to track content status across releases. The
                        dashboard shows progress for each release with clear visibility into
                        what's pending, in progress, and published.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card id="best-practices">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Start with Gap Analysis",
                      description:
                        "Before each release, run the Content Gap Analysis to prioritize what needs documentation first.",
                      type: "do",
                    },
                    {
                      title: "Use AI as a Starting Point",
                      description:
                        "AI-generated content should be reviewed and refined by subject matter experts.",
                      type: "do",
                    },
                    {
                      title: "Match Content to Audience",
                      description:
                        "Use DAP guides for in-app help, SCORM for formal training, and documentation for reference.",
                      type: "do",
                    },
                    {
                      title: "Track Coverage Metrics",
                      description:
                        "Monitor the Coverage Matrix to ensure all features have adequate enablement materials.",
                      type: "do",
                    },
                    {
                      title: "Don't Skip Review",
                      description:
                        "Always move content through the review workflow before publishing.",
                      type: "dont",
                    },
                    {
                      title: "Don't Forget Updates",
                      description:
                        "Run Change Detection regularly to identify documentation that needs updating.",
                      type: "dont",
                    },
                  ].map((practice, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 p-4 rounded-lg border ${
                        practice.type === "do"
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      }`}
                    >
                      {practice.type === "do" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-semibold">{practice.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {practice.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card id="metrics">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      metric: "Coverage %",
                      target: "> 90%",
                      description: "Features with documentation",
                    },
                    {
                      metric: "Time to Publish",
                      target: "< 5 days",
                      description: "From backlog to published",
                    },
                    {
                      metric: "Content Score",
                      target: "> 80",
                      description: "AI quality score average",
                    },
                    {
                      metric: "Update Lag",
                      target: "< 7 days",
                      description: "Time to update after changes",
                    },
                  ].map((item) => (
                    <div
                      key={item.metric}
                      className="p-4 rounded-lg border bg-card text-center"
                    >
                      <p className="text-sm text-muted-foreground">{item.metric}</p>
                      <p className="text-2xl font-bold text-primary mt-1">{item.target}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                  <div className="flex gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <h4 className="font-semibold">Tracking Progress</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use the Analytics Dashboard to monitor these metrics across releases.
                        Set up alerts for metrics falling below targets to maintain content
                        quality.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Printable Version (hidden on screen, shown on print) */}
        <div className="hidden print:block">
          <PrintableGuide ref={printRef} />
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
