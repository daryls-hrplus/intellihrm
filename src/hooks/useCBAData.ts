import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CBAArticle {
  id: string;
  agreement_id: string;
  article_number: string;
  title: string;
  content: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clauses?: CBAClause[];
}

export interface CBAClause {
  id: string;
  article_id: string;
  clause_number: string;
  title: string;
  content: string | null;
  clause_type: string | null;
  is_enforceable: boolean;
  rule_parameters: Record<string, any> | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CBAVersion {
  id: string;
  agreement_id: string;
  version_number: number;
  effective_date: string;
  changes_summary: string | null;
  document_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CBANegotiation {
  id: string;
  agreement_id: string | null;
  company_id: string;
  union_id: string;
  title: string;
  session_date: string | null;
  session_time: string | null;
  location: string | null;
  meeting_type: string;
  attendees: any[] | null;
  agenda: string | null;
  outcomes: string | null;
  next_steps: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  unions?: { name: string };
  proposals?: CBAProposal[];
}

export interface CBAProposal {
  id: string;
  negotiation_id: string;
  proposed_by: string;
  proposal_type: string;
  title: string;
  content: string | null;
  affected_articles: string[] | null;
  estimated_cost_impact: number | null;
  cost_justification: string | null;
  status: string;
  response_notes: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface CBAAmendment {
  id: string;
  agreement_id: string;
  amendment_number: string;
  title: string;
  description: string | null;
  effective_date: string;
  expiry_date: string | null;
  content: string | null;
  affected_articles: string[] | null;
  document_url: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface CBARule {
  id: string;
  agreement_id: string;
  clause_id: string | null;
  rule_type: string;
  rule_name: string;
  description: string | null;
  parameters: Record<string, any>;
  applies_to_departments: string[] | null;
  applies_to_positions: string[] | null;
  enforcement_action: string;
  is_active: boolean;
  effective_date: string | null;
  expiry_date: string | null;
  priority: number;
  created_at: string;
  clause?: CBAClause;
}

export interface CBAViolation {
  id: string;
  company_id: string;
  agreement_id: string;
  clause_id: string | null;
  rule_id: string | null;
  violation_date: string;
  detected_at: string;
  description: string;
  severity: string;
  detected_by: string;
  affected_employee_id: string | null;
  related_grievance_id: string | null;
  evidence: any | null;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  affected_employee?: { full_name: string };
  rule?: { rule_name: string };
}

// Hook for CBA Articles
export function useCBAArticles(agreementId: string) {
  return useQuery({
    queryKey: ['cba_articles', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_articles')
        .select('*')
        .eq('agreement_id', agreementId)
        .order('display_order');
      if (error) throw error;
      return data as CBAArticle[];
    },
    enabled: !!agreementId,
  });
}

// Hook for CBA Clauses by Article
export function useCBAClauses(articleId: string) {
  return useQuery({
    queryKey: ['cba_clauses', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_clauses')
        .select('*')
        .eq('article_id', articleId)
        .order('display_order');
      if (error) throw error;
      return data as CBAClause[];
    },
    enabled: !!articleId,
  });
}

// Hook for all Clauses of an Agreement
export function useCBAClausesByAgreement(agreementId: string) {
  return useQuery({
    queryKey: ['cba_clauses_by_agreement', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_articles')
        .select(`
          *,
          cba_clauses(*)
        `)
        .eq('agreement_id', agreementId)
        .order('display_order');
      if (error) throw error;
      return data as (CBAArticle & { cba_clauses: CBAClause[] })[];
    },
    enabled: !!agreementId,
  });
}

// Hook for CBA Versions
export function useCBAVersions(agreementId: string) {
  return useQuery({
    queryKey: ['cba_versions', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_versions')
        .select('*')
        .eq('agreement_id', agreementId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data as CBAVersion[];
    },
    enabled: !!agreementId,
  });
}

// Hook for CBA Negotiations
export function useCBANegotiations(companyId: string, agreementId?: string) {
  return useQuery({
    queryKey: ['cba_negotiations', companyId, agreementId],
    queryFn: async () => {
      let query = supabase
        .from('cba_negotiations')
        .select('*, unions(name)')
        .eq('company_id', companyId)
        .order('session_date', { ascending: false });
      
      if (agreementId) {
        query = query.eq('agreement_id', agreementId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CBANegotiation[];
    },
    enabled: !!companyId,
  });
}

// Hook for CBA Proposals
export function useCBAProposals(negotiationId: string) {
  return useQuery({
    queryKey: ['cba_proposals', negotiationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_proposals')
        .select('*')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CBAProposal[];
    },
    enabled: !!negotiationId,
  });
}

// Hook for CBA Amendments
export function useCBAAmendments(agreementId: string) {
  return useQuery({
    queryKey: ['cba_amendments', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_amendments')
        .select('*')
        .eq('agreement_id', agreementId)
        .order('effective_date', { ascending: false });
      if (error) throw error;
      return data as CBAAmendment[];
    },
    enabled: !!agreementId,
  });
}

// Hook for CBA Rules
export function useCBARules(agreementId: string) {
  return useQuery({
    queryKey: ['cba_rules', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cba_rules')
        .select('*')
        .eq('agreement_id', agreementId)
        .order('priority', { ascending: false });
      if (error) throw error;
      return data as CBARule[];
    },
    enabled: !!agreementId,
  });
}

// Hook for CBA Violations
export function useCBAViolations(companyId: string, agreementId?: string) {
  return useQuery({
    queryKey: ['cba_violations', companyId, agreementId],
    queryFn: async () => {
      let query = supabase
        .from('cba_violations')
        .select(`
          *,
          affected_employee:profiles!cba_violations_affected_employee_id_fkey(full_name),
          rule:cba_rules(rule_name)
        `)
        .eq('company_id', companyId)
        .order('detected_at', { ascending: false });
      
      if (agreementId) {
        query = query.eq('agreement_id', agreementId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CBAViolation[];
    },
    enabled: !!companyId,
  });
}

// Mutations
export function useCreateCBAArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CBAArticle>) => {
      const { error } = await supabase.from('cba_articles').insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cba_articles', variables.agreement_id] });
      toast.success('Article created successfully');
    },
    onError: () => toast.error('Failed to create article'),
  });
}

export function useCreateCBAClause() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CBAClause>) => {
      const { error } = await supabase.from('cba_clauses').insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cba_clauses', variables.article_id] });
      queryClient.invalidateQueries({ queryKey: ['cba_clauses_by_agreement'] });
      toast.success('Clause created successfully');
    },
    onError: () => toast.error('Failed to create clause'),
  });
}

export function useCreateCBANegotiation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CBANegotiation>) => {
      const { error } = await supabase.from('cba_negotiations').insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cba_negotiations', variables.company_id] });
      toast.success('Negotiation session created successfully');
    },
    onError: () => toast.error('Failed to create negotiation session'),
  });
}

