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
  FileText, Layers, Settings, PlayCircle, BarChart3,
  Link2, Download, Printer, BookOpen,
  CheckCircle, Circle, ArrowLeft, Target
} from 'lucide-react';
import { GoalsManualSetupSection } from '@/components/enablement/goals-manual/GoalsManualSetupSection';

interface ManualSection {
  id: string;
  sectionNumber: string;
  title: string;
  description: string;
  estimatedReadTime: number;
  subsections?: {
    id: string;
    sectionNumber: string;
    title: string;
    description: string;
  }[];
}

const GOALS_MANUAL_STRUCTURE: ManualSection[] = [
  {
    id: 'part-1',
    sectionNumber: '1',
    title: 'Overview',
    description: 'Introduction to Goals Management module',
    estimatedReadTime: 5,
    subsections: [
      { id: 'sec-1-1', sectionNumber: '1.1', title: 'Introduction', description: 'Module overview and key concepts' },
      { id: 'sec-1-2', sectionNumber: '1.2', title: 'Core Concepts', description: 'Goals, OKRs, and alignment' },
      { id: 'sec-1-3', sectionNumber: '1.3', title: 'Architecture', description: 'System architecture and data flow' },
    ],
  },
  {
    id: 'part-2',
    sectionNumber: '2',
    title: 'Setup & Configuration',
    description: 'Configure goal cycles, templates, and settings',
    estimatedReadTime: 25,
    subsections: [
      { id: 'sec-2-1', sectionNumber: '2.1', title: 'Goal Cycles', description: 'Configure goal periods and deadlines' },
      { id: 'sec-2-2', sectionNumber: '2.2', title: 'Goal Templates', description: 'Create reusable goal templates' },
      { id: 'sec-2-3', sectionNumber: '2.3', title: 'Locking Rules', description: 'Control when goals can be edited' },
      { id: 'sec-2-4', sectionNumber: '2.4', title: 'Check-in Cadence', description: 'Set up progress update schedules' },
      { id: 'sec-2-5', sectionNumber: '2.5', title: 'Goal Rating', description: 'Configure goal achievement ratings' },
    ],
  },
  {
    id: 'part-3',
    sectionNumber: '3',
    title: 'Workflows',
    description: 'Employee and manager goal workflows',
    estimatedReadTime: 15,
    subsections: [
      { id: 'sec-3-1', sectionNumber: '3.1', title: 'Employee Goal Entry', description: 'How employees create and manage goals' },
      { id: 'sec-3-2', sectionNumber: '3.2', title: 'Manager Review', description: 'Manager goal review and approval' },
      { id: 'sec-3-3', sectionNumber: '3.3', title: 'HR Administration', description: 'HR oversight and reporting' },
    ],
  },
  {
    id: 'part-4',
    sectionNumber: '4',
    title: 'OKR Framework',
    description: 'Objectives and Key Results management',
    estimatedReadTime: 20,
    subsections: [
      { id: 'sec-4-1', sectionNumber: '4.1', title: 'OKR Setup', description: 'Configure OKR methodology' },
      { id: 'sec-4-2', sectionNumber: '4.2', title: 'Key Results', description: 'Define measurable outcomes' },
      { id: 'sec-4-3', sectionNumber: '4.3', title: 'Alignment View', description: 'Cascade and alignment visualization' },
    ],
  },
  {
    id: 'part-5',
    sectionNumber: '5',
    title: 'Analytics',
    description: 'Goal progress and completion analytics',
    estimatedReadTime: 10,
    subsections: [
      { id: 'sec-5-1', sectionNumber: '5.1', title: 'Goal Progress Dashboard', description: 'Track goal completion rates' },
      { id: 'sec-5-2', sectionNumber: '5.2', title: 'Completion Reports', description: 'Generate goal reports' },
    ],
  },
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Integration',
    description: 'Connect goals to appraisals and compensation',
    estimatedReadTime: 10,
    subsections: [
      { id: 'sec-6-1', sectionNumber: '6.1', title: 'Appraisals Integration', description: 'Link goals to performance reviews' },
      { id: 'sec-6-2', sectionNumber: '6.2', title: 'Compensation Integration', description: 'Connect goals to merit increases' },
    ],
  },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'part-1': <BookOpen className="h-5 w-5" />,
  'part-2': <Settings className="h-5 w-5" />,
  'part-3': <PlayCircle className="h-5 w-5" />,
  'part-4': <Target className="h-5 w-5" />,
  'part-5': <BarChart3 className="h-5 w-5" />,
  'part-6': <Link2 className="h-5 w-5" />,
};

export default function GoalsManualPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const activePartId = useMemo(() => {
    const parentPart = GOALS_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentPart?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentPart = GOALS_MANUAL_STRUCTURE.find(
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

  const totalReadTime = useMemo(() => {
    return GOALS_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
  }, []);

  const progressPercent = useMemo(() => {
    const totalSections = GOALS_MANUAL_STRUCTURE.reduce((acc, section) => 
      acc + 1 + (section.subsections?.length || 0), 0);
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return GOALS_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return GOALS_MANUAL_STRUCTURE.filter(section => 
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

  const handlePrint = () => {
    window.print();
  };

  const renderSectionContent = () => {
    switch (activePartId) {
      case 'part-1':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goals Management Overview</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  The Goals Management module enables organizations to define, track, and measure employee goals 
                  aligned with organizational objectives. This module supports both traditional goal-setting 
                  and OKR (Objectives and Key Results) methodologies.
                </p>
                <h4 className="font-semibold mt-4">Key Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Goal cycle management with configurable periods</li>
                  <li>Goal templates for standardization</li>
                  <li>Cascading goals and alignment visualization</li>
                  <li>Progress check-ins and updates</li>
                  <li>Integration with appraisals and compensation</li>
                  <li>OKR framework support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case 'part-2':
        return <GoalsManualSetupSection />;
      case 'part-3':
        return (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Goal Workflow documentation coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'part-4':
        return (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>OKR Framework documentation coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'part-5':
        return (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Goals Analytics documentation coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'part-6':
        return (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Integration documentation coming soon.</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
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
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Goals Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide for Goals Management configuration
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
                {GOALS_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0)} sections
              </Badge>
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
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            <div id={activePartId}>
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
