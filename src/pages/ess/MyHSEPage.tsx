import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, FileText, GraduationCap, CheckCircle, Clock, Plus, Shield, Eye, HardHat, Accessibility, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHSE } from "@/hooks/useHSE";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

export default function MyHSEPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    incidents, safetyPolicies, trainingRecords, createIncident,
    myNearMisses, createNearMiss,
    myObservations, createObservation,
    myPPE,
    myAcknowledgments, acknowledgePolicy,
    myErgonomicRequests, createErgonomicRequest,
  } = useHSE();

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isNearMissDialogOpen, setIsNearMissDialogOpen] = useState(false);
  const [isObservationDialogOpen, setIsObservationDialogOpen] = useState(false);
  const [isErgonomicDialogOpen, setIsErgonomicDialogOpen] = useState(false);

  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    incident_type: "near_miss",
    severity: "low",
    location: "",
  });

  const [newNearMiss, setNewNearMiss] = useState({
    description: "",
    location: "",
    potential_severity: "low",
    hazard_type: "",
    immediate_actions: "",
    is_anonymous: false,
  });

  const [newObservation, setNewObservation] = useState({
    observation_type: "safe",
    category: "",
    description: "",
    behavior_observed: "",
  });

  const [newErgonomic, setNewErgonomic] = useState({
    workstation_type: "",
    location: "",
    notes: "",
  });

  // Filter data for current user
  const myIncidents = incidents?.filter(inc => inc.reported_by === user?.id) || [];
  const myTrainingRecords = trainingRecords?.filter(rec => rec.employee_id === user?.id) || [];
  const activePolicies = safetyPolicies?.filter(p => p.status === "active") || [];
  const acknowledgedPolicyIds = new Set(myAcknowledgments?.map((a: any) => a.policy_id) || []);

  const handleReportIncident = async () => {
    if (!user?.id) return;
    try {
      await createIncident.mutateAsync({
        ...newIncident,
        reported_by: user.id,
        company_id: user.user_metadata?.company_id || "",
        incident_date: getTodayString(),
        incident_time: new Date().toTimeString().slice(0, 5),
        status: "reported",
      });
      setIsReportDialogOpen(false);
      setNewIncident({ title: "", description: "", incident_type: "near_miss", severity: "low", location: "" });
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleReportNearMiss = async () => {
    if (!user?.id) return;
    try {
      await createNearMiss.mutateAsync({
        ...newNearMiss,
        company_id: user.user_metadata?.company_id || "",
        report_date: getTodayString(),
        status: "reported",
      });
      setIsNearMissDialogOpen(false);
      setNewNearMiss({ description: "", location: "", potential_severity: "low", hazard_type: "", immediate_actions: "", is_anonymous: false });
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleSubmitObservation = async () => {
    if (!user?.id) return;
    try {
      await createObservation.mutateAsync({
        ...newObservation,
        company_id: user.user_metadata?.company_id || "",
        observation_date: getTodayString(),
      });
      setIsObservationDialogOpen(false);
      setNewObservation({ observation_type: "safe", category: "", description: "", behavior_observed: "" });
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleRequestErgonomic = async () => {
    if (!user?.id) return;
    try {
      await createErgonomicRequest.mutateAsync({
        ...newErgonomic,
        company_id: user.user_metadata?.company_id || "",
        assessment_date: getTodayString(),
      });
      setIsErgonomicDialogOpen(false);
      setNewErgonomic({ workstation_type: "", location: "", notes: "" });
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleAcknowledgePolicy = async (policyId: string) => {
    try {
      await acknowledgePolicy.mutateAsync(policyId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary", medium: "default", high: "destructive", critical: "destructive",
    };
    return <Badge variant={variants[severity] || "secondary"}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      reported: "outline", investigating: "default", resolved: "secondary", closed: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('navigation.ess', 'Employee Self Service'), href: "/ess" },
            { label: t('ess.myHSE.breadcrumb', 'Health, Safety & Environment') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('ess.myHSE.title', 'My Health, Safety & Environment')}</h1>
            <p className="text-muted-foreground">
              {t('ess.myHSE.subtitle', 'Report incidents, near-misses, observations, and manage your safety compliance')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="incidents">
              <AlertTriangle className="mr-2 h-4 w-4" />
              My Incidents
            </TabsTrigger>
            <TabsTrigger value="near-misses">
              <Eye className="mr-2 h-4 w-4" />
              Near-Miss Reports
            </TabsTrigger>
            <TabsTrigger value="observations">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Safety Observations
            </TabsTrigger>
            <TabsTrigger value="ppe">
              <HardHat className="mr-2 h-4 w-4" />
              My PPE
            </TabsTrigger>
            <TabsTrigger value="policies">
              <FileText className="mr-2 h-4 w-4" />
              Safety Policies
            </TabsTrigger>
            <TabsTrigger value="training">
              <GraduationCap className="mr-2 h-4 w-4" />
              My Training
            </TabsTrigger>
            <TabsTrigger value="ergonomics">
              <Accessibility className="mr-2 h-4 w-4" />
              Ergonomic Requests
            </TabsTrigger>
          </TabsList>

          {/* ===== My Incidents Tab ===== */}
          <TabsContent value="incidents" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Report Incident</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Report Safety Incident</DialogTitle>
                    <DialogDescription>Provide details about the safety incident</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={newIncident.title} onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })} placeholder="Brief description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newIncident.incident_type} onValueChange={(v) => setNewIncident({ ...newIncident, incident_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="near_miss">Near Miss</SelectItem>
                            <SelectItem value="injury">Injury</SelectItem>
                            <SelectItem value="property_damage">Property Damage</SelectItem>
                            <SelectItem value="environmental">Environmental</SelectItem>
                            <SelectItem value="fire">Fire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={newIncident.location} onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })} placeholder="Where did this occur?" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newIncident.description} onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })} rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReportIncident} disabled={!newIncident.title || createIncident.isPending}>
                      {createIncident.isPending ? "Reporting..." : "Report"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {myIncidents.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No incidents reported</h3>
                <p className="text-sm text-muted-foreground">You haven't reported any safety incidents yet</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {myIncidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription>{incident.incident_number} • {formatDateForDisplay(incident.incident_date, "PPP")}</CardDescription>
                        </div>
                        <div className="flex gap-2">{getSeverityBadge(incident.severity)}{getStatusBadge(incident.status)}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span><strong>Type:</strong> {incident.incident_type.replace("_", " ")}</span>
                        <span><strong>Location:</strong> {incident.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== Near-Miss Reports Tab ===== */}
          <TabsContent value="near-misses" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isNearMissDialogOpen} onOpenChange={setIsNearMissDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Report Near-Miss</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Report Near-Miss</DialogTitle>
                    <DialogDescription>Report a near-miss event to help prevent future incidents</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newNearMiss.description} onChange={(e) => setNewNearMiss({ ...newNearMiss, description: e.target.value })} rows={3} placeholder="What happened?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={newNearMiss.location} onChange={(e) => setNewNearMiss({ ...newNearMiss, location: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Potential Severity</Label>
                        <Select value={newNearMiss.potential_severity} onValueChange={(v) => setNewNearMiss({ ...newNearMiss, potential_severity: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hazard Type</Label>
                      <Input value={newNearMiss.hazard_type} onChange={(e) => setNewNearMiss({ ...newNearMiss, hazard_type: e.target.value })} placeholder="e.g., Slip/Trip, Electrical, Chemical" />
                    </div>
                    <div className="space-y-2">
                      <Label>Immediate Actions Taken</Label>
                      <Textarea value={newNearMiss.immediate_actions} onChange={(e) => setNewNearMiss({ ...newNearMiss, immediate_actions: e.target.value })} rows={2} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={newNearMiss.is_anonymous} onCheckedChange={(v) => setNewNearMiss({ ...newNearMiss, is_anonymous: v })} />
                      <Label>Report anonymously</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNearMissDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReportNearMiss} disabled={!newNearMiss.description || createNearMiss.isPending}>
                      {createNearMiss.isPending ? "Submitting..." : "Submit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {myNearMisses.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No near-miss reports</h3>
                <p className="text-sm text-muted-foreground">Report near-misses to help prevent future incidents</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {myNearMisses.map((nm: any) => (
                  <Card key={nm.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{nm.report_number || "Near-Miss"}</CardTitle>
                          <CardDescription>{nm.report_date ? formatDateForDisplay(nm.report_date, "PPP") : "-"} • {nm.hazard_type || "General"}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getSeverityBadge(nm.potential_severity || "low")}
                          {getStatusBadge(nm.status || "reported")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{nm.description}</p>
                      {nm.corrective_actions && <p className="text-sm mt-2"><strong>Corrective Actions:</strong> {nm.corrective_actions}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== Safety Observations Tab ===== */}
          <TabsContent value="observations" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isObservationDialogOpen} onOpenChange={setIsObservationDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Submit Observation</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Safety Observation</DialogTitle>
                    <DialogDescription>Report a positive or negative safety observation</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Observation Type</Label>
                      <Select value={newObservation.observation_type} onValueChange={(v) => setNewObservation({ ...newObservation, observation_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safe">Safe Behavior</SelectItem>
                          <SelectItem value="unsafe">Unsafe Behavior</SelectItem>
                          <SelectItem value="positive">Positive Practice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input value={newObservation.category} onChange={(e) => setNewObservation({ ...newObservation, category: e.target.value })} placeholder="e.g., PPE, Housekeeping, Procedures" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newObservation.description} onChange={(e) => setNewObservation({ ...newObservation, description: e.target.value })} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Behavior Observed</Label>
                      <Textarea value={newObservation.behavior_observed} onChange={(e) => setNewObservation({ ...newObservation, behavior_observed: e.target.value })} rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsObservationDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitObservation} disabled={!newObservation.description || createObservation.isPending}>
                      {createObservation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {myObservations.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <ThumbsUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No observations submitted</h3>
                <p className="text-sm text-muted-foreground">Submit safety observations to improve workplace safety</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myObservations.map((obs: any) => (
                  <Card key={obs.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{obs.observation_number || "Observation"}</CardTitle>
                        <Badge className={obs.observation_type === "unsafe" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"}>
                          {obs.observation_type === "unsafe" ? <ThumbsDown className="mr-1 h-3 w-3" /> : <ThumbsUp className="mr-1 h-3 w-3" />}
                          {obs.observation_type}
                        </Badge>
                      </div>
                      <CardDescription>{obs.observation_date ? formatDateForDisplay(obs.observation_date, "PPP") : "-"} • {obs.category || "General"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{obs.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== My PPE Tab ===== */}
          <TabsContent value="ppe" className="space-y-4">
            {myPPE.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <HardHat className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No PPE issued</h3>
                <p className="text-sm text-muted-foreground">Your personal protective equipment will appear here when issued</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myPPE.map((item: any) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{(item.ppe_type as any)?.name || "PPE Item"}</CardTitle>
                        <Badge variant={item.return_date ? "secondary" : "default"}>
                          {item.return_date ? "Returned" : "Active"}
                        </Badge>
                      </div>
                      <CardDescription>{(item.ppe_type as any)?.category || "General"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span><strong>Issued:</strong> {item.issued_date ? formatDateForDisplay(item.issued_date, "PPP") : "-"}</span>
                        <span><strong>Quantity:</strong> {item.quantity || 1}</span>
                        {item.expiry_date && <span><strong>Expires:</strong> {formatDateForDisplay(item.expiry_date, "PPP")}</span>}
                        {item.return_date && <span><strong>Returned:</strong> {formatDateForDisplay(item.return_date, "PPP")}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== Safety Policies Tab (with acknowledgment) ===== */}
          <TabsContent value="policies" className="space-y-4">
            {activePolicies.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No policies available</h3>
                <p className="text-sm text-muted-foreground">Safety policies will appear here when published</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activePolicies.map((policy) => {
                  const isAcknowledged = acknowledgedPolicyIds.has(policy.id);
                  return (
                    <Card key={policy.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{policy.title}</CardTitle>
                          <Badge>{policy.policy_type}</Badge>
                        </div>
                        <CardDescription>Version {policy.version}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{policy.content?.substring(0, 200)}...</p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />View Policy
                          </Button>
                          {policy.acknowledgment_required && (
                            isAcknowledged ? (
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                                <CheckCircle className="mr-1 h-3 w-3" />Acknowledged
                              </Badge>
                            ) : (
                              <Button size="sm" onClick={() => handleAcknowledgePolicy(policy.id)} disabled={acknowledgePolicy.isPending}>
                                <CheckCircle className="mr-2 h-4 w-4" />Acknowledge
                              </Button>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== My Training Tab ===== */}
          <TabsContent value="training" className="space-y-4">
            {myTrainingRecords.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No training records</h3>
                <p className="text-sm text-muted-foreground">Your safety training history will appear here</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {myTrainingRecords.map((record) => {
                  const isPassed = record.status === "completed" || record.status === "passed";
                  return (
                    <Card key={record.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{(record.training as any)?.title || "Training"}</CardTitle>
                            <CardDescription>Completed: {formatDateForDisplay(record.training_date, "PPP")}</CardDescription>
                          </div>
                          <Badge variant={isPassed ? "secondary" : "destructive"} className={isPassed ? "bg-emerald-500/10 text-emerald-600" : ""}>
                            {isPassed ? <><CheckCircle className="mr-1 h-3 w-3" />Passed</> : "Incomplete"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm">
                          {record.score && <span><strong>Score:</strong> {record.score}%</span>}
                          {record.expiry_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />Expires: {formatDateForDisplay(record.expiry_date, "PPP")}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== Ergonomic Requests Tab ===== */}
          <TabsContent value="ergonomics" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isErgonomicDialogOpen} onOpenChange={setIsErgonomicDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Request Assessment</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Request Ergonomic Assessment</DialogTitle>
                    <DialogDescription>Request a workstation ergonomic assessment</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Workstation Type</Label>
                      <Input value={newErgonomic.workstation_type} onChange={(e) => setNewErgonomic({ ...newErgonomic, workstation_type: e.target.value })} placeholder="e.g., Desk, Standing, Lab" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={newErgonomic.location} onChange={(e) => setNewErgonomic({ ...newErgonomic, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes / Concerns</Label>
                      <Textarea value={newErgonomic.notes} onChange={(e) => setNewErgonomic({ ...newErgonomic, notes: e.target.value })} rows={3} placeholder="Describe any discomfort or concerns..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsErgonomicDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRequestErgonomic} disabled={createErgonomicRequest.isPending}>
                      {createErgonomicRequest.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {myErgonomicRequests.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <Accessibility className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No ergonomic requests</h3>
                <p className="text-sm text-muted-foreground">Request a workstation ergonomic assessment</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {myErgonomicRequests.map((req: any) => (
                  <Card key={req.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{req.workstation_type || "Ergonomic Assessment"}</CardTitle>
                          <CardDescription>{req.assessment_date ? formatDateForDisplay(req.assessment_date, "PPP") : "-"} • {req.location || "-"}</CardDescription>
                        </div>
                        {getStatusBadge(req.status || "requested")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {req.notes && <p className="text-sm text-muted-foreground mb-2">{req.notes}</p>}
                      {req.findings && <p className="text-sm"><strong>Findings:</strong> {req.findings}</p>}
                      {req.recommendations && <p className="text-sm"><strong>Recommendations:</strong> {req.recommendations}</p>}
                      {req.equipment_needed && <p className="text-sm"><strong>Equipment Needed:</strong> {req.equipment_needed}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
