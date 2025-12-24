import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTourContext } from './TourProvider';
import { useTour } from '@/hooks/useTour';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';

interface FirstTimeUserDetectorProps {
  moduleCode: string;
  featureCode?: string;
  tourCode?: string;
  delay?: number;
}

export function FirstTimeUserDetector({
  moduleCode,
  featureCode,
  tourCode,
  delay = 1500,
}: FirstTimeUserDetectorProps) {
  const location = useLocation();
  const { startTour, isRunning } = useTourContext();
  const { getAutoTriggerTours } = useTour();
  const { isFirstTime, isLoading, markTourTriggered } = useFirstTimeUser({
    moduleCode,
    featureCode,
  });
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Reset trigger flag when location changes
    hasTriggeredRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (isLoading || !isFirstTime || isRunning || hasTriggeredRef.current) {
      return;
    }

    // Find tour to trigger
    let tourToStart = tourCode;
    
    if (!tourToStart) {
      const autoTriggerTours = getAutoTriggerTours(location.pathname, moduleCode);
      if (autoTriggerTours.length > 0) {
        // Pick highest priority (lowest number) tour
        tourToStart = autoTriggerTours[0].tour_code;
      }
    }

    if (!tourToStart) {
      return;
    }

    // Delay before starting tour to let page render
    const timer = setTimeout(async () => {
      if (!hasTriggeredRef.current && !isRunning) {
        hasTriggeredRef.current = true;
        await markTourTriggered();
        startTour(tourToStart!);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [
    isFirstTime, 
    isLoading, 
    isRunning, 
    tourCode, 
    moduleCode, 
    location.pathname,
    delay,
    getAutoTriggerTours,
    startTour,
    markTourTriggered,
  ]);

  // This component doesn't render anything
  return null;
}
