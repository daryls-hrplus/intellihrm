import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useESSChangeRequest } from "@/hooks/useESSChangeRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CountrySelect } from "@/components/ui/country-select";
import { CalendarIcon, Loader2, GraduationCap, Award, Upload, FileText, X, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ESSQualificationSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface LookupValue {
  id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export function ESSQualificationSubmissionDialog({
  open,
  onOpenChange,
  onSuccess,
}: ESSQualificationSubmissionDialogProps) {
  const { t } = useTranslation();
  const { user, profile, company } = useAuth();
  const { submitChangeRequest, isSubmitting } = useESSChangeRequest(profile?.id || "");
  
  const [recordType, setRecordType] = useState<"academic" | "certification">("academic");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Lookup data
  const [educationLevels, setEducationLevels] = useState<LookupValue[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<LookupValue[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<LookupValue[]>([]);
  const [institutionNames, setInstitutionNames] = useState<LookupValue[]>([]);
  const [certificationTypes, setCertificationTypes] = useState<LookupValue[]>([]);
  const [accreditingBodies, setAccreditingBodies] = useState<LookupValue[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    education_level: "",
    qualification_type: "",
    field_of_study: "",
    specialization: "",
    institution_name: "",
    certification_type: "",
    accrediting_body: "",
    accrediting_body_manual: "",
    license_number: "",
    country: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    date_awarded: undefined as Date | undefined,
    issued_date: undefined as Date | undefined,
    expiry_date: undefined as Date | undefined,
    comments: "",
  });

  useEffect(() => {
    if (open) {
      fetchLookupData();
      resetForm();
    }
  }, [open]);

  const fetchLookupData = async () => {
    try {
      const { data: lookupRes } = await supabase
        .from("lookup_values")
        .select("id, code, name, description, display_order, is_active, category")
        .eq("is_active", true)
        .in("category", [
          "education_level", 
          "qualification_type", 
          "field_of_study", 
          "institution_name",
          "certification_type",
          "accrediting_body"
        ] as any)
        .order("display_order");

      if (lookupRes) {
        const grouped = lookupRes.reduce((acc, item) => {
          const cat = (item as any).category as string;
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item as LookupValue);
          return acc;
        }, {} as Record<string, LookupValue[]>);
        
        setEducationLevels(grouped["education_level"] || []);
        setQualificationTypes(grouped["qualification_type"] || []);
        setFieldsOfStudy(grouped["field_of_study"] || []);
        setInstitutionNames(grouped["institution_name"] || []);
        setCertificationTypes(grouped["certification_type"] || []);
        setAccreditingBodies(grouped["accrediting_body"] || []);
      }
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Please enter the qualification name");
      return;
    }

    if (!profile?.id) {
      toast.error("Unable to identify your profile");
      return;
    }

    try {
      // Upload document if selected
      let documentUrl = null;
      let documentName = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `qualifications/${profile.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("employee-documents")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("employee-documents")
          .getPublicUrl(filePath);

        documentUrl = urlData.publicUrl;
        documentName = selectedFile.name;
      }

      // Prepare qualification data for change request
      const qualificationData = {
        record_type: recordType,
        name: formData.name,
        education_level: formData.education_level || null,
        qualification_type: formData.qualification_type || null,
        field_of_study: formData.field_of_study || null,
        specialization: formData.specialization || null,
        institution_name: formData.institution_name || null,
        certification_type: formData.certification_type || null,
        accrediting_body: formData.accrediting_body || formData.accrediting_body_manual || null,
        license_number: formData.license_number || null,
        country: formData.country || null,
        start_date: formData.start_date?.toISOString().split("T")[0] || null,
        end_date: formData.end_date?.toISOString().split("T")[0] || null,
        date_awarded: formData.date_awarded?.toISOString().split("T")[0] || null,
        issued_date: formData.issued_date?.toISOString().split("T")[0] || null,
        expiry_date: formData.expiry_date?.toISOString().split("T")[0] || null,
        comments: formData.comments || null,
        document_url: documentUrl,
        document_name: documentName,
        status: recordType === "academic" ? "completed" : "active",
      };

      // Submit as change request for HR approval
      await submitChangeRequest.mutateAsync({
        request_type: "qualification",
        entity_table: "employee_qualifications",
        change_action: "create",
        new_values: qualificationData,
      });

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting qualification:", error);
      toast.error(error.message || "Failed to submit qualification");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      education_level: "",
      qualification_type: "",
      field_of_study: "",
      specialization: "",
      institution_name: "",
      certification_type: "",
      accrediting_body: "",
      accrediting_body_manual: "",
      license_number: "",
      country: "",
      start_date: undefined,
      end_date: undefined,
      date_awarded: undefined,
      issued_date: undefined,
      expiry_date: undefined,
      comments: "",
    });
    setRecordType("academic");
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ess.qualifications.addNew", "Add Qualification")}</DialogTitle>
          <DialogDescription>
            {t("ess.qualifications.addDescription", "Submit your qualification for HR review and verification")}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            {t("ess.qualifications.approvalNotice", "Your submission will be reviewed by HR before being added to your profile.")}
          </AlertDescription>
        </Alert>

        <Tabs value={recordType} onValueChange={(v) => setRecordType(v as "academic" | "certification")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="certification" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certification/License
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <TabsContent value="academic" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Education Level</Label>
                  <Select
                    value={formData.education_level}
                    onValueChange={(v) => setFormData({ ...formData, education_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Qualification Type</Label>
                  <Select
                    value={formData.qualification_type}
                    onValueChange={(v) => setFormData({ ...formData, qualification_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Qualification Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Select
                    value={formData.field_of_study}
                    onValueChange={(v) => setFormData({ ...formData, field_of_study: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldsOfStudy.map((field) => (
                        <SelectItem key={field.id} value={field.name}>{field.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Specialization/Major</Label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Software Engineering"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Institution Name</Label>
                  <Select
                    value={formData.institution_name}
                    onValueChange={(v) => setFormData({ ...formData, institution_name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionNames.map((inst) => (
                        <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Country</Label>
                  <CountrySelect
                    value={formData.country}
                    onChange={(v) => setFormData({ ...formData, country: v })}
                  />
                </div>
                <div>
                  <Label>Date Awarded</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !formData.date_awarded && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_awarded ? format(formData.date_awarded, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date_awarded}
                        onSelect={(d) => setFormData({ ...formData, date_awarded: d })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="certification" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Certification Type</Label>
                  <Select
                    value={formData.certification_type}
                    onValueChange={(v) => setFormData({ ...formData, certification_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Accrediting/Issuing Body</Label>
                  <Select
                    value={formData.accrediting_body}
                    onValueChange={(v) => setFormData({ ...formData, accrediting_body: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body" />
                    </SelectTrigger>
                    <SelectContent>
                      {accreditingBodies.map((body) => (
                        <SelectItem key={body.id} value={body.name}>{body.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Certification/License Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., PMP, AWS Solutions Architect"
                  />
                </div>
                <div>
                  <Label>License/Certificate Number</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="Enter number"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <CountrySelect
                    value={formData.country}
                    onChange={(v) => setFormData({ ...formData, country: v })}
                  />
                </div>
                <div>
                  <Label>Issued Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !formData.issued_date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.issued_date ? format(formData.issued_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.issued_date}
                        onSelect={(d) => setFormData({ ...formData, issued_date: d })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !formData.expiry_date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiry_date ? format(formData.expiry_date, "PPP") : "No expiry"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expiry_date}
                        onSelect={(d) => setFormData({ ...formData, expiry_date: d })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            {/* Document Upload - Common */}
            <div className="space-y-2">
              <Label>Supporting Document</Label>
              <div className="flex items-center gap-2">
                {selectedFile ? (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg flex-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors flex-1">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload certificate or diploma (max 10MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label>Additional Comments</Label>
              <Textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Any additional information for HR review..."
                rows={3}
              />
            </div>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              t("ess.qualifications.submitForApproval", "Submit for Approval")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
