import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PasswordPolicy {
  id: string;
  company_id: string | null;
  min_password_length: number;
  max_password_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  special_chars_allowed: string;
  password_history_count: number;
  password_expiry_days: number | null;
  expiry_warning_days: number | null;
  session_timeout_minutes: number | null;
  require_change_on_first_login: boolean;
  mfa_enforcement_level: string;
  is_active: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function usePasswordPolicy() {
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('password_policies')
        .select('*')
        .is('company_id', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPolicy(data as PasswordPolicy);
      }
    } catch (error) {
      console.error('Error fetching password policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = useCallback((password: string): ValidationResult => {
    if (!policy) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];

    // Length check
    if (password.length < policy.min_password_length) {
      errors.push(`Password must be at least ${policy.min_password_length} characters`);
    }

    if (password.length > policy.max_password_length) {
      errors.push(`Password must be no more than ${policy.max_password_length} characters`);
    }

    // Complexity checks
    if (policy.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.require_lowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.require_numbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.require_special_chars) {
      const specialCharsRegex = new RegExp(`[${policy.special_chars_allowed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
      if (!specialCharsRegex.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [policy]);

  const getPasswordStrength = useCallback((password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 20) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-destructive' };
    if (score <= 4) return { score: 50, label: 'Fair', color: 'bg-warning' };
    if (score <= 6) return { score: 75, label: 'Strong', color: 'bg-info' };
    return { score: 100, label: 'Very Strong', color: 'bg-success' };
  }, []);

  return {
    policy,
    isLoading,
    validatePassword,
    getPasswordStrength,
    refetch: fetchPolicy,
  };
}
