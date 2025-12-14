import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { FaceCaptureDialog } from "@/components/time-attendance/FaceCaptureDialog";
import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  Building2,
  Users,
  AlertTriangle,
  Navigation,
  Target,
  Camera,
  UserCheck
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface GeofenceLocation {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_headquarters: boolean;
  is_active: boolean;
  requires_geofence: boolean;
  allow_clock_outside: boolean;
  requires_face_capture: boolean;
  start_date: string;
  end_date: string | null;
}

interface FaceEnrollment {
  id: string;
  company_id: string;
  employee_id: string;
  photo_url: string;
  enrolled_at: string;
  is_active: boolean;
  notes: string | null;
  profile?: { full_name: string } | null;
}

interface GeofenceAssignment {
  id: string;
  company_id: string;
  employee_id: string;
  geofence_id: string;
  is_primary: boolean;
  effective_date: string;
  end_date: string | null;
  notes: string | null;
  profile?: { full_name: string } | null;
  geofence?: { name: string; code: string } | null;
}

interface GeofenceViolation {
  id: string;
  employee_id: string;
  violation_type: string;
  latitude: number | null;
  longitude: number | null;
  distance_meters: number | null;
  action_taken: string | null;
  notes: string | null;
  created_at: string;
  profile?: { full_name: string } | null;
  nearest_geofence?: { name: string } | null;
}

export default function GeofenceManagementPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("locations");
  
  // Locations
  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<GeofenceLocation | null>(null);
const [locationForm, setLocationForm] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    radius_meters: 100,
    is_headquarters: false,
    is_active: true,
    requires_geofence: true,
    allow_clock_outside: false,
    requires_face_capture: false,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: ""
  });
  
  // Face Enrollments
  const [faceEnrollments, setFaceEnrollments] = useState<FaceEnrollment[]>([]);
  const [faceDialogOpen, setFaceDialogOpen] = useState(false);
  const [selectedEmployeeForFace, setSelectedEmployeeForFace] = useState<string>("");
  
  // Assignments
  const [assignments, setAssignments] = useState<GeofenceAssignment[]>([]);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [assignmentForm, setAssignmentForm] = useState({
    employee_id: "",
    geofence_id: "",
    is_primary: true,
    effective_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: "",
    notes: ""
  });
  
  // Violations
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadAllData();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error("Failed to load companies");
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

const loadAllData = async () => {
    await Promise.all([
      loadLocations(),
      loadAssignments(),
      loadViolations(),
      loadEmployees(),
      loadFaceEnrollments()
    ]);
  };

  const loadLocations = async () => {
    const { data, error } = await supabase
      .from('geofence_locations')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (error) {
      console.error("Failed to load locations:", error);
      return;
    }
    setLocations(data || []);
  };

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from('employee_geofence_assignments')
      .select('*, profile:profiles(full_name), geofence:geofence_locations(name, code)')
      .eq('company_id', selectedCompany)
      .order('effective_date', { ascending: false });
    
    if (error) {
      console.error("Failed to load assignments:", error);
      return;
    }
    setAssignments(data || []);
  };

  const loadViolations = async () => {
    const { data, error } = await supabase
      .from('geofence_violations')
      .select('*, profile:profiles!geofence_violations_employee_id_fkey(full_name), nearest_geofence:geofence_locations(name)')
      .eq('company_id', selectedCompany)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error("Failed to load violations:", error);
      return;
    }
    setViolations(data || []);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    setEmployees(data || []);
  };

  // Get current location for form
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationForm(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        toast.success("Location captured");
      },
      (error) => {
        toast.error("Unable to get current location");
      }
    );
  };

  // Location CRUD
  const handleSaveLocation = async () => {
    if (!locationForm.name || !locationForm.code || !locationForm.latitude || !locationForm.longitude) {
      toast.error("Name, code, latitude and longitude are required");
      return;
    }

const payload = {
      company_id: selectedCompany,
      name: locationForm.name,
      code: locationForm.code,
      description: locationForm.description || null,
      address: locationForm.address || null,
      latitude: parseFloat(locationForm.latitude),
      longitude: parseFloat(locationForm.longitude),
      radius_meters: locationForm.radius_meters,
      is_headquarters: locationForm.is_headquarters,
      is_active: locationForm.is_active,
      requires_geofence: locationForm.requires_geofence,
      allow_clock_outside: locationForm.allow_clock_outside,
      requires_face_capture: locationForm.requires_face_capture,
      start_date: locationForm.start_date,
      end_date: locationForm.end_date || null
    };

    let error;
    if (editingLocation) {
      ({ error } = await supabase.from('geofence_locations').update(payload).eq('id', editingLocation.id));
    } else {
      ({ error } = await supabase.from('geofence_locations').insert(payload));
    }

    if (error) {
      toast.error("Failed to save location");
      console.error(error);
      return;
    }

    toast.success(editingLocation ? "Location updated" : "Location created");
    setLocationDialogOpen(false);
    resetLocationForm();
    loadLocations();
  };

  const handleDeleteLocation = async (id: string) => {
    const { error } = await supabase.from('geofence_locations').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete location");
      return;
    }
    toast.success("Location deleted");
    loadLocations();
  };

