import { DocumentTemplate } from "./DocumentTemplateConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  ListChecks, 
  Lightbulb, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  CheckCircle,
  Info,
  Image,
  ChevronRight,
  Clock,
  Users,
  Target
} from "lucide-react";

interface TemplateLivePreviewProps {
  template: DocumentTemplate;
}

export function TemplateLivePreview({ template }: TemplateLivePreviewProps) {
  const { layout, sections, formatting, branding } = template;

  // Render callout based on style
  const renderCallout = (type: 'tip' | 'warning' | 'info', content: string) => {
    const styles = {
      confluence: {
        tip: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200",
        warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200"
      },
      github: {
        tip: "border-l-4 border-l-emerald-500 bg-muted/50 pl-4",
        warning: "border-l-4 border-l-amber-500 bg-muted/50 pl-4",
        info: "border-l-4 border-l-blue-500 bg-muted/50 pl-4"
      },
      minimal: {
        tip: "border border-border rounded bg-muted/30",
        warning: "border border-border rounded bg-muted/30",
        info: "border border-border rounded bg-muted/30"
      }
    };

    const icons = {
      tip: <Lightbulb className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    };

    const style = formatting.calloutStyle as keyof typeof styles;
    
    return (
      <div className={`p-3 rounded-md text-xs ${styles[style]?.[type] || styles.minimal[type]}`}>
        <div className="flex items-center gap-2 font-medium mb-1">
          {icons[type]}
          <span className="capitalize">{type}</span>
        </div>
        <p className="opacity-80">{content}</p>
      </div>
    );
  };

  // Render header based on style
  const renderHeader = (level: number, text: string, number?: string) => {
    const sizes = ['text-base font-bold', 'text-sm font-semibold', 'text-xs font-medium'];
    const size = sizes[level - 1] || sizes[2];
    
    if (formatting.headerStyle === 'numbered' && number) {
      return <h4 className={`${size} text-foreground`}>{number} {text}</h4>;
    } else if (formatting.headerStyle === 'icon') {
      return (
        <h4 className={`${size} text-foreground flex items-center gap-2`}>
          <ChevronRight className="h-3 w-3" style={{ color: branding.primaryColor }} />
          {text}
        </h4>
      );
    }
    return <h4 className={`${size} text-foreground`}>{text}</h4>;
  };

  // Render screenshot based on placement style
  const renderScreenshot = () => {
    if (formatting.screenshotPlacement === 'annotated') {
      return (
        <div className="relative">
          <div className="aspect-video bg-muted rounded border flex items-center justify-center">
            <Image className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="absolute top-2 left-2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ backgroundColor: branding.primaryColor }}>1</div>
          <div className="absolute top-8 right-4 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ backgroundColor: branding.primaryColor }}>2</div>
        </div>
      );
    }
    return (
      <div className="aspect-video bg-muted rounded border flex items-center justify-center">
        <Image className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Document Header */}
      <div 
        className="p-4 border-b"
        style={{ backgroundColor: branding.primaryColor + '10' }}
      >
        <div className="flex items-center gap-3">
          {branding.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          )}
          <div>
            <h3 className="font-bold text-sm" style={{ color: branding.primaryColor }}>
              {branding.companyName || 'Your Company'}
            </h3>
            <p className="text-[10px] text-muted-foreground">Document Title</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4 text-xs">
          {/* Learning Objectives */}
          {layout.includeLearningObjectives && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" style={{ color: branding.primaryColor }} />
                Learning Objectives
              </h4>
              <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                <li>Understand the core functionality</li>
                <li>Complete basic workflows</li>
              </ul>
            </div>
          )}

          {/* Table of Contents */}
          {layout.includeTableOfContents && (
            <div className="p-3 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <ListChecks className="h-4 w-4" style={{ color: branding.primaryColor }} />
                Table of Contents
              </h4>
              <div className="space-y-1 text-muted-foreground">
                {sections.introduction && <p className="hover:text-foreground cursor-pointer">1. Introduction</p>}
                {sections.overview && <p className="hover:text-foreground cursor-pointer">2. Overview</p>}
                {sections.prerequisites && <p className="hover:text-foreground cursor-pointer">3. Prerequisites</p>}
                {sections.stepByStep && <p className="hover:text-foreground cursor-pointer">4. Step-by-Step Guide</p>}
                {sections.bestPractices && <p className="hover:text-foreground cursor-pointer">5. Best Practices</p>}
                {sections.troubleshooting && <p className="hover:text-foreground cursor-pointer">6. Troubleshooting</p>}
                {sections.faqs && <p className="hover:text-foreground cursor-pointer">7. FAQ</p>}
              </div>
            </div>
          )}

          {/* Introduction Section */}
          {sections.introduction && (
            <div className="space-y-2">
              {renderHeader(1, 'Introduction', '1.')}
              <p className="text-muted-foreground leading-relaxed">
                Welcome to this guide. This document will help you understand and use the system effectively...
              </p>
            </div>
          )}

          {/* Overview Section */}
          {sections.overview && (
            <div className="space-y-2">
              {renderHeader(1, 'Overview', '2.')}
              <p className="text-muted-foreground leading-relaxed">
                This section provides a high-level summary of the topic and key concepts...
              </p>
            </div>
          )}

          {/* Prerequisites Section */}
          {sections.prerequisites && (
            <div className="space-y-2">
              {renderHeader(1, 'Prerequisites', '3.')}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>Access to the system</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>Basic training completed</span>
                </div>
              </div>
            </div>
          )}

          {/* Step by Step Section */}
          {sections.stepByStep && (
            <div className="space-y-3">
              {renderHeader(1, 'Step-by-Step Guide', '4.')}
              
              {formatting.screenshotPlacement === 'sidebar' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {renderHeader(2, 'Navigate to Module', '4.1')}
                    {layout.includeTimeEstimates && (
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                        <Clock className="h-3 w-3" /> ~2 min
                      </div>
                    )}
                    {layout.includeRoleIndicators && (
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                        <Users className="h-3 w-3" /> Admin, HR Manager
                      </div>
                    )}
                    <p className="text-muted-foreground">Click on the module icon in the navigation panel...</p>
                    {renderCallout('tip', 'Use keyboard shortcuts for faster navigation')}
                  </div>
                  {layout.includeScreenshots && (
                    <div>
                      {renderScreenshot()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {renderHeader(2, 'Navigate to Module', '4.1')}
                  {layout.includeTimeEstimates && (
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <Clock className="h-3 w-3" /> ~2 min
                    </div>
                  )}
                  {layout.includeRoleIndicators && (
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <Users className="h-3 w-3" /> Admin, HR Manager
                    </div>
                  )}
                  <p className="text-muted-foreground">Click on the module icon in the navigation panel...</p>
                  {layout.includeScreenshots && renderScreenshot()}
                  {renderCallout('tip', 'Use keyboard shortcuts for faster navigation')}
                </div>
              )}
            </div>
          )}

          {/* Best Practices */}
          {sections.bestPractices && (
            <div className="space-y-2">
              {renderHeader(1, 'Best Practices', '5.')}
              {renderCallout('info', 'Following these guidelines ensures consistent results across your organization.')}
            </div>
          )}

          {/* Troubleshooting */}
          {sections.troubleshooting && (
            <div className="space-y-2">
              {renderHeader(1, 'Troubleshooting', '6.')}
              {renderCallout('warning', 'If you encounter an error, try clearing your browser cache and refreshing.')}
            </div>
          )}

          {/* FAQ */}
          {sections.faqs && (
            <div className="space-y-2">
              {renderHeader(1, 'Frequently Asked Questions', '7.')}
              <div className="space-y-2">
                <div className="p-2 bg-muted/30 rounded">
                  <p className="font-medium flex items-center gap-2">
                    <HelpCircle className="h-3 w-3" style={{ color: branding.primaryColor }} />
                    How do I reset my password?
                  </p>
                  <p className="text-muted-foreground mt-1 ml-5">Click on the "Forgot Password" link...</p>
                </div>
              </div>
            </div>
          )}

          {/* Glossary */}
          {sections.glossary && (
            <div className="p-3 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" style={{ color: branding.primaryColor }} />
                Glossary
              </h4>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Term:</strong> Definition of the term...</p>
              </div>
            </div>
          )}

          {/* Appendix */}
          {sections.appendix && (
            <div className="p-3 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" style={{ color: branding.primaryColor }} />
                Appendix
              </h4>
              <p className="text-muted-foreground">Additional reference materials...</p>
            </div>
          )}

          {/* Related Docs */}
          {layout.includeRelatedDocs && (
            <div className="space-y-2">
              {renderHeader(1, 'Related Documents', '8.')}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer">User Guide</span>
                <span className="px-2 py-1 bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer">Admin Manual</span>
              </div>
            </div>
          )}

          {/* Version History */}
          {layout.includeVersionInfo && (
            <div className="p-3 bg-muted/30 rounded-lg border mt-4">
              <h4 className="font-semibold text-sm mb-2">Version History</h4>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1">Version</th>
                    <th className="text-left py-1">Date</th>
                    <th className="text-left py-1">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">1.0</td>
                    <td className="py-1">Dec 2024</td>
                    <td className="py-1 text-muted-foreground">Initial release</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Document Footer */}
      <div 
        className="p-2 border-t text-center text-[10px] text-muted-foreground"
        style={{ backgroundColor: branding.primaryColor + '05' }}
      >
        {branding.companyName || 'Your Company'} • Confidential
      </div>
    </div>
  );
}
