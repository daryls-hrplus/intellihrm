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
  Book, Search, Clock, ChevronRight, ChevronDown,
  FileText, Layers, Settings, PlayCircle, Brain, BarChart3,
  Link2, AlertTriangle, BookOpen, Eye, Users,
  CheckCircle, Circle, ArrowLeft, Shield, GitBranch,
  Target, Heart, Briefcase, Network
} from 'lucide-react';
import { SUCCESSION_MANUAL_STRUCTURE, getTotalReadTime, getTotalSections } from '@/types/successionManual';
import { useManualPrintSettings } from '@/hooks/useManualPrintSettings';
import { PrintConfigDialog } from '@/components/enablement/manual/print/PrintConfigDialog';
import { ManualPrintPreview } from '@/components/enablement/manual/print/ManualPrintPreview';

// Section Components
import { SuccessionOverviewSection } from '@/components/enablement/manual/succession/SuccessionOverviewSection';
import { SuccessionFoundationSection } from '@/components/enablement/manual/succession/SuccessionFoundationSection';
import { SuccessionNineBoxSection } from '@/components/enablement/manual/succession/SuccessionNineBoxSection';
import { SuccessionReadinessSection } from '@/components/enablement/manual/succession/SuccessionReadinessSection';
import { SuccessionTalentPoolsSection } from '@/components/enablement/manual/succession/SuccessionTalentPoolsSection';
import { SuccessionPlansSection } from '@/components/enablement/manual/succession/SuccessionPlansSection';
import { SuccessionRiskSection } from '@/components/enablement/manual/succession/SuccessionRiskSection';
import { SuccessionCareerSection } from '@/components/enablement/manual/succession/SuccessionCareerSection';
import { SuccessionIntegrationSection } from '@/components/enablement/manual/succession/SuccessionIntegrationSection';
import { SuccessionAnalyticsSection } from '@/components/enablement/manual/succession/SuccessionAnalyticsSection';
import { SuccessionTroubleshootingSection } from '@/components/enablement/manual/succession/SuccessionTroubleshootingSection';
import { SuccessionQuickReference } from '@/components/enablement/manual/succession/SuccessionQuickReference';
import { SuccessionDiagrams } from '@/components/enablement/manual/succession/SuccessionDiagrams';
import { SuccessionGlossary } from '@/components/enablement/manual/succession/SuccessionGlossary';
import { SuccessionVersionHistory } from '@/components/enablement/manual/succession/SuccessionVersionHistory';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'part-1': <BookOpen className="h-5 w-5" />,
  'part-2': <Settings className="h-5 w-5" />,
  'part-3': <GitBranch className="h-5 w-5" />,
  'part-4': <Target className="h-5 w-5" />,
  'part-5': <Users className="h-5 w-5" />,
  'part-6': <PlayCircle className="h-5 w-5" />,
  'part-7': <Shield className="h-5 w-5" />,
  'part-8': <Briefcase className="h-5 w-5" />,
  'part-9': <Network className="h-5 w-5" />,
  'part-10': <BarChart3 className="h-5 w-5" />,
  'part-11': <AlertTriangle className="h-5 w-5" />
};

export default function SuccessionManualPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showPrintConfig, setShowPrintConfig] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { printSettings, brandColors, savePrintSettings } = useManualPrintSettings('Succession Planning Admin Manual');

  const activePartId = useMemo(() => {
    if (['quick-ref', 'diagrams', 'glossary', 'version-history'].includes(selectedSectionId)) {
      return selectedSectionId;
    }
    
    const parentPart = SUCCESSION_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentPart?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentPart = SUCCESSION_MANUAL_STRUCTURE.find(
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

  const totalReadTime = getTotalReadTime();
  const totalSections = getTotalSections();

  const progressPercent = useMemo(() => {
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections, totalSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return SUCCESSION_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return SUCCESSION_MANUAL_STRUCTURE.filter(section => 
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
        return <SuccessionOverviewSection />;
      case 'part-2':
        return <SuccessionFoundationSection />;
      case 'part-3':
        return <SuccessionNineBoxSection />;
      case 'part-4':
        return <SuccessionReadinessSection />;
      case 'part-5':
        return <SuccessionTalentPoolsSection />;
      case 'part-6':
        return <SuccessionPlansSection />;
      case 'part-7':
        return <SuccessionRiskSection />;
      case 'part-8':
        return <SuccessionCareerSection />;
      case 'part-9':
        return <SuccessionIntegrationSection />;
      case 'part-10':
        return <SuccessionAnalyticsSection />;
      case 'part-11':
        return <SuccessionTroubleshootingSection />;
      case 'quick-ref':
        return <SuccessionQuickReference />;
      case 'diagrams':
        return <SuccessionDiagrams />;
      case 'glossary':
        return <SuccessionGlossary />;
      case 'version-history':
        return <SuccessionVersionHistory />;
      default:
        return <SuccessionOverviewSection />;
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
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <GitBranch className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Succession Planning Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for succession planning, Nine-Box, talent pools, and readiness assessment
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
                            <span className="flex-1 truncate">{section.sectionNumber}. {section.title}</span>
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
                              {section.subsections.map((sub) => (
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
                                  <span className="truncate">{sub.sectionNumber} {sub.title}</span>
                                </button>
                              ))}
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
                          ${activePartId === 'quick-ref' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('quick-ref')}
                      >
                        <Book className="h-4 w-4" />
                        <span>A. Quick Reference Cards</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activePartId === 'diagrams' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('diagrams')}
                      >
                        <GitBranch className="h-4 w-4" />
                        <span>B. Architecture Diagrams</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activePartId === 'glossary' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('glossary')}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>C. Glossary</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                          ${activePartId === 'version-history' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                        onClick={() => scrollToSection('version-history')}
                      >
                        <FileText className="h-4 w-4" />
                        <span>D. Version History</span>
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
              <CardContent className="flex-1 overflow-auto p-6" ref={contentRef}>
                {renderSectionContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Dialogs */}
      <PrintConfigDialog
        open={showPrintConfig}
        onOpenChange={setShowPrintConfig}
        settings={printSettings}
        brandColors={brandColors}
        onSave={handleSavePrintSettings}
        isSaving={savePrintSettings.isPending}
      />

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
