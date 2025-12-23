import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIGovernance, AIBiasIncident } from "@/hooks/useAIGovernance";
import { AlertTriangle, Eye, CheckCircle, Search, ShieldX, FileWarning } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const severityColors: Record<string, string> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "default",
};

const statusColors: Record<string, string> = {
  open: "destructive",
  investigating: "secondary",
  remediated: "default",
  false_positive: "outline",
};

export function BiasIncidentPanel() {
  const { biasIncidents, updateBiasIncident, isLoading } = useAIGovernance();
  const [selectedIncident, setSelectedIncident] = useState<AIBiasIncident | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("open");

  const filteredIncidents = biasIncidents.filter((incident) => {
    if (activeTab === "open") return incident.remediation_status === "open";
    if (activeTab === "investigating") return incident.remediation_status === "investigating";
    if (activeTab === "resolved") return ["remediated", "false_positive"].includes(incident.remediation_status || "");
    return true;
  });

  const handleUpdateStatus = () => {
    if (!selectedIncident || !newStatus) return;
    
    updateBiasIncident({
      incidentId: selectedIncident.id,
      status: newStatus,
      notes: notes,
    });
    
    setSelectedIncident(null);
    setNewStatus("");
    setNotes("");
  };

  const openCount = biasIncidents.filter(i => i.remediation_status === "open").length;
  const investigatingCount = biasIncidents.filter(i => i.remediation_status === "investigating").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5" />
            Bias Incidents
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-red-500" />
            Bias Incidents
            {openCount > 0 && (
              <Badge variant="destructive">{openCount} open</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Detected AI bias incidents requiring investigation per ISO 42001
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="open" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Open ({openCount})
              </TabsTrigger>
              <TabsTrigger value="investigating" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Investigating ({investigatingCount})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileWarning className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No incidents in this category</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {filteredIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={severityColors[incident.severity || "medium"] as any}>
                              {incident.severity || "medium"}
                            </Badge>
                            <Badge variant="outline">{incident.bias_type}</Badge>
                            <Badge variant={statusColors[incident.remediation_status || "open"] as any}>
                              {incident.remediation_status || "open"}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">
                            {incident.affected_characteristic || "Unspecified characteristic"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Detected: {incident.detection_method} • 
                            {incident.created_at && formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setNewStatus(incident.remediation_status || "open");
                            setNotes(incident.remediation_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bias Incident Details</DialogTitle>
            <DialogDescription>
              Review and update bias incident status
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Bias Type</label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedIncident.bias_type}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <p className="mt-1">
                    <Badge variant={severityColors[selectedIncident.severity || "medium"] as any}>
                      {selectedIncident.severity || "medium"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Detection Method</label>
                  <p className="mt-1 text-sm">{selectedIncident.detection_method}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Affected Characteristic</label>
                <p className="mt-1 text-sm">
                  {selectedIncident.affected_characteristic || "Not specified"}
                </p>
              </div>

              {selectedIncident.prompt_content && (
                <div>
                  <label className="text-sm font-medium">Prompt Content</label>
                  <div className="mt-1 p-3 bg-muted rounded-lg text-sm max-h-24 overflow-auto">
                    {selectedIncident.prompt_content}
                  </div>
                </div>
              )}

              {selectedIncident.response_content && (
                <div>
                  <label className="text-sm font-medium">Response Content</label>
                  <div className="mt-1 p-3 bg-muted rounded-lg text-sm max-h-24 overflow-auto">
                    {selectedIncident.response_content}
                  </div>
                </div>
              )}

              {selectedIncident.evidence_description && (
                <div>
                  <label className="text-sm font-medium">Evidence Description</label>
                  <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedIncident.evidence_description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="remediated">Remediated</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Reported</label>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedIncident.created_at && format(new Date(selectedIncident.created_at), "PPpp")}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Remediation Notes</label>
                <Textarea
                  className="mt-1"
                  placeholder="Document investigation findings and remediation actions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIncident(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
