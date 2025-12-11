import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Baby } from "lucide-react";
import { format, differenceInYears } from "date-fns";

interface Dependent {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  id_number: string | null;
  is_disabled: boolean;
  is_student: boolean;
  notes: string | null;
}

interface DependentFormData {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  id_number: string;
  is_disabled: boolean;
  is_student: boolean;
  notes: string;
  start_date: string;
  end_date: string;
}

interface EmployeeDependentsTabProps {
  employeeId: string;
}

export function EmployeeDependentsTab({ employeeId }: EmployeeDependentsTabProps) {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);

  const form = useForm<DependentFormData>({
    defaultValues: {
      full_name: "",
      relationship: "",
      date_of_birth: "",
      gender: "",
      nationality: "",
      id_number: "",
      is_disabled: false,
      is_student: false,
      notes: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const fetchDependents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_dependents")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load dependents");
    } else {
      setDependents(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDependents();
  }, [employeeId]);

  const handleSubmit = async (data: DependentFormData) => {
    try {
      const payload = {
        ...data,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        nationality: data.nationality || null,
        id_number: data.id_number || null,
        notes: data.notes || null,
      };

      if (editingDependent) {
        const { error } = await supabase
          .from("employee_dependents")
          .update(payload)
          .eq("id", editingDependent.id);

        if (error) throw error;
        toast.success("Dependent updated");
      } else {
        const { error } = await supabase.from("employee_dependents").insert({
          employee_id: employeeId,
          ...payload,
        });

        if (error) throw error;
        toast.success("Dependent added");
      }

      setDialogOpen(false);
      setEditingDependent(null);
      form.reset();
      fetchDependents();
    } catch (error) {
      toast.error("Failed to save dependent");
    }
  };

  const handleEdit = (dependent: any) => {
    setEditingDependent(dependent);
    form.reset({
      full_name: dependent.full_name,
      relationship: dependent.relationship,
      date_of_birth: dependent.date_of_birth || "",
      gender: dependent.gender || "",
      nationality: dependent.nationality || "",
      id_number: dependent.id_number || "",
      is_disabled: dependent.is_disabled,
      is_student: dependent.is_student,
      notes: dependent.notes || "",
      start_date: dependent.start_date || new Date().toISOString().split("T")[0],
      end_date: dependent.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employee_dependents").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete dependent");
    } else {
      toast.success("Dependent deleted");
      fetchDependents();
    }
  };

  const openNewDialog = () => {
    setEditingDependent(null);
    form.reset({
      full_name: "",
      relationship: "",
      date_of_birth: "",
      gender: "",
      nationality: "",
      id_number: "",
      is_disabled: false,
      is_student: false,
      notes: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setDialogOpen(true);
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dependents</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDependent ? "Edit Dependent" : "Add Dependent"}</DialogTitle>
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
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="id_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="is_disabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Disabled</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_student"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Student</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

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
      ) : dependents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Baby className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No dependents on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dependents.map((dependent) => (
            <Card key={dependent.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{dependent.full_name}</CardTitle>
                    <Badge variant="outline" className="capitalize">{dependent.relationship}</Badge>
                    {dependent.is_student && <Badge variant="secondary">Student</Badge>}
                    {dependent.is_disabled && <Badge variant="secondary">Disabled</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(dependent)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(dependent.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {dependent.date_of_birth && (
                    <div>
                      <span className="text-muted-foreground">Age:</span> {getAge(dependent.date_of_birth)} years
                    </div>
                  )}
                  {dependent.gender && (
                    <div>
                      <span className="text-muted-foreground">Gender:</span>{" "}
                      <span className="capitalize">{dependent.gender}</span>
                    </div>
                  )}
                  {dependent.nationality && (
                    <div>
                      <span className="text-muted-foreground">Nationality:</span> {dependent.nationality}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
