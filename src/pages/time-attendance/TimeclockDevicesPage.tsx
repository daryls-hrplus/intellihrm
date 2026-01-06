import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { 
  Plus, Wifi, WifiOff, Trash2, Edit, Loader2, Monitor, 
  RefreshCw, TestTube, Users, History, Link, AlertCircle, CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface TimeclockDevice {
  id: string;
  device_code: string;
  device_name: string;
  device_type: string;
  ip_address: string | null;
  port: number | null;
  serial_number: string | null;
  manufacturer: string | null;
  model: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  last_heartbeat_at: string | null;
  sync_status: string;
  pending_punches: number;
  location?: { name: string } | null;
  settings?: Record<string, unknown>;
}

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_synced: number;
  records_failed: number;
  error_message: string | null;
}

interface DeviceUserMapping {
  id: string;
  device_user_id: string;
  device_user_name: string | null;
  employee_id: string | null;
  fingerprint_count: number;
  card_number: string | null;
  employee?: { first_name: string; first_last_name: string | null } | null;
}

const statusColors: Record<string, string> = {
  online: "bg-green-500/20 text-green-700",
  offline: "bg-red-500/20 text-red-700",
  syncing: "bg-blue-500/20 text-blue-700",
  error: "bg-orange-500/20 text-orange-700",
  unknown: "bg-muted text-muted-foreground",
};

