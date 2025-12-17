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
import { AlertTriangle, FileText, GraduationCap, CheckCircle, Clock, Plus, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHSE } from "@/hooks/useHSE";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

export default function MyHSEPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { incidents, safetyPolicies, trainingRecords, createIncident } = useHSE();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    incident_type: "near_miss",
    severity: "low",
    location: "",
  });

  // Filter incidents reported by current user
  const myIncidents = incidents?.filter(inc => inc.reported_by === user?.id) || [];
  
  // Filter training records for current user
  const myTrainingRecords = trainingRecords?.filter(rec => rec.employee_id === user?.id) || [];
  
  // Filter active policies
  const activePolicies = safetyPolicies?.filter(p => p.status === "active") || [];

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
      
      toast.success(t('common.success'));
      setIsReportDialogOpen(false);
      setNewIncident({
        title: "",
        description: "",
        incident_type: "near_miss",
        severity: "low",
        location: "",
      });
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return <Badge variant={variants[severity] || "secondary"}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      reported: "outline",
      investigating: "default",
      resolved: "secondary",
      closed: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('navigation.ess'), href: "/ess" },
            { label: t('ess.myHSE.breadcrumb') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('ess.myHSE.title')}</h1>
            <p className="text-muted-foreground">
              {t('ess.myHSE.subtitle')}
            </p>
          </div>
          
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('ess.myHSE.reportIncident')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('ess.myHSE.reportSafetyIncident')}</DialogTitle>
                <DialogDescription>
                  {t('ess.myHSE.reportDescription')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title</Label>
                  <Input
                    id="title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Brief description of the incident"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Incident Type</Label>
                    <Select
                      value={newIncident.incident_type}
                      onValueChange={(value) => setNewIncident({ ...newIncident, incident_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="near_miss">Near Miss</SelectItem>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="property_damage">Property Damage</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="fire">Fire</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={newIncident.severity}
                      onValueChange={(value) => setNewIncident({ ...newIncident, severity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                    placeholder="Where did this occur?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Provide details about what happened..."
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReportIncident} disabled={!newIncident.title || createIncident.isPending}>
                  {createIncident.isPending ? "Reporting..." : "Report Incident"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incidents">
              <AlertTriangle className="mr-2 h-4 w-4" />
              My Incidents
            </TabsTrigger>
            <TabsTrigger value="policies">
              <FileText className="mr-2 h-4 w-4" />
              Safety Policies
            </TabsTrigger>
            <TabsTrigger value="training">
              <GraduationCap className="mr-2 h-4 w-4" />
              My Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            {myIncidents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No incidents reported</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't reported any safety incidents yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myIncidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription>
                            {incident.incident_number} • {format(new Date(incident.incident_date), "PPP")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
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

          <TabsContent value="policies" className="space-y-4">
            {activePolicies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No policies available</h3>
                  <p className="text-sm text-muted-foreground">
                    Safety policies will appear here when published
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activePolicies.map((policy) => (
                  <Card key={policy.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{policy.title}</CardTitle>
                        <Badge>{policy.policy_type}</Badge>
                      </div>
                      <CardDescription>Version {policy.version}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {policy.content?.substring(0, 200)}...
                      </p>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Policy
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {myTrainingRecords.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No training records</h3>
                  <p className="text-sm text-muted-foreground">
                    Your safety training history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myTrainingRecords.map((record) => {
                  const isPassed = record.status === "completed" || record.status === "passed";
                  return (
                    <Card key={record.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {(record.training as any)?.title || "Training"}
                            </CardTitle>
                            <CardDescription>
                              Completed: {format(new Date(record.training_date), "PPP")}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPassed ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Passed
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Incomplete</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm">
                          {record.score && <span><strong>Score:</strong> {record.score}%</span>}
                          {record.expiry_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {format(new Date(record.expiry_date), "PPP")}
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
        </Tabs>
      </div>
    </AppLayout>
  );
}
