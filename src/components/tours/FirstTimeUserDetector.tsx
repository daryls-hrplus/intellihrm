import { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTourContext } from './TourProvider';
import { useTour } from '@/hooks/useTour';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';

// Route to module/feature mapping
const ROUTE_MAPPING: Record<string, { moduleCode: string; featureCode?: string }> = {
  '/dashboard': { moduleCode: 'dashboard' },
  '/core-hr': { moduleCode: 'core_hr' },
  '/payroll': { moduleCode: 'payroll' },
  '/recruitment': { moduleCode: 'recruitment' },
  '/performance': { moduleCode: 'performance' },
  '/learning': { moduleCode: 'learning' },
  '/time-attendance': { moduleCode: 'time_attendance' },
  '/benefits': { moduleCode: 'benefits' },
  '/enablement': { moduleCode: 'enablement' },
  '/settings': { moduleCode: 'settings' },
};

function getModuleFromPath(pathname: string): { moduleCode: string; featureCode?: string } | null {
  // Check exact matches first
  if (ROUTE_MAPPING[pathname]) {
    return ROUTE_MAPPING[pathname];
  }
  
  // Check prefix matches
  for (const [route, mapping] of Object.entries(ROUTE_MAPPING)) {
    if (pathname.startsWith(route + '/')) {
      return mapping;
    }
  }
  
  return null;
}

interface FirstTimeUserDetectorProps {
  moduleCode?: string;
  featureCode?: string;
  tourCode?: string;
  delay?: number;
}

export function FirstTimeUserDetector({
  moduleCode: propModuleCode,
  featureCode: propFeatureCode,
  tourCode,
  delay = 1500,
}: FirstTimeUserDetectorProps = {}) {
  const location = useLocation();
  const { startTour, isRunning } = useTourContext();
  const { getAutoTriggerTours } = useTour();
  
  // Derive module from route if not provided
  const routeMapping = useMemo(() => getModuleFromPath(location.pathname), [location.pathname]);
  const moduleCode = propModuleCode || routeMapping?.moduleCode || 'general';
  const featureCode = propFeatureCode || routeMapping?.featureCode;
  
  const { isFirstTime, isLoading, markTourTriggered } = useFirstTimeUser({
    moduleCode,
    featureCode,
  });
  const hasTriggeredRef = useRef(false);
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    // Reset trigger flag when location changes
    if (lastPathRef.current !== location.pathname) {
      hasTriggeredRef.current = false;
      lastPathRef.current = location.pathname;
    }
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
