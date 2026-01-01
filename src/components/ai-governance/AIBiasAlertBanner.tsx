import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  X, 
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BiasIncident {
  id: string;
  bias_type: string;
  severity: string;
  affected_characteristic: string | null;
  detection_method: string;
  remediation_status: string;
  created_at: string;
}

interface AIBiasAlertBannerProps {
  companyId: string;
  onViewDetails?: (incident: BiasIncident) => void;
}

export function AIBiasAlertBanner({ companyId, onViewDetails }: AIBiasAlertBannerProps) {
  const [incidents, setIncidents] = useState<BiasIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchBiasIncidents();
  }, [companyId]);

  const fetchBiasIncidents = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from("ai_bias_incidents")
        .select("*")
        .eq("company_id", companyId)
        .in("remediation_status", ["pending", "investigating"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setIncidents((data || []) as BiasIncident[]);
    } catch (error) {
      console.error("Error fetching bias incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || incidents.length === 0 || isDismissed) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-info text-info-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatBiasType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayedIncidents = showAll ? incidents : incidents.slice(0, 2);

  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>AI Bias Detection Alert</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">
          The AI governance system has detected {incidents.length} potential bias incident{incidents.length !== 1 ? 's' : ''} 
          that require attention:
        </p>
        
        <div className="space-y-2">
          {displayedIncidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-center justify-between p-2 bg-background/50 rounded border"
            >
              <div className="flex items-center gap-3">
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity?.toUpperCase()}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{formatBiasType(incident.bias_type)}</p>
                  {incident.affected_characteristic && (
                    <p className="text-xs text-muted-foreground">
                      Affected: {incident.affected_characteristic}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {incident.detection_method}
                </Badge>
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(incident)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {incidents.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <EyeOff className="mr-2 h-3.5 w-3.5" />
                Show Less
              </>
            ) : (
              <>
                <Eye className="mr-2 h-3.5 w-3.5" />
                Show {incidents.length - 2} More
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          ISO 42001 requires investigation and remediation of detected bias. Please review and take appropriate action.
        </p>
      </AlertDescription>
    </Alert>
  );
}
