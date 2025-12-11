import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmployeeMedicalProfileTabProps {
  employeeId: string;
}

interface MedicalFormData {
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
  medications: string;
  disabilities: string;
  emergency_medical_info: string;
  doctor_name: string;
  doctor_phone: string;
  insurance_provider: string;
  insurance_policy_number: string;
  start_date: string;
  end_date: string;
}

export function EmployeeMedicalProfileTab({ employeeId }: EmployeeMedicalProfileTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MedicalFormData>({
    blood_type: "",
    allergies: "",
    chronic_conditions: "",
    medications: "",
    disabilities: "",
    emergency_medical_info: "",
    doctor_name: "",
    doctor_phone: "",
    insurance_provider: "",
    insurance_policy_number: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["employee-medical-profile", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_medical_profiles")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: MedicalFormData) => {
      const payload = {
        employee_id: employeeId,
        blood_type: data.blood_type || null,
        allergies: data.allergies || null,
        chronic_conditions: data.chronic_conditions || null,
        medications: data.medications || null,
        disabilities: data.disabilities || null,
        emergency_medical_info: data.emergency_medical_info || null,
        doctor_name: data.doctor_name || null,
        doctor_phone: data.doctor_phone || null,
        insurance_provider: data.insurance_provider || null,
        insurance_policy_number: data.insurance_policy_number || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
      };

      if (profile) {
        const { error } = await supabase.from("employee_medical_profiles").update(payload).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_medical_profiles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-medical-profile", employeeId] });
      toast.success("Medical profile saved");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Failed to save medical profile"),
  });

  const openDialog = () => {
    if (profile) {
      setFormData({
        blood_type: profile.blood_type || "",
        allergies: profile.allergies || "",
        chronic_conditions: profile.chronic_conditions || "",
        medications: profile.medications || "",
        disabilities: profile.disabilities || "",
        emergency_medical_info: profile.emergency_medical_info || "",
        doctor_name: profile.doctor_name || "",
        doctor_phone: profile.doctor_phone || "",
        insurance_provider: profile.insurance_provider || "",
        insurance_policy_number: profile.insurance_policy_number || "",
        start_date: profile.start_date,
        end_date: profile.end_date || "",
      });
    } else {
      setFormData({
        blood_type: "",
        allergies: "",
        chronic_conditions: "",
        medications: "",
        disabilities: "",
        emergency_medical_info: "",
        doctor_name: "",
        doctor_phone: "",
        insurance_provider: "",
        insurance_policy_number: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
      });
    }
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medical Profile</CardTitle>
        <Button onClick={openDialog} size="sm">
          {profile ? <><Pencil className="h-4 w-4 mr-1" />Edit</> : <><Plus className="h-4 w-4 mr-1" />Add</>}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : !profile ? (
          <p className="text-muted-foreground">No medical profile found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Basic Information</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Blood Type:</dt><dd>{profile.blood_type || "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Start Date:</dt><dd>{format(new Date(profile.start_date), "PP")}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">End Date:</dt><dd>{profile.end_date ? format(new Date(profile.end_date), "PP") : "-"}</dd></div>
              </dl>
            </div>
            <div>
              <h4 className="font-medium mb-3">Doctor & Insurance</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Doctor:</dt><dd>{profile.doctor_name || "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Doctor Phone:</dt><dd>{profile.doctor_phone || "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Insurance:</dt><dd>{profile.insurance_provider || "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Policy #:</dt><dd>{profile.insurance_policy_number || "-"}</dd></div>
              </dl>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium mb-3">Medical Conditions</h4>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-muted-foreground">Allergies:</dt><dd className="mt-1">{profile.allergies || "-"}</dd></div>
                <div><dt className="text-muted-foreground">Chronic Conditions:</dt><dd className="mt-1">{profile.chronic_conditions || "-"}</dd></div>
                <div><dt className="text-muted-foreground">Medications:</dt><dd className="mt-1">{profile.medications || "-"}</dd></div>
                <div><dt className="text-muted-foreground">Disabilities:</dt><dd className="mt-1">{profile.disabilities || "-"}</dd></div>
                <div><dt className="text-muted-foreground">Emergency Info:</dt><dd className="mt-1">{profile.emergency_medical_info || "-"}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{profile ? "Edit Medical Profile" : "Add Medical Profile"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Blood Type</Label>
                <Select value={formData.blood_type} onValueChange={(value) => setFormData(prev => ({ ...prev, blood_type: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Doctor Name</Label>
                <Input value={formData.doctor_name} onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Doctor Phone</Label>
                <Input value={formData.doctor_phone} onChange={(e) => setFormData(prev => ({ ...prev, doctor_phone: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Insurance Provider</Label>
                <Input value={formData.insurance_provider} onChange={(e) => setFormData(prev => ({ ...prev, insurance_provider: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Insurance Policy Number</Label>
                <Input value={formData.insurance_policy_number} onChange={(e) => setFormData(prev => ({ ...prev, insurance_policy_number: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Allergies</Label>
              <Textarea value={formData.allergies} onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))} placeholder="List any allergies..." />
            </div>
            <div className="grid gap-2">
              <Label>Chronic Conditions</Label>
              <Textarea value={formData.chronic_conditions} onChange={(e) => setFormData(prev => ({ ...prev, chronic_conditions: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Current Medications</Label>
              <Textarea value={formData.medications} onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Disabilities</Label>
              <Textarea value={formData.disabilities} onChange={(e) => setFormData(prev => ({ ...prev, disabilities: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Emergency Medical Information</Label>
              <Textarea value={formData.emergency_medical_info} onChange={(e) => setFormData(prev => ({ ...prev, emergency_medical_info: e.target.value }))} placeholder="Any critical info for emergency responders..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.start_date}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