export function useCreateCBAProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CBAProposal>) => {
      const { error } = await supabase.from('cba_proposals').insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cba_proposals', variables.negotiation_id] });
      toast.success('Proposal created successfully');
    },
    onError: () => toast.error('Failed to create proposal'),
  });
}

export function useCreateCBAAmendment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CBAAmendment>) => {
      const { error } = await supabase.from('cba_amendments').insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cba_amendments', variables.agreement_id] });
      toast.success('Amendment created successfully');
    },
    onError: () => toast.error('Failed to create amendment'),
  });
}

export function useCreateCBARule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CBARule>) => {
      const { error } = await supabase.from('cba_rules').insert(data as any);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cba_rules', variables.agreement_id] });
      toast.success('Rule created successfully');
    },
    onError: () => toast.error('Failed to create rule'),
  });
}

export function useUpdateCBARule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CBARule> & { id: string }) => {
      const { error } = await supabase.from('cba_rules').update(data as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cba_rules'] });
      toast.success('Rule updated successfully');
    },
    onError: () => toast.error('Failed to update rule'),
  });
}

export function useUpdateCBAViolation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CBAViolation> & { id: string }) => {
      const { error } = await supabase.from('cba_violations').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cba_violations'] });
      toast.success('Violation updated successfully');
    },
    onError: () => toast.error('Failed to update violation'),
  });
}
