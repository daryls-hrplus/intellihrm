import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Book, Search, Clock, ChevronRight, ChevronDown,
  FileText, Layers, Settings, Users, MessageSquare, Calendar,
  Shield, Database, BarChart3, AlertTriangle,
  BookOpen, CheckCircle, Circle, ArrowLeft, Sparkles, Link2
} from 'lucide-react';
import { HR_HUB_MANUAL_STRUCTURE } from '@/types/hrHubManual';
import { 
  HRHubManualOverviewSection,
  HRHubManualOrganizationSection,
  HRHubManualComplianceSection,
  HRHubManualDocumentsSection,
  HRHubManualCommunicationSection,
  HRHubManualOperationsSection,
  HRHubManualAnalyticsSection,
  HRHubManualTroubleshootingSection
} from '@/components/enablement/hr-hub-manual';

// Icons mapped to new chapter order:
// 1. Overview, 2. Org Config, 3. Compliance/Workflows, 4. Documents, 5. Communication, 6. Tasks, 7. Analytics, 8. Troubleshooting
const SECTION_ICONS: Record<string, React.ReactNode> = {
  'hh-part-1': <BookOpen className="h-5 w-5" />,
  'hh-part-2': <Database className="h-5 w-5" />,      // Org Config
  'hh-part-3': <Shield className="h-5 w-5" />,        // Compliance & Workflows
  'hh-part-4': <FileText className="h-5 w-5" />,      // Documents
  'hh-part-5': <MessageSquare className="h-5 w-5" />, // Communication
  'hh-part-6': <Calendar className="h-5 w-5" />,      // Tasks & Events
  'hh-part-7': <BarChart3 className="h-5 w-5" />,     // Analytics
  'hh-part-8': <AlertTriangle className="h-5 w-5" />  // Troubleshooting
};

