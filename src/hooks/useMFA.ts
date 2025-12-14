import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MFAFactor {
  id: string;
  factor_type: string;
  friendly_name?: string;
  created_at: string;
}

interface MFAEnrollment {
  id: string;
  type: string;
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export function useMFA() {
  const { user, company } = useAuth();
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isMFARequired, setIsMFARequired] = useState(false);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<MFAEnrollment | null>(null);

  const fetchMFASettings = useCallback(async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: settings } = await supabase
        .from("mfa_settings")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();

      if (settings) {
        setIsMFAEnabled(settings.is_mfa_enabled);
        setIsMFARequired(settings.is_mfa_required);
      }
    } catch (error) {
      console.error("Error fetching MFA settings:", error);
    }
  }, [company?.id]);

  const fetchFactors = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error("Error listing MFA factors:", error);
        return;
      }

      const totpFactors = data?.totp || [];
      setFactors(totpFactors);
      setIsEnrolled(totpFactors.length > 0);
    } catch (error) {
      console.error("Error fetching MFA factors:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMFASettings();
    fetchFactors();
  }, [fetchMFASettings, fetchFactors]);

  const startEnrollment = async (friendlyName?: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: friendlyName || "Authenticator App",
      });

      if (error) throw error;

      setEnrollment(data);
      return { data, error: null };
    } catch (error) {
      console.error("Error starting MFA enrollment:", error);
      return { data: null, error };
    }
  };

  const verifyEnrollment = async (factorId: string, code: string) => {
    try {
      const { data: challengeData, error: challengeError } = 
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (error) throw error;

      // Update user MFA status in database
      await supabase.from("user_mfa_status").upsert({
        user_id: user?.id,
        is_enrolled: true,
        enrolled_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
        factor_type: "totp",
      }, { onConflict: "user_id" });

      setEnrollment(null);
      await fetchFactors();
      
      return { data, error: null };
    } catch (error) {
      console.error("Error verifying MFA enrollment:", error);
      return { data: null, error };
    }
  };

  const verifyCode = async (code: string) => {
    try {
      const { data: factorsData, error: factorsError } = 
        await supabase.auth.mfa.listFactors();

      if (factorsError) throw factorsError;

      const totpFactor = factorsData.totp[0];
      if (!totpFactor) {
        throw new Error("No TOTP factors found");
      }

      const { data: challengeData, error: challengeError } = 
        await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (error) throw error;

      // Update last verified timestamp
      await supabase.from("user_mfa_status").upsert({
        user_id: user?.id,
        last_verified_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      return { data, error: null };
    } catch (error) {
      console.error("Error verifying MFA code:", error);
      return { data: null, error };
    }
  };

  const unenroll = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });

      if (error) throw error;

      // Update user MFA status
      await supabase.from("user_mfa_status").upsert({
        user_id: user?.id,
        is_enrolled: false,
        enrolled_at: null,
      }, { onConflict: "user_id" });

      await fetchFactors();
      return { error: null };
    } catch (error) {
      console.error("Error unenrolling MFA:", error);
      return { error };
    }
  };

  const cancelEnrollment = () => {
    setEnrollment(null);
  };

  return {
    factors,
    isEnrolled,
    isMFARequired,
    isMFAEnabled,
    isLoading,
    enrollment,
    startEnrollment,
    verifyEnrollment,
    verifyCode,
    unenroll,
    cancelEnrollment,
    refreshFactors: fetchFactors,
  };
}
