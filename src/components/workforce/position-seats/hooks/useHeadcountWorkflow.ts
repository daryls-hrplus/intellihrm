import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkflow, WorkflowInstance, WorkflowStepAction } from '@/hooks/useWorkflow';
import { toast } from 'sonner';
import type { HeadcountChangeRequest } from '../types';

export interface HeadcountRequestWithWorkflow extends HeadcountChangeRequest {
  workflow_instance_id: string | null;
  workflow_instance?: WorkflowInstance | null;
  workflow_actions?: WorkflowStepAction[];
  current_step_name?: string;
  pending_approver?: {
    id: string;
    full_name: string;
  } | null;
}

export function useHeadcountWorkflow(companyId: string | null) {
  const { user, profile } = useAuth();
  const { startWorkflow, takeAction, getWorkflowInstance, getWorkflowHistory, isLoading: workflowLoading } = useWorkflow();
  const [requests, setRequests] = useState<HeadcountRequestWithWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('headcount_change_requests')
        .select(`
          *,
          position:positions(
            title,
            code,
            department:departments(name)
          ),
          requester:profiles!headcount_change_requests_requested_by_fkey(
            full_name,
            email
          ),
          reviewer:profiles!headcount_change_requests_reviewed_by_fkey(
            full_name,
            email
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with workflow data
      const enrichedRequests = await Promise.all(
        (data || []).map(async (request: any) => {
          const typedRequest = request as HeadcountRequestWithWorkflow;
          
          if (typedRequest.workflow_instance_id) {
            try {
              const instance = await getWorkflowInstance(typedRequest.workflow_instance_id);
              const actions = await getWorkflowHistory(typedRequest.workflow_instance_id);
              
              return {
                ...typedRequest,
                workflow_instance: instance,
                workflow_actions: actions,
                current_step_name: instance?.current_step?.name,
              };
            } catch (err) {
              console.error('Error fetching workflow data:', err);
            }
          }
          
          return typedRequest;
        })
      );

      setRequests(enrichedRequests);
    } catch (err) {
      console.error('Error fetching headcount requests:', err);
      toast.error('Failed to load headcount requests');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, getWorkflowInstance, getWorkflowHistory]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`headcount_workflow_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'headcount_change_requests',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          fetchRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_instances'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, fetchRequests]);

  // Submit a new headcount request with workflow
  const submitRequest = async (data: Partial<HeadcountChangeRequest>): Promise<boolean> => {
    try {
      // Create the request
      const { data: newRequest, error } = await supabase
        .from('headcount_change_requests')
        .insert({
          ...data,
          status: 'PENDING',
          requested_by: user?.id,
          requested_at: new Date().toISOString(),
          company_id: companyId,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Start the workflow
      const instance = await startWorkflow(
        'HEADCOUNT_CHANGE',
        'headcount_change_requests',
        newRequest.id,
        {
          request_type: data.request_type,
          change_amount: data.change_amount,
          position_id: data.position_id,
          effective_date: data.effective_date,
        }
      );

      if (instance) {
        // Link workflow instance to request
        await supabase
          .from('headcount_change_requests')
          .update({ workflow_instance_id: instance.id } as any)
          .eq('id', newRequest.id);
      }

      toast.success('Headcount change request submitted for approval');
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error('Failed to submit request');
      return false;
    }
  };

  // Approve a request through workflow
  const approveRequest = async (
    requestId: string,
    comment?: string
  ): Promise<boolean> => {
    const request = requests.find(r => r.id === requestId);
    if (!request?.workflow_instance_id) {
      toast.error('No workflow found for this request');
      return false;
    }

    try {
      const result = await takeAction(
        request.workflow_instance_id,
        'approve',
        { comment }
      );

      if (result) {
        // Update request status based on workflow status
        const instance = await getWorkflowInstance(request.workflow_instance_id);
        if (instance?.status === 'approved') {
          await supabase
            .from('headcount_change_requests')
            .update({ 
              status: 'APPROVED',
              reviewed_by: user?.id,
              reviewed_at: new Date().toISOString(),
              review_notes: comment,
            })
            .eq('id', requestId);
        } else {
          // Still in progress (more approvals needed)
          await supabase
            .from('headcount_change_requests')
            .update({ 
              status: 'UNDER_REVIEW',
              approval_level: instance?.current_step_order || 1,
            })
            .eq('id', requestId);
        }

        toast.success('Request approved');
        await fetchRequests();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error('Failed to approve request');
      return false;
    }
  };

  // Reject a request through workflow
  const rejectRequest = async (
    requestId: string,
    reason: string
  ): Promise<boolean> => {
    const request = requests.find(r => r.id === requestId);
    if (!request?.workflow_instance_id) {
      toast.error('No workflow found for this request');
      return false;
    }

    try {
      const result = await takeAction(
        request.workflow_instance_id,
        'reject',
        { comment: reason }
      );

      if (result) {
        await supabase
          .from('headcount_change_requests')
          .update({ 
            status: 'REJECTED',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            review_notes: reason,
          })
          .eq('id', requestId);

        toast.success('Request rejected');
        await fetchRequests();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error('Failed to reject request');
      return false;
    }
  };

  // Return a request for revision
  const returnRequest = async (
    requestId: string,
    reason: string
  ): Promise<boolean> => {
    const request = requests.find(r => r.id === requestId);
    if (!request?.workflow_instance_id) {
      toast.error('No workflow found for this request');
      return false;
    }

    try {
      const result = await takeAction(
        request.workflow_instance_id,
        'return',
        { 
          comment: reason,
          returnReason: reason,
          returnToStep: 1 
        }
      );

      if (result) {
        await supabase
          .from('headcount_change_requests')
          .update({ 
            status: 'PENDING',
            review_notes: reason,
          })
          .eq('id', requestId);

        toast.success('Request returned for revision');
        await fetchRequests();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error returning request:', err);
      toast.error('Failed to return request');
      return false;
    }
  };

  // Check if current user can approve
  const canUserApprove = useCallback((request: HeadcountRequestWithWorkflow): boolean => {
    if (!user || !request.workflow_instance) return false;
    
    const instance = request.workflow_instance;
    if (instance.status !== 'pending' && instance.status !== 'in_progress') return false;
    
    // Check if user is the current approver
    // This would need to be enhanced based on the step's approver configuration
    return true; // Simplified - actual implementation should check step approver
  }, [user]);

  // Execute approved request - creates/removes seats
  const executeRequest = async (requestId: string): Promise<boolean> => {
    const request = requests.find(r => r.id === requestId);
    if (!request || request.status !== 'APPROVED') {
      toast.error('Request must be approved before execution');
      return false;
    }

    try {
      // Execute the headcount change by creating/removing seats
      if (request.request_type === 'INCREASE') {
        // Create new seats
        const newSeats = [];
        for (let i = 0; i < request.change_amount; i++) {
          newSeats.push({
            position_id: request.position_id,
            seat_number: request.requested_headcount - request.change_amount + i + 1,
            seat_code: `${request.position?.code || 'SEAT'}-${request.requested_headcount - request.change_amount + i + 1}`,
            status: 'APPROVED',
            approved_date: new Date().toISOString().split('T')[0],
          });
        }

        const { error: insertError } = await supabase
          .from('position_seats')
          .insert(newSeats);

        if (insertError) throw insertError;

        // Update position headcount
        await supabase
          .from('positions')
          .update({ 
            headcount: request.requested_headcount,
            authorized_headcount: request.requested_headcount
          })
          .eq('id', request.position_id);

      } else if (request.request_type === 'DECREASE') {
        // Mark seats as eliminated (from affected_seats array)
        if (request.affected_seats && request.affected_seats.length > 0) {
          const { error: updateError } = await supabase
            .from('position_seats')
            .update({ 
              status: 'ELIMINATED',
              eliminated_date: new Date().toISOString().split('T')[0],
              elimination_reason: request.business_justification,
              elimination_approved_by: user?.id
            })
            .in('id', request.affected_seats);

          if (updateError) throw updateError;
        }

        // Update position headcount
        await supabase
          .from('positions')
          .update({ 
            headcount: request.requested_headcount,
            authorized_headcount: request.requested_headcount
          })
          .eq('id', request.position_id);
      }

      // Mark request as executed
      await supabase
        .from('headcount_change_requests')
        .update({ 
          status: 'EXECUTED',
          executed_at: new Date().toISOString(),
          executed_by: user?.id,
        })
        .eq('id', requestId);

      toast.success('Headcount change executed successfully');
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error executing request:', err);
      toast.error('Failed to execute headcount change');
      return false;
    }
  };

  // Get workflow history/timeline for a request
  const getRequestTimeline = useCallback(async (requestId: string): Promise<any[]> => {
    const request = requests.find(r => r.id === requestId);
    const instanceId = request?.workflow_instance_id;
    if (!instanceId) return [];

    try {
      // Use workflow_step_actions as audit trail
      const result = await supabase
        .from('workflow_step_actions')
        .select('id, action, comment, acted_at, actor_id')
        .eq('instance_id', instanceId)
        .order('acted_at', { ascending: true });

      if (result.error) throw result.error;
      
      // Map to timeline format
      return (result.data || []).map((item: any) => ({
        id: item.id,
        event_type: item.action,
        comment: item.comment,
        created_at: item.acted_at,
      }));
    } catch (err) {
      console.error('Error fetching timeline:', err);
      return [];
    }
  }, [requests]);

  return {
    requests,
    isLoading: isLoading || workflowLoading,
    refetch: fetchRequests,
    submitRequest,
    approveRequest,
    rejectRequest,
    returnRequest,
    executeRequest,
    canUserApprove,
    getRequestTimeline,
  };
}