export default function HRHubManualPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('hh-part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['hh-part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const activePartId = useMemo(() => {
    const parentPart = HR_HUB_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || 
             s.subsections?.some((sub) => sub.id === selectedSectionId) ||
             s.subsections?.some((sub) => sub.subsections?.some((third) => third.id === selectedSectionId))
    );
    return parentPart?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    // Find the first-level parent (chapter)
    const parentPart = HR_HUB_MANUAL_STRUCTURE.find(
      (s) => s.id === sectionId || 
             s.subsections?.some((sub) => sub.id === sectionId) ||
             s.subsections?.some((sub) => sub.subsections?.some((third) => third.id === sectionId))
    );

    if (parentPart && !expandedSections.includes(parentPart.id)) {
      setExpandedSections((prev) => [...prev, parentPart.id]);
    }
  };

  useEffect(() => {
    const id = selectedSectionId;
    let attempt = 0;

    const findAnchor = () => {
      const byData = document.querySelector<HTMLElement>(`[data-manual-anchor="${id}"]`);
      return byData ?? document.getElementById(id);
    };

    const scrollWithOffset = (el: HTMLElement) => {
      const headerOffset = 140;
      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    };

    const tryScroll = () => {
      attempt += 1;
      const el = findAnchor();
      if (el) {
        scrollWithOffset(el);
        return;
      }

      if (attempt < 20) {
        window.setTimeout(tryScroll, 75);
        return;
      }

      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const timeout = window.setTimeout(tryScroll, 50);
    return () => window.clearTimeout(timeout);
  }, [selectedSectionId, activePartId]);

  const totalReadTime = useMemo(() => {
    return HR_HUB_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
  }, []);

  const progressPercent = useMemo(() => {
    const totalSections = HR_HUB_MANUAL_STRUCTURE.reduce((acc, section) => 
      acc + 1 + (section.subsections?.length || 0), 0);
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return HR_HUB_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return HR_HUB_MANUAL_STRUCTURE.filter(section => 
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.subsections?.some(sub => 
        sub.title.toLowerCase().includes(query) ||
        sub.description.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const setSectionExpanded = (sectionId: string, open: boolean) => {
    setExpandedSections((prev) => {
      if (open) return prev.includes(sectionId) ? prev : [...prev, sectionId];
      return prev.filter((id) => id !== sectionId);
    });
  };

  const renderSectionContent = () => {
    switch (activePartId) {
      case 'hh-part-1':
        return <HRHubManualOverviewSection />;
      case 'hh-part-2':
        return <HRHubManualOrganizationSection />;
      case 'hh-part-3':
        return <HRHubManualComplianceSection />;
      case 'hh-part-4':
        return <HRHubManualDocumentsSection />;
      case 'hh-part-5':
        return <HRHubManualCommunicationSection />;
      case 'hh-part-6':
        return <HRHubManualOperationsSection />;
      case 'hh-part-7':
        return <HRHubManualAnalyticsSection />;
      case 'hh-part-8':
        return <HRHubManualTroubleshootingSection />;
      default:
        return <HRHubManualOverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/enablement')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Book className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">HR Hub Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for HR Hub configuration and management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {totalReadTime} min read
              </Badge>
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {HR_HUB_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0)} sections
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <Progress value={progressPercent} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {progressPercent}% complete
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Table of Contents */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-28">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Table of Contents
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-1">
                    {filteredSections.map((section) => (
                      <Collapsible
                        key={section.id}
                        open={expandedSections.includes(section.id)}
                        onOpenChange={(open) => setSectionExpanded(section.id, open)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                              ${activePartId === section.id 
                                ? 'bg-purple-500/10 text-purple-600 font-medium' 
                                : 'hover:bg-muted'
                              }`}
                            onClick={() => scrollToSection(section.id)}
                          >
                            {completedSections.includes(section.id) ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate">
                              {section.sectionNumber}. {section.title}
                            </span>
                            {section.subsections && section.subsections.length > 0 && (
                              expandedSections.includes(section.id) 
                                ? <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                : <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        {section.subsections && (
                          <CollapsibleContent>
                            <div className="ml-6 pl-2 border-l space-y-1 mt-1">
                              {section.subsections.map((sub) => (
                                <div key={sub.id}>
                                  <button
                                    className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors
                                      ${selectedSectionId === sub.id 
                                        ? 'bg-purple-500/10 text-purple-600 font-medium' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                      }`}
                                    onClick={() => scrollToSection(sub.id)}
                                  >
                                    {completedSections.includes(sub.id) ? (
                                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <Circle className="h-3 w-3 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{sub.sectionNumber} {sub.title}</span>
                                  </button>
                                  {/* Third-level subsections */}
                                  {sub.subsections && sub.subsections.length > 0 && (
                                    <div className="ml-4 pl-2 border-l space-y-0.5 mt-0.5">
                                      {sub.subsections.map((thirdLevel) => (
                                        <button
                                          key={thirdLevel.id}
                                          className={`w-full flex items-center gap-1.5 p-1 rounded text-left text-[10px] transition-colors
                                            ${selectedSectionId === thirdLevel.id 
                                              ? 'bg-purple-500/10 text-purple-600 font-medium' 
                                              : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted'
                                            }`}
                                          onClick={() => scrollToSection(thirdLevel.id)}
                                        >
                                          <span className="truncate">{thirdLevel.sectionNumber} {thirdLevel.title}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ))}

                    <Separator className="my-3" />

                    {/* Related Manuals */}
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
                      Related Manuals
                    </div>
                    <button
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors hover:bg-muted text-muted-foreground"
                      onClick={() => navigate('/enablement/workforce-manual')}
                    >
                      <Link2 className="h-4 w-4 text-blue-500" />
                      <span>Workforce Admin Manual</span>
                    </button>

                    <Separator className="my-3" />

                    {/* Quick Reference */}
                    <button
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors hover:bg-muted text-muted-foreground"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Quick Reference Cards</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors hover:bg-muted text-muted-foreground"
                    >
                      <BookOpen className="h-4 w-4 text-green-500" />
                      <span>Glossary</span>
                    </button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            {renderSectionContent()}
          </div>

        </div>
      </div>
    </div>
  );
}
