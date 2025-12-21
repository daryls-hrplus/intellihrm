import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  EnablementArtifact, 
  CreateArtifactInput, 
  UpdateArtifactInput,
  ArtifactApproval,
  ArtifactStatus,
  ArtifactStep 
} from '@/types/artifact';
import type { Json } from '@/integrations/supabase/types';

// Helper to transform database row to typed artifact
function transformArtifact(row: any): EnablementArtifact {
  return {
    ...row,
    learning_objective: Array.isArray(row.learning_objective) ? row.learning_objective : [],
    preconditions: Array.isArray(row.preconditions) ? row.preconditions : [],
    steps: Array.isArray(row.steps) ? row.steps as ArtifactStep[] : [],
    expected_outcomes: Array.isArray(row.expected_outcomes) ? row.expected_outcomes : [],
    ui_routes: Array.isArray(row.ui_routes) ? row.ui_routes : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    role_scope: Array.isArray(row.role_scope) ? row.role_scope : []
  };
}

// Helper to transform input for database
function transformInputForDb(input: Partial<CreateArtifactInput | UpdateArtifactInput>): Record<string, any> {
  const result: Record<string, any> = { ...input };
  
  if (input.steps) {
    result.steps = input.steps as unknown as Json;
  }
  if (input.learning_objective) {
    result.learning_objective = input.learning_objective as unknown as Json;
  }
  if (input.preconditions) {
    result.preconditions = input.preconditions as unknown as Json;
  }
  if (input.expected_outcomes) {
    result.expected_outcomes = input.expected_outcomes as unknown as Json;
  }
  
  return result;
}

export function useEnablementArtifacts(filters?: {
  status?: ArtifactStatus;
  moduleId?: string;
  featureId?: string;
  search?: string;
}) {
  const [artifacts, setArtifacts] = useState<EnablementArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchArtifacts = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('enablement_artifacts')
        .select(`
          *,
          module:application_modules(module_code, module_name),
          feature:application_features(feature_code, feature_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.moduleId) {
        query = query.eq('module_id', filters.moduleId);
      }
      if (filters?.featureId) {
        query = query.eq('feature_id', filters.featureId);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setArtifacts((data || []).map(transformArtifact));
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch artifacts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.moduleId, filters?.featureId, filters?.search, toast]);

  const createArtifact = useCallback(async (input: CreateArtifactInput): Promise<EnablementArtifact | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const dbInput = transformInputForDb(input);
      
      const insertData = {
        ...dbInput,
        artifact_id: `ART-${Date.now()}`, // Placeholder, will be replaced by trigger
        created_by: userData.user?.id,
        updated_by: userData.user?.id
      };
      
      const { data, error } = await supabase
        .from('enablement_artifacts')
        .insert(insertData as any)
        .select(`
          *,
          module:application_modules(module_code, module_name),
          feature:application_features(feature_code, feature_name)
        `)
        .single();

      if (error) throw error;

      // Log creation
      await supabase.from('enablement_artifact_approvals').insert({
        artifact_id: data.id,
        action: 'created',
        to_status: 'draft',
        performed_by: userData.user?.id
      });

      toast({
        title: 'Success',
        description: 'Artifact created successfully'
      });

      return transformArtifact(data);
    } catch (error) {
      console.error('Error creating artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to create artifact',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const updateArtifact = useCallback(async (
    id: string, 
    input: UpdateArtifactInput
  ): Promise<EnablementArtifact | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const dbInput = transformInputForDb(input);
      
      const { data, error } = await supabase
        .from('enablement_artifacts')
        .update({
          ...dbInput,
          updated_by: userData.user?.id
        })
        .eq('id', id)
        .select(`
          *,
          module:application_modules(module_code, module_name),
          feature:application_features(feature_code, feature_name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Artifact updated successfully'
      });

      return transformArtifact(data);
    } catch (error) {
      console.error('Error updating artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update artifact',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const submitForReview = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('enablement_artifacts')
        .update({
          status: 'in_review',
          submitted_by: userData.user?.id,
          submitted_at: new Date().toISOString(),
          updated_by: userData.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Submitted',
        description: 'Artifact submitted for review'
      });

      return true;
    } catch (error) {
      console.error('Error submitting artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit artifact',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const approveArtifact = useCallback(async (id: string, notes?: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('enablement_artifacts')
        .update({
          status: 'approved',
          approved_by: userData.user?.id,
          approved_at: new Date().toISOString(),
          review_notes: notes,
          updated_by: userData.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Approved',
        description: 'Artifact approved successfully'
      });

      return true;
    } catch (error) {
      console.error('Error approving artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve artifact',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const publishArtifact = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('enablement_artifacts')
        .update({
          status: 'published',
          published_by: userData.user?.id,
          published_at: new Date().toISOString(),
          updated_by: userData.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Published',
        description: 'Artifact published to Help Center'
      });

      return true;
    } catch (error) {
      console.error('Error publishing artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish artifact',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const deprecateArtifact = useCallback(async (id: string, reason: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('enablement_artifacts')
        .update({
          status: 'deprecated',
          deprecated_by: userData.user?.id,
          deprecated_at: new Date().toISOString(),
          deprecation_reason: reason,
          updated_by: userData.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deprecated',
        description: 'Artifact has been deprecated'
      });

      return true;
    } catch (error) {
      console.error('Error deprecating artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to deprecate artifact',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const deleteArtifact = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('enablement_artifacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Artifact deleted successfully'
      });

      return true;
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete artifact',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  return {
    artifacts,
    isLoading,
    fetchArtifacts,
    createArtifact,
    updateArtifact,
    submitForReview,
    approveArtifact,
    publishArtifact,
    deprecateArtifact,
    deleteArtifact
  };
}

export function useArtifact(id?: string) {
  const [artifact, setArtifact] = useState<EnablementArtifact | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ArtifactApproval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchArtifact = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('enablement_artifacts')
        .select(`
          *,
          module:application_modules(module_code, module_name),
          feature:application_features(feature_code, feature_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtifact(transformArtifact(data));

      // Fetch approval history
      const { data: historyData } = await supabase
        .from('enablement_artifact_approvals')
        .select('*')
        .eq('artifact_id', id)
        .order('created_at', { ascending: false });

      setApprovalHistory(historyData as ArtifactApproval[] || []);
    } catch (error) {
      console.error('Error fetching artifact:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch artifact',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  return {
    artifact,
    approvalHistory,
    isLoading,
    fetchArtifact,
    setArtifact
  };
}
