import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, AlertTriangle, Phone, MapPin, Plane, User, Save, X } from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";

interface EmergencyPlan {
  id: string;
  employee_id: string;
  evacuation_destination: string | null;
  evacuation_contact_name: string | null;
  evacuation_contact_phone: string | null;
  evacuation_contact_relationship: string | null;
  embassy_contact: string | null;
  medical_considerations: string | null;
  travel_restrictions: string | null;
  preferred_airline: string | null;
  notes: string | null;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
}

interface EmergencyPlanFormData {
  evacuation_destination: string;
  evacuation_contact_name: string;
  evacuation_contact_phone: string;
  evacuation_contact_relationship: string;
  embassy_contact: string;
  medical_considerations: string;
  travel_restrictions: string;
  preferred_airline: string;
  notes: string;
}

interface EmployeeEmergencyPlanSectionProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeEmergencyPlanSection({ employeeId, viewType = "hr" }: EmployeeEmergencyPlanSectionProps) {
  const [plan, setPlan] = useState<EmergencyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const { hasTabAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();

  const canEdit = viewType === "hr" && hasTabAccess("workforce", "immigration", "edit");

  const form = useForm<EmergencyPlanFormData>({
    defaultValues: {
      evacuation_destination: "",
      evacuation_contact_name: "",
      evacuation_contact_phone: "",
      evacuation_contact_relationship: "",
      embassy_contact: "",
      medical_considerations: "",
      travel_restrictions: "",
      preferred_airline: "",
      notes: "",
    },
  });

  const fetchPlan = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_emergency_plans")
      .select("*")
      .eq("employee_id", employeeId)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load emergency plan");
    } else {
      setPlan(data);
      if (data) {
        form.reset({
          evacuation_destination: data.evacuation_destination || "",
          evacuation_contact_name: data.evacuation_contact_name || "",
          evacuation_contact_phone: data.evacuation_contact_phone || "",
          evacuation_contact_relationship: data.evacuation_contact_relationship || "",
          embassy_contact: data.embassy_contact || "",
          medical_considerations: data.medical_considerations || "",
          travel_restrictions: data.travel_restrictions || "",
          preferred_airline: data.preferred_airline || "",
          notes: data.notes || "",
        });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlan();
  }, [employeeId]);

  const handleSubmit = async (data: EmergencyPlanFormData) => {
    try {
      const payload = {
        evacuation_destination: data.evacuation_destination || null,
        evacuation_contact_name: data.evacuation_contact_name || null,
        evacuation_contact_phone: data.evacuation_contact_phone || null,
        evacuation_contact_relationship: data.evacuation_contact_relationship || null,
        embassy_contact: data.embassy_contact || null,
        medical_considerations: data.medical_considerations || null,
        travel_restrictions: data.travel_restrictions || null,
        preferred_airline: data.preferred_airline || null,
        notes: data.notes || null,
        last_reviewed_at: new Date().toISOString(),
      };

      if (plan) {
        const { error } = await supabase
          .from("employee_emergency_plans")
          .update(payload)
          .eq("id", plan.id);

        if (error) throw error;

        await logAction({
          action: "UPDATE",
          entityType: "emergency_plan",
          entityId: plan.id,
          entityName: "Emergency Plan",
          newValues: payload,
        });

        toast.success("Emergency plan updated");
      } else {
        const { data: result, error } = await supabase
          .from("employee_emergency_plans")
          .insert({
            employee_id: employeeId,
            ...payload,
          })
          .select()
          .single();

        if (error) throw error;

        await logAction({
          action: "CREATE",
          entityType: "emergency_plan",
          entityId: result.id,
          entityName: "Emergency Plan",
          newValues: payload,
        });

        toast.success("Emergency plan created");
      }

      setIsEditing(false);
      fetchPlan();
    } catch (error) {
      toast.error("Failed to save emergency plan");
    }
  };

