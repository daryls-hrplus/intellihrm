import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ResumptionOfDuty {
  id: string;
  leave_request_id: string;
  employee_id: string;
  company_id: string;
  leave_end_date: string;
  actual_resumption_date: string | null;
  form_created_at: string;
  form_submitted_at: string | null;
  status: 'pending_employee' | 'pending_manager' | 'verified' | 'rejected' | 'overdue' | 'no_show';
  employee_notes: string | null;
  fit_to_work: boolean;
  requires_medical_clearance: boolean;
  medical_clearance_file_path: string | null;
  medical_clearance_uploaded_at: string | null;
  medical_clearance_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  leave_requests?: {
    id: string;
    request_number: string;
    start_date: string;
    end_date: string;
    duration: number;
    leave_types?: {
      id: string;
      name: string;
      code: string;
    };
  };
  verifier?: {
    id: string;
    full_name: string;
  };
}

export function useResumptionOfDuty() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get employee's own RODs
  const { data: myRods, isLoading: myRodsLoading } = useQuery({
    queryKey: ['my-resumption-of-duty', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('resumption_of_duty')
        .select(`
          *,
          leave_requests (
            id,
            request_number,
            start_date,
            end_date,
            duration,
            leave_types (
              id,
              name,
              code
            )
          )
        `)
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ResumptionOfDuty[];
    },
    enabled: !!user?.id
  });

  // Get pending RODs for employee action
  const pendingForEmployee = myRods?.filter(rod => 
    rod.status === 'pending_employee' || rod.status === 'rejected'
  ) || [];

  return {
    myRods,
    myRodsLoading,
    pendingForEmployee
  };
}

export function useTeamResumptionOfDuty() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get team RODs for manager
  const { data: teamRods, isLoading: teamRodsLoading } = useQuery({
    queryKey: ['team-resumption-of-duty', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get direct reports first
      const { data: directReports, error: reportsError } = await supabase
        .rpc('get_manager_direct_reports', { p_manager_id: user.id });

      if (reportsError) throw reportsError;
      if (!directReports || directReports.length === 0) return [];

      const employeeIds = directReports.map((r: { employee_id: string }) => r.employee_id);

      const { data, error } = await supabase
        .from('resumption_of_duty')
        .select(`
          *,
          profiles!resumption_of_duty_employee_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          ),
          leave_requests (
            id,
            request_number,
            start_date,
            end_date,
            duration,
            leave_types (
              id,
              name,
              code
            )
          )
        `)
        .in('employee_id', employeeIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ResumptionOfDuty[];
    },
    enabled: !!user?.id
  });

  // Get RODs pending manager verification
  const pendingVerification = teamRods?.filter(rod => 
    rod.status === 'pending_manager'
  ) || [];

  // Get overdue/no-show RODs
  const overdueRods = teamRods?.filter(rod => 
    rod.status === 'overdue' || rod.status === 'no_show'
  ) || [];

  return {
    teamRods,
    teamRodsLoading,
    pendingVerification,
    overdueRods
  };
}

export function useRODMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Submit ROD form (employee)
  const submitRod = useMutation({
    mutationFn: async ({
      rodId,
      employeeNotes,
      fitToWork,
      actualResumptionDate,
      medicalClearanceFilePath,
      medicalClearanceNotes
    }: {
      rodId: string;
      employeeNotes?: string;
      fitToWork: boolean;
      actualResumptionDate: string;
      medicalClearanceFilePath?: string;
      medicalClearanceNotes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status: 'pending_manager',
        employee_notes: employeeNotes,
        fit_to_work: fitToWork,
        actual_resumption_date: actualResumptionDate,
        form_submitted_at: new Date().toISOString()
      };

      if (medicalClearanceFilePath) {
        updateData.medical_clearance_file_path = medicalClearanceFilePath;
        updateData.medical_clearance_uploaded_at = new Date().toISOString();
      }
      if (medicalClearanceNotes) {
        updateData.medical_clearance_notes = medicalClearanceNotes;
      }

      const { data, error } = await supabase
        .from('resumption_of_duty')
        .update(updateData)
        .eq('id', rodId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumption-of-duty'] });
      queryClient.invalidateQueries({ queryKey: ['team-resumption-of-duty'] });
      toast.success('Resumption of Duty submitted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to submit: ${error.message}`);
    }
  });

  // Verify ROD (manager)
  const verifyRod = useMutation({
    mutationFn: async ({
      rodId,
      verificationNotes
    }: {
      rodId: string;
      verificationNotes?: string;
    }) => {
      // First verify the ROD
      const { data: rod, error: updateError } = await supabase
        .from('resumption_of_duty')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_notes: verificationNotes
        })
        .eq('id', rodId)
        .select('leave_request_id')
        .single();

      if (updateError) throw updateError;

      // Update the leave request status to 'resumed'
      const { error: leaveError } = await supabase
        .from('leave_requests')
        .update({ status: 'resumed' })
        .eq('id', rod.leave_request_id);

      if (leaveError) {
        console.error('Failed to update leave request status:', leaveError);
      }

      return rod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumption-of-duty'] });
      queryClient.invalidateQueries({ queryKey: ['team-resumption-of-duty'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Resumption verified successfully');
    },
    onError: (error) => {
      toast.error(`Failed to verify: ${error.message}`);
    }
  });

  // Reject ROD (manager)
  const rejectRod = useMutation({
    mutationFn: async ({
      rodId,
      rejectionReason
    }: {
      rodId: string;
      rejectionReason: string;
    }) => {
      const { data, error } = await supabase
        .from('resumption_of_duty')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', rodId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumption-of-duty'] });
      queryClient.invalidateQueries({ queryKey: ['team-resumption-of-duty'] });
      toast.success('Resumption returned to employee');
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    }
  });

  return {
    submitRod,
    verifyRod,
    rejectRod
  };
}
