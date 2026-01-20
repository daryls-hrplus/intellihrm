import { useState, useEffect } from "react";
import { Building2, Globe, Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCapabilityCompanyLinks } from "@/hooks/capabilities/useCapabilityCompanyLinks";

interface Company {
  id: string;
  name: string;
}

interface CompanyScopeSelectorProps {
  capabilityId?: string;
  companies: Company[];
  isGlobal: boolean;
  selectedCompanyIds: string[];
  onGlobalChange: (isGlobal: boolean) => void;
  onCompaniesChange: (companyIds: string[]) => void;
  loading?: boolean;
}

export function CompanyScopeSelector({
  capabilityId,
  companies,
  isGlobal,
  selectedCompanyIds,
  onGlobalChange,
  onCompaniesChange,
  loading: externalLoading,
}: CompanyScopeSelectorProps) {
  const { fetchLinkedCompanies, loading: linkLoading } = useCapabilityCompanyLinks();
  const [initialized, setInitialized] = useState(false);

  // Load existing company links when editing
  useEffect(() => {
    if (capabilityId && !initialized) {
      fetchLinkedCompanies(capabilityId).then((links) => {
        if (links.length > 0) {
          onCompaniesChange(links.map(l => l.company_id));
        }
        setInitialized(true);
      });
    } else if (!capabilityId && !initialized) {
      setInitialized(true);
    }
  }, [capabilityId, initialized, fetchLinkedCompanies, onCompaniesChange]);

  const handleGlobalToggle = (checked: boolean) => {
    onGlobalChange(checked);
    if (checked) {
      // Clear company selections when going global
      onCompaniesChange([]);
    }
  };

  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    if (checked) {
      onCompaniesChange([...selectedCompanyIds, companyId]);
    } else {
      onCompaniesChange(selectedCompanyIds.filter(id => id !== companyId));
    }
    // If selecting companies, ensure global is off
    if (checked && isGlobal) {
      onGlobalChange(false);
    }
  };

  const isLoading = externalLoading || linkLoading;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Company Scope
      </Label>

      {/* Global Toggle */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors",
          isGlobal 
            ? "bg-primary/5 border-primary/30" 
            : "bg-muted/50 border-border"
        )}
      >
        <div className="flex items-center gap-2">
          <Globe className={cn("h-4 w-4", isGlobal ? "text-primary" : "text-muted-foreground")} />
          <div>
            <p className="text-sm font-medium">Global (All Companies)</p>
            <p className="text-xs text-muted-foreground">
              Available to all companies automatically
            </p>
          </div>
        </div>
        <Switch
          checked={isGlobal}
          onCheckedChange={handleGlobalToggle}
          disabled={isLoading}
        />
      </div>

      {/* Company Selection */}
      {!isGlobal && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Or link to specific companies:
            </Label>
            {selectedCompanyIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedCompanyIds.length} selected
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[180px] rounded-lg border p-2">
              <div className="space-y-1">
                {companies.map((company) => {
                  const isSelected = selectedCompanyIds.includes(company.id);
                  return (
                    <label
                      key={company.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-primary/10 hover:bg-primary/15" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleCompanyToggle(company.id, checked === true)
                        }
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{company.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {selectedCompanyIds.length === 0 && !isLoading && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              No companies selected — this will be saved without company links
            </p>
          )}
        </div>
      )}
    </div>
  );
}
