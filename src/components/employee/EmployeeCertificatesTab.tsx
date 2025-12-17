import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";

interface EmployeeCertificatesTabProps {
  employeeId: string;
}

interface CertificateFormData {
  certificate_name: string;
  issuing_organization: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  start_date: string;
  end_date: string;
  file_url: string;
  file_name: string;
  notes: string;
}

export function EmployeeCertificatesTab({ employeeId }: EmployeeCertificatesTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<CertificateFormData>({
    certificate_name: "",
    issuing_organization: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    start_date: getTodayString(),
    end_date: "",
    file_url: "",
    file_name: "",
    notes: "",
  });

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["employee-certificates", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_certificates")
        .select("*")
        .eq("employee_id", employeeId)
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CertificateFormData) => {
      const payload = {
        employee_id: employeeId,
        certificate_name: data.certificate_name,
        issuing_organization: data.issuing_organization,
        certificate_number: data.certificate_number || null,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        file_url: data.file_url || null,
        file_name: data.file_name || null,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_certificates").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_certificates").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates", employeeId] });
      toast.success(editingId ? "Certificate updated" : "Certificate added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save certificate"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_certificates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates", employeeId] });
      toast.success("Certificate deleted");
    },
    onError: () => toast.error("Failed to delete certificate"),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, file_url: publicUrl, file_name: file.name }));
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      certificate_name: "",
      issuing_organization: "",
      certificate_number: "",
      issue_date: "",
      expiry_date: "",
      start_date: getTodayString(),
      end_date: "",
      file_url: "",
      file_name: "",
      notes: "",
    });
  };

  const handleEdit = (cert: any) => {
    setEditingId(cert.id);
    setFormData({
      certificate_name: cert.certificate_name,
      issuing_organization: cert.issuing_organization,
      certificate_number: cert.certificate_number || "",
      issue_date: cert.issue_date,
      expiry_date: cert.expiry_date || "",
      start_date: cert.start_date,
      end_date: cert.end_date || "",
      file_url: cert.file_url || "",
      file_name: cert.file_name || "",
      notes: cert.notes || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Certificates</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Certificate
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : certificates?.length === 0 ? (
          <p className="text-muted-foreground">No certificates found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates?.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>{cert.certificate_name}</TableCell>
                  <TableCell>{cert.issuing_organization}</TableCell>
                  <TableCell>{format(new Date(cert.issue_date), "PP")}</TableCell>
                  <TableCell>{cert.expiry_date ? format(new Date(cert.expiry_date), "PP") : "-"}</TableCell>
                  <TableCell>
                    {cert.file_url ? (
                      <a href={cert.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(cert.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Certificate" : "Add Certificate"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Certificate Name *</Label>
              <Input value={formData.certificate_name} onChange={(e) => setFormData(prev => ({ ...prev, certificate_name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Issuing Organization *</Label>
              <Input value={formData.issuing_organization} onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Certificate Number</Label>
              <Input value={formData.certificate_number} onChange={(e) => setFormData(prev => ({ ...prev, certificate_number: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Issue Date *</Label>
                <Input type="date" value={formData.issue_date} onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Upload Certificate</Label>
              <div className="flex items-center gap-2">
                <Input type="file" onChange={handleFileUpload} disabled={uploading} />
                {formData.file_name && <span className="text-sm text-muted-foreground">{formData.file_name}</span>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.certificate_name || !formData.issuing_organization || !formData.issue_date || !formData.start_date}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
