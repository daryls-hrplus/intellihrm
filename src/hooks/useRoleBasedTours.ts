import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tour, HelpTooltip } from '@/types/tours';

/**
 * Hook to filter tours and tooltips based on user's current roles.
 * Tours/tooltips with empty target_roles array are shown to everyone.
 * Tours/tooltips with specific target_roles only show if user has at least one matching role.
 */
export function useRoleBasedTours() {
  const { roles } = useAuth();

  /**
   * Check if user's roles match the target roles for a tour/tooltip
   * @param targetRoles - Array of role codes the content is targeted to
   * @returns true if user should see the content
   */
  const matchesUserRole = useCallback((targetRoles: string[] | null): boolean => {
    // If no target roles specified, show to everyone
    if (!targetRoles || targetRoles.length === 0) {
      return true;
    }
    
    // Check if user has any of the target roles
    return roles.some(userRole => targetRoles.includes(userRole));
  }, [roles]);

  /**
   * Filter tours to only show those matching user's roles
   */
  const filterToursByRole = useCallback(<T extends Pick<Tour, 'target_roles'>>(tours: T[]): T[] => {
    return tours.filter(tour => matchesUserRole(tour.target_roles));
  }, [matchesUserRole]);

  /**
   * Filter tooltips to only show those matching user's roles
   */
  const filterTooltipsByRole = useCallback(<T extends Pick<HelpTooltip, 'target_roles'>>(tooltips: T[]): T[] => {
    return tooltips.filter(tooltip => matchesUserRole(tooltip.target_roles));
  }, [matchesUserRole]);

  /**
   * Check if a specific tour is available for the current user
   */
  const canAccessTour = useCallback((tour: Pick<Tour, 'target_roles'> | null): boolean => {
    if (!tour) return false;
    return matchesUserRole(tour.target_roles);
  }, [matchesUserRole]);

  /**
   * Check if a specific tooltip is available for the current user
   */
  const canAccessTooltip = useCallback((tooltip: Pick<HelpTooltip, 'target_roles'> | null): boolean => {
    if (!tooltip) return false;
    return matchesUserRole(tooltip.target_roles);
  }, [matchesUserRole]);

  return {
    userRoles: roles,
    matchesUserRole,
    filterToursByRole,
    filterTooltipsByRole,
    canAccessTour,
    canAccessTooltip,
  };
}
