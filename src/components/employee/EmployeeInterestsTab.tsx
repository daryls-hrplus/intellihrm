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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface EmployeeInterestsTabProps {
  employeeId: string;
}

interface InterestFormData {
  interest_name: string;
  category: string;
  proficiency_level: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export function EmployeeInterestsTab({ employeeId }: EmployeeInterestsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InterestFormData>({
    interest_name: "",
    category: "",
    proficiency_level: "",
    start_date: getTodayString(),
    end_date: "",
    notes: "",
  });

  const { data: interests, isLoading } = useQuery({
    queryKey: ["employee-interests", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_interests")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InterestFormData) => {
      const payload = {
        employee_id: employeeId,
        interest_name: data.interest_name,
        category: data.category || null,
        proficiency_level: data.proficiency_level || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        notes: data.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("employee_interests").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_interests").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-interests", employeeId] });
      toast.success(editingId ? "Interest updated" : "Interest added");
      closeDialog();
    },
    onError: () => toast.error("Failed to save interest"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_interests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-interests", employeeId] });
      toast.success("Interest deleted");
    },
    onError: () => toast.error("Failed to delete interest"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      interest_name: "",
      category: "",
      proficiency_level: "",
      start_date: getTodayString(),
      end_date: "",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      interest_name: item.interest_name,
      category: item.category || "",
      proficiency_level: item.proficiency_level || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interests & Hobbies</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Interest
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : interests?.length === 0 ? (
          <p className="text-muted-foreground">No interests found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interest</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Proficiency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interests?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.interest_name}</TableCell>
                  <TableCell>{item.category || "-"}</TableCell>
                  <TableCell>{item.proficiency_level || "-"}</TableCell>
                <TableCell>{formatDateForDisplay(item.start_date, "PP")}</TableCell>
                  <TableCell>{item.end_date ? formatDateForDisplay(item.end_date, "PP") : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>{editingId ? "Edit Interest" : "Add Interest"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Interest Name *</Label>
              <Input value={formData.interest_name} onChange={(e) => setFormData(prev => ({ ...prev, interest_name: e.target.value }))} placeholder="e.g., Photography, Chess" />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="arts">Arts & Crafts</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="outdoor">Outdoor Activities</SelectItem>
                  <SelectItem value="reading">Reading & Writing</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="volunteering">Volunteering</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Proficiency Level</Label>
              <Select value={formData.proficiency_level} onValueChange={(value) => setFormData(prev => ({ ...prev, proficiency_level: value }))}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.interest_name || !formData.start_date}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
