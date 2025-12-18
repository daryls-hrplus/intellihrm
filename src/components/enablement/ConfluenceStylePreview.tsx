import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Info,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Image,
  Clock,
  Users,
  BookOpen,
  ExternalLink,
  Copy,
  Printer,
  FileDown
} from "lucide-react";
import { DocumentTemplate } from "./DocumentTemplateConfig";

interface ScreenshotPlaceholder {
  id: string;
  description: string;
  annotations?: string[];
  step?: number;
}

interface DocumentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'steps' | 'callout' | 'screenshot' | 'table' | 'list' | 'code' | 'expandable';
  level?: number;
  content?: string;
  items?: any[];
  calloutType?: 'info' | 'warning' | 'success' | 'tip' | 'error';
  screenshot?: ScreenshotPlaceholder;
  expanded?: boolean;
}

interface GeneratedDocument {
  title: string;
  description?: string;
  summary?: string;
  version?: string;
  lastUpdated?: string;
  author?: string;
  targetRoles?: string[];
  estimatedDuration?: number;
  learningObjectives?: string[];
  prerequisites?: string[];
  sections: DocumentSection[];
  tableOfContents?: { id: string; title: string; level: number }[];
  relatedDocs?: { title: string; href: string }[];
  tags?: string[];
  faqs?: { question: string; answer: string }[];
  glossary?: { term: string; definition: string }[];
}

interface ConfluenceStylePreviewProps {
  document: GeneratedDocument | null;
  template: DocumentTemplate | null;
}

