import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { useEnhancedPiiVisibility } from "@/hooks/useEnhancedPiiVisibility";
import { cn } from "@/lib/utils";
import type { PiiLevel } from "@/types/roles";

type PiiCategory = 
  | "personal_details"
  | "compensation"
  | "banking"
  | "medical"
  | "disciplinary"
  | "documents"
  | "notes";

interface PiiFieldProps {
  /** The actual value to display */
  value: string | number | null | undefined;
  /** Category of PII for permission checking */
  category: PiiCategory;
  /** Optional custom mask pattern */
  maskPattern?: string;
  /** Whether to show reveal button */
  allowReveal?: boolean;
  /** Callback when user attempts to reveal masked data */
  onRevealAttempt?: () => void;
  /** Custom className */
  className?: string;
  /** Format function for the revealed value */
  formatValue?: (value: string | number) => string;
  /** Placeholder when value is empty */
  placeholder?: string;
}

export function PiiField({
  value,
  category,
  maskPattern = "••••••••",
  allowReveal = true,
  onRevealAttempt,
  className,
  formatValue,
  placeholder = "—",
}: PiiFieldProps) {
  const piiHook = useEnhancedPiiVisibility();
  const canAccessCategory = (cat: PiiCategory) => piiHook.canViewDomain(cat as any);
  const piiLevel = piiHook.piiProfile.pii_level;
  const maskingEnabled = piiHook.piiProfile.masking_enabled;
  const requiresApproval = piiHook.piiProfile.approval_required_for_full;
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const hasAccess = canAccessCategory(category);
  const displayValue = value != null ? (formatValue ? formatValue(value) : String(value)) : placeholder;

  // No value case
  if (value == null || value === "") {
    return <span className={cn("text-muted-foreground", className)}>{placeholder}</span>;
  }

  // Full access without masking
  if (hasAccess && !maskingEnabled) {
    return <span className={className}>{displayValue}</span>;
  }

  // No access at all
  if (!hasAccess) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("text-muted-foreground flex items-center gap-1", className)}>
            <Lock className="h-3 w-3" />
            <span className="font-mono">{maskPattern}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>You don't have permission to view this data</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Has access but masking is enabled
  if (!isRevealed) {
    const handleReveal = async () => {
      if (requiresApproval) {
        setIsRequesting(true);
        onRevealAttempt?.();
        // Simulate approval request - in real app this would trigger workflow
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsRequesting(false);
        // For demo, auto-approve
        setIsRevealed(true);
      } else {
        setIsRevealed(true);
        onRevealAttempt?.();
      }
    };

    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <span className="font-mono text-muted-foreground">{maskPattern}</span>
        {allowReveal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleReveal}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : requiresApproval ? (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {requiresApproval ? "Click to request access" : "Click to reveal"}
            </TooltipContent>
          </Tooltip>
        )}
      </span>
    );
  }

  // Revealed state
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span>{displayValue}</span>
      {allowReveal && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsRevealed(false)}
        >
          <EyeOff className="h-3 w-3" />
        </Button>
      )}
    </span>
  );
}

// Specialized PII field variants for common use cases

export function SsnField({ value, ...props }: Omit<PiiFieldProps, "category" | "maskPattern">) {
  return (
    <PiiField
      value={value}
      category="personal_details"
      maskPattern="•••-••-••••"
      formatValue={(v) => {
        const str = String(v).replace(/\D/g, "");
        if (str.length === 9) {
          return `${str.slice(0, 3)}-${str.slice(3, 5)}-${str.slice(5)}`;
        }
        return String(v);
      }}
      {...props}
    />
  );
}

export function BankAccountField({ value, ...props }: Omit<PiiFieldProps, "category" | "maskPattern">) {
  return (
    <PiiField
      value={value}
      category="banking"
      maskPattern="••••••••"
      formatValue={(v) => {
        const str = String(v);
        if (str.length > 4) {
          return `••••${str.slice(-4)}`;
        }
        return str;
      }}
      {...props}
    />
  );
}

export function SalaryField({ value, currency = "USD", ...props }: Omit<PiiFieldProps, "category" | "maskPattern"> & { currency?: string }) {
  return (
    <PiiField
      value={value}
      category="compensation"
      maskPattern="$•••,•••"
      formatValue={(v) => {
        const num = typeof v === "number" ? v : parseFloat(String(v));
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num);
      }}
      {...props}
    />
  );
}

export function PhoneField({ value, ...props }: Omit<PiiFieldProps, "category" | "maskPattern">) {
  return (
    <PiiField
      value={value}
      category="personal_details"
      maskPattern="(•••) •••-••••"
      {...props}
    />
  );
}

export function EmailField({ value, ...props }: Omit<PiiFieldProps, "category" | "maskPattern">) {
  return (
    <PiiField
      value={value}
      category="personal_details"
      maskPattern="•••@••••••"
      formatValue={(v) => {
        const str = String(v);
        const [local, domain] = str.split("@");
        if (local && domain) {
          return `${local[0]}${"•".repeat(Math.min(local.length - 1, 3))}@${domain}`;
        }
        return str;
      }}
      {...props}
    />
  );
}

export function AddressField({ value, ...props }: Omit<PiiFieldProps, "category" | "maskPattern">) {
  return (
    <PiiField
      value={value}
      category="personal_details"
      maskPattern="••••••••••••"
      {...props}
    />
  );
}
