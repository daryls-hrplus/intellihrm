import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTourContext } from './TourProvider';
import { useTour } from '@/hooks/useTour';

interface FloatingHelpButtonProps {
  className?: string;
}

export function FloatingHelpButton({ className }: FloatingHelpButtonProps) {
  const location = useLocation();
  const { openHelpPanel, isHelpPanelOpen } = useTourContext();
  const { tours, hasCompletedTour } = useTour();
  const [hasUncompletedTours, setHasUncompletedTours] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check if there are uncompleted tours for current module
  useEffect(() => {
    const currentPath = location.pathname;
    const moduleTours = tours.filter(t => 
      t.trigger_route === currentPath || 
      currentPath.includes(t.module_code)
    );
    
    const uncompleted = moduleTours.some(t => !hasCompletedTour(t.tour_code));
    setHasUncompletedTours(uncompleted);
  }, [location.pathname, tours, hasCompletedTour]);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className={cn(
              "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
              "transition-all duration-300 z-50",
              !isVisible && "translate-y-20 opacity-0",
              isHelpPanelOpen && "scale-90",
              className
            )}
            onClick={openHelpPanel}
          >
            <div className="relative">
              <HelpCircle className="h-6 w-6" />
              {hasUncompletedTours && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                  <Sparkles className="relative inline-flex rounded-full h-3 w-3 text-primary-foreground" />
                </span>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="flex items-center gap-2">
          <span>Help & Tours</span>
          {hasUncompletedTours && (
            <span className="text-xs text-muted-foreground">(New tours available)</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