  const startEditing = () => {
    if (plan) {
      form.reset({
        evacuation_destination: plan.evacuation_destination || "",
        evacuation_contact_name: plan.evacuation_contact_name || "",
        evacuation_contact_phone: plan.evacuation_contact_phone || "",
        evacuation_contact_relationship: plan.evacuation_contact_relationship || "",
        embassy_contact: plan.embassy_contact || "",
        medical_considerations: plan.medical_considerations || "",
        travel_restrictions: plan.travel_restrictions || "",
        preferred_airline: plan.preferred_airline || "",
        notes: plan.notes || "",
      });
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (plan) {
      form.reset({
        evacuation_destination: plan.evacuation_destination || "",
        evacuation_contact_name: plan.evacuation_contact_name || "",
        evacuation_contact_phone: plan.evacuation_contact_phone || "",
        evacuation_contact_relationship: plan.evacuation_contact_relationship || "",
        embassy_contact: plan.embassy_contact || "",
        medical_considerations: plan.medical_considerations || "",
        travel_restrictions: plan.travel_restrictions || "",
        preferred_airline: plan.preferred_airline || "",
        notes: plan.notes || "",
      });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  // ESS View - Read-only summary
  if (viewType === "ess") {
    if (!plan) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No emergency plan on file. Please contact HR.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Plan
          </CardTitle>
          <CardDescription>
            Your emergency evacuation plan and contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.evacuation_destination && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Evacuation Destination</p>
                <p className="text-sm text-muted-foreground">{plan.evacuation_destination}</p>
              </div>
            </div>
          )}
          {plan.evacuation_contact_name && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Emergency Contact</p>
                <p className="text-sm text-muted-foreground">
                  {plan.evacuation_contact_name}
                  {plan.evacuation_contact_relationship && ` (${plan.evacuation_contact_relationship})`}
                </p>
                {plan.evacuation_contact_phone && (
                  <p className="text-sm text-muted-foreground">{plan.evacuation_contact_phone}</p>
                )}
              </div>
            </div>
          )}
          {plan.embassy_contact && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Embassy Contact</p>
                <p className="text-sm text-muted-foreground">{plan.embassy_contact}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // HR View
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Plan
            </CardTitle>
            <CardDescription>
              Emergency evacuation and repatriation planning
            </CardDescription>
          </div>
          {canEdit && !isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="h-4 w-4 mr-2" />
              {plan ? "Edit" : "Create Plan"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="evacuation_destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evacuation Destination</FormLabel>
                    <FormControl>
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        valueType="name"
                        placeholder="Select destination country"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="evacuation_contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="evacuation_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 555-0123" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="evacuation_contact_relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Spouse, Parent" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="embassy_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Embassy/Consulate Contact</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Embassy phone number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferred_airline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Airline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Caribbean Airlines" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="medical_considerations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Considerations</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Any medical conditions or requirements for travel" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="travel_restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Restrictions</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Any known travel restrictions or visa issues" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Plan
                </Button>
              </div>
            </form>
          </Form>
        ) : plan ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Evacuation Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Destination:</span>
                    <p className="font-medium">{plan.evacuation_destination || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preferred Airline:</span>
                    <p className="font-medium">{plan.preferred_airline || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Emergency Contact
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">
                      {plan.evacuation_contact_name || "Not specified"}
                      {plan.evacuation_contact_relationship && ` (${plan.evacuation_contact_relationship})`}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{plan.evacuation_contact_phone || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Embassy Contact:</span>
                    <p className="font-medium">{plan.embassy_contact || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {(plan.medical_considerations || plan.travel_restrictions) && (
              <div className="space-y-4 pt-4 border-t">
                {plan.medical_considerations && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Medical Considerations</h4>
                    <p className="text-sm">{plan.medical_considerations}</p>
                  </div>
                )}
                {plan.travel_restrictions && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Travel Restrictions</h4>
                    <p className="text-sm">{plan.travel_restrictions}</p>
                  </div>
                )}
              </div>
            )}

            {plan.notes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm">{plan.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No emergency plan created yet.
            {canEdit && (
              <p className="mt-2">
                <Button variant="link" onClick={startEditing}>
                  Create an emergency plan
                </Button>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
