import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserCheck, Phone, Mail, HelpCircle, ChevronDown, Star, ShieldCheck, FileCheck, Building2 } from "lucide-react";

interface Reference {
  id: string;
  full_name: string;
  relationship: string;
  company: string | null;
  position: string | null;
  phone: string | null;
  phone_extension: string | null;
  email: string | null;
  years_known: number | null;
  reference_type: string;
  preferred_contact_method: string;
  best_time_to_contact: string | null;
  consent_obtained: boolean;
  consent_date: string | null;
  verification_method: string | null;
  verified_by: string | null;
  verified_date: string | null;
  status: string;
  overall_rating: number | null;
  would_rehire: string | null;
  employment_dates_confirmed: boolean | null;
  title_confirmed: boolean | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  feedback: string | null;
  notes: string | null;
  attachment_url: string | null;
}

interface ReferenceFormData {
  full_name: string;
  relationship: string;
  reference_type: string;
  company: string;
  position: string;
  phone: string;
  phone_extension: string;
  email: string;
  years_known: number | null;
  preferred_contact_method: string;
  best_time_to_contact: string;
  consent_obtained: boolean;
  consent_date: string;
  status: string;
  verification_method: string;
  verified_date: string;
  overall_rating: number | null;
  would_rehire: string;
  employment_dates_confirmed: boolean;
  title_confirmed: boolean;
  strengths: string;
  areas_for_improvement: string;
  feedback: string;
  notes: string;
}

interface EmployeeReferencesTabProps {
  employeeId: string;
}

const REFERENCE_TYPES = [
  { value: "employment", label: "Employment Reference", description: "Verifies work history and performance" },
  { value: "character", label: "Character Reference", description: "Attests to personal qualities and integrity" },
  { value: "academic", label: "Academic Reference", description: "Confirms educational achievements" },
  { value: "professional", label: "Professional Reference", description: "Industry colleague or mentor" },
];

const RELATIONSHIPS = [
  { value: "former_supervisor", label: "Former Supervisor" },
  { value: "direct_manager", label: "Direct Manager" },
  { value: "hr_representative", label: "HR Representative" },
  { value: "former_colleague", label: "Former Colleague" },
  { value: "professional", label: "Professional Contact" },
  { value: "academic", label: "Academic Reference" },
  { value: "personal", label: "Personal Reference" },
  { value: "other", label: "Other" },
];

const VERIFICATION_METHODS = [
  { value: "phone_call", label: "Phone Call" },
  { value: "email", label: "Email Correspondence" },
  { value: "video_call", label: "Video Call" },
  { value: "written", label: "Written Response" },
  { value: "third_party", label: "Third-Party Service" },
];

const WOULD_REHIRE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "with_reservations", label: "With Reservations" },
  { value: "not_applicable", label: "Not Applicable" },
];

const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-1.5">
    <span>{label}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

