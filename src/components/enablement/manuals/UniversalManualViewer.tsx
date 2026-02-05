import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X,
  Printer,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useManualTableOfContents, 
  useManualSection,
  groupSectionsIntoChapters 
} from '@/hooks/useManualContent';
import { ManualTableOfContents } from './ManualTableOfContents';
import { ManualSectionRenderer } from './ManualSectionRenderer';
import { useTabState } from '@/hooks/useTabState';

// Manual metadata for display
const MANUAL_METADATA: Record<string, { title: string; icon: string; description: string }> = {
  'learning-development': {
    title: 'Learning & Development Administrator Manual',
    icon: '📚',
    description: 'Complete guide to configuring and managing the LMS module'
  },
  'admin-security': {
    title: 'Administration & Security Manual',
    icon: '🔐',
    description: 'System administration, user management, and security configuration'
  },
  'workforce': {
    title: 'Workforce Management Manual',
    icon: '👥',
    description: 'Employee records, organizational structure, and workforce planning'
  },
  'appraisals': {
    title: 'Performance Appraisals Manual',
    icon: '📊',
    description: 'Performance review cycles, ratings, and feedback processes'
  },
  'goals': {
    title: 'Goals & Objectives Manual',
    icon: '🎯',
    description: 'Goal setting, OKRs, and cascading objectives'
  },
  'feedback-360': {
    title: '360° Feedback Manual',
    icon: '🔄',
    description: 'Multi-rater feedback, surveys, and development insights'
  },
  'succession': {
    title: 'Succession Planning Manual',
    icon: '🏆',
    description: 'Talent pools, readiness assessment, and succession pipelines'
  },
  'career-development': {
    title: 'Career Development Manual',
    icon: '🚀',
    description: 'Career paths, competency frameworks, and development plans'
  },
  'time-attendance': {
    title: 'Time & Attendance Manual',
    icon: '⏰',
    description: 'Time tracking, schedules, and attendance policies'
  },
  'benefits': {
    title: 'Benefits Administration Manual',
    icon: '🏥',
    description: 'Benefits enrollment, plans, and employee benefits management'
  },
  'hr-hub': {
    title: 'HR Hub Manual',
    icon: '🏢',
    description: 'Central HR dashboard and cross-module workflows'
  },
};

interface UniversalManualViewerProps {
  manualIdOverride?: string; // Allow passing manual ID directly
}

export function UniversalManualViewer({ manualIdOverride }: UniversalManualViewerProps) {
  const { manualId: paramManualId } = useParams<{ manualId: string }>();
  const manualId = manualIdOverride || paramManualId;
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeSectionId: null as string | null,
      activeChapterId: null as string | null,
      completedSections: [] as string[],
      searchTerm: '',
    },
  });

  const { data: tocData, isLoading: tocLoading } = useManualTableOfContents(manualId);
  const { data: sectionData, isLoading: sectionLoading } = useManualSection(
    manualId, 
    tabState.activeSectionId || undefined
  );

  const chapters = tocData ? groupSectionsIntoChapters(tocData) : [];
  const metadata = manualId ? MANUAL_METADATA[manualId] : null;
  const completedSet = new Set(tabState.completedSections);

  // Auto-select first section if none selected
  useEffect(() => {
    if (tocData && tocData.length > 0 && !tabState.activeSectionId) {
      const firstSection = tocData[0];
      setTabState({ 
        activeSectionId: firstSection.section_id,
        activeChapterId: firstSection.chapter_id 
      });
    }
  }, [tocData, tabState.activeSectionId, setTabState]);

  // Mark section as completed when viewed
  useEffect(() => {
    if (tabState.activeSectionId && !completedSet.has(tabState.activeSectionId)) {
      // Mark as completed after 5 seconds of viewing
      const timer = setTimeout(() => {
        setTabState({
          completedSections: [...tabState.completedSections, tabState.activeSectionId!]
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [tabState.activeSectionId, tabState.completedSections, completedSet, setTabState]);

  const handleSectionClick = (sectionId: string, chapterId: string) => {
    setTabState({ activeSectionId: sectionId, activeChapterId: chapterId });
  };

  const navigateSection = (direction: 'prev' | 'next') => {
    if (!tocData || !tabState.activeSectionId) return;
    
    const currentIndex = tocData.findIndex(s => s.section_id === tabState.activeSectionId);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < tocData.length) {
      const newSection = tocData[newIndex];
      setTabState({ 
        activeSectionId: newSection.section_id,
        activeChapterId: newSection.chapter_id 
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!manualId) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Manual Selected</h2>
        <p className="text-muted-foreground">Please select a manual from the library.</p>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "border-r bg-muted/30 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        {/* Manual Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{metadata?.icon || '📖'}</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm truncate">
                {metadata?.title || manualId}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {metadata?.description}
              </p>
            </div>
          </div>
        </div>

        {/* TOC */}
        <ManualTableOfContents
          chapters={chapters}
          activeSectionId={tabState.activeSectionId}
          completedSections={completedSet}
          onSectionClick={handleSectionClick}
          isLoading={tocLoading}
          searchTerm={tabState.searchTerm}
          onSearchChange={(term) => setTabState({ searchTerm: term })}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateSection('prev')}
              disabled={!tocData || tocData.findIndex(s => s.section_id === tabState.activeSectionId) <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateSection('next')}
              disabled={!tocData || tocData.findIndex(s => s.section_id === tabState.activeSectionId) >= tocData.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-8">
            {sectionLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-32 w-full mt-6" />
              </div>
            ) : sectionData ? (
              <ManualSectionRenderer
                content={sectionData.content_markdown}
                title={sectionData.title}
                readTimeMinutes={sectionData.read_time_minutes}
              />
            ) : tocData && tocData.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
                <p className="text-muted-foreground">
                  This manual has not been migrated to the streaming format yet.
                </p>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Select a section from the sidebar</p>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
