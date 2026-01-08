import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type TenantType = "hrplus_internal" | "client";

interface TenantContext {
  tenantType: TenantType;
  isHRPlusInternal: boolean;
  isClient: boolean;
  appVersion: string;
  isLoading: boolean;
}

/**
 * Hook to determine the current user's tenant type and application version.
 * This is used to control visibility of Intelli HRM-internal features like the Enablement Center.
 */
export function useTenantContext(): TenantContext {
  const { user, company } = useAuth();
  const [tenantType, setTenantType] = useState<TenantType>("client");
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenantContext = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the security definer functions for consistent access
        const [tenantTypeResult, appVersionResult] = await Promise.all([
          supabase.rpc("get_user_tenant_type"),
          supabase.rpc("get_user_app_version"),
        ]);

        if (tenantTypeResult.data) {
          setTenantType(tenantTypeResult.data as TenantType);
        }

        if (appVersionResult.data) {
          setAppVersion(appVersionResult.data as string);
        }
      } catch (error) {
        console.error("Error fetching tenant context:", error);
        // Default to client tenant for safety
        setTenantType("client");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantContext();
  }, [user, company?.id]);

  return {
    tenantType,
    isHRPlusInternal: tenantType === "hrplus_internal",
    isClient: tenantType === "client",
    appVersion,
    isLoading,
  };
}
