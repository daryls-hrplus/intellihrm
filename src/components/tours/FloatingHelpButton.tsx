import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Sparkles, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTourContext } from './TourProvider';
import { useTour } from '@/hooks/useTour';

interface FloatingHelpButtonProps {
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'floating-help-button-position';

export function FloatingHelpButton({ className }: FloatingHelpButtonProps) {
  const location = useLocation();
  const { openHelpPanel, isHelpPanelOpen } = useTourContext();
  const { tours, hasCompletedTour } = useTour();
  const [hasUncompletedTours, setHasUncompletedTours] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; buttonX: number; buttonY: number } | null>(null);

  // Load saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
        setHasMoved(true);
      } catch {
        // Use default position
      }
    }
  }, []);

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
    };
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    const newX = dragStartRef.current.buttonX + deltaX;
    const newY = dragStartRef.current.buttonY + deltaY;

    // Constrain to viewport
    const buttonSize = 56; // h-14 w-14 = 3.5rem = 56px
    const padding = 16;
    const maxX = window.innerWidth - buttonSize - padding;
    const maxY = window.innerHeight - buttonSize - padding;

    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    });
    setHasMoved(true);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && hasMoved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
    setIsDragging(false);
    dragStartRef.current = null;
  }, [isDragging, hasMoved, position]);

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
    };
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    
    const newX = dragStartRef.current.buttonX + deltaX;
    const newY = dragStartRef.current.buttonY + deltaY;

    const buttonSize = 56;
    const padding = 16;
    const maxX = window.innerWidth - buttonSize - padding;
    const maxY = window.innerHeight - buttonSize - padding;

    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    });
    setHasMoved(true);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging && hasMoved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
    setIsDragging(false);
    dragStartRef.current = null;
  }, [isDragging, hasMoved, position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const handleClick = () => {
    // Only open panel if we haven't been dragging
    if (!isDragging) {
      openHelpPanel();
    }
  };

  const buttonStyle: React.CSSProperties = hasMoved
    ? {
        position: 'fixed',
        left: position.x,
        top: position.y,
        right: 'auto',
        bottom: 'auto',
      }
    : {};

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={buttonRef}
            variant="default"
            size="icon"
            style={buttonStyle}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg group",
              "transition-all duration-300 z-50",
              !hasMoved && "fixed bottom-6 right-6",
              !isVisible && !hasMoved && "translate-y-20 opacity-0",
              isHelpPanelOpen && "scale-90",
              isDragging && "cursor-grabbing scale-110 shadow-2xl",
              !isDragging && "cursor-grab",
              className
            )}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="relative flex items-center justify-center">
              <GripVertical className="h-3 w-3 absolute -left-1 opacity-0 group-hover:opacity-50 transition-opacity" />
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
          <span className="text-xs text-muted-foreground ml-1">• Drag to move</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
