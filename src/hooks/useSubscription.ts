import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionTier {
  id: string;
  name: string;
  code: string;
  description: string | null;
  modules: string[];
  base_price_monthly: number;
  price_per_employee: number;
  min_employees: number | null;
  max_employees: number | null;
  display_order: number;
}

interface CompanySubscription {
  id: string;
  company_id: string | null;
  tier_id: string | null;
  status: 'trial' | 'active' | 'grace_period' | 'expired' | 'cancelled';
  billing_cycle: 'monthly' | 'annual';
  payment_method: 'credit_card' | 'wire_transfer' | null;
  active_employee_count: number;
  monthly_amount: number | null;
  annual_amount: number | null;
  trial_started_at: string;
  trial_ends_at: string;
  grace_period_ends_at: string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  next_billing_date: string | null;
  selected_modules: string[];
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_address: string | null;
}

export function useSubscription() {
  const { user, company } = useAuth();
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = useCallback(async () => {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) {
      console.error('Error fetching tiers:', error);
      return;
    }
    
    setTiers((data || []).map(t => ({
      ...t,
      modules: Array.isArray(t.modules) ? t.modules : JSON.parse(t.modules as string || '[]')
    })));
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('company_subscriptions')
      .select('*')
      .eq('company_id', company.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      setError(error.message);
    } else if (data) {
      setSubscription({
        ...data,
        status: data.status as CompanySubscription['status'],
        billing_cycle: data.billing_cycle as CompanySubscription['billing_cycle'],
        payment_method: data.payment_method as CompanySubscription['payment_method'],
        selected_modules: Array.isArray(data.selected_modules) 
          ? data.selected_modules 
          : JSON.parse(data.selected_modules as string || '[]')
      });
    }
    setIsLoading(false);
  }, [company?.id]);

  useEffect(() => {
    fetchTiers();
    fetchSubscription();
  }, [fetchTiers, fetchSubscription]);

  const calculatePrice = useCallback((
    tier: SubscriptionTier,
    employeeCount: number,
    billingCycle: 'monthly' | 'annual'
  ) => {
    const monthlyPrice = tier.base_price_monthly + (tier.price_per_employee * employeeCount);
    if (billingCycle === 'annual') {
      // 1 month free = 11 months price
      return { monthly: monthlyPrice, annual: monthlyPrice * 11, savings: monthlyPrice };
    }
    return { monthly: monthlyPrice, annual: monthlyPrice * 12, savings: 0 };
  }, []);

  const isTrialExpired = useCallback(() => {
    if (!subscription) return false;
    if (subscription.status === 'active') return false;
    return new Date(subscription.trial_ends_at) < new Date();
  }, [subscription]);

  const isInGracePeriod = useCallback(() => {
    if (!subscription) return false;
    if (subscription.status !== 'grace_period') return false;
    return subscription.grace_period_ends_at 
      ? new Date(subscription.grace_period_ends_at) > new Date()
      : false;
  }, [subscription]);

  const isExpired = useCallback(() => {
    if (!subscription) return false;
    if (subscription.status === 'expired') return true;
    if (subscription.status === 'grace_period' && subscription.grace_period_ends_at) {
      return new Date(subscription.grace_period_ends_at) < new Date();
    }
    return false;
  }, [subscription]);

  const getDaysRemaining = useCallback(() => {
    if (!subscription) return 0;
    const endDate = subscription.status === 'grace_period' && subscription.grace_period_ends_at
      ? new Date(subscription.grace_period_ends_at)
      : new Date(subscription.trial_ends_at);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  const hasModuleAccess = useCallback((moduleCode: string): boolean => {
    if (!subscription) return true; // No subscription means no restrictions (new user)
    if (subscription.status === 'active') {
      return subscription.selected_modules.includes(moduleCode);
    }
    // During trial, all modules available
    if (subscription.status === 'trial') return true;
    // Grace period - limited access
    if (subscription.status === 'grace_period') return true;
    // Expired - no access
    return false;
  }, [subscription]);

  return {
    subscription,
    tiers,
    isLoading,
    error,
    calculatePrice,
    isTrialExpired,
    isInGracePeriod,
    isExpired,
    getDaysRemaining,
    hasModuleAccess,
    refetch: fetchSubscription
  };
}
