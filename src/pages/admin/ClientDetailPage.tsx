import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Users, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  PlayCircle,
  Rocket,
  ExternalLink,
  Save
} from "lucide-react";
import { useClientProvisioning, type DemoRegistration, type DemoRegistrationStatus } from "@/hooks/useClientProvisioning";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const STATUS_CONFIG: Record<DemoRegistrationStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  demo_active: { label: "Demo Active", color: "bg-info/10 text-info", icon: PlayCircle },
  converting: { label: "Converting", color: "bg-warning/10 text-warning", icon: Loader2 },
  converted: { label: "Converted", color: "bg-success/10 text-success", icon: CheckCircle2 },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRegistrationById, updateRegistration, startProvisioning } = useClientProvisioning();
  
  const [registration, setRegistration] = useState<DemoRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await getRegistrationById(id);
      setRegistration(data);
      setNotes(data?.notes || "");
      setIsLoading(false);
    };
    fetchData();
  }, [id, getRegistrationById]);

  const handleStatusChange = async (newStatus: DemoRegistrationStatus) => {
    if (!registration) return;
    
    const updates: Partial<DemoRegistration> = { status: newStatus };
    
    if (newStatus === "demo_active" && !registration.demo_started_at) {
      updates.demo_started_at = new Date().toISOString();
      // Set demo expiry to 14 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14);
      updates.demo_expires_at = expiryDate.toISOString();
    }
    
    if (newStatus === "converted" && !registration.converted_at) {
      updates.converted_at = new Date().toISOString();
    }
    
    await updateRegistration(registration.id, updates);
    setRegistration({ ...registration, ...updates });
  };

  const handleSaveNotes = async () => {
    if (!registration) return;
    setIsSaving(true);
    try {
      await updateRegistration(registration.id, { notes });
      toast.success("Notes saved");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartProvisioning = async () => {
    if (!registration) return;
    await startProvisioning(registration.id);
    navigate(`/admin/clients/${registration.id}/provision`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!registration) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Registration Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The registration you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <NavLink to="/admin/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Registry
            </NavLink>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[registration.status];
  const StatusIcon = statusConfig.icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <NavLink to="/admin/clients">
                <ArrowLeft className="h-4 w-4" />
              </NavLink>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{registration.company_name}</h1>
                <p className="text-muted-foreground">
                  Registered {formatDistanceToNow(new Date(registration.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {registration.assigned_subdomain && (
              <Button variant="outline" asChild>
                <a 
                  href={`https://${registration.assigned_subdomain}.intellihrm.com`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Site
                </a>
              </Button>
            )}
            {(registration.status === "demo_active" || registration.status === "pending") && (
              <Button onClick={handleStartProvisioning}>
                <Rocket className="mr-2 h-4 w-4" />
                Start Provisioning
              </Button>
            )}
            {registration.status === "converting" && (
              <Button asChild>
                <NavLink to={`/admin/clients/${registration.id}/provision`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Provisioning
                </NavLink>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                    <p className="font-medium">{registration.contact_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <a href={`mailto:${registration.contact_email}`} className="font-medium text-primary hover:underline">
                      {registration.contact_email}
                    </a>
                  </div>
                </div>
                {registration.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="font-medium">{registration.contact_phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="font-medium">{registration.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {registration.industry && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="font-medium">{registration.industry}</p>
                  </div>
                )}
                {registration.employee_count && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employee Count</p>
                    <p className="font-medium">{registration.employee_count}</p>
                  </div>
                )}
                {registration.preferred_subdomain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Subdomain</p>
                    <p className="font-medium">{registration.preferred_subdomain}.intellihrm.com</p>
                  </div>
                )}
                {registration.assigned_subdomain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned Subdomain</p>
                    <p className="font-medium text-success">{registration.assigned_subdomain}.intellihrm.com</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Internal notes about this client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add notes about this client..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={isSaving || notes === registration.notes}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig.color} gap-1 text-sm py-1 px-3`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Change Status
                  </label>
                  <Select 
                    value={registration.status} 
                    onValueChange={(v) => handleStatusChange(v as DemoRegistrationStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="demo_active">Demo Active</SelectItem>
                      <SelectItem value="converting">Converting</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Registered</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(registration.created_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
                
                {registration.demo_started_at && (
                  <div className="flex items-start gap-3">
                    <PlayCircle className="h-4 w-4 text-info mt-1" />
                    <div>
                      <p className="text-sm font-medium">Demo Started</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(registration.demo_started_at), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}
                
                {registration.demo_expires_at && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-warning mt-1" />
                    <div>
                      <p className="text-sm font-medium">Demo Expires</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(registration.demo_expires_at), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
                
                {registration.conversion_requested_at && (
                  <div className="flex items-start gap-3">
                    <Rocket className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium">Conversion Requested</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(registration.conversion_requested_at), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}
                
                {registration.converted_at && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                    <div>
                      <p className="text-sm font-medium">Converted</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(registration.converted_at), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Info */}
            {registration.lovable_project_id && (
              <Card>
                <CardHeader>
                  <CardTitle>Lovable Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {registration.lovable_project_id}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
