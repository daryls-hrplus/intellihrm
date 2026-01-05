import { useState, useEffect, ReactNode } from "react";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ConsentManagementPanel } from "./ConsentManagementPanel";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { ConsentType } from "@/hooks/useFeedbackGovernance";

interface ConsentGateProps {
  cycleId: string;
  companyId: string;
  requiredTypes?: ConsentType[];
  children: ReactNode;
  onConsentComplete?: () => void;
}

interface ConsentCheckResult {
  hasConsent: boolean;
  missingTypes: ConsentType[];
}

async function checkRequiredConsent(
  employeeId: string,
  cycleId: string,
  requiredTypes: ConsentType[]
): Promise<ConsentCheckResult> {
  const { data, error } = await supabase
    .from("feedback_consent_records")
    .select("consent_type, consent_given, withdrawn_at")
    .eq("employee_id", employeeId)
    .eq("cycle_id", cycleId)
    .in("consent_type", requiredTypes);

  if (error) {
    console.error("Error checking consent:", error);
    return { hasConsent: false, missingTypes: requiredTypes };
  }

  const validConsents = (data || []).filter(
    (c: any) => c.consent_given && !c.withdrawn_at
  );
  const validTypes = validConsents.map((c: any) => c.consent_type);
  const missingTypes = requiredTypes.filter((t) => !validTypes.includes(t));

  return {
    hasConsent: missingTypes.length === 0,
    missingTypes,
  };
}

export function ConsentGate({
  cycleId,
  companyId,
  requiredTypes = ["participation", "data_processing"],
  children,
  onConsentComplete,
}: ConsentGateProps) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [consentCompleted, setConsentCompleted] = useState(false);

  useEffect(() => {
    if (user?.id && cycleId) {
      checkConsent();
    }
  }, [user?.id, cycleId]);

  const checkConsent = async () => {
    if (!user?.id) return;
    
    setChecking(true);
    try {
      const result = await checkRequiredConsent(user.id, cycleId, requiredTypes);
      setHasConsent(result.hasConsent);
    } catch (error) {
      console.error("Error checking consent:", error);
      setHasConsent(false);
    } finally {
      setChecking(false);
    }
  };

  const handleConsentComplete = () => {
    setConsentCompleted(true);
    setHasConsent(true);
    onConsentComplete?.();
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Checking consent status...</span>
      </div>
    );
  }

  if (!hasConsent && !consentCompleted) {
    return (
      <ConsentManagementPanel
        cycleId={cycleId}
        companyId={companyId}
        employeeId={user?.id}
        mode="collect"
        onConsentComplete={handleConsentComplete}
      />
    );
  }

  return (
    <>
      {children}
      {/* Subtle consent indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm cursor-default">
                <Shield className="h-3 w-3 mr-1 text-success" />
                Privacy Protected
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Your consent preferences are recorded</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
