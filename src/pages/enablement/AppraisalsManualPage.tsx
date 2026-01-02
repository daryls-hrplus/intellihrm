import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Book, Search, Clock, Users, ChevronRight, ChevronDown,
  FileText, Layers, Settings, PlayCircle, Brain, BarChart3,
  Link2, AlertTriangle, Download, Printer, BookOpen,
  CheckCircle, Circle, ArrowLeft, Sparkles, Calendar, Target, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateAppraisalsManualDocx, MANUAL_CONTENT } from '@/utils/appraisalsManualDocx';
import { APPRAISALS_MANUAL_STRUCTURE, QUICK_REFERENCE_CARDS, type ManualSection } from '@/types/adminManual';
import { ManualOverviewSection } from '@/components/enablement/manual/ManualOverviewSection';
import { ManualSetupSection } from '@/components/enablement/manual/ManualSetupSection';
import { ManualWorkflowsSection } from '@/components/enablement/manual/ManualWorkflowsSection';
import { ManualCalibrationSection } from '@/components/enablement/manual/ManualCalibrationSection';
import { ManualAISection } from '@/components/enablement/manual/ManualAISection';
import { ManualAnalyticsSection } from '@/components/enablement/manual/ManualAnalyticsSection';
import { ManualIntegrationSection } from '@/components/enablement/manual/ManualIntegrationSection';
import { ManualTroubleshootingSection } from '@/components/enablement/manual/ManualTroubleshootingSection';
import { ManualQuickReference } from '@/components/enablement/manual/ManualQuickReference';
import { ManualDiagrams } from '@/components/enablement/manual/ManualDiagrams';
import { ManualVersionHistory } from '@/components/enablement/manual/ManualVersionHistory';
import { ManualGlossary } from '@/components/enablement/manual/ManualGlossary';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'part-1': <BookOpen className="h-5 w-5" />,
  'part-2': <Settings className="h-5 w-5" />,
  'part-3': <PlayCircle className="h-5 w-5" />,
  'part-4': <Target className="h-5 w-5" />,
  'part-5': <Brain className="h-5 w-5" />,
  'part-6': <BarChart3 className="h-5 w-5" />,
  'part-7': <Link2 className="h-5 w-5" />,
  'part-8': <AlertTriangle className="h-5 w-5" />
};

