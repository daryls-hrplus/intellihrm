import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, MapPin, Building, Warehouse, Home, Users } from "lucide-react";

interface GeofenceLocation {
  id: string;
  company_id: string;
  name: string;
  code: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  location_type?: string;
  is_active: boolean;
  requires_wifi_validation?: boolean;
  allowed_wifi_ssids?: string[] | null;
}
  is_active: boolean;
  requires_wifi_validation: boolean;
  allowed_wifi_ssids: string[] | null;
}

interface EmployeeAssignment {
  id: string;
  employee_id: string;
  geofence_location_id: string;
  is_primary: boolean;
  allow_remote_clockin: boolean;
  employee?: {
    full_name: string;
    employee_id: string;
  };
}

const LOCATION_TYPES = [
  { value: "office", label: "Office", icon: Building },
  { value: "warehouse", label: "Warehouse", icon: Warehouse },
  { value: "remote_site", label: "Remote Site", icon: MapPin },
  { value: "client_site", label: "Client Site", icon: Users },
  { value: "home", label: "Home Office", icon: Home },
  { value: "other", label: "Other", icon: MapPin },
];

const DEFAULT_LOCATION: Partial<GeofenceLocation> = {
  name: "",
  code: "",
  address: "",
  latitude: 0,
  longitude: 0,
  radius_meters: 100,
  location_type: "office",
  is_active: true,
  requires_wifi_validation: false,
  allowed_wifi_ssids: [],
};

export default function GeofenceLocationsPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<GeofenceLocation>>(DEFAULT_LOCATION);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchLocations();
      fetchEmployees();
    }
  }, [companyId]);

  const fetchLocations = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("geofence_locations")
      .select("*")
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      toast.error("Failed to load locations");
    } else {
      setLocations((data as any[]) || []);
    }
    setLoading(false);
  };
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, employee_id")
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("full_name");
    setEmployees(data || []);
  };

  const fetchAssignments = async (locationId: string) => {
    const { data } = await supabase
      .from("employee_geofence_assignments")
      .select(`
        *,
        employee:employee_id(full_name, employee_id)
      `)
      .eq("geofence_location_id", locationId);
    setAssignments((data as any[]) || []);
  };

  const handleSave = async () => {
    if (!companyId || !editing.name || !editing.code || !editing.latitude || !editing.longitude) {
      toast.error("Please fill in all required fields including coordinates");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: editing.name,
        code: editing.code,
        address: editing.address,
        latitude: editing.latitude,
        longitude: editing.longitude,
        radius_meters: editing.radius_meters,
        location_type: editing.location_type,
        is_active: editing.is_active,
        requires_wifi_validation: editing.requires_wifi_validation,
        company_id: companyId,
      };

      if (editing.id) {
        const { error } = await supabase
          .from("geofence_locations")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Location updated");
      } else {
        const { error } = await supabase
          .from("geofence_locations")
          .insert(payload);
        if (error) throw error;
        toast.success("Location created");
      }

      setIsDialogOpen(false);
      setEditing(DEFAULT_LOCATION);
      fetchLocations();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    const { error } = await supabase.from("geofence_locations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted");
      fetchLocations();
    }
  };

  const handleAssignEmployee = async (employeeId: string) => {
    if (!selectedLocationId) return;
    
    const { error } = await supabase
      .from("employee_geofence_assignments")
      .insert({
        employee_id: employeeId,
        geofence_location_id: selectedLocationId,
        is_primary: assignments.length === 0,
      } as any);

    if (error) {
      toast.error("Failed to assign employee");
    } else {
      toast.success("Employee assigned");
      fetchAssignments(selectedLocationId);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from("employee_geofence_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      toast.error("Failed to remove assignment");
    } else {
      toast.success("Assignment removed");
      if (selectedLocationId) fetchAssignments(selectedLocationId);
    }
  };

  const getLocationIcon = (type: string) => {
    const found = LOCATION_TYPES.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditing({
            ...editing,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success("Location captured");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Time & Attendance", href: "/time" },
            { label: "Geofence Locations" }
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Geofence Locations</h1>
            <p className="text-muted-foreground">
              Define approved work locations for clock-in validation
            </p>
          </div>
          <Button onClick={() => { setEditing(DEFAULT_LOCATION); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work Locations</CardTitle>
            <CardDescription>
              Employees must be within the specified radius to clock in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No locations configured. Add one to enable geofencing.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead>WiFi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {getLocationIcon(loc.location_type)}
                            {loc.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{loc.code}</div>
                          {loc.address && (
                            <div className="text-xs text-muted-foreground">{loc.address}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {loc.location_type.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">
                          {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                        </div>
                      </TableCell>
                      <TableCell>{loc.radius_meters}m</TableCell>
                      <TableCell>
                        {loc.requires_wifi_validation ? (
                          <Badge variant="outline">Required</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={loc.is_active ? "default" : "secondary"}>
                          {loc.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedLocationId(loc.id);
                              fetchAssignments(loc.id);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditing(loc); setIsDialogOpen(true); }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(loc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Location Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit" : "Add"} Location</DialogTitle>
              <DialogDescription>
                Define the location coordinates and validation rules
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editing.name || ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Main Office"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={editing.code || ""}
                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                    placeholder="MAIN_HQ"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editing.address || ""}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  placeholder="123 Main Street, City, Country"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <Select
                    value={editing.location_type}
                    onValueChange={(v) => setEditing({ ...editing, location_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Radius (meters)</Label>
                  <Input
                    type="number"
                    value={editing.radius_meters || ""}
                    onChange={(e) => setEditing({ ...editing, radius_meters: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude *</Label>
                  <Input
                    type="number"
                    step="0.0000001"
                    value={editing.latitude || ""}
                    onChange={(e) => setEditing({ ...editing, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude *</Label>
                  <Input
                    type="number"
                    step="0.0000001"
                    value={editing.longitude || ""}
                    onChange={(e) => setEditing({ ...editing, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <Button variant="outline" onClick={getCurrentLocation} type="button">
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editing.requires_wifi_validation}
                  onCheckedChange={(checked) => setEditing({ ...editing, requires_wifi_validation: checked })}
                />
                <Label>Require WiFi validation</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editing.is_active}
                  onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Employee Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Employees</DialogTitle>
              <DialogDescription>
                Assign employees who can clock in at this location
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Select onValueChange={handleAssignEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee to assign" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(e => !assignments.some(a => a.employee_id === e.id))
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="border rounded-lg divide-y">
                {assignments.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No employees assigned
                  </div>
                ) : (
                  assignments.map((a) => (
                    <div key={a.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.employee?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{a.employee?.employee_id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.is_primary && <Badge>Primary</Badge>}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAssignment(a.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
