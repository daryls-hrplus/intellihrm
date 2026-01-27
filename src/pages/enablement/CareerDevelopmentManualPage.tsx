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
  FileText, Layers, Settings, Brain, BarChart3,
  Network, AlertTriangle, BookOpen,
  CheckCircle, Circle, ArrowLeft, Sparkles, Users,
  Briefcase, UserCheck, Eye
} from 'lucide-react';
import { CAREER_DEV_MANUAL_STRUCTURE } from '@/types/careerDevelopmentManual';
import {
  CareerDevOverviewSection,
  CareerDevCareerPathsSection,
  CareerDevMentorshipSection,
  CareerDevIDPSection,
  CareerDevAISection,
  CareerDevIntegrationSection,
  CareerDevESSSection,
  CareerDevAnalyticsSection,
  CareerDevTroubleshootingSection,
  CareerDevQuickReference,
  CareerDevDiagrams,
  CareerDevGlossary,
  CareerDevVersionHistory
} from '@/components/enablement/manual/careerdevelopment';
import { useManualPrintSettings } from '@/hooks/useManualPrintSettings';
import { PrintConfigDialog } from '@/components/enablement/manual/print/PrintConfigDialog';
import { ManualPrintPreview } from '@/components/enablement/manual/print/ManualPrintPreview';

const CHAPTER_ICONS: Record<string, React.ReactNode> = {
  'chapter-1': <BookOpen className="h-5 w-5" />,
  'chapter-2': <Briefcase className="h-5 w-5" />,
  'chapter-3': <Users className="h-5 w-5" />,
  'chapter-4': <UserCheck className="h-5 w-5" />,
  'chapter-5': <Brain className="h-5 w-5" />,
  'chapter-6': <Network className="h-5 w-5" />,
  'chapter-7': <Users className="h-5 w-5" />,
  'chapter-8': <BarChart3 className="h-5 w-5" />,
  'chapter-9': <AlertTriangle className="h-5 w-5" />,
};

export default function CareerDevelopmentManualPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('chapter-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['chapter-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showPrintConfig, setShowPrintConfig] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { printSettings, brandColors, savePrintSettings } = useManualPrintSettings('Career Development Admin Manual');

  const activeChapterId = useMemo(() => {
    // Handle appendix sections
    if (['quick-ref', 'diagrams', 'glossary', 'version-history'].includes(selectedSectionId)) {
      return selectedSectionId;
    }
    
    const parentChapter = CAREER_DEV_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentChapter?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentChapter = CAREER_DEV_MANUAL_STRUCTURE.find(
      (s) => s.id === sectionId || s.subsections?.some((sub) => sub.id === sectionId)
    );

    if (parentChapter && !expandedSections.includes(parentChapter.id)) {
      setExpandedSections((prev) => [...prev, parentChapter.id]);
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
  }, [selectedSectionId, activeChapterId]);

  // Calculate total read time
  const totalReadTime = useMemo(() => {
    return CAREER_DEV_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
  }, []);

  // Calculate progress
  const progressPercent = useMemo(() => {
    const totalSections = CAREER_DEV_MANUAL_STRUCTURE.reduce((acc, section) => 
      acc + 1 + (section.subsections?.length || 0), 0);
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return CAREER_DEV_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return CAREER_DEV_MANUAL_STRUCTURE.filter(section => 
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
    switch (activeChapterId) {
      case 'chapter-1':
        return <CareerDevOverviewSection />;
      case 'chapter-2':
        return <CareerDevCareerPathsSection />;
      case 'chapter-3':
        return <CareerDevMentorshipSection />;
      case 'chapter-4':
        return <CareerDevIDPSection />;
      case 'chapter-5':
        return <CareerDevAISection />;
      case 'chapter-6':
        return <CareerDevIntegrationSection />;
      case 'chapter-7':
        return <CareerDevESSSection />;
      case 'chapter-8':
        return <CareerDevAnalyticsSection />;
      case 'chapter-9':
        return <CareerDevTroubleshootingSection />;
      case 'quick-ref':
        return <CareerDevQuickReference />;
      case 'diagrams':
        return <CareerDevDiagrams />;
      case 'glossary':
        return <CareerDevGlossary />;
      case 'version-history':
        return <CareerDevVersionHistory />;
      default:
        return <CareerDevOverviewSection />;
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
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Book className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Career Development Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for Career Paths, IDPs, Mentorship, and AI Recommendations
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
                {CAREER_DEV_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0)} sections
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
                                ${activeChapterId === section.id 
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

                    {/* Appendices */}
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

      {/* Print Preview */}
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
