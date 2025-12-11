import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserCheck, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

interface Reference {
  id: string;
  full_name: string;
  relationship: string;
  company: string | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  years_known: number | null;
  reference_date: string | null;
  status: string;
  feedback: string | null;
  notes: string | null;
}

interface ReferenceFormData {
  full_name: string;
  relationship: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  years_known: number | null;
  reference_date: string;
  status: string;
  feedback: string;
  notes: string;
  start_date: string;
  end_date: string;
}

interface EmployeeReferencesTabProps {
  employeeId: string;
}

export function EmployeeReferencesTab({ employeeId }: EmployeeReferencesTabProps) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);

  const form = useForm<ReferenceFormData>({
    defaultValues: {
      full_name: "",
      relationship: "",
      company: "",
      position: "",
      phone: "",
      email: "",
      years_known: null,
      reference_date: "",
      status: "pending",
      feedback: "",
      notes: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const fetchReferences = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_references")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load references");
    } else {
      setReferences(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReferences();
  }, [employeeId]);

  const handleSubmit = async (data: ReferenceFormData) => {
    try {
      const payload = {
        ...data,
        company: data.company || null,
        position: data.position || null,
        phone: data.phone || null,
        email: data.email || null,
        years_known: data.years_known || null,
        reference_date: data.reference_date || null,
        feedback: data.feedback || null,
        notes: data.notes || null,
      };

      if (editingReference) {
        const { error } = await supabase
          .from("employee_references")
          .update(payload)
          .eq("id", editingReference.id);

        if (error) throw error;
        toast.success("Reference updated");
      } else {
        const { error } = await supabase.from("employee_references").insert({
          employee_id: employeeId,
          ...payload,
        });

        if (error) throw error;
        toast.success("Reference added");
      }

      setDialogOpen(false);
      setEditingReference(null);
      form.reset();
      fetchReferences();
    } catch (error) {
      toast.error("Failed to save reference");
    }
  };

  const handleEdit = (reference: any) => {
    setEditingReference(reference);
    form.reset({
      full_name: reference.full_name,
      relationship: reference.relationship,
      company: reference.company || "",
      position: reference.position || "",
      phone: reference.phone || "",
      email: reference.email || "",
      years_known: reference.years_known,
      reference_date: reference.reference_date || "",
      status: reference.status,
      feedback: reference.feedback || "",
      notes: reference.notes || "",
      start_date: reference.start_date || new Date().toISOString().split("T")[0],
      end_date: reference.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employee_references").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete reference");
    } else {
      toast.success("Reference deleted");
      fetchReferences();
    }
  };

  const openNewDialog = () => {
    setEditingReference(null);
    form.reset({
      full_name: "",
      relationship: "",
      company: "",
      position: "",
      phone: "",
      email: "",
      years_known: null,
      reference_date: "",
      status: "pending",
      feedback: "",
      notes: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default">Verified</Badge>;
      case "contacted":
        return <Badge variant="secondary">Contacted</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "unable_to_verify":
        return <Badge variant="destructive">Unable to Verify</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">References</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reference
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingReference ? "Edit Reference" : "Add Reference"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  rules={{ required: "Full name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="relationship"
                    rules={{ required: "Relationship is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="former_supervisor">Former Supervisor</SelectItem>
                            <SelectItem value="former_colleague">Former Colleague</SelectItem>
                            <SelectItem value="professional">Professional Contact</SelectItem>
                            <SelectItem value="academic">Academic Reference</SelectItem>
                            <SelectItem value="personal">Personal Reference</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="years_known"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years Known</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unable_to_verify">Unable to Verify</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reference_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Reference feedback..." />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : references.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No references on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {references.map((reference) => (
            <Card key={reference.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{reference.full_name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {reference.relationship.replace("_", " ")}
                    </Badge>
                    {getStatusBadge(reference.status)}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(reference)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(reference.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {reference.company && (
                    <div>
                      <span className="text-muted-foreground">Company:</span> {reference.company}
                    </div>
                  )}
                  {reference.position && (
                    <div>
                      <span className="text-muted-foreground">Position:</span> {reference.position}
                    </div>
                  )}
                  {reference.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {reference.phone}
                    </div>
                  )}
                  {reference.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {reference.email}
                    </div>
                  )}
                  {reference.years_known && (
                    <div>
                      <span className="text-muted-foreground">Known for:</span> {reference.years_known} years
                    </div>
                  )}
                  {reference.reference_date && (
                    <div>
                      <span className="text-muted-foreground">Reference Date:</span>{" "}
                      {format(new Date(reference.reference_date), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
                {reference.feedback && (
                  <p className="mt-2 text-sm text-muted-foreground italic">"{reference.feedback}"</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
