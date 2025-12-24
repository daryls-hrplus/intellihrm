import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTourContext } from './TourProvider';
import { usePageTours } from '@/hooks/usePageTours';

interface PageTourPromptProps {
  className?: string;
}

export function PageTourPrompt({ className }: PageTourPromptProps) {
  const { startTour } = useTourContext();
  const { uncompletedTours, hasUncompletedTours, isLoading } = usePageTours();
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissedTours, setDismissedTours] = useState<Set<string>>(new Set());

  // Load dismissed tours from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('dismissed_tour_prompts');
    if (stored) {
      setDismissedTours(new Set(JSON.parse(stored)));
    }
  }, []);

  // Get the first uncompleted tour that hasn't been dismissed
  const activeTour = uncompletedTours.find(
    tour => !dismissedTours.has(tour.tour_code)
  );

  const handleDismiss = () => {
    if (activeTour) {
      const newDismissed = new Set(dismissedTours);
      newDismissed.add(activeTour.tour_code);
      setDismissedTours(newDismissed);
      sessionStorage.setItem(
        'dismissed_tour_prompts',
        JSON.stringify([...newDismissed])
      );
    }
    setIsDismissed(true);
  };

  const handleStartTour = () => {
    if (activeTour) {
      startTour(activeTour.tour_code);
    }
  };

  // Don't show if loading, no tours, or dismissed
  if (isLoading || !hasUncompletedTours || !activeTour) {
    return null;
  }

  // Estimate duration (convert seconds to minutes, default 2 min if not specified)
  const estimatedMinutes = activeTour.estimated_duration_seconds 
    ? Math.ceil(activeTour.estimated_duration_seconds / 60) 
    : 2;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg border",
        "bg-primary/5 border-primary/20",
        "animate-in fade-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      <PlayCircle className="h-5 w-5 text-primary shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {activeTour.tour_name}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{estimatedMinutes} min</span>
          {activeTour.description && (
            <>
              <span>•</span>
              <span className="truncate">{activeTour.description}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="default"
          size="sm"
          onClick={handleStartTour}
          className="gap-1.5"
        >
          <PlayCircle className="h-4 w-4" />
          Take Tour
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}
