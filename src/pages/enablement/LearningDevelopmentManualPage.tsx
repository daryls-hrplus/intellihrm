import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceNavigation } from '@/hooks/useWorkspaceNavigation';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Search, Clock, ChevronRight, ChevronDown,
  FileText, Layers, Settings, PlayCircle, Brain, BarChart3,
  Link2, AlertTriangle, BookOpen, Eye,
  CheckCircle, Circle, ArrowLeft, Shield,
  GraduationCap, Building, Workflow, ClipboardCheck, Network, FolderOpen
} from 'lucide-react';
import { LND_MANUAL_STRUCTURE, getLndTotalReadTime, getLndTotalSections, LndSection } from '@/types/learningDevelopmentManual';
import { useManualPrintSettings } from '@/hooks/useManualPrintSettings';
import { PrintConfigDialog } from '@/components/enablement/manual/print/PrintConfigDialog';
import { ManualPrintPreview } from '@/components/enablement/manual/print/ManualPrintPreview';

// Section Components
import { LndOverviewSection } from '@/components/enablement/learning-development-manual/LndOverviewSection';
import { LndSetupSection } from '@/components/enablement/learning-development-manual/LndSetupSection';
import { LndAgencySection } from '@/components/enablement/learning-development-manual/LndAgencySection';
import { LndWorkflowsSection } from '@/components/enablement/learning-development-manual/LndWorkflowsSection';
import { LndComplianceSection } from '@/components/enablement/learning-development-manual/LndComplianceSection';
import { LndAISection } from '@/components/enablement/learning-development-manual/LndAISection';
import { LndAnalyticsSection } from '@/components/enablement/learning-development-manual/LndAnalyticsSection';
import { LndIntegrationSection } from '@/components/enablement/learning-development-manual/LndIntegrationSection';
import { LndTroubleshootingSection } from '@/components/enablement/learning-development-manual/LndTroubleshootingSection';
import { LndQuickReference } from '@/components/enablement/learning-development-manual/LndQuickReference';
import { LndGlossary } from '@/components/enablement/learning-development-manual/LndGlossary';
import { LndVersionHistory } from '@/components/enablement/learning-development-manual/LndVersionHistory';
import { LndArchitectureDiagrams } from '@/components/enablement/learning-development-manual/LndArchitectureDiagrams';
import { LndLegacyMigration } from '@/components/enablement/learning-development-manual/sections/overview/LndLegacyMigration';

// Helper function to group subsections by sectionGroup
function groupSubsectionsByGroup(subsections: LndSection[] | undefined) {
  if (!subsections) return { groups: [], ungrouped: [] };
  
  const groups: Map<string, { code: string; title: string; range: string; items: LndSection[] }> = new Map();
  const ungrouped: LndSection[] = [];
  
  subsections.forEach(sub => {
    if (sub.sectionGroup) {
      const key = sub.sectionGroup.code;
      if (!groups.has(key)) {
        groups.set(key, {
          code: sub.sectionGroup.code,
          title: sub.sectionGroup.title,
          range: sub.sectionGroup.range,
          items: []
        });
      }
      groups.get(key)!.items.push(sub);
    } else {
      ungrouped.push(sub);
    }
  });
  
  // Sort groups alphabetically by code
  const sortedGroups = Array.from(groups.values()).sort((a, b) => a.code.localeCompare(b.code));
  
  return { groups: sortedGroups, ungrouped };
}

const CHAPTER_ICONS: Record<string, React.ReactNode> = {
  'chapter-1': <BookOpen className="h-5 w-5" />,
  'chapter-2': <Settings className="h-5 w-5" />,
  'chapter-3': <Building className="h-5 w-5" />,
  'chapter-4': <Workflow className="h-5 w-5" />,
  'chapter-5': <ClipboardCheck className="h-5 w-5" />,
  'chapter-6': <Brain className="h-5 w-5" />,
  'chapter-7': <BarChart3 className="h-5 w-5" />,
  'chapter-8': <Network className="h-5 w-5" />,
  'chapter-9': <AlertTriangle className="h-5 w-5" />
};

