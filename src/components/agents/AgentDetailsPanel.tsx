import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  Bot, 
  Clock, 
  Zap, 
  Shield, 
  Code, 
  RefreshCw,
  Settings,
  ExternalLink,
  Copy
} from "lucide-react";
import { AIAgent } from "@/hooks/useAgentRegistry";
import { format } from "date-fns";
import { toast } from "sonner";

interface AgentDetailsPanelProps {
  agent: AIAgent;
  onClose: () => void;
  onRefreshExecutions: () => void;
}

export function AgentDetailsPanel({
  agent,
  onClose,
  onRefreshExecutions
}: AgentDetailsPanelProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
              <CardDescription className="font-mono text-xs">
                {agent.agent_code}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-6">
            {/* Description */}
            {agent.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Configuration */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <p className="font-medium capitalize">{agent.agent_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Version</span>
                  <p className="font-medium">{agent.version || "1.0.0"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rate Limit</span>
                  <p className="font-medium">{agent.rate_limit_per_minute}/min</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Timeout</span>
                  <p className="font-medium">{agent.timeout_seconds}s</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Function Details */}
            {agent.function_name && (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Function Details
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Function:</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(agent.function_name || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="text-primary">{agent.function_name}</code>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Capabilities */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {(agent.capabilities || []).map((capability, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
                {(!agent.capabilities || agent.capabilities.length === 0) && (
                  <span className="text-sm text-muted-foreground">
                    No capabilities defined
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Dependencies */}
            {agent.dependencies && agent.dependencies.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Dependencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.dependencies.map((dep, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Retry Configuration */}
            {agent.retry_config && (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Max Retries</span>
                      <p className="font-medium">
                        {agent.retry_config.max_retries || 3}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Backoff</span>
                      <p className="font-medium">
                        {agent.retry_config.backoff_ms || 1000}ms
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Timestamps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timestamps
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(agent.created_at), "PPp")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{format(new Date(agent.updated_at), "PPp")}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onRefreshExecutions}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                View Executions
              </Button>
              {agent.endpoint_url && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(agent.endpoint_url!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Endpoint
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
