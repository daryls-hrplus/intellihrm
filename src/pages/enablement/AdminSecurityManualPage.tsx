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
  FileText, Layers, Settings, Shield, Users, Lock,
  Brain, BarChart3, AlertTriangle, BookOpen,
  CheckCircle, Circle, ArrowLeft, Sparkles, Building
} from 'lucide-react';
import { ADMIN_SECURITY_MANUAL_STRUCTURE } from '@/types/adminSecurityManual';
import { AdminManualOverviewSection, AdminManualFoundationSection, AdminManualUsersSection, AdminManualSecuritySection, AdminManualSystemSection, AdminManualAIGovernanceSection, AdminManualComplianceSection } from '@/components/enablement/admin-manual';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'admin-part-1': <BookOpen className="h-5 w-5" />,
  'admin-part-2': <Building className="h-5 w-5" />,
  'admin-part-3': <Users className="h-5 w-5" />,
  'admin-part-4': <Shield className="h-5 w-5" />,
  'admin-part-5': <Settings className="h-5 w-5" />,
  'admin-part-6': <Brain className="h-5 w-5" />,
  'admin-part-7': <BarChart3 className="h-5 w-5" />,
  'admin-part-8': <AlertTriangle className="h-5 w-5" />
};

export default function AdminSecurityManualPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('admin-part-1');
  const [expandedSections, setExpandedSections] = useState<string[]>(['admin-part-1']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const activePartId = useMemo(() => {
    const parentPart = ADMIN_SECURITY_MANUAL_STRUCTURE.find(
      (s) => s.id === selectedSectionId || s.subsections?.some((sub) => sub.id === selectedSectionId)
    );
    return parentPart?.id ?? selectedSectionId;
  }, [selectedSectionId]);

  const scrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);

    const parentPart = ADMIN_SECURITY_MANUAL_STRUCTURE.find(
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

  // Calculate total read time
  const totalReadTime = useMemo(() => {
    return ADMIN_SECURITY_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
  }, []);

  // Calculate progress
  const progressPercent = useMemo(() => {
    const totalSections = ADMIN_SECURITY_MANUAL_STRUCTURE.reduce((acc, section) => 
      acc + 1 + (section.subsections?.length || 0), 0);
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return ADMIN_SECURITY_MANUAL_STRUCTURE;
    const query = searchQuery.toLowerCase();
    return ADMIN_SECURITY_MANUAL_STRUCTURE.filter(section => 
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

  const renderSectionContent = () => {
    switch (activePartId) {
      case 'admin-part-1':
        return <AdminManualOverviewSection />;
      case 'admin-part-2':
        return <AdminManualFoundationSection />;
      case 'admin-part-3':
        return <AdminManualUsersSection />;
      case 'admin-part-4':
        return <AdminManualSecuritySection />;
      case 'admin-part-5':
        return <AdminManualSystemSection />;
      case 'admin-part-6':
        return <AdminManualAIGovernanceSection />;
      case 'admin-part-7':
        return <AdminManualComplianceSection />;
      case 'admin-part-8':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Part 8: Troubleshooting & FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Common issues and troubleshooting content coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return <AdminManualOverviewSection />;
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
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin & Security Administrator Manual</h1>
                  <p className="text-sm text-muted-foreground">
                    Administration and security configuration guide
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
                {ADMIN_SECURITY_MANUAL_STRUCTURE.reduce((acc, s) => acc + 1 + (s.subsections?.length || 0), 0)} sections
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
                {ADMIN_SECURITY_MANUAL_STRUCTURE.find(s => s.id === selectedSectionId || 
                  s.subsections?.some(sub => sub.id === selectedSectionId)) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Current Section</span>
                      <p className="font-medium mt-1">
                        {ADMIN_SECURITY_MANUAL_STRUCTURE.find(s => s.id === activePartId)?.title}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Target Roles</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ADMIN_SECURITY_MANUAL_STRUCTURE.find(s => s.id === activePartId)?.targetRoles.map((role, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Est. Read Time</span>
                      <p className="font-medium mt-1">
                        {ADMIN_SECURITY_MANUAL_STRUCTURE.find(s => s.id === activePartId)?.estimatedReadTime} minutes
                      </p>
                    </div>
                    <Separator />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => toggleCompleted(activePartId)}
                    >
                      {completedSections.includes(activePartId) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