const StarRating = ({ value, onChange, readonly = false }: { value: number | null; onChange?: (val: number) => void; readonly?: boolean }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              value && star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export function EmployeeReferencesTab({ employeeId }: EmployeeReferencesTabProps) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);

  const form = useForm<ReferenceFormData>({
    defaultValues: {
      full_name: "",
      relationship: "",
      reference_type: "employment",
      company: "",
      position: "",
      phone: "",
      phone_extension: "",
      email: "",
      years_known: null,
      preferred_contact_method: "phone",
      best_time_to_contact: "",
      consent_obtained: false,
      consent_date: "",
      status: "pending",
      verification_method: "",
      verified_date: "",
      overall_rating: null,
      would_rehire: "",
      employment_dates_confirmed: false,
      title_confirmed: false,
      strengths: "",
      areas_for_improvement: "",
      feedback: "",
      notes: "",
    },
  });

  const watchStatus = form.watch("status");
  const watchConsent = form.watch("consent_obtained");

  useEffect(() => {
    if (watchStatus === "verified" || watchStatus === "contacted") {
      setVerificationOpen(true);
    }
  }, [watchStatus]);

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
    if (!data.consent_obtained) {
      toast.error("Consent must be obtained before saving a reference");
      return;
    }

    try {
      const payload = {
        full_name: data.full_name,
        relationship: data.relationship,
        reference_type: data.reference_type,
        company: data.company || null,
        position: data.position || null,
        phone: data.phone || null,
        phone_extension: data.phone_extension || null,
        email: data.email || null,
        years_known: data.years_known || null,
        preferred_contact_method: data.preferred_contact_method,
        best_time_to_contact: data.best_time_to_contact || null,
        consent_obtained: data.consent_obtained,
        consent_date: data.consent_date || null,
        status: data.status,
        verification_method: data.verification_method || null,
        verified_date: data.verified_date || null,
        overall_rating: data.overall_rating || null,
        would_rehire: data.would_rehire || null,
        employment_dates_confirmed: data.employment_dates_confirmed || null,
        title_confirmed: data.title_confirmed || null,
        strengths: data.strengths || null,
        areas_for_improvement: data.areas_for_improvement || null,
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

  const handleEdit = (reference: Reference) => {
    setEditingReference(reference);
    form.reset({
      full_name: reference.full_name,
      relationship: reference.relationship,
      reference_type: reference.reference_type || "employment",
      company: reference.company || "",
      position: reference.position || "",
      phone: reference.phone || "",
      phone_extension: reference.phone_extension || "",
      email: reference.email || "",
      years_known: reference.years_known,
      preferred_contact_method: reference.preferred_contact_method || "phone",
      best_time_to_contact: reference.best_time_to_contact || "",
      consent_obtained: reference.consent_obtained || false,
      consent_date: reference.consent_date || "",
      status: reference.status,
      verification_method: reference.verification_method || "",
      verified_date: reference.verified_date || "",
      overall_rating: reference.overall_rating,
      would_rehire: reference.would_rehire || "",
      employment_dates_confirmed: reference.employment_dates_confirmed || false,
      title_confirmed: reference.title_confirmed || false,
      strengths: reference.strengths || "",
      areas_for_improvement: reference.areas_for_improvement || "",
      feedback: reference.feedback || "",
      notes: reference.notes || "",
    });
    setVerificationOpen(reference.status !== "pending");
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
    setVerificationOpen(false);
    form.reset({
      full_name: "",
      relationship: "",
      reference_type: "employment",
      company: "",
      position: "",
      phone: "",
      phone_extension: "",
      email: "",
      years_known: null,
      preferred_contact_method: "phone",
      best_time_to_contact: "",
      consent_obtained: false,
      consent_date: "",
      status: "pending",
      verification_method: "",
      verified_date: "",
      overall_rating: null,
      would_rehire: "",
      employment_dates_confirmed: false,
      title_confirmed: false,
      strengths: "",
      areas_for_improvement: "",
      feedback: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>;
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

  const getReferenceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      employment: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      character: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      academic: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      professional: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    };
    return (
      <Badge className={colors[type] || ""} variant="outline">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingReference ? "Edit Reference" : "Add Reference"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Section 1: Reference Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <UserCheck className="h-4 w-4" />
                      Reference Information
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="reference_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithTooltip 
                              label="Reference Type" 
                              tooltip="Employment references verify work history. Character references attest to personal qualities." 
                            />
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REFERENCE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div>{type.label}</div>
                                    <div className="text-xs text-muted-foreground">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="full_name"
                      rules={{ required: "Full name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter reference's full name" />
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
                            <FormLabel>
                              <LabelWithTooltip 
                                label="Relationship *" 
                                tooltip="The professional or personal relationship to the candidate" 
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RELATIONSHIPS.map((rel) => (
                                  <SelectItem key={rel.value} value={rel.value}>{rel.label}</SelectItem>
                                ))}
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
                                placeholder="e.g. 3"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Contact Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Contact Details
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Company name" />
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
                              <Input {...field} placeholder="Job title" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Phone number" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone_extension"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ext.</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ext" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} placeholder="email@company.com" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferred_contact_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="either">Either</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="best_time_to_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Best Time to Contact</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                                <SelectItem value="evening">Evening (5pm-8pm)</SelectItem>
                                <SelectItem value="anytime">Anytime</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Section 3: Consent & Compliance */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Consent & Compliance
                    </div>

                    <Card className={!watchConsent ? "border-amber-500/50 bg-amber-500/5" : "border-green-500/50 bg-green-500/5"}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="consent_obtained"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (checked) {
                                        form.setValue("consent_date", getTodayString());
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    <LabelWithTooltip 
                                      label="Consent Obtained *" 
                                      tooltip="Required for GDPR/privacy compliance. Confirm candidate has authorized contact with this reference." 
                                    />
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    Candidate has authorized contact with this reference
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="consent_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Consent Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Section 4: Verification Workflow */}
                  <Collapsible open={verificationOpen} onOpenChange={setVerificationOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" type="button" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <FileCheck className="h-4 w-4" />
                          Verification & Results
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${verificationOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Status</FormLabel>
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
                          name="verification_method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Method</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {VERIFICATION_METHODS.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="verified_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {(watchStatus === "verified" || watchStatus === "contacted") && (
                        <>
                          <Separator className="my-4" />
                          
                          <div className="text-sm font-medium text-muted-foreground mb-2">Verification Results</div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="employment_dates_confirmed"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <FormLabel className="font-normal">Employment Dates Confirmed</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="title_confirmed"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <FormLabel className="font-normal">Job Title Confirmed</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="overall_rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <LabelWithTooltip 
                                    label="Overall Rating" 
                                    tooltip="Rate the overall quality of this reference (1-5 stars)" 
                                  />
                                </FormLabel>
                                <FormControl>
                                  <StarRating value={field.value} onChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="would_rehire"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <LabelWithTooltip 
                                    label="Would Rehire?" 
                                    tooltip="The single most predictive question in reference checking. A 'no' or hesitation is a significant red flag." 
                                  />
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {WOULD_REHIRE_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="strengths"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Strengths Mentioned</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={2} placeholder="Key strengths highlighted by the reference..." />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="areas_for_improvement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Areas for Improvement</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={2} placeholder="Development areas or concerns mentioned..." />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="feedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>General Feedback</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Summary of reference feedback..." />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Section 5: Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Any additional internal notes..." />
                        </FormControl>
                        <FormDescription>These notes are for internal HR use only</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!watchConsent}>
                      {!watchConsent ? "Consent Required" : "Save Reference"}
                    </Button>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{reference.full_name}</CardTitle>
                      {getReferenceTypeBadge(reference.reference_type || "employment")}
                      <Badge variant="outline" className="capitalize">
                        {reference.relationship.replace(/_/g, " ")}
                      </Badge>
                      {getStatusBadge(reference.status)}
                      {reference.consent_obtained && (
                        <Tooltip>
                          <TooltipTrigger>
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          </TooltipTrigger>
                          <TooltipContent>Consent obtained</TooltipContent>
                        </Tooltip>
                      )}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
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
                    {reference.years_known && (
                      <div>
                        <span className="text-muted-foreground">Years Known:</span> {reference.years_known}
                      </div>
                    )}
                    {reference.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {reference.phone}{reference.phone_extension && ` x${reference.phone_extension}`}
                      </div>
                    )}
                    {reference.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {reference.email}
                      </div>
                    )}
                    {reference.overall_rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Rating:</span>
                        <StarRating value={reference.overall_rating} readonly />
                      </div>
                    )}
                    {reference.would_rehire && (
                      <div>
                        <span className="text-muted-foreground">Would Rehire:</span>{" "}
                        <span className={reference.would_rehire === "no" ? "text-destructive font-medium" : ""}>
                          {reference.would_rehire.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </div>
                  {reference.feedback && (
                    <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                      {reference.feedback}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