export function ConfluenceStylePreview({ document, template }: ConfluenceStylePreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [collapsedToc, setCollapsedToc] = useState(false);

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Generated document will appear here</p>
        </div>
      </div>
    );
  }

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedSections(next);
  };

  const renderCallout = (type: string, content: string) => {
    const calloutStyle = template?.formatting.calloutStyle || 'confluence';
    
    const styles = {
      info: {
        confluence: 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950/30',
        github: 'border-l-4 border-blue-500 bg-muted/50',
        minimal: 'border border-blue-200 rounded-md dark:border-blue-800',
      },
      warning: {
        confluence: 'bg-yellow-50 border-l-4 border-yellow-500 dark:bg-yellow-950/30',
        github: 'border-l-4 border-yellow-500 bg-muted/50',
        minimal: 'border border-yellow-200 rounded-md dark:border-yellow-800',
      },
      success: {
        confluence: 'bg-green-50 border-l-4 border-green-500 dark:bg-green-950/30',
        github: 'border-l-4 border-green-500 bg-muted/50',
        minimal: 'border border-green-200 rounded-md dark:border-green-800',
      },
      tip: {
        confluence: 'bg-purple-50 border-l-4 border-purple-500 dark:bg-purple-950/30',
        github: 'border-l-4 border-purple-500 bg-muted/50',
        minimal: 'border border-purple-200 rounded-md dark:border-purple-800',
      },
      error: {
        confluence: 'bg-red-50 border-l-4 border-red-500 dark:bg-red-950/30',
        github: 'border-l-4 border-red-500 bg-muted/50',
        minimal: 'border border-red-200 rounded-md dark:border-red-800',
      },
    };

    const icons = {
      info: <Info className="h-5 w-5 text-blue-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      tip: <Lightbulb className="h-5 w-5 text-purple-500" />,
      error: <AlertCircle className="h-5 w-5 text-red-500" />,
    };

    const labels = {
      info: 'Note',
      warning: 'Warning',
      success: 'Success',
      tip: 'Tip',
      error: 'Important',
    };

    return (
      <div className={`p-4 my-4 ${styles[type as keyof typeof styles]?.[calloutStyle] || styles.info.confluence}`}>
        <div className="flex items-start gap-3">
          {icons[type as keyof typeof icons] || icons.info}
          <div className="flex-1">
            <span className="font-semibold text-sm uppercase tracking-wide">
              {labels[type as keyof typeof labels] || 'Note'}
            </span>
            <p className="mt-1 text-sm">{content}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderScreenshotPlaceholder = (screenshot: ScreenshotPlaceholder) => {
    const placement = template?.formatting.screenshotPlacement || 'inline';
    
    return (
      <div className={`my-4 ${placement === 'sidebar' ? 'float-right ml-4 w-1/3' : 'w-full'}`}>
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 bg-muted/20">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Image className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium text-sm">Screenshot Placeholder</p>
            <p className="text-xs mt-1 text-center max-w-xs">{screenshot.description}</p>
            {screenshot.step && (
              <Badge variant="outline" className="mt-2">Step {screenshot.step}</Badge>
            )}
            {screenshot.annotations && screenshot.annotations.length > 0 && (
              <div className="mt-3 text-xs">
                <p className="font-medium">Annotations needed:</p>
                <ul className="list-disc list-inside mt-1">
                  {screenshot.annotations.map((ann, i) => (
                    <li key={i}>{ann}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center italic">
          Figure {screenshot.step || 1}: {screenshot.description}
        </p>
      </div>
    );
  };

  const renderHeading = (level: number, content: string, id: string) => {
    const headerStyle = template?.formatting.headerStyle || 'plain';
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    
    const sizes = {
      1: 'text-2xl font-bold',
      2: 'text-xl font-semibold',
      3: 'text-lg font-medium',
      4: 'text-base font-medium',
    };

    return (
      <HeadingTag 
        id={id} 
        className={`${sizes[level as keyof typeof sizes] || 'text-base'} mt-6 mb-3 scroll-mt-20`}
      >
        {headerStyle === 'numbered' && <span className="text-muted-foreground mr-2">{id}</span>}
        {content}
      </HeadingTag>
    );
  };

  const renderStep = (step: any, index: number) => {
    return (
      <div key={index} className="flex gap-4 py-4 border-b last:border-0">
        <div className="flex-shrink-0">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground"
            style={{ backgroundColor: template?.branding.primaryColor || '#0052CC' }}
          >
            {index + 1}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-medium">{step.title}</h4>
          <p className="text-sm text-muted-foreground">{step.instruction || step.description}</p>
          {step.tip && renderCallout('tip', step.tip)}
          {step.warning && renderCallout('warning', step.warning)}
          {step.screenshot && renderScreenshotPlaceholder({
            id: `step-${index + 1}`,
            description: step.screenshotHint || step.screenshot,
            step: index + 1,
            annotations: step.annotations,
          })}
        </div>
      </div>
    );
  };

  const renderTableOfContents = () => {
    if (!template?.layout.includeTableOfContents || !document.tableOfContents?.length) return null;

    return (
      <Card className="p-4 mb-6 bg-muted/30">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setCollapsedToc(!collapsedToc)}
        >
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Table of Contents
          </h3>
          {collapsedToc ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {!collapsedToc && (
          <nav className="mt-3">
            <ul className="space-y-1">
              {document.tableOfContents.map((item, i) => (
                <li 
                  key={i} 
                  style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                  className="text-sm"
                >
                  <a 
                    href={`#${item.id}`} 
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Card>
    );
  };

  return (
    <div className="confluence-preview">
      {/* Document Header */}
      <div className="mb-6 pb-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: template?.branding.primaryColor }}>
              {document.title}
            </h1>
            {document.description && (
              <p className="text-lg text-muted-foreground mt-2">{document.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {template?.layout.includeVersionInfo && document.version && (
            <span>Version: {document.version}</span>
          )}
          {document.lastUpdated && (
            <span>Last updated: {document.lastUpdated}</span>
          )}
          {document.author && (
            <span>Author: {document.author}</span>
          )}
          {template?.layout.includeTimeEstimates && document.estimatedDuration && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {document.estimatedDuration} min read
            </span>
          )}
        </div>

        {/* Target Roles */}
        {template?.layout.includeRoleIndicators && document.targetRoles?.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">For:</span>
            {document.targetRoles.map((role) => (
              <Badge key={role} variant="secondary" className="capitalize">
                {role.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        )}

        {/* Tags */}
        {document.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {template?.layout.includeSummary && document.summary && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-sm">{document.summary}</p>
        </div>
      )}

      {/* Learning Objectives */}
      {template?.layout.includeLearningObjectives && document.learningObjectives?.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Learning Objectives
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            After completing this guide, you will be able to:
          </p>
          <ul className="space-y-2">
            {document.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {typeof obj === 'string' ? obj : (obj as any).objective || JSON.stringify(obj)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites */}
      {template?.layout.includePrerequisites && document.prerequisites?.length > 0 && (
        <div className="mb-6">
          {renderCallout('info', `Prerequisites: ${document.prerequisites.join(', ')}`)}
        </div>
      )}

      {/* Table of Contents */}
      {renderTableOfContents()}

      {/* Main Content Sections */}
      <div className="space-y-6">
        {document.sections?.map((section, index) => {
          switch (section.type) {
            case 'heading':
              return renderHeading(section.level || 2, section.content || '', section.id);
            
            case 'paragraph':
              return <p key={index} className="text-sm leading-relaxed">{section.content}</p>;
            
            case 'steps':
              return (
                <div key={index} className="my-6">
                  {section.items?.map((step, i) => renderStep(step, i))}
                </div>
              );
            
            case 'callout':
              return (
                <div key={index}>
                  {renderCallout(section.calloutType || 'info', section.content || '')}
                </div>
              );
            
            case 'screenshot':
              return section.screenshot && (
                <div key={index}>
                  {renderScreenshotPlaceholder(section.screenshot)}
                </div>
              );
            
            case 'list':
              return (
                <ul key={index} className="list-disc list-inside space-y-1 text-sm">
                  {section.items?.map((item, i) => (
                    <li key={i}>{typeof item === 'string' ? item : item.content}</li>
                  ))}
                </ul>
              );
            
            case 'expandable':
              const isExpanded = expandedSections.has(section.id);
              return (
                <div key={index} className="border rounded-lg my-4">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="font-medium">{section.content}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t">
                      {section.items?.map((item, i) => (
                        <p key={i} className="text-sm">{typeof item === 'string' ? item : item.content}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            
            default:
              return null;
          }
        })}
      </div>

      {/* FAQs */}
      {template?.sections.faqs && document.faqs?.length > 0 && (
        <div className="mt-8">
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {document.faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h4 className="font-medium">{faq.question}</h4>
                <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Glossary */}
      {template?.sections.glossary && document.glossary?.length > 0 && (
        <div className="mt-8">
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-4">Glossary</h2>
          <dl className="space-y-3">
            {document.glossary.map((item, i) => (
              <div key={i}>
                <dt className="font-medium">{item.term}</dt>
                <dd className="text-sm text-muted-foreground ml-4">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Related Documents */}
      {template?.layout.includeRelatedDocs && document.relatedDocs?.length > 0 && (
        <div className="mt-8">
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-4">Related Documents</h2>
          <div className="flex flex-wrap gap-2">
            {document.relatedDocs.map((doc, i) => (
              <Button key={i} variant="outline" size="sm" asChild>
                <a href={doc.href}>
                  {doc.title}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {template?.branding.footerText && (
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          {template.branding.footerText}
        </div>
      )}
    </div>
  );
}

export type { GeneratedDocument, DocumentSection, ScreenshotPlaceholder };