const resetLocationForm = () => {
    setEditingLocation(null);
    setLocationForm({
      name: "",
      code: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      radius_meters: 100,
      is_headquarters: false,
      is_active: true,
      requires_geofence: true,
      allow_clock_outside: false,
      requires_face_capture: false,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: ""
    });
  };

const openEditLocation = (location: GeofenceLocation) => {
    setEditingLocation(location);
    setLocationForm({
      name: location.name,
      code: location.code,
      description: location.description || "",
      address: location.address || "",
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius_meters: location.radius_meters,
      is_headquarters: location.is_headquarters,
      is_active: location.is_active,
      requires_geofence: location.requires_geofence,
      allow_clock_outside: location.allow_clock_outside,
      requires_face_capture: location.requires_face_capture,
      start_date: location.start_date,
      end_date: location.end_date || ""
    });
    setLocationDialogOpen(true);
  };

// Face Enrollment Functions
  const loadFaceEnrollments = async () => {
    const { data, error } = await supabase
      .from('employee_face_enrollments')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('enrolled_at', { ascending: false });
    
    if (error) {
      console.error("Failed to load face enrollments:", error);
      return;
    }

    // Get employee names separately
    if (data && data.length > 0) {
      const employeeIds = data.map(d => d.employee_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', employeeIds);
      
      const enrichedData = data.map(enrollment => ({
        ...enrollment,
        profile: profiles?.find(p => p.id === enrollment.employee_id) || null
      }));
      setFaceEnrollments(enrichedData as FaceEnrollment[]);
    } else {
      setFaceEnrollments([]);
    }
  };

  const handleFaceCapture = async (photoDataUrl: string) => {
    if (!selectedEmployeeForFace) {
      toast.error("Please select an employee");
      return;
    }

    // Check if employee already has enrollment
    const existingEnrollment = faceEnrollments.find(e => e.employee_id === selectedEmployeeForFace);
    
    if (existingEnrollment) {
      // Update existing
      const { error } = await supabase
        .from('employee_face_enrollments')
        .update({
          photo_url: photoDataUrl,
          enrolled_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', existingEnrollment.id);

      if (error) {
        toast.error("Failed to update face enrollment");
        console.error(error);
        return;
      }
    } else {
      // Create new
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('employee_face_enrollments')
        .insert({
          company_id: selectedCompany,
          employee_id: selectedEmployeeForFace,
          photo_url: photoDataUrl,
          enrolled_by: user.user?.id || null
        });

      if (error) {
        toast.error("Failed to save face enrollment");
        console.error(error);
        return;
      }
    }

    toast.success("Face enrolled successfully");
    setFaceDialogOpen(false);
    setSelectedEmployeeForFace("");
    loadFaceEnrollments();
  };

  const handleDeleteFaceEnrollment = async (id: string) => {
    const { error } = await supabase.from('employee_face_enrollments').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete enrollment");
      return;
    }
    toast.success("Face enrollment deleted");
    loadFaceEnrollments();
  };

  // Assignment CRUD
  const handleSaveAssignment = async () => {
    if (!assignmentForm.employee_id || !assignmentForm.geofence_id) {
      toast.error("Employee and location are required");
      return;
    }

    const { error } = await supabase.from('employee_geofence_assignments').insert({
      company_id: selectedCompany,
      employee_id: assignmentForm.employee_id,
      geofence_id: assignmentForm.geofence_id,
      is_primary: assignmentForm.is_primary,
      effective_date: assignmentForm.effective_date,
      end_date: assignmentForm.end_date || null,
      notes: assignmentForm.notes || null
    });

    if (error) {
      toast.error("Failed to save assignment");
      console.error(error);
      return;
    }

    toast.success("Assignment created");
    setAssignmentDialogOpen(false);
    setAssignmentForm({
      employee_id: "",
      geofence_id: "",
      is_primary: true,
      effective_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: "",
      notes: ""
    });
    loadAssignments();
  };

  const handleDeleteAssignment = async (id: string) => {
    const { error } = await supabase.from('employee_geofence_assignments').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete assignment");
      return;
    }
    toast.success("Assignment deleted");
    loadAssignments();
  };

  const getViolationBadge = (type: string) => {
    switch (type) {
      case 'clock_in_outside':
        return <Badge className="bg-warning/20 text-warning">Clock In Outside</Badge>;
      case 'clock_out_outside':
        return <Badge className="bg-warning/20 text-warning">Clock Out Outside</Badge>;
      case 'no_location':
        return <Badge className="bg-destructive/20 text-destructive">No Location</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs 
          items={[
            { label: t("navigation.timeAttendance"), href: "/time-attendance" },
            { label: t("timeAttendance.geofencing.title") }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("timeAttendance.geofencing.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("timeAttendance.geofencing.subtitle")}
              </p>
            </div>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.geofencing.locations")}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
              <p className="text-xs text-muted-foreground">
                {locations.filter(l => l.is_active).length} {t("common.active").toLowerCase()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.geofencing.assignments")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">{t("timeAttendance.geofencing.employeeAssignments")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.geofencing.avgRadius")}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {locations.length > 0 
                  ? Math.round(locations.reduce((a, l) => a + l.radius_meters, 0) / locations.length)
                  : 0}m
              </div>
              <p className="text-xs text-muted-foreground">{t("timeAttendance.geofencing.averageRadius")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.geofencing.violations")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{violations.length}</div>
              <p className="text-xs text-muted-foreground">{t("timeAttendance.geofencing.recentViolations")}</p>
            </CardContent>
          </Card>
        </div>

<Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              {t("timeAttendance.geofencing.locations")}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <Users className="h-4 w-4" />
              {t("timeAttendance.geofencing.assignments")}
            </TabsTrigger>
            <TabsTrigger value="face-enrollment" className="gap-2">
              <Camera className="h-4 w-4" />
              {t("timeAttendance.geofencing.faceEnrollment")}
            </TabsTrigger>
            <TabsTrigger value="violations" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("timeAttendance.geofencing.violations")}
            </TabsTrigger>
          </TabsList>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Geofence Locations</CardTitle>
                  <CardDescription>Define physical locations for clock restrictions</CardDescription>
                </div>
                <Dialog open={locationDialogOpen} onOpenChange={(open) => { setLocationDialogOpen(open); if (!open) resetLocationForm(); }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input 
                            value={locationForm.name}
                            onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                            placeholder="Main Office"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input 
                            value={locationForm.code}
                            onChange={(e) => setLocationForm({...locationForm, code: e.target.value})}
                            placeholder="HQ"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea 
                          value={locationForm.address}
                          onChange={(e) => setLocationForm({...locationForm, address: e.target.value})}
                          placeholder="123 Main St, City, Country"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Latitude *</Label>
                          <Input 
                            type="number"
                            step="0.00000001"
                            value={locationForm.latitude}
                            onChange={(e) => setLocationForm({...locationForm, latitude: e.target.value})}
                            placeholder="40.7128"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Longitude *</Label>
                          <Input 
                            type="number"
                            step="0.00000001"
                            value={locationForm.longitude}
                            onChange={(e) => setLocationForm({...locationForm, longitude: e.target.value})}
                            placeholder="-74.0060"
                          />
                        </div>
                      </div>
                      <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Use Current Location
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Radius (meters)</Label>
                          <Input 
                            type="number"
                            value={locationForm.radius_meters}
                            onChange={(e) => setLocationForm({...locationForm, radius_meters: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input 
                            type="date"
                            value={locationForm.start_date}
                            onChange={(e) => setLocationForm({...locationForm, start_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={locationForm.description}
                          onChange={(e) => setLocationForm({...locationForm, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={locationForm.is_headquarters}
                            onCheckedChange={(c) => setLocationForm({...locationForm, is_headquarters: c})}
                          />
                          <Label>Headquarters</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={locationForm.is_active}
                            onCheckedChange={(c) => setLocationForm({...locationForm, is_active: c})}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={locationForm.requires_geofence}
                            onCheckedChange={(c) => setLocationForm({...locationForm, requires_geofence: c})}
/>
                          <Label>Require Geofence</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={locationForm.allow_clock_outside}
                            onCheckedChange={(c) => setLocationForm({...locationForm, allow_clock_outside: c})}
                          />
                          <Label>Allow Outside</Label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Camera className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <Label className="cursor-pointer">Require Face Capture</Label>
                          <p className="text-xs text-muted-foreground">Employees must capture photo when clocking in/out</p>
                        </div>
                        <Switch 
                          checked={locationForm.requires_face_capture}
                          onCheckedChange={(c) => setLocationForm({...locationForm, requires_face_capture: c})}
                        />
                      </div>
                      <Button onClick={handleSaveLocation} className="w-full">
                        {editingLocation ? "Update Location" : "Create Location"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>Radius</TableHead>
                      <TableHead>Settings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No locations defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{location.name}</span>
                              {location.is_headquarters && (
                                <Badge variant="outline" className="text-xs">HQ</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{location.code}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </TableCell>
                          <TableCell>{location.radius_meters}m</TableCell>
<TableCell>
                            <div className="flex flex-wrap gap-1">
                              {location.requires_geofence && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                              {location.allow_clock_outside && (
                                <Badge variant="outline" className="text-xs bg-warning/10">Allow Outside</Badge>
                              )}
                              {location.requires_face_capture && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Face
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={location.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                              {location.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditLocation(location)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteLocation(location.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Employee Location Assignments</CardTitle>
                  <CardDescription>Assign employees to geofence locations</CardDescription>
                </div>
                <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Employee to Location</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Employee *</Label>
                        <Select 
                          value={assignmentForm.employee_id} 
                          onValueChange={(v) => setAssignmentForm({...assignmentForm, employee_id: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Location *</Label>
                        <Select 
                          value={assignmentForm.geofence_id} 
                          onValueChange={(v) => setAssignmentForm({...assignmentForm, geofence_id: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.filter(l => l.is_active).map((l) => (
                              <SelectItem key={l.id} value={l.id}>{l.name} ({l.code})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Effective Date</Label>
                          <Input 
                            type="date"
                            value={assignmentForm.effective_date}
                            onChange={(e) => setAssignmentForm({...assignmentForm, effective_date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input 
                            type="date"
                            value={assignmentForm.end_date}
                            onChange={(e) => setAssignmentForm({...assignmentForm, end_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={assignmentForm.is_primary}
                          onCheckedChange={(c) => setAssignmentForm({...assignmentForm, is_primary: c})}
                        />
                        <Label>Primary Location</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea 
                          value={assignmentForm.notes}
                          onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleSaveAssignment} className="w-full">
                        Assign Location
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No assignments
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {assignment.geofence?.name} ({assignment.geofence?.code})
                          </TableCell>
                          <TableCell>{format(new Date(assignment.effective_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {assignment.end_date ? format(new Date(assignment.end_date), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            {assignment.is_primary && <Badge className="bg-primary/20 text-primary">Primary</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

{/* Face Enrollment Tab */}
          <TabsContent value="face-enrollment">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Face Enrollment
                  </CardTitle>
                  <CardDescription>
                    Register employee faces for identity verification during clock in/out
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={selectedEmployeeForFace} 
                    onValueChange={setSelectedEmployeeForFace}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => setFaceDialogOpen(true)}
                    disabled={!selectedEmployeeForFace}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Enroll Face
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {faceEnrollments.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No face enrollments yet</p>
                      <p className="text-sm">Select an employee and click "Enroll Face" to register</p>
                    </div>
                  ) : (
                    faceEnrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="overflow-hidden">
                        <div className="aspect-square relative bg-muted">
                          <img 
                            src={enrollment.photo_url} 
                            alt={enrollment.profile?.full_name || "Employee"}
                            className="w-full h-full object-cover"
                          />
                          {enrollment.is_active && (
                            <Badge className="absolute top-2 right-2 bg-success/90 text-success-foreground">
                              Active
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{enrollment.profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">
                                Enrolled {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteFaceEnrollment(enrollment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations">
            <Card>
              <CardHeader>
                <CardTitle>Geofence Violations</CardTitle>
                <CardDescription>Clock attempts outside allowed locations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Violation Type</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Nearest Location</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No violations recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      violations.map((violation) => (
                        <TableRow key={violation.id}>
                          <TableCell className="text-sm">
                            {format(new Date(violation.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {violation.profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>{getViolationBadge(violation.violation_type)}</TableCell>
                          <TableCell>
                            {violation.distance_meters ? `${violation.distance_meters}m` : '-'}
                          </TableCell>
                          <TableCell>
                            {violation.nearest_geofence?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{violation.action_taken || 'flagged'}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Face Capture Dialog */}
        <FaceCaptureDialog
          open={faceDialogOpen}
          onOpenChange={setFaceDialogOpen}
          onCapture={handleFaceCapture}
          title="Enroll Employee Face"
          description="Position the employee's face within the frame for enrollment"
        />
      </div>
    </AppLayout>
  );
}
