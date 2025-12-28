import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GLOverrideRule {
  id: string;
  company_id: string;
  rule_code: string;
  rule_name: string;
  description: string | null;
  priority: number;
  override_type: 'account' | 'segment' | 'full_string';
  applies_to_debit: boolean;
  applies_to_credit: boolean;
  effective_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  conditions?: GLOverrideCondition[];
  targets?: GLOverrideTarget[];
}

export interface GLOverrideCondition {
  id: string;
  override_rule_id: string;
  dimension_type: 'pay_element' | 'department' | 'division' | 'location' | 'job' | 'employee' | 'pay_group' | 'cost_center' | 'section' | 'mapping_type';
  dimension_value_id: string | null;
  dimension_value_code: string | null;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'any';
  value_list: string[] | null;
  created_at: string;
}

export interface GLOverrideTarget {
  id: string;
  override_rule_id: string;
  target_debit_account_id: string | null;
  target_credit_account_id: string | null;
  segment_overrides: Record<string, string>;
  custom_gl_string: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOverrideRuleInput {
  company_id: string;
  rule_code: string;
  rule_name: string;
  description?: string;
  priority?: number;
  override_type: 'account' | 'segment' | 'full_string';
  applies_to_debit?: boolean;
  applies_to_credit?: boolean;
  effective_date?: string;
  end_date?: string | null;
  conditions: Omit<GLOverrideCondition, 'id' | 'override_rule_id' | 'created_at'>[];
  target: Omit<GLOverrideTarget, 'id' | 'override_rule_id' | 'created_at' | 'updated_at'>;
}

export function useGLOverrideRules() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchOverrideRules = async (companyId: string): Promise<GLOverrideRule[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gl_override_rules')
        .select(`
          *,
          conditions:gl_override_conditions(*),
          targets:gl_override_targets(*)
        `)
        .eq('company_id', companyId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []) as GLOverrideRule[];
    } catch (err: any) {
      console.error('Error fetching override rules:', err);
      toast.error('Failed to fetch override rules');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveOverrideRules = async (companyId: string, asOfDate?: string): Promise<GLOverrideRule[]> => {
    const dateToCheck = asOfDate || new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('gl_override_rules')
        .select(`
          *,
          conditions:gl_override_conditions(*),
          targets:gl_override_targets(*)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .lte('effective_date', dateToCheck)
        .or(`end_date.is.null,end_date.gte.${dateToCheck}`)
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []) as GLOverrideRule[];
    } catch (err: any) {
      console.error('Error fetching active override rules:', err);
      return [];
    }
  };

  const createOverrideRule = async (input: CreateOverrideRuleInput): Promise<GLOverrideRule | null> => {
    setIsLoading(true);
    try {
      // Create the rule first
      const { data: rule, error: ruleError } = await supabase
        .from('gl_override_rules')
        .insert({
          company_id: input.company_id,
          rule_code: input.rule_code,
          rule_name: input.rule_name,
          description: input.description || null,
          priority: input.priority || 0,
          override_type: input.override_type,
          applies_to_debit: input.applies_to_debit ?? true,
          applies_to_credit: input.applies_to_credit ?? true,
          effective_date: input.effective_date || new Date().toISOString().split('T')[0],
          end_date: input.end_date || null,
        })
        .select()
        .single();

      if (ruleError) throw ruleError;

      // Create conditions
      if (input.conditions.length > 0) {
        const conditionsToInsert = input.conditions.map(c => ({
          override_rule_id: rule.id,
          dimension_type: c.dimension_type,
          dimension_value_id: c.dimension_value_id || null,
          dimension_value_code: c.dimension_value_code || null,
          operator: c.operator,
          value_list: c.value_list || null,
        }));

        const { error: condError } = await supabase
          .from('gl_override_conditions')
          .insert(conditionsToInsert);

        if (condError) throw condError;
      }

      // Create target
      const { error: targetError } = await supabase
        .from('gl_override_targets')
        .insert({
          override_rule_id: rule.id,
          target_debit_account_id: input.target.target_debit_account_id || null,
          target_credit_account_id: input.target.target_credit_account_id || null,
          segment_overrides: input.target.segment_overrides || {},
          custom_gl_string: input.target.custom_gl_string || null,
        });

      if (targetError) throw targetError;

      toast.success('Override rule created');
      return rule as GLOverrideRule;
    } catch (err: any) {
      console.error('Error creating override rule:', err);
      toast.error(err.message || 'Failed to create override rule');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOverrideRule = async (
    ruleId: string,
    updates: Partial<Omit<GLOverrideRule, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'conditions' | 'targets'>>,
    newConditions?: Omit<GLOverrideCondition, 'id' | 'override_rule_id' | 'created_at'>[],
    newTarget?: Partial<Omit<GLOverrideTarget, 'id' | 'override_rule_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Update the rule
      const { error: ruleError } = await supabase
        .from('gl_override_rules')
        .update(updates)
        .eq('id', ruleId);

      if (ruleError) throw ruleError;

      // Replace conditions if provided
      if (newConditions) {
        // Delete existing conditions
        await supabase
          .from('gl_override_conditions')
          .delete()
          .eq('override_rule_id', ruleId);

        // Insert new conditions
        if (newConditions.length > 0) {
          const conditionsToInsert = newConditions.map(c => ({
            override_rule_id: ruleId,
            dimension_type: c.dimension_type,
            dimension_value_id: c.dimension_value_id || null,
            dimension_value_code: c.dimension_value_code || null,
            operator: c.operator,
            value_list: c.value_list || null,
          }));

          const { error: condError } = await supabase
            .from('gl_override_conditions')
            .insert(conditionsToInsert);

          if (condError) throw condError;
        }
      }

      // Update target if provided
      if (newTarget) {
        const { error: targetError } = await supabase
          .from('gl_override_targets')
          .update(newTarget)
          .eq('override_rule_id', ruleId);

        if (targetError) throw targetError;
      }

      toast.success('Override rule updated');
      return true;
    } catch (err: any) {
      console.error('Error updating override rule:', err);
      toast.error(err.message || 'Failed to update override rule');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOverrideRule = async (ruleId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Cascade delete will handle conditions and targets
      const { error } = await supabase
        .from('gl_override_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast.success('Override rule deleted');
      return true;
    } catch (err: any) {
      console.error('Error deleting override rule:', err);
      toast.error(err.message || 'Failed to delete override rule');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRuleActive = async (ruleId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('gl_override_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast.success(isActive ? 'Rule activated' : 'Rule deactivated');
      return true;
    } catch (err: any) {
      console.error('Error toggling rule:', err);
      toast.error('Failed to update rule status');
      return false;
    }
  };

  return {
    isLoading,
    fetchOverrideRules,
    fetchActiveOverrideRules,
    createOverrideRule,
    updateOverrideRule,
    deleteOverrideRule,
    toggleRuleActive,
  };
}
