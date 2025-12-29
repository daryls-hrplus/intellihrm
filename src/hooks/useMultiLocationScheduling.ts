import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BranchLocation {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  is_active: boolean;
}

export interface LocationStaffingRequirement {
  id: string;
  company_id: string;
  location_id: string;
  department_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  minimum_staff: number;
  optimal_staff: number | null;
  required_skills: string[] | null;
  notes: string | null;
  is_active: boolean;
  location?: BranchLocation;
  department?: { name: string };
}

export interface ShiftAssignmentWithLocation {
  id: string;
  employee_id: string;
  shift_id: string;
  location_id: string | null;
  effective_date: string;
  end_date: string | null;
  profile: { full_name: string; avatar_url: string | null } | null;
  shift: { 
    name: string; 
    code: string; 
    color: string;
    start_time: string;
    end_time: string;
  } | null;
  location?: BranchLocation | null;
}

export function useMultiLocationScheduling(companyId: string | null) {
  const queryClient = useQueryClient();

  // Fetch all locations for the company
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['multi-location-locations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('company_branch_locations')
        .select('id, name, code, address, city, is_active')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as BranchLocation[];
    },
    enabled: !!companyId
  });

  // Fetch staffing requirements
  const { data: staffingRequirements = [], isLoading: requirementsLoading } = useQuery({
    queryKey: ['location-staffing-requirements', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('location_staffing_requirements')
        .select(`
          *,
          location:company_branch_locations(id, name, code, address, city, is_active),
          department:departments(name)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('day_of_week');
      if (error) throw error;
      return data as LocationStaffingRequirement[];
    },
    enabled: !!companyId
  });

  // Fetch shift assignments with location data
  const fetchAssignmentsByDateRange = async (startDate: string, endDate: string) => {
    if (!companyId) return [];
    
    const { data, error } = await supabase
      .from('employee_shift_assignments')
      .select(`
        id,
        employee_id,
        shift_id,
        location_id,
        effective_date,
        end_date,
        profile:profiles(full_name, avatar_url),
        shift:shifts(name, code, color, start_time, end_time),
        location:company_branch_locations(id, name, code, address, city, is_active)
      `)
      .eq('company_id', companyId)
      .lte('effective_date', endDate)
      .or(`end_date.is.null,end_date.gte.${startDate}`);
    
    if (error) throw error;
    return data as unknown as ShiftAssignmentWithLocation[];
  };

  // Update assignment location
  const updateAssignmentLocation = useMutation({
    mutationFn: async ({ assignmentId, locationId }: { assignmentId: string; locationId: string | null }) => {
      const { error } = await supabase
        .from('employee_shift_assignments')
        .update({ location_id: locationId })
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multi-location-assignments'] });
      toast.success('Assignment location updated');
    },
    onError: () => {
      toast.error('Failed to update location');
    }
  });

  // Create staffing requirement
  const createStaffingRequirement = useMutation({
    mutationFn: async (requirement: Omit<LocationStaffingRequirement, 'id' | 'location' | 'department'>) => {
      const { error } = await supabase
        .from('location_staffing_requirements')
        .insert(requirement);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-staffing-requirements'] });
      toast.success('Staffing requirement created');
    },
    onError: () => {
      toast.error('Failed to create requirement');
    }
  });

  // Delete staffing requirement
  const deleteStaffingRequirement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('location_staffing_requirements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-staffing-requirements'] });
      toast.success('Staffing requirement deleted');
    },
    onError: () => {
      toast.error('Failed to delete requirement');
    }
  });

  // Calculate coverage for a location on a specific day
  const calculateCoverage = (locationId: string, dayOfWeek: number, assignments: ShiftAssignmentWithLocation[]) => {
    const requirements = staffingRequirements.filter(
      r => r.location_id === locationId && r.day_of_week === dayOfWeek
    );
    
    const locationAssignments = assignments.filter(a => a.location_id === locationId);
    const staffCount = locationAssignments.length;
    
    const totalMinimum = requirements.reduce((sum, r) => sum + r.minimum_staff, 0);
    const totalOptimal = requirements.reduce((sum, r) => sum + (r.optimal_staff || r.minimum_staff), 0);
    
    return {
      current: staffCount,
      minimum: totalMinimum,
      optimal: totalOptimal,
      status: staffCount >= totalOptimal ? 'optimal' : staffCount >= totalMinimum ? 'adequate' : 'understaffed'
    };
  };

  return {
    locations,
    staffingRequirements,
    isLoading: locationsLoading || requirementsLoading,
    fetchAssignmentsByDateRange,
    updateAssignmentLocation: updateAssignmentLocation.mutate,
    createStaffingRequirement: createStaffingRequirement.mutate,
    deleteStaffingRequirement: deleteStaffingRequirement.mutate,
    calculateCoverage
  };
}
