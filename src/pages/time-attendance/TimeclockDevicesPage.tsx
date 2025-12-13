import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format, parseISO } from "date-fns";
import { Plus, Wifi, WifiOff, RefreshCw, Trash2, Edit, Loader2, Monitor } from "lucide-react";

interface TimeclockDevice {
  id: string;
  device_code: string;
  device_name: string;
  device_type: string;
  ip_address: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  model: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  last_heartbeat_at: string | null;
  sync_status: string;
  pending_punches: number;
  location?: { name: string } | null;
}

const deviceTypes = [
  { value: "biometric", label: "Biometric (Fingerprint)" },
  { value: "facial", label: "Facial Recognition" },
  { value: "card", label: "Card Reader" },
  { value: "pin", label: "PIN Entry" },
  { value: "mobile", label: "Mobile Device" },
];

const statusColors: Record<string, string> = {
  online: "bg-green-500/20 text-green-700",
  offline: "bg-red-500/20 text-red-700",
  syncing: "bg-blue-500/20 text-blue-700",
  error: "bg-orange-500/20 text-orange-700",
  unknown: "bg-muted text-muted-foreground",
};

export default function TimeclockDevicesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<TimeclockDevice[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<TimeclockDevice | null>(null);
  const [formData, setFormData] = useState({
    device_code: "",
    device_name: "",
    device_type: "biometric",
    ip_address: "",
    serial_number: "",
    manufacturer: "",
    model: "",
    location_id: "",
  });

  useEffect(() => {
    if (profile?.company_id) {
      loadData();
    }
  }, [profile?.company_id]);

  const loadData = async () => {
    setIsLoading(true);
    const [devicesRes, locationsRes] = await Promise.all([
      supabase
        .from("timeclock_devices")
        .select("*, location:geofence_locations(name)")
        .eq("company_id", profile?.company_id)
        .order("device_name"),
      supabase
        .from("geofence_locations")
        .select("id, name")
        .eq("company_id", profile?.company_id)
        .eq("is_active", true),
    ]);
    if (devicesRes.data) setDevices(devicesRes.data as TimeclockDevice[]);
    if (locationsRes.data) setLocations(locationsRes.data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!profile?.company_id) return;
    try {
      const payload = {
        ...formData,
        company_id: profile.company_id,
        location_id: formData.location_id || null,
        api_key: editingDevice ? undefined : crypto.randomUUID(),
      };

      if (editingDevice) {
        await supabase.from("timeclock_devices").update(payload).eq("id", editingDevice.id);
        toast({ title: "Device updated" });
      } else {
        await supabase.from("timeclock_devices").insert(payload);
        toast({ title: "Device added" });
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save device", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("timeclock_devices").delete().eq("id", id);
    toast({ title: "Device deleted" });
    loadData();
  };

  const handleToggleActive = async (device: TimeclockDevice) => {
    await supabase.from("timeclock_devices").update({ is_active: !device.is_active }).eq("id", device.id);
    loadData();
  };

  const openEdit = (device: TimeclockDevice) => {
    setEditingDevice(device);
    setFormData({
      device_code: device.device_code,
      device_name: device.device_name,
      device_type: device.device_type,
      ip_address: device.ip_address || "",
      serial_number: device.serial_number || "",
      manufacturer: device.manufacturer || "",
      model: device.model || "",
      location_id: "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDevice(null);
    setFormData({ device_code: "", device_name: "", device_type: "biometric", ip_address: "", serial_number: "", manufacturer: "", model: "", location_id: "" });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Time & Attendance", href: "/time-attendance" }, { label: "Timeclock Devices" }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Timeclock Devices</h1>
              <p className="text-muted-foreground">Manage physical timeclock terminals</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Device</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Devices</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{devices.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Online</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{devices.filter(d => d.sync_status === "online").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Offline</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{devices.filter(d => d.sync_status === "offline").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Punches</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{devices.reduce((sum, d) => sum + (d.pending_punches || 0), 0)}</div></CardContent></Card>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No devices configured</TableCell></TableRow>
              ) : devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="font-medium">{device.device_name}</div>
                    <div className="text-sm text-muted-foreground">{device.device_code}</div>
                  </TableCell>
                  <TableCell>{deviceTypes.find(t => t.value === device.device_type)?.label}</TableCell>
                  <TableCell>{device.location?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[device.sync_status]}>
                      {device.sync_status === "online" ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                      {device.sync_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{device.last_sync_at ? format(parseISO(device.last_sync_at), "MMM d, HH:mm") : "Never"}</TableCell>
                  <TableCell>{device.pending_punches || 0}</TableCell>
                  <TableCell><Switch checked={device.is_active} onCheckedChange={() => handleToggleActive(device)} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(device)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(device.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingDevice ? "Edit Device" : "Add Timeclock Device"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Device Code *</Label><Input value={formData.device_code} onChange={(e) => setFormData({ ...formData, device_code: e.target.value })} /></div>
              <div className="space-y-2"><Label>Device Name *</Label><Input value={formData.device_name} onChange={(e) => setFormData({ ...formData, device_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select value={formData.device_type} onValueChange={(v) => setFormData({ ...formData, device_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{deviceTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={formData.location_id} onValueChange={(v) => setFormData({ ...formData, location_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>IP Address</Label><Input value={formData.ip_address} onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })} /></div>
              <div className="space-y-2"><Label>Serial Number</Label><Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Manufacturer</Label><Input value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} /></div>
              <div className="space-y-2"><Label>Model</Label><Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.device_code || !formData.device_name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
