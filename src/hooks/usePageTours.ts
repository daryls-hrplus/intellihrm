import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTour } from './useTour';
import { Tour } from '@/types/tours';

interface PageToursResult {
  availableTours: Tour[];
  uncompletedTours: Tour[];
  hasUncompletedTours: boolean;
  isLoading: boolean;
}

export function usePageTours(): PageToursResult {
  const location = useLocation();
  const { tours, hasCompletedTour, isLoading } = useTour();

  const availableTours = useMemo(() => {
    const currentPath = location.pathname;
    const currentPathSegments = currentPath.split('/').filter(Boolean);
    const currentLastSegment = currentPathSegments[currentPathSegments.length - 1];
    
    return tours.filter(tour => {
      // Match by exact trigger_route
      if (tour.trigger_route === currentPath) return true;
      
      // Match by last segment of path (e.g., /admin/company-groups and /workforce/company-groups both match trigger_route /workforce/company-groups)
      if (tour.trigger_route) {
        const triggerSegments = tour.trigger_route.split('/').filter(Boolean);
        const triggerLastSegment = triggerSegments[triggerSegments.length - 1];
        if (triggerLastSegment && triggerLastSegment === currentLastSegment) return true;
      }
      
      // Match by module_code in path
      if (tour.module_code && currentPath.includes(tour.module_code)) return true;
      
      // Match partial path (e.g., /workforce/company-groups matches trigger_route /workforce)
      if (tour.trigger_route && currentPath.startsWith(tour.trigger_route)) return true;
      
      return false;
    });
  }, [tours, location.pathname]);

  const uncompletedTours = useMemo(() => {
    return availableTours.filter(tour => !hasCompletedTour(tour.tour_code));
  }, [availableTours, hasCompletedTour]);

  return {
    availableTours,
    uncompletedTours,
    hasUncompletedTours: uncompletedTours.length > 0,
    isLoading,
  };
}
