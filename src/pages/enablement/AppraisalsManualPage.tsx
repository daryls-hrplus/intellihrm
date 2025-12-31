import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle, Circle, ArrowLeft, Sparkles, Calendar, Target
} from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleCompleted = (sectionId: string) => {
    setCompletedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
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
                        onOpenChange={() => toggleSection(section.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                              ${activeSection === section.id 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-muted'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSection(section.id);
                            }}
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
                                    ${activeSection === sub.id 
                                      ? 'bg-primary/10 text-primary font-medium' 
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                  onClick={() => setActiveSection(sub.id)}
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
                        ${activeSection === 'quick-ref' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => setActiveSection('quick-ref')}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Quick Reference Cards</span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                        ${activeSection === 'diagrams' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => setActiveSection('diagrams')}
                    >
                      <Layers className="h-4 w-4 text-blue-500" />
                      <span>Architecture Diagrams</span>
                    </button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {renderSectionContent()}
          </div>

          {/* Right Sidebar - Section Info */}
          <div className="w-64 flex-shrink-0 hidden xl:block">
            <Card className="sticky top-28">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Section Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === activeSection || 
                  s.subsections?.some(sub => sub.id === activeSection)) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Target Audience</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === activeSection)?.targetRoles || 
                          APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                            .find(sub => sub.id === activeSection)?.targetRoles || ['All']
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
                          {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === activeSection)?.estimatedReadTime || 
                            APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                              .find(sub => sub.id === activeSection)?.estimatedReadTime || 10} min
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Industry Context</span>
                      <div className="mt-2 space-y-2">
                        {(APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === activeSection)?.industryContext ||
                          APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                            .find(sub => sub.id === activeSection)?.industryContext) && (
                          <>
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Frequency</p>
                                <p className="text-xs">
                                  {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === activeSection)?.industryContext?.frequency ||
                                    APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                                      .find(sub => sub.id === activeSection)?.industryContext?.frequency}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Timing</p>
                                <p className="text-xs">
                                  {APPRAISALS_MANUAL_STRUCTURE.find(s => s.id === activeSection)?.industryContext?.timing ||
                                    APPRAISALS_MANUAL_STRUCTURE.flatMap(s => s.subsections || [])
                                      .find(sub => sub.id === activeSection)?.industryContext?.timing}
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
                  onClick={() => toggleCompleted(activeSection)}
                >
                  {completedSections.includes(activeSection) ? (
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