export default function AppraisalsManualPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const activePartId = useMemo(() => {
    const parentPart = APPRAISALS_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentPart?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentPart = APPRAISALS_MANUAL_STRUCTURE.find(
      (s) => s.id === sectionId || s.subsections?.some((sub) => sub.id === sectionId)
    );

    if (parentPart && !expandedSections.includes(parentPart.id)) {
      setExpandedSections((prev) => [...prev, parentPart.id]);
    }
  };

  useEffect(() => {
    const id = selectedSectionId;
    const timeout = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [selectedSectionId, activePartId]);

  // Calculate total read time
  const totalReadTime = useMemo(() => {
    return APPRAISALS_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
  }, []);

  // Calculate progress
  const progressPercent = useMemo(() => {
    const totalSections = APPRAISALS_MANUAL_STRUCTURE.reduce((acc, section) => 
      acc + 1 + (section.subsections?.length || 0), 0);
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return APPRAISALS_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return APPRAISALS_MANUAL_STRUCTURE.filter(section => 
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

  const exportToPDF = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Appraisals Administrator Manual', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('HRplus Performance Management Module', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} | Total Read Time: ${totalReadTime} min`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.setTextColor(0);
      yPosition += 20;

      // Export all parts with comprehensive content
      const parts = [
        MANUAL_CONTENT.part1,
        MANUAL_CONTENT.part2,
        MANUAL_CONTENT.part3,
        MANUAL_CONTENT.part4,
        MANUAL_CONTENT.part5,
        MANUAL_CONTENT.part6,
        MANUAL_CONTENT.part7,
        MANUAL_CONTENT.part8,
      ];

      parts.forEach((part) => {
        // Part header
        addNewPageIfNeeded(20);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175);
        pdf.text(part.title, margin, yPosition);
        yPosition += 12;
        pdf.setTextColor(0);

        // Sections within part
        part.sections.forEach((section) => {
          addNewPageIfNeeded(25);

          // Section header
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(60);
          pdf.text(section.title, margin, yPosition);
          yPosition += 7;

          // Section content
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(40);

          section.content.forEach((line) => {
            const lines = pdf.splitTextToSize(line, contentWidth);
            addNewPageIfNeeded(lines.length * 5);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 5;
          });

          yPosition += 5;
        });

        yPosition += 10;
      });

      // Save
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`appraisals-admin-manual-${date}.pdf`);

      toast({
        title: "PDF exported successfully",
        description: "Appraisals Administrator Manual has been downloaded.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportToDocx = async () => {
    setIsExportingDocx(true);
    try {
      await generateAppraisalsManualDocx();
      toast({
        title: "DOCX exported successfully",
        description: "Appraisals Administrator Manual has been downloaded.",
      });
    } catch (error) {
      console.error('DOCX export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate DOCX. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSectionContent = () => {
    switch (activePartId) {
      case 'part-1':
        return <ManualOverviewSection />;
      case 'part-2':
        return <ManualSetupSection />;
      case 'part-3':
        return <ManualWorkflowsSection />;
      case 'part-4':
        return <ManualCalibrationSection />;
      case 'part-5':
        return <ManualAISection />;
      case 'part-6':
        return <ManualAnalyticsSection />;
      case 'part-7':
        return <ManualIntegrationSection />;
      case 'part-8':
        return <ManualTroubleshootingSection />;
      case 'quick-ref':
        return <ManualQuickReference />;
      case 'diagrams':
        return <ManualDiagrams />;
      case 'glossary':
        return <ManualGlossary />;
      case 'version-history':
        return <ManualVersionHistory />;
      default:
        return <ManualOverviewSection />;
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
                <div className="p-2 rounded-lg bg-primary/10">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Appraisals Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for Performance Appraisals configuration and management
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
                {APPRAISALS_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0)} sections
              </Badge>
              <Button variant="outline" size="sm" onClick={exportToPDF} disabled={isExportingPdf}>
                {isExportingPdf ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExportingPdf ? 'Generating...' : 'Export PDF'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportToDocx} disabled={isExportingDocx}>
                {isExportingDocx ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {isExportingDocx ? 'Generating...' : 'Export DOCX'}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
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
          <div className="flex-1 min-w-0" ref={contentRef}>
            {renderSectionContent()}
          </div>

          {/* Right Sidebar - Section Info */}
          <div className="w-64 flex-shrink-0 hidden xl:block">
            <Card className="sticky top-28">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Section Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId || 
                  s.subsections?.some(sub => sub.id === selectedSectionId)) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Target Audience</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId)?.targetRoles || 
                          APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                            .find(sub => sub.id === selectedSectionId)?.targetRoles || ['All']
                        ).map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Estimated Time</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId)?.estimatedReadTime || 
                            APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                              .find(sub => sub.id === selectedSectionId)?.estimatedReadTime || 10} min
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Industry Context</span>
                      <div className="mt-2 space-y-2">
                        {(APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId)?.industryContext ||
                          APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                            .find(sub => sub.id === selectedSectionId)?.industryContext) && (
                          <>
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Frequency</p>
                                <p className="text-xs">
                                  {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId)?.industryContext?.frequency ||
                                    APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                                      .find(sub => sub.id === selectedSectionId)?.industryContext?.frequency}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Timing</p>
                                <p className="text-xs">
                                  {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId)?.industryContext?.timing ||
                                    APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                                      .find(sub => sub.id === selectedSectionId)?.industryContext?.timing}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => toggleCompleted(selectedSectionId)}
                >
                  {completedSections.includes(selectedSectionId) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
