import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManualChapter } from '@/hooks/useManualContent';

interface ManualTableOfContentsProps {
  chapters: ManualChapter[];
  activeSectionId: string | null;
  completedSections?: Set<string>;
  onSectionClick: (sectionId: string, chapterId: string) => void;
  isLoading?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function ManualTableOfContents({
  chapters,
  activeSectionId,
  completedSections = new Set(),
  onSectionClick,
  isLoading,
  searchTerm = '',
  onSearchChange,
}: ManualTableOfContentsProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map(c => c.chapter_id))
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const getTotalReadTime = () => {
    return chapters.reduce((total, chapter) => 
      total + chapter.sections.reduce((chapterTotal, section) => 
        chapterTotal + (section.read_time_minutes || 0), 0
      ), 0
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="pl-4 space-y-1">
              {[1, 2].map(j => (
                <div key={j} className="h-6 bg-muted/50 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      {onSearchChange && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{getTotalReadTime()} min total</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4" />
          <span>{completedSections.size} / {chapters.reduce((t, c) => t + c.sections.length, 0)} sections</span>
        </div>
      </div>

      {/* Chapter Tree */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {chapters.map((chapter) => (
            <div key={chapter.chapter_id} className="mb-1">
              {/* Chapter Header */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 font-medium text-left h-auto py-2"
                onClick={() => toggleChapter(chapter.chapter_id)}
              >
                {expandedChapters.has(chapter.chapter_id) ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{chapter.title || `Chapter ${chapter.chapter_order + 1}`}</span>
              </Button>

              {/* Sections */}
              {expandedChapters.has(chapter.chapter_id) && (
                <div className="ml-4 border-l pl-2 space-y-0.5">
                  {chapter.sections
                    .filter(s => s.parent_section_id !== null || chapter.sections.length === 1)
                    .map((section) => (
                      <Button
                        key={section.section_id}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left h-auto py-1.5 px-2 font-normal",
                          activeSectionId === section.section_id && "bg-primary/10 text-primary",
                          completedSections.has(section.section_id) && "text-muted-foreground"
                        )}
                        onClick={() => onSectionClick(section.section_id, chapter.chapter_id)}
                      >
                        <div className="flex items-start gap-2 w-full">
                          {completedSections.has(section.section_id) ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm leading-snug">{section.title}</span>
                        </div>
                      </Button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
