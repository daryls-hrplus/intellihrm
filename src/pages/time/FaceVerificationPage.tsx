import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Camera, User, CheckCircle, XCircle, AlertTriangle, Trash2, RefreshCw } from "lucide-react";

interface FaceTemplate {
  id: string;
  employee_id: string;
  photo_url: string | null;
  is_primary: boolean;
  is_active: boolean;
  enrolled_at: string;
  verification_count: number;
  last_verified_at: string | null;
  employee?: {
    full_name: string;
    employee_id: string;
  };
}

interface VerificationLog {
  id: string;
  employee_id: string;
  punch_type: string;
  verification_status: string;
  confidence_score: number | null;
  failure_reason: string | null;
  created_at: string;
  employee?: {
    full_name: string;
  };
}

export default function FaceVerificationPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const [templates, setTemplates] = useState<FaceTemplate[]>([]);
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchTemplates();
      fetchLogs();
      fetchEmployees();
    }
  }, [companyId]);

  const fetchTemplates = async () => {
    if (!companyId) return;
    setLoading(true);
    
    const { data: companyEmployees } = await supabase
      .from("profiles")
      .select("id")
      .eq("company_id", companyId);

    if (companyEmployees) {
      const employeeIds = companyEmployees.map(e => e.id);
      const { data: templatesData } = await supabase
        .from("face_verification_templates")
        .select("*")
        .in("employee_id", employeeIds)
        .order("enrolled_at", { ascending: false });

      // Fetch employee names separately
      const templatesWithEmployees = await Promise.all(
        (templatesData || []).map(async (t: any) => {
          const { data: emp } = await supabase
            .from("profiles")
            .select("full_name, employee_id")
            .eq("id", t.employee_id)
            .single();
          return { ...t, employee: emp };
        })
      );

      setTemplates(templatesWithEmployees);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    if (!companyId) return;
    
    const { data: companyEmployees } = await supabase
      .from("profiles")
      .select("id")
      .eq("company_id", companyId);

    if (companyEmployees) {
      const employeeIds = companyEmployees.map(e => e.id);
      const { data } = await supabase
        .from("face_verification_logs")
        .select("*")
        .in("employee_id", employeeIds)
        .order("created_at", { ascending: false })
        .limit(100);

      const logsWithEmployees = await Promise.all(
        (data || []).map(async (log: any) => {
          const { data: emp } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", log.employee_id)
            .single();
          return { ...log, employee: emp };
        })
      );

      setLogs(logsWithEmployees);
    }
  };

  const fetchEmployees = async () => {
    if (!companyId) return;
    const { data } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, employee_id")
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("full_name");
    setEmployees(data || []);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleEnroll = async () => {
    if (!selectedEmployee || !capturedPhoto) {
      toast.error("Please select an employee and capture a photo");
      return;
    }

    setEnrolling(true);
    try {
      // In a real implementation, you would:
      // 1. Upload the photo to storage
      // 2. Send to a face recognition API to generate embeddings
      // 3. Store the embeddings/template
      
      // For now, we'll store a placeholder template
      const { error } = await supabase
        .from("face_verification_templates")
        .insert({
          employee_id: selectedEmployee,
          template_data: btoa(capturedPhoto.substring(0, 1000)), // Simplified - real impl would use actual embeddings
          photo_url: capturedPhoto,
          is_primary: true,
          is_active: true,
          enrolled_by: profile?.id,
        });

      if (error) throw error;
      
      toast.success("Face enrolled successfully");
      setIsEnrollDialogOpen(false);
      setSelectedEmployee("");
      setCapturedPhoto(null);
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll face");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this face template?")) return;
    
    const { error } = await supabase
      .from("face_verification_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
    } else {
      toast.success("Template deleted");
      fetchTemplates();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "manual_override":
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Override</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Time & Attendance", href: "/time" },
            { label: "Face Verification" }
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Face Verification</h1>
            <p className="text-muted-foreground">
              Enroll employee faces and monitor verification logs
            </p>
          </div>
          <Button onClick={() => setIsEnrollDialogOpen(true)}>
            <Camera className="h-4 w-4 mr-2" />
            Enroll New Face
          </Button>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="templates">Enrolled Faces</TabsTrigger>
            <TabsTrigger value="logs">Verification Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Employees</CardTitle>
                <CardDescription>
                  Employees with registered face templates for clock-in verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No faces enrolled. Click "Enroll New Face" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Verifications</TableHead>
                        <TableHead>Last Verified</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={template.photo_url || undefined} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{template.employee?.full_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {template.employee?.employee_id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(template.enrolled_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{template.verification_count}</TableCell>
                          <TableCell>
                            {template.last_verified_at 
                              ? format(new Date(template.last_verified_at), "MMM d, HH:mm")
                              : "-"
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.is_active ? "default" : "secondary"}>
                              {template.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Verification History
                  <Button variant="outline" size="sm" onClick={fetchLogs}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Recent face verification attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No verification logs yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Punch Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.employee?.full_name}</TableCell>
                          <TableCell className="capitalize">{log.punch_type.replace("_", " ")}</TableCell>
                          <TableCell>{getStatusBadge(log.verification_status)}</TableCell>
                          <TableCell>
                            {log.confidence_score 
                              ? `${(log.confidence_score * 100).toFixed(1)}%`
                              : "-"
                            }
                          </TableCell>
                          <TableCell>
                            {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enrollment Dialog */}
        <Dialog open={isEnrollDialogOpen} onOpenChange={(open) => {
          if (!open) {
            stopCamera();
            setCapturedPhoto(null);
          }
          setIsEnrollDialogOpen(open);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enroll Face</DialogTitle>
              <DialogDescription>
                Select an employee and capture their face for verification
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(e => !templates.some(t => t.employee_id === e.id))
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="border rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                  {capturedPhoto ? (
                    <img src={capturedPhoto} alt="Captured" className="max-h-full" />
                  ) : cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="max-h-full" />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <Camera className="h-12 w-12" />
                      <span>Camera not active</span>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex gap-2">
                  {!cameraActive && !capturedPhoto && (
                    <Button onClick={startCamera} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  )}
                  {cameraActive && (
                    <>
                      <Button onClick={capturePhoto} className="flex-1">
                        Capture Photo
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {capturedPhoto && (
                    <>
                      <Button variant="outline" onClick={() => { setCapturedPhoto(null); startCamera(); }} className="flex-1">
                        Retake
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEnroll} disabled={enrolling || !selectedEmployee || !capturedPhoto}>
                {enrolling ? "Enrolling..." : "Enroll Face"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
