import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceNavigation } from '@/hooks/useWorkspaceNavigation';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Book, Search, Clock, ChevronRight, ChevronDown,
  FileText, Layers, Settings, PlayCircle, Brain, BarChart3,
  Link2, AlertTriangle, BookOpen, Eye, Radar,
  CheckCircle, Circle, ArrowLeft, Sparkles, Shield, MessageSquare
} from 'lucide-react';
import { FEEDBACK_360_MANUAL_STRUCTURE } from '@/types/feedback360Manual';
import { useManualPrintSettings } from '@/hooks/useManualPrintSettings';
import { PrintConfigDialog } from '@/components/enablement/manual/print/PrintConfigDialog';
import { ManualPrintPreview } from '@/components/enablement/manual/print/ManualPrintPreview';

// Section Components
import { F360OverviewSection } from '@/components/enablement/manual/feedback360/F360OverviewSection';
import { F360SetupSection } from '@/components/enablement/manual/feedback360/F360SetupSection';
import { F360WorkflowSection } from '@/components/enablement/manual/feedback360/F360WorkflowSection';
import { F360GovernanceSection } from '@/components/enablement/manual/feedback360/F360GovernanceSection';
import { F360AISection } from '@/components/enablement/manual/feedback360/F360AISection';
import { F360AnalyticsSection } from '@/components/enablement/manual/feedback360/F360AnalyticsSection';
import { F360IntegrationSection } from '@/components/enablement/manual/feedback360/F360IntegrationSection';
import { F360TroubleshootingSection } from '@/components/enablement/manual/feedback360/F360TroubleshootingSection';
import { F360QuickReference } from '@/components/enablement/manual/feedback360/F360QuickReference';
import { F360Diagrams } from '@/components/enablement/manual/feedback360/F360Diagrams';
import { F360Glossary } from '@/components/enablement/manual/feedback360/F360Glossary';
import { F360VersionHistory } from '@/components/enablement/manual/feedback360/F360VersionHistory';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'part-1': <BookOpen className="h-5 w-5" />,
  'part-2': <Settings className="h-5 w-5" />,
  'part-3': <PlayCircle className="h-5 w-5" />,
  'part-4': <Shield className="h-5 w-5" />,
  'part-5': <Brain className="h-5 w-5" />,
  'part-6': <BarChart3 className="h-5 w-5" />,
  'part-7': <Link2 className="h-5 w-5" />,
  'part-8': <AlertTriangle className="h-5 w-5" />
};

export default function Feedback360ManualPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showPrintConfig, setShowPrintConfig] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { printSettings, brandColors, savePrintSettings } = useManualPrintSettings('360 Feedback Admin Manual');

  const activePartId = useMemo(() => {
    if (['quick-ref', 'diagrams', 'glossary', 'version-history'].includes(selectedSectionId)) {
      return selectedSectionId;
    }
    
    const parentPart = FEEDBACK_360_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentPart?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentPart = FEEDBACK_360_MANUAL_STRUCTURE.find(
      (s) => s.id === sectionId || s.subsections?.some((sub) => sub.id === sectionId)
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
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    return FEEDBACK_360_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
  }, []);

  const progressPercent = useMemo(() => {
    const totalSections = FEEDBACK_360_MANUAL_STRUCTURE.reduce((acc, section) => 
      acc + 1 + (section.subsections?.length || 0), 0);
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return FEEDBACK_360_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return FEEDBACK_360_MANUAL_STRUCTURE.filter(section => 
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

  const toggleCompleted = (sectionId: string) => {
    setCompletedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleOpenPrintPreview = () => {
    setShowPrintPreview(true);
  };

  const handleOpenPrintConfig = () => {
    setShowPrintPreview(false);
    setShowPrintConfig(true);
  };

  const handleSavePrintSettings = (settings: typeof printSettings) => {
    savePrintSettings.mutate(settings, {
      onSuccess: () => {
        setShowPrintConfig(false);
      }
    });
  };

  const renderSectionContent = () => {
    switch (activePartId) {
      case 'part-1':
        return <F360OverviewSection />;
      case 'part-2':
        return <F360SetupSection selectedSectionId={selectedSectionId} />;
      case 'part-3':
        return <F360WorkflowSection />;
      case 'part-4':
        return <F360GovernanceSection />;
      case 'part-5':
        return <F360AISection />;
      case 'part-6':
        return <F360AnalyticsSection />;
      case 'part-7':
        return <F360IntegrationSection />;
      case 'part-8':
        return <F360TroubleshootingSection />;
      case 'quick-ref':
        return <F360QuickReference />;
      case 'diagrams':
        return <F360Diagrams />;
      case 'glossary':
        return <F360Glossary />;
      case 'version-history':
        return <F360VersionHistory />;
      default:
        return <F360OverviewSection />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10 flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigateToList({
                route: '/enablement/manuals',
                title: 'Administrator Manuals',
                moduleCode: 'enablement',
              })}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Radar className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">360 Feedback Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for multi-rater feedback configuration and management
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
                {FEEDBACK_360_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0)} sections
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowPrintConfig(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Print Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenPrintPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Print Preview
              </Button>
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

      <div className="container mx-auto px-6 py-6 flex-1 overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Left Sidebar - Table of Contents */}
          <div className="w-80 flex-shrink-0 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
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
              <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
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
                                  ? 'bg-primary/10 text-primary font-medium' 
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
                                <button
                                  key={sub.id}
                                  className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors
                                    ${selectedSectionId === sub.id 
                                      ? 'bg-primary/10 text-primary font-medium' 
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
                              ))}
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ))}

                    <Separator className="my-3" />

                    {/* Quick Reference & Diagrams */}
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                        ${selectedSectionId === 'quick-ref' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => scrollToSection('quick-ref')}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Quick Reference Cards</span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                        ${selectedSectionId === 'diagrams' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => scrollToSection('diagrams')}
                    >
                      <Layers className="h-4 w-4 text-blue-500" />
                      <span>Architecture Diagrams</span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                        ${selectedSectionId === 'glossary' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => scrollToSection('glossary')}
                    >
                      <BookOpen className="h-4 w-4 text-green-500" />
                      <span>Glossary</span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                        ${selectedSectionId === 'version-history' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => scrollToSection('version-history')}
                    >
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>Version History</span>
                    </button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-auto" ref={contentRef}>
            {renderSectionContent()}
          </div>

        </div>
      </div>

      {/* Print Configuration Dialog */}
      <PrintConfigDialog
        open={showPrintConfig}
        onOpenChange={setShowPrintConfig}
        settings={printSettings}
        brandColors={brandColors}
        onSave={handleSavePrintSettings}
        isSaving={savePrintSettings.isPending}
      />

      {/* Print Preview Modal */}
      <ManualPrintPreview
        open={showPrintPreview}
        onOpenChange={setShowPrintPreview}
        settings={printSettings}
        brandColors={brandColors}
        onConfigureClick={handleOpenPrintConfig}
        totalReadTime={totalReadTime}
      />
    </div>
  );
}
