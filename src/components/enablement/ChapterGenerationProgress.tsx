// Progress display for chapter-by-chapter generation
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  Square,
  RefreshCw 
} from "lucide-react";
import { ChapterInfo, ChapterGenerationProgress as ProgressType } from "@/hooks/useChapterGeneration";

interface ChapterGenerationProgressProps {
  chapters: ChapterInfo[];
  progress: ProgressType;
  onCancel: () => void;
  onRetryFailed: () => void;
}

export function ChapterGenerationProgress({
  chapters,
  progress,
  onCancel,
  onRetryFailed
}: ChapterGenerationProgressProps) {
  const completedCount = progress.completedChapters.length;
  const failedCount = progress.failedChapters.length;
  const totalToGenerate = chapters.length; // Use passed chapters length for partial selection
  const progressPercent = totalToGenerate > 0 
    ? Math.round((completedCount / totalToGenerate) * 100)
    : 0;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Chapter Generation</h4>
          <p className="text-sm text-muted-foreground">
            {progress.isGenerating 
              ? `Generating chapter ${progress.currentChapter || '...'}`
              : completedCount === progress.totalChapters && failedCount === 0
                ? 'All chapters complete!'
                : failedCount > 0
                  ? `${failedCount} chapter(s) failed`
                  : 'Ready to generate'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {failedCount > 0 && !progress.isGenerating && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onRetryFailed}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Failed
            </Button>
          )}
          {progress.isGenerating && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={onCancel}
            >
              <Square className="mr-2 h-3 w-3" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>{completedCount} of {totalToGenerate} chapters</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Chapter List */}
      <ScrollArea className="h-[200px]">
        <div className="space-y-1">
          {chapters.map((chapter) => {
            const status = progress.chapterStatuses[chapter.chapterNumber];
            
            return (
              <div 
                key={chapter.chapterNumber}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50"
              >
                {/* Status Icon */}
                {status?.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : status?.status === 'failed' ? (
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                ) : status?.status === 'generating' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}

                {/* Chapter Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Ch. {chapter.chapterNumber}
                    </Badge>
                    <span className="text-sm truncate">{chapter.title}</span>
                  </div>
                  {status?.error && (
                    <p className="text-xs text-destructive mt-1 truncate">
                      {status.error}
                    </p>
                  )}
                </div>

                {/* Section Count */}
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {chapter.sectionCount} section{chapter.sectionCount !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
