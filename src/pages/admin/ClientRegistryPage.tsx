import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Search, 
  Plus, 
  Eye, 
  PlayCircle,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Rocket
} from "lucide-react";
import { useClientProvisioning, type DemoRegistrationStatus } from "@/hooks/useClientProvisioning";
import { formatDistanceToNow, format } from "date-fns";
import { NavLink, useNavigate } from "react-router-dom";
import { NewDemoRegistrationDialog } from "@/components/admin/provisioning/NewDemoRegistrationDialog";

const STATUS_CONFIG: Record<DemoRegistrationStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  demo_active: { label: "Demo Active", color: "bg-info/10 text-info", icon: PlayCircle },
  converting: { label: "Converting", color: "bg-warning/10 text-warning", icon: Loader2 },
  converted: { label: "Converted", color: "bg-success/10 text-success", icon: CheckCircle2 },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function ClientRegistryPage() {
  const navigate = useNavigate();
  const { registrations, isLoading, startProvisioning } = useClientProvisioning();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    demoActive: registrations.filter(r => r.status === "demo_active").length,
    converting: registrations.filter(r => r.status === "converting").length,
    converted: registrations.filter(r => r.status === "converted").length,
  };

  const handleStartProvisioning = async (id: string) => {
    await startProvisioning(id);
    navigate(`/admin/clients/${id}/provision`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Client Registry</h1>
              <p className="text-muted-foreground">
                Manage demo registrations and client provisioning
              </p>
            </div>
          </div>
          <Button onClick={() => setIsNewDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Registration
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Demos</p>
                  <p className="text-2xl font-bold text-info">{stats.demoActive}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-info/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Provisioning</p>
                  <p className="text-2xl font-bold text-warning">{stats.converting}</p>
                </div>
                <Loader2 className="h-8 w-8 text-warning/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Converted</p>
                  <p className="text-2xl font-bold text-success">{stats.converted}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Client Registrations</CardTitle>
            <CardDescription>
              All demo signups and client onboarding records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by company, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="demo_active">Demo Active</SelectItem>
                  <SelectItem value="converting">Converting</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold">No registrations found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your filters"
                    : "Create a new demo registration to get started"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => {
                      const statusConfig = STATUS_CONFIG[reg.status];
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div className="font-medium">{reg.company_name}</div>
                            {reg.assigned_subdomain && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {reg.assigned_subdomain}.intellihrm.com
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>{reg.contact_name}</div>
                            <div className="text-xs text-muted-foreground">{reg.contact_email}</div>
                          </TableCell>
                          <TableCell>{reg.country}</TableCell>
                          <TableCell>{reg.employee_count || "—"}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(reg.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <NavLink to={`/admin/clients/${reg.id}`}>
                                  <Eye className="h-4 w-4" />
                                </NavLink>
                              </Button>
                              {(reg.status === "demo_active" || reg.status === "pending") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartProvisioning(reg.id)}
                                >
                                  <Rocket className="mr-1 h-4 w-4" />
                                  Provision
                                </Button>
                              )}
                              {reg.status === "converting" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <NavLink to={`/admin/clients/${reg.id}/provision`}>
                                    <PlayCircle className="mr-1 h-4 w-4" />
                                    Continue
                                  </NavLink>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewDemoRegistrationDialog 
        open={isNewDialogOpen} 
        onOpenChange={setIsNewDialogOpen} 
      />
    </AppLayout>
  );
}