export default function LearningDevelopmentManualPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('chapter-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['chapter-1']);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showPrintConfig, setShowPrintConfig] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { printSettings, brandColors, savePrintSettings } = useManualPrintSettings('Learning & Development Admin Manual');

  const activeChapterId = useMemo(() => {
    if (['quick-ref', 'diagrams', 'glossary', 'version-history', 'legacy-mapping'].includes(selectedSectionId)) {
      return selectedSectionId;
    }
    
    const parentChapter = LND_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentChapter?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentChapter = LND_MANUAL_STRUCTURE.find(
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

  const totalReadTime = getLndTotalReadTime();
  const totalSections = getLndTotalSections();

  const progressPercent = useMemo(() => {
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections, totalSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return LND_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return LND_MANUAL_STRUCTURE.filter(section => 
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

  const setGroupExpanded = (groupKey: string, open: boolean) => {
    setExpandedGroups((prev) => {
      if (open) return prev.includes(groupKey) ? prev : [...prev, groupKey];
      return prev.filter((id) => id !== groupKey);
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
        return <LndOverviewSection />;
      case 'chapter-2':
        return <LndSetupSection />;
      case 'chapter-3':
        return <LndAgencySection />;
      case 'chapter-4':
        return <LndWorkflowsSection />;
      case 'chapter-5':
        return <LndComplianceSection />;
      case 'chapter-6':
        return <LndAISection />;
      case 'chapter-7':
        return <LndAnalyticsSection />;
      case 'chapter-8':
        return <LndIntegrationSection />;
      case 'chapter-9':
        return <LndTroubleshootingSection />;
      case 'quick-ref':
        return <LndQuickReference />;
      case 'diagrams':
        return <LndArchitectureDiagrams />;
      case 'glossary':
        return <LndGlossary />;
      case 'legacy-mapping':
        return <LndLegacyMigration />;
      case 'version-history':
        return <LndVersionHistory />;
      default:
        return <LndOverviewSection />;
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
                  <GraduationCap className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Learning & Development Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for LMS management, training operations, compliance, and AI-powered learning
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
                {totalSections} sections
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
          <div className="w-[340px] flex-shrink-0 h-full">
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
                            <span className="flex-1 break-words">{section.sectionNumber}. {section.title}</span>
                            {section.subsections && section.subsections.length > 0 && (
                              expandedSections.includes(section.id) 
                                ? <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                : <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        {section.subsections && (
                          <CollapsibleContent>
                            <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                              {(() => {
                                const { groups, ungrouped } = groupSubsectionsByGroup(section.subsections);
                                
                                // If no groups, render flat list
                                if (groups.length === 0) {
                                  return section.subsections.map((sub) => (
                                    <button
                                      key={sub.id}
                                      className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors
                                        ${selectedSectionId === sub.id 
                                          ? 'bg-primary/10 text-primary font-medium' 
                                          : 'hover:bg-muted text-muted-foreground'
                                        }`}
                                      onClick={() => scrollToSection(sub.id)}
                                    >
                                      {completedSections.includes(sub.id) ? (
                                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                      ) : (
                                        <Circle className="h-3 w-3 flex-shrink-0" />
                                      )}
                                      <span className="break-words">{sub.sectionNumber} {sub.title}</span>
                                    </button>
                                  ));
                                }
                                
                                // Render grouped subsections with collapsible headers
                                return (
                                  <>
                                    {groups.map((group) => {
                                      const groupKey = `${section.id}-group-${group.code}`;
                                      const isGroupExpanded = expandedGroups.includes(groupKey);
                                      const isAnyItemSelected = group.items.some(item => selectedSectionId === item.id);
                                      
                                      return (
                                        <Collapsible
                                          key={groupKey}
                                          open={isGroupExpanded}
                                          onOpenChange={(open) => setGroupExpanded(groupKey, open)}
                                        >
                                          <CollapsibleTrigger asChild>
                                            <button
                                              className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors font-medium
                                                ${isAnyItemSelected 
                                                  ? 'bg-primary/5 text-primary' 
                                                  : 'hover:bg-muted text-foreground'
                                                }`}
                                            >
                                              <FolderOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                              <span className="flex-1 break-words">
                                                {group.code}. {group.title}
                                              </span>
                                              <span className="text-muted-foreground text-[10px]">({group.range})</span>
                                              {isGroupExpanded 
                                                ? <ChevronDown className="h-3 w-3 flex-shrink-0" />
                                                : <ChevronRight className="h-3 w-3 flex-shrink-0" />
                                              }
                                            </button>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <div className="ml-4 mt-1 space-y-0.5 border-l pl-2">
                                              {group.items.map((sub) => (
                                                <button
                                                  key={sub.id}
                                                  className={`w-full flex items-center gap-2 p-1 rounded text-left text-xs transition-colors
                                                    ${selectedSectionId === sub.id 
                                                      ? 'bg-primary/10 text-primary font-medium' 
                                                      : 'hover:bg-muted text-muted-foreground'
                                                    }`}
                                                  onClick={() => scrollToSection(sub.id)}
                                                >
                                                  {completedSections.includes(sub.id) ? (
                                                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                  ) : (
                                                    <Circle className="h-3 w-3 flex-shrink-0" />
                                                  )}
                                                  <span className="break-words">{sub.sectionNumber} {sub.title}</span>
                                                </button>
                                              ))}
                                            </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      );
                                    })}
                                    {/* Render any ungrouped subsections after groups */}
                                    {ungrouped.map((sub) => (
                                      <button
                                        key={sub.id}
                                        className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors
                                          ${selectedSectionId === sub.id 
                                            ? 'bg-primary/10 text-primary font-medium' 
                                            : 'hover:bg-muted text-muted-foreground'
                                          }`}
                                        onClick={() => scrollToSection(sub.id)}
                                      >
                                        {completedSections.includes(sub.id) ? (
                                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Circle className="h-3 w-3 flex-shrink-0" />
                                        )}
                                        <span className="break-words">{sub.sectionNumber} {sub.title}</span>
                                      </button>
                                    ))}
                                  </>
                                );
                              })()}
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ))}

                    {/* Appendices */}
                    <div className="pt-4 mt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">APPENDICES</p>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activeChapterId === 'quick-ref' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('quick-ref')}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>A. Quick Reference Cards</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activeChapterId === 'diagrams' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('diagrams')}
                      >
                        <Network className="h-4 w-4" />
                        <span>B. Architecture Diagrams</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activeChapterId === 'legacy-mapping' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('legacy-mapping')}
                      >
                        <Link2 className="h-4 w-4" />
                        <span>C. Legacy Migration Mapping</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activeChapterId === 'glossary' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('glossary')}
                      >
                        <FileText className="h-4 w-4" />
                        <span>D. Glossary</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activeChapterId === 'version-history' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('version-history')}
                      >
                        <Clock className="h-4 w-4" />
                        <span>E. Version History</span>
                      </button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-full overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardContent className="p-6 flex-1 overflow-auto" ref={contentRef}>
                {renderSectionContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Config Dialog */}
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
        totalReadTime={getLndTotalReadTime()}
      />
    </div>
  );
}
