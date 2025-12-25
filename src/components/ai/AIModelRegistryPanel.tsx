import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIGovernance } from "@/hooks/useAIGovernance";
import { Bot, CheckCircle, AlertTriangle, Clock, Shield } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

const complianceColors: Record<string, string> = {
  compliant: "default",
  pending: "secondary",
  non_compliant: "destructive",
};

const riskColors: Record<string, string> = {
  low: "default",
  medium: "secondary",
  high: "destructive",
  critical: "destructive",
};

export function AIModelRegistryPanel() {
  const { modelRegistry, isLoading } = useAIGovernance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Model Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const compliantCount = modelRegistry.filter(m => m.compliance_status === 'compliant').length;
  const pendingAuditCount = modelRegistry.filter(m => {
    if (!m.next_audit_due) return false;
    return new Date(m.next_audit_due) <= new Date();
  }).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Model Registry
          <Badge variant="outline" className="ml-2">
            {compliantCount}/{modelRegistry.length} compliant
          </Badge>
        </CardTitle>
        <CardDescription>
          Registered AI models and their ISO 42001 compliance status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingAuditCount > 0 && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm">{pendingAuditCount} model(s) have overdue audits</span>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {modelRegistry.map((model) => {
              const auditOverdue = model.next_audit_due && new Date(model.next_audit_due) <= new Date();
              
              return (
                <div
                  key={model.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{model.display_name}</h4>
                        <Badge variant={complianceColors[model.compliance_status || "pending"] as any}>
                          {model.compliance_status === 'compliant' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {model.compliance_status === 'non_compliant' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {model.compliance_status || "pending"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground font-mono">
                        {model.model_identifier}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {model.provider}
                        </Badge>
                        <Badge variant={riskColors[model.risk_classification || "medium"] as any} className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {model.risk_classification || "medium"} risk
                        </Badge>
                        {model.version && (
                          <Badge variant="outline" className="text-xs">
                            v{model.version}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        Purpose: {model.purpose}
                      </p>

                      {model.approved_use_cases && model.approved_use_cases.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Approved for: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {model.approved_use_cases.slice(0, 3).map((useCase, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {useCase}
                              </Badge>
                            ))}
                            {model.approved_use_cases.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{model.approved_use_cases.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      {model.last_audit_date && (
                        <p>
                          Last audit: {formatDateForDisplay(model.last_audit_date, "MMM d, yyyy")}
                        </p>
                      )}
                      {model.next_audit_due && (
                        <p className={auditOverdue ? "text-amber-500 font-medium" : ""}>
                          {auditOverdue ? "Audit overdue: " : "Next audit: "}
                          {formatDistanceToNow(new Date(model.next_audit_due), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
