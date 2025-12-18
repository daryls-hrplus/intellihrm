import { forwardRef } from "react";
import {
  BookOpen,
  Workflow,
  Target,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Video,
  Package,
  Sparkles,
  Calendar,
  BarChart3,
  Clock,
  Rocket,
} from "lucide-react";

interface GuideUpdate {
  date: string;
  version: string;
  changes: string[];
}

interface PrintableGuideProps {
  updates?: GuideUpdate[];
}

export const PrintableGuide = forwardRef<HTMLDivElement, PrintableGuideProps>(
  ({ updates = [] }, ref) => {
    return (
      <div ref={ref} className="print-guide bg-white text-black">
        {/* Cover Page */}
        <div className="page cover-page flex flex-col items-center justify-center min-h-[100vh] text-center p-16">
          <div className="mb-8">
            <img
              src="/hrplus-logo.png"
              alt="HRplus Cerebra"
              className="h-24 mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Enablement Hub
          </h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-8">
            User Guide
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Best Practices for Content Generation
          </p>
          <p className="text-lg text-gray-500">
            Industry-Aligned Methodology
          </p>
          <div className="mt-16 text-sm text-gray-400">
            <p>HRplus Cerebra</p>
            <p>Version {new Date().getFullYear()}.1</p>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="page toc-page p-12 min-h-[100vh]">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
            Table of Contents
          </h2>
          <div className="space-y-3 text-lg">
            {[
              { num: "1", title: "Overview", page: "3" },
              { num: "2", title: "Recommended Workflow", page: "4" },
              { num: "3", title: "Content Types", page: "6" },
              { num: "4", title: "AI Automation Tools", page: "8" },
              { num: "5", title: "Release Process", page: "10" },
              { num: "6", title: "Best Practices", page: "11" },
              { num: "7", title: "Success Metrics", page: "12" },
              { num: "8", title: "Change Log", page: "13" },
            ].map((item) => (
              <div key={item.num} className="flex items-center">
                <span className="font-semibold w-8">{item.num}.</span>
                <span className="flex-1">{item.title}</span>
                <span className="text-gray-500 border-b border-dotted border-gray-300 flex-1 mx-4" />
                <span className="text-gray-600">{item.page}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">1. Overview</h2>
          </div>
          
          <p className="text-lg mb-6 leading-relaxed">
            The Enablement Hub is HRplus Cerebra's central platform for creating, managing, and
            distributing training content and documentation. Following industry-proven
            methodology, we implement a release-driven content strategy that
            ensures all stakeholders receive timely, accurate enablement materials.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 text-lg">Industry Alignment</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Release-based content planning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Role-based learning paths
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Multi-format content delivery
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Continuous improvement cycle
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 text-lg">Key Capabilities</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  AI-powered content generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  SCORM-Lite LMS packages
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Articulate Rise integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  DAP in-app guidance
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <Workflow className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">2. Recommended Workflow</h2>
          </div>
          <p className="text-gray-600 mb-8">Industry-aligned content development lifecycle</p>

          <div className="space-y-6">
            {[
              {
                phase: "1. Planning",
                color: "bg-blue-600",
                steps: [
                  "Create a new release version for the upcoming product update",
                  "Run AI Content Gap Analysis to identify documentation needs",
                  "Use Compliance Impact Detector for regulatory changes",
                  "Prioritize content items in the Workflow Board",
                ],
              },
              {
                phase: "2. Development",
                color: "bg-amber-500",
                steps: [
                  "Move items to 'In Progress' as work begins",
                  "Use Documentation Generator for initial drafts",
                  "Generate contextual help (tooltips, walkthroughs)",
                  "Create voice-over scripts for video content",
                ],
              },
              {
                phase: "3. Review",
                color: "bg-purple-600",
                steps: [
                  "Move completed items to 'Review' column",
                  "Subject matter experts validate accuracy",
                  "Run effectiveness scoring on final content",
                  "Address AI-suggested improvements",
                ],
              },
              {
                phase: "4. Publication",
                color: "bg-green-600",
                steps: [
                  "Move approved items to 'Published'",
                  "Generate SCORM packages for LMS",
                  "Configure DAP guides in UserGuiding",
                  "Generate release notes automatically",
                ],
              },
              {
                phase: "5. Maintenance",
                color: "bg-cyan-600",
                steps: [
                  "Monitor content analytics",
                  "Run Change Detection after product updates",
                  "Generate FAQs from support tickets",
                  "Update learning paths based on feedback",
                ],
              },
            ].map((phase, idx) => (
              <div key={idx} className="flex gap-4">
                <div className={`w-3 rounded-full ${phase.color}`} />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">{phase.phase}</h4>
                  <ul className="space-y-1 text-gray-700">
                    {phase.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Types Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">3. Content Types</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <div key={idx} className="p-4 rounded-lg border bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Icon className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">{content.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        <strong>Formats:</strong> {content.formats.join(", ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Best for:</strong> {content.use}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">4. AI Automation Tools</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Leverage AI to accelerate content creation with these powerful tools.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Generate All Feature Docs", desc: "Bulk generate documentation for all features in a module" },
              { name: "Application Change Report", desc: "Track UI & backend changes with dates for release notes" },
              { name: "Content Gap Analysis", desc: "Identify missing documentation across features" },
              { name: "Change Detection", desc: "Track features needing documentation updates" },
              { name: "Contextual Help Generator", desc: "Create tooltips, walkthroughs & help text" },
              { name: "FAQ Generator", desc: "Convert support tickets into FAQ entries" },
              { name: "Learning Path Optimizer", desc: "Create personalized training paths by role" },
              { name: "Voice-Over Script Generator", desc: "Generate video narration scripts" },
              { name: "Content Effectiveness Scorer", desc: "Analyze documentation quality" },
              { name: "Compliance Impact Detector", desc: "Flag regulatory change impacts" },
              { name: "Cross-Module Integration Analyzer", desc: "Suggest module integrations" },
              { name: "Guide Sync Checker", desc: "Auto-update guide when features change" },
            ].map((tool) => (
              <div key={tool.name} className="flex items-start gap-2 p-3 rounded bg-gray-50 border">
                <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{tool.name}</p>
                  <p className="text-xs text-gray-600">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">6. Best Practices</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Start with Gap Analysis",
                description: "Before each release, run the Content Gap Analysis to prioritize what needs documentation first.",
                type: "do",
              },
              {
                title: "Use AI as a Starting Point",
                description: "AI-generated content should be reviewed and refined by subject matter experts.",
                type: "do",
              },
              {
                title: "Match Content to Audience",
                description: "Use DAP guides for in-app help, SCORM for formal training, and documentation for reference.",
                type: "do",
              },
              {
                title: "Track Coverage Metrics",
                description: "Monitor the Coverage Matrix to ensure all features have adequate enablement materials.",
                type: "do",
              },
              {
                title: "Don't Skip Review",
                description: "Always move content through the review workflow before publishing.",
                type: "dont",
              },
              {
                title: "Don't Forget Updates",
                description: "Run Change Detection regularly to identify documentation that needs updating.",
                type: "dont",
              },
            ].map((practice, idx) => (
              <div
                key={idx}
                className={`flex gap-3 p-4 rounded-lg border ${
                  practice.type === "do"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                {practice.type === "do" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold">{practice.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">7. Success Metrics</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { metric: "Coverage %", target: "> 90%", desc: "Features with documentation" },
              { metric: "Time to Publish", target: "< 5 days", desc: "From backlog to published" },
              { metric: "Content Score", target: "> 80", desc: "AI quality score average" },
              { metric: "Update Lag", target: "< 7 days", desc: "Time to update after changes" },
            ].map((item) => (
              <div key={item.metric} className="p-6 rounded-lg border text-center bg-gray-50">
                <p className="text-4xl font-bold text-blue-600">{item.target}</p>
                <p className="font-semibold text-lg mt-2">{item.metric}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Change Log Section */}
        <div className="page content-page p-12 min-h-[100vh]">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">8. Change Log</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Track updates made to this guide and the Enablement Hub features.
          </p>

          <div className="space-y-4">
            {updates.length > 0 ? (
              updates.map((update, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-600">{update.version}</span>
                    <span className="text-sm text-gray-500">{update.date}</span>
                  </div>
                  <ul className="space-y-1">
                    {update.changes.map((change, cIdx) => (
                      <li key={cIdx} className="text-sm flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-600">v1.0.0</span>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <ul className="space-y-1">
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    Initial release of Enablement Hub User Guide
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    Added 12 AI automation tools documentation
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    Industry-aligned workflow methodology
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer for each page */}
        <style>{`
          @media print {
            .print-guide {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page {
              page-break-after: always;
              page-break-inside: avoid;
            }
            .cover-page {
              page-break-before: avoid;
            }
            @page {
              margin: 0.5in;
              size: letter;
              @bottom-center {
                content: counter(page);
              }
            }
          }
        `}</style>
      </div>
    );
  }
);

PrintableGuide.displayName = "PrintableGuide";
