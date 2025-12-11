import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PiiAccessTracker {
  count: number;
  firstAccess: Date;
}

// Track access attempts per user session
const accessTracker = new Map<string, PiiAccessTracker>();

export function usePiiVisibility() {
  const { user, roles } = useAuth();
  const [canViewPii, setCanViewPii] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const alertSentRef = useRef(false);

  useEffect(() => {
    const checkPiiAccess = async () => {
      if (!user || roles.length === 0) {
        setCanViewPii(false);
        setIsLoading(false);
        return;
      }

      try {
        // Get the user's role_ids from user_roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        if (!userRoles || userRoles.length === 0) {
          setCanViewPii(false);
          setIsLoading(false);
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean);

        // Check if any of the user's roles have can_view_pii = true
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("can_view_pii")
          .in("id", roleIds)
          .eq("can_view_pii", true)
          .limit(1);

        if (roleError) throw roleError;

        setCanViewPii((roleData && roleData.length > 0) || false);
      } catch (error) {
        console.error("Error checking PII access:", error);
        setCanViewPii(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPiiAccess();
  }, [user, roles]);

  // Track and potentially alert on suspicious PII access
  const trackPiiAccess = useCallback(async () => {
    if (!user || canViewPii || alertSentRef.current) return;

    const userKey = user.id;
    const now = new Date();
    
    let tracker = accessTracker.get(userKey);
    
    if (!tracker) {
      tracker = { count: 1, firstAccess: now };
      accessTracker.set(userKey, tracker);
    } else {
      // Check if we're still within the alert window
      const hoursDiff = (now.getTime() - tracker.firstAccess.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 1) {
        // Reset tracker after window expires
        tracker = { count: 1, firstAccess: now };
        accessTracker.set(userKey, tracker);
      } else {
        tracker.count++;
      }
    }

    // Check against threshold (default 5)
    if (tracker.count >= 5 && !alertSentRef.current) {
      alertSentRef.current = true;
      
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        await supabase.functions.invoke("send-pii-alert", {
          body: {
            userId: user.id,
            userEmail: profile?.email || user.email || "unknown",
            accessCount: tracker.count,
            alertType: "REPEATED_ACCESS_WITHOUT_PERMISSION",
            alertReason: `User without PII permissions accessed PII-protected pages ${tracker.count} times within 1 hour`,
          },
        });
      } catch (error) {
        console.error("Failed to send PII alert:", error);
      }
    }
  }, [user, canViewPii]);

  // Helper function to mask PII data
  const maskPii = useCallback((value: string | null | undefined, type: "email" | "phone" | "text" = "text"): string => {
    if (!value) return "—";
    if (canViewPii) return value;

    // Track access when masking is applied
    trackPiiAccess();

    switch (type) {
      case "email": {
        const [local, domain] = value.split("@");
        if (!domain) return "***@***.***";
        return `${local.slice(0, 2)}***@${domain.slice(0, 2)}***.***`;
      }
      case "phone": {
        return value.replace(/\d(?=\d{4})/g, "*");
      }
      default: {
        if (value.length <= 3) return "***";
        return `${value.slice(0, 2)}${"*".repeat(Math.min(value.length - 2, 8))}`;
      }
    }
  }, [canViewPii, trackPiiAccess]);

  return {
    canViewPii,
    isLoading,
    maskPii,
  };
}