export default function TimeclockDevicesPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<TimeclockDevice[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; first_name: string; first_last_name: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TimeclockDevice | null>(null);
  const [editingDevice, setEditingDevice] = useState<TimeclockDevice | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [userMappings, setUserMappings] = useState<DeviceUserMapping[]>([]);
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    device_code: "",
    device_name: "",
    device_type: "biometric",
    ip_address: "",
    port: "4370",
    serial_number: "",
    manufacturer: "ZKTeco",
    model: "",
    location_id: "",
  });

  const deviceTypes = [
    { value: "biometric", label: t("timeAttendance.devices.types.biometric") },
    { value: "facial", label: t("timeAttendance.devices.types.facial") },
    { value: "card", label: t("timeAttendance.devices.types.card") },
    { value: "pin", label: t("timeAttendance.devices.types.pin") },
    { value: "mobile", label: t("timeAttendance.devices.types.mobile") },
  ];

  const manufacturers = [
    "ZKTeco", "Anviz", "Suprema", "Fingertec", "Biomax", "Hikvision", "Other"
  ];

  useEffect(() => {
    if (profile?.company_id) {
      loadData();
    }
  }, [profile?.company_id]);

  const loadData = async () => {
    setIsLoading(true);
    const [devicesRes, locationsRes, employeesRes] = await Promise.all([
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
      supabase
        .from("profiles")
        .select("id, first_name, first_last_name")
        .eq("company_id", profile?.company_id)
        .order("first_name"),
    ]);
    if (devicesRes.data) setDevices(devicesRes.data as TimeclockDevice[]);
    if (locationsRes.data) setLocations(locationsRes.data);
    if (employeesRes.data) setEmployees(employeesRes.data);
    setIsLoading(false);
  };

  const loadDeviceDetails = async (deviceId: string) => {
    const [logsRes, mappingsRes] = await Promise.all([
      supabase
        .from("device_sync_logs")
        .select("*")
        .eq("device_id", deviceId)
        .order("started_at", { ascending: false })
        .limit(20),
      supabase
        .from("device_user_mappings")
        .select("*, employee:profiles(first_name, first_last_name)")
        .eq("device_id", deviceId),
    ]);
    if (logsRes.data) setSyncLogs(logsRes.data);
    if (mappingsRes.data) setUserMappings(mappingsRes.data as DeviceUserMapping[]);
  };

  const handleSave = async () => {
    if (!profile?.company_id) return;
    try {
      const payload = {
        ...formData,
        port: parseInt(formData.port) || 4370,
        company_id: profile.company_id,
        location_id: formData.location_id || null,
        api_key: editingDevice ? undefined : crypto.randomUUID(),
      };

      if (editingDevice) {
        await supabase.from("timeclock_devices").update(payload).eq("id", editingDevice.id);
        toast({ title: t("timeAttendance.devices.deviceUpdated") });
      } else {
        await supabase.from("timeclock_devices").insert(payload);
        toast({ title: t("timeAttendance.devices.deviceAdded") });
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: t("common.error"), description: t("timeAttendance.devices.saveFailed"), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("timeclock_devices").delete().eq("id", id);
    toast({ title: t("timeAttendance.devices.deviceDeleted") });
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
      port: String(device.port || 4370),
      serial_number: device.serial_number || "",
      manufacturer: device.manufacturer || "ZKTeco",
      model: device.model || "",
      location_id: "",
    });
    setDialogOpen(true);
  };

  const openDetails = async (device: TimeclockDevice) => {
    setSelectedDevice(device);
    await loadDeviceDetails(device.id);
    setDetailsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDevice(null);
    setFormData({ device_code: "", device_name: "", device_type: "biometric", ip_address: "", port: "4370", serial_number: "", manufacturer: "ZKTeco", model: "", location_id: "" });
  };

  const handleTestConnection = async (device: TimeclockDevice) => {
    if (!profile?.company_id || !profile?.id) return;
    
    setIsSyncing({ ...isSyncing, [device.id]: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('zkteco-device-sync', {
        body: {
          action: 'test_connection',
          device_id: device.id,
          company_id: profile.company_id,
          user_id: profile.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({ 
          title: "Connection Successful", 
          description: `Device ${device.device_name} is online`,
        });
      } else {
        toast({ 
          title: "Connection Failed", 
          description: data.error || "Could not connect to device",
          variant: "destructive"
        });
      }
      loadData();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSyncing({ ...isSyncing, [device.id]: false });
    }
  };

  const handleSyncAttendance = async (device: TimeclockDevice) => {
    if (!profile?.company_id || !profile?.id) return;
    
    setIsSyncing({ ...isSyncing, [device.id]: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('zkteco-device-sync', {
        body: {
          action: 'sync_attendance',
          device_id: device.id,
          company_id: profile.company_id,
          user_id: profile.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({ 
          title: "Sync Complete", 
          description: `Synced ${data.synced} records from ${device.device_name}`,
        });
      } else {
        toast({ 
          title: "Sync Failed", 
          description: data.error || "Could not sync attendance",
          variant: "destructive"
        });
      }
      loadData();
      if (selectedDevice?.id === device.id) {
        loadDeviceDetails(device.id);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSyncing({ ...isSyncing, [device.id]: false });
    }
  };

  const handleSyncUsers = async (device: TimeclockDevice) => {
    if (!profile?.company_id || !profile?.id) return;
    
    setIsSyncing({ ...isSyncing, [`${device.id}-users`]: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('zkteco-device-sync', {
        body: {
          action: 'sync_users',
          device_id: device.id,
          company_id: profile.company_id,
          user_id: profile.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({ 
          title: "Users Synced", 
          description: data.message,
        });
        if (selectedDevice?.id === device.id) {
          loadDeviceDetails(device.id);
        }
      } else {
        toast({ 
          title: "Sync Failed", 
          description: data.error || "Could not sync users",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSyncing({ ...isSyncing, [`${device.id}-users`]: false });
    }
  };

  const handleMapEmployee = async (mappingId: string, employeeId: string) => {
    await supabase
      .from("device_user_mappings")
      .update({ employee_id: employeeId || null })
      .eq("id", mappingId);
    
    if (selectedDevice) {
      loadDeviceDetails(selectedDevice.id);
    }
    toast({ title: "Mapping Updated" });
  };

  const handleSyncAllUsersToDevice = async (device: TimeclockDevice) => {
    if (!profile?.company_id || !profile?.id) return;
    
    setIsSyncing({ ...isSyncing, [`${device.id}-push`]: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('zkteco-device-sync', {
        body: {
          action: 'sync_all_users_to_device',
          device_id: device.id,
          company_id: profile.company_id,
          user_id: profile.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({ 
          title: "Users Synced to Device", 
          description: `${data.pushed} users pushed, ${data.failed} failed`,
        });
        loadDeviceDetails(device.id);
      } else {
        toast({ 
          title: "Sync Failed", 
          description: data.error || "Could not sync users to device",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSyncing({ ...isSyncing, [`${device.id}-push`]: false });
    }
  };

  const handlePushUserToDevices = async (employeeId: string, sourceDeviceId: string, targetDeviceIds: string[]) => {
    if (!profile?.company_id || !profile?.id || targetDeviceIds.length === 0) return;
    
    setIsSyncing({ ...isSyncing, [`push-${employeeId}`]: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('zkteco-device-sync', {
        body: {
          action: 'push_user_to_devices',
          device_id: sourceDeviceId,
          company_id: profile.company_id,
          user_id: profile.id,
          options: {
            employee_id: employeeId,
            source_device_id: sourceDeviceId,
            target_device_ids: targetDeviceIds
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({ 
          title: "User Pushed to Devices", 
          description: data.message,
        });
        if (selectedDevice) {
          loadDeviceDetails(selectedDevice.id);
        }
      } else {
        toast({ 
          title: "Push Failed", 
          description: data.error || "Could not push user to devices",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSyncing({ ...isSyncing, [`push-${employeeId}`]: false });
    }
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
        <Breadcrumbs items={[{ label: t("navigation.timeAttendance"), href: "/time-attendance" }, { label: t("timeAttendance.devices.title") }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("timeAttendance.devices.title")}</h1>
              <p className="text-muted-foreground">{t("timeAttendance.devices.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />{t("timeAttendance.devices.addDevice")}</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.devices.totalDevices")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{devices.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.devices.online")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{devices.filter(d => d.sync_status === "online").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.devices.offline")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{devices.filter(d => d.sync_status === "offline").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.devices.pendingPunches")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{devices.reduce((sum, d) => sum + (d.pending_punches || 0), 0)}</div></CardContent></Card>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("timeAttendance.devices.device")}</TableHead>
                <TableHead>{t("common.type")}</TableHead>
                <TableHead>IP / Port</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("timeAttendance.devices.lastSync")}</TableHead>
                <TableHead>{t("common.active")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("timeAttendance.devices.noDevices")}</TableCell></TableRow>
              ) : devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="font-medium">{device.device_name}</div>
                    <div className="text-sm text-muted-foreground">{device.manufacturer} {device.model}</div>
                  </TableCell>
                  <TableCell>{deviceTypes.find(t => t.value === device.device_type)?.label}</TableCell>
                  <TableCell>
                    {device.ip_address ? (
                      <span className="font-mono text-sm">{device.ip_address}:{device.port || 4370}</span>
                    ) : (
                      <span className="text-muted-foreground">Not configured</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[device.sync_status]}>
                      {device.sync_status === "online" ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                      {device.sync_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{device.last_sync_at ? format(parseISO(device.last_sync_at), "MMM d, HH:mm") : t("common.never")}</TableCell>
                  <TableCell><Switch checked={device.is_active} onCheckedChange={() => handleToggleActive(device)} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleTestConnection(device)}
                        disabled={!device.ip_address || isSyncing[device.id]}
                        title="Test Connection"
                      >
                        {isSyncing[device.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleSyncAttendance(device)}
                        disabled={!device.ip_address || isSyncing[device.id]}
                        title="Sync Attendance"
                      >
                        <RefreshCw className={`h-4 w-4 ${isSyncing[device.id] ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDetails(device)} title="View Details">
                        <History className="h-4 w-4" />
                      </Button>
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

      {/* Add/Edit Device Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingDevice ? t("timeAttendance.devices.editDevice") : t("timeAttendance.devices.addTimeclockDevice")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("timeAttendance.devices.deviceCode")} *</Label><Input value={formData.device_code} onChange={(e) => setFormData({ ...formData, device_code: e.target.value })} placeholder="DEV001" /></div>
              <div className="space-y-2"><Label>{t("timeAttendance.devices.deviceName")} *</Label><Input value={formData.device_name} onChange={(e) => setFormData({ ...formData, device_name: e.target.value })} placeholder="Main Entrance" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("timeAttendance.devices.manufacturer")}</Label>
                <Select value={formData.manufacturer} onValueChange={(v) => setFormData({ ...formData, manufacturer: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{manufacturers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("timeAttendance.devices.deviceType")}</Label>
                <Select value={formData.device_type} onValueChange={(v) => setFormData({ ...formData, device_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{deviceTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2"><Label>{t("timeAttendance.devices.ipAddress")} *</Label><Input value={formData.ip_address} onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })} placeholder="192.168.1.100" /></div>
              <div className="space-y-2"><Label>Port</Label><Input value={formData.port} onChange={(e) => setFormData({ ...formData, port: e.target.value })} placeholder="4370" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("timeAttendance.devices.model")}</Label><Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="K40, F18, etc." /></div>
              <div className="space-y-2"><Label>{t("timeAttendance.devices.serialNumber")}</Label><Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.location")}</Label>
              <Select value={formData.location_id} onValueChange={(v) => setFormData({ ...formData, location_id: v })}>
                <SelectTrigger><SelectValue placeholder={t("common.selectLocation")} /></SelectTrigger>
                <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!formData.device_code || !formData.device_name || !formData.ip_address}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Device Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {selectedDevice?.device_name}
            </DialogTitle>
            <DialogDescription>
              {selectedDevice?.manufacturer} {selectedDevice?.model} • {selectedDevice?.ip_address}:{selectedDevice?.port || 4370}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> User Mappings
              </TabsTrigger>
              <TabsTrigger value="cross-sync" className="flex items-center gap-2">
                <Link className="h-4 w-4" /> Cross-Device Sync
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <History className="h-4 w-4" /> Sync History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Map device users to employees for attendance sync
                </p>
                <Button 
                  size="sm" 
                  onClick={() => selectedDevice && handleSyncUsers(selectedDevice)}
                  disabled={isSyncing[`${selectedDevice?.id}-users`]}
                >
                  {isSyncing[`${selectedDevice?.id}-users`] ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync Users from Device
                </Button>
              </div>
              
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device User ID</TableHead>
                      <TableHead>Device User Name</TableHead>
                      <TableHead>Fingerprints</TableHead>
                      <TableHead>Mapped Employee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userMappings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No users synced. Click "Sync Users from Device" to fetch users.
                        </TableCell>
                      </TableRow>
                    ) : userMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-mono">{mapping.device_user_id}</TableCell>
                        <TableCell>{mapping.device_user_name || '-'}</TableCell>
                        <TableCell>{mapping.fingerprint_count}</TableCell>
                        <TableCell>
                          <Select 
                            value={mapping.employee_id || ""} 
                            onValueChange={(v) => handleMapEmployee(mapping.id, v)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select employee..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-- Unassigned --</SelectItem>
                              {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.first_last_name || ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cross-sync" className="mt-4">
              <div className="space-y-4">
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Pull Users from Other Devices
                    </CardTitle>
                    <CardDescription>
                      Sync all registered users from other devices to this one. Employees only need to register once.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => selectedDevice && handleSyncAllUsersToDevice(selectedDevice)}
                      disabled={isSyncing[`${selectedDevice?.id}-push`]}
                    >
                      {isSyncing[`${selectedDevice?.id}-push`] ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      Sync All Users to This Device
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Push Individual User to Other Devices
                    </CardTitle>
                    <CardDescription>
                      Select a user registered on this device to push to other devices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userMappings.filter(m => m.employee_id).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No mapped users on this device. Map employees in the "User Mappings" tab first.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {userMappings.filter(m => m.employee_id).map((mapping) => (
                          <div key={mapping.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div>
                              <p className="font-medium">{mapping.device_user_name || `User ${mapping.device_user_id}`}</p>
                              <p className="text-sm text-muted-foreground">
                                {mapping.fingerprint_count} fingerprints • ID: {mapping.device_user_id}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const otherDeviceIds = devices
                                  .filter(d => d.id !== selectedDevice?.id && d.is_active && d.ip_address)
                                  .map(d => d.id);
                                if (mapping.employee_id && selectedDevice) {
                                  handlePushUserToDevices(mapping.employee_id, selectedDevice.id, otherDeviceIds);
                                }
                              }}
                              disabled={isSyncing[`push-${mapping.employee_id}`] || devices.filter(d => d.id !== selectedDevice?.id).length === 0}
                            >
                              {isSyncing[`push-${mapping.employee_id}`] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Push to All Devices
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <strong>How it works:</strong> When an employee registers their fingerprint on one device, 
                  you can push their credentials to all other devices so they don't need to register again. 
                  This saves time and ensures consistent user IDs across all terminals.
                </div>
              </div>
            </TabsContent>
            <TabsContent value="logs" className="mt-4">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No sync history yet
                        </TableCell>
                      </TableRow>
                    ) : syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="capitalize">{log.sync_type.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge className={
                            log.status === 'completed' ? 'bg-green-500/20 text-green-700' :
                            log.status === 'failed' ? 'bg-red-500/20 text-red-700' :
                            'bg-blue-500/20 text-blue-700'
                          }>
                            {log.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                             log.status === 'failed' ? <AlertCircle className="h-3 w-3 mr-1" /> : 
                             <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(parseISO(log.started_at), "MMM d, HH:mm")}</TableCell>
                        <TableCell>
                          {log.records_synced > 0 && <span className="text-green-600">{log.records_synced} synced</span>}
                          {log.records_failed > 0 && <span className="text-red-600 ml-2">{log.records_failed} failed</span>}
                          {log.records_synced === 0 && log.records_failed === 0 && '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
