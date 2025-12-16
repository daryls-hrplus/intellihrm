import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, GraduationCap, Award } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface QualificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  companyId?: string;
  employeeId?: string;
}

interface Employee {
  id: string;
  full_name: string;
  company_id: string;
}

interface EducationLevel {
  id: string;
  name: string;
  display_order: number;
}

interface QualificationType {
  id: string;
  name: string;
  record_type: string;
  requires_expiry: boolean;
}

interface FieldOfStudy {
  id: string;
  name: string;
  category: string;
}

interface AccreditingBody {
  id: string;
  name: string;
  short_name: string;
  industry: string;
}

export function QualificationDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
  employeeId,
}: QualificationDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recordType, setRecordType] = useState<"academic" | "certification">("academic");
  
  // Lookup data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<QualificationType[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [accreditingBodies, setAccreditingBodies] = useState<AccreditingBody[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    employee_id: employeeId || "",
    name: "",
    education_level_id: "",
    qualification_type_id: "",
    field_of_study_id: "",
    specialization: "",
    institution_name: "",
    accrediting_body_id: "",
    accrediting_body_name: "",
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
    }
  }, [open]);

  const fetchLookupData = async () => {
    try {
      const [employeesRes, levelsRes, typesRes, fieldsRes, bodiesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, company_id").eq("is_active", true).order("full_name"),
        supabase.from("education_levels").select("*").eq("is_active", true).order("display_order"),
        supabase.from("qualification_types").select("*").eq("is_active", true).order("display_order"),
        supabase.from("fields_of_study").select("*").eq("is_active", true).order("name"),
        supabase.from("accrediting_bodies").select("*").eq("is_active", true).order("name"),
      ]);

      if (employeesRes.data) setEmployees(employeesRes.data);
      if (levelsRes.data) setEducationLevels(levelsRes.data);
      if (typesRes.data) setQualificationTypes(typesRes.data);
      if (fieldsRes.data) setFieldsOfStudy(fieldsRes.data);
      if (bodiesRes.data) setAccreditingBodies(bodiesRes.data);
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.name) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsLoading(true);
    try {
      const employee = employees.find((e) => e.id === formData.employee_id);
      if (!employee) {
        toast.error("Employee not found");
        return;
      }

      const { error } = await supabase.from("employee_qualifications").insert({
        employee_id: formData.employee_id,
        company_id: employee.company_id,
        record_type: recordType,
        name: formData.name,
        education_level_id: formData.education_level_id || null,
        qualification_type_id: formData.qualification_type_id || null,
        field_of_study_id: formData.field_of_study_id || null,
        specialization: formData.specialization || null,
        institution_name: formData.institution_name || null,
        accrediting_body_id: formData.accrediting_body_id || null,
        accrediting_body_name: formData.accrediting_body_name || null,
        license_number: formData.license_number || null,
        country: formData.country || null,
        start_date: formData.start_date?.toISOString().split("T")[0] || null,
        end_date: formData.end_date?.toISOString().split("T")[0] || null,
        date_awarded: formData.date_awarded?.toISOString().split("T")[0] || null,
        issued_date: formData.issued_date?.toISOString().split("T")[0] || null,
        expiry_date: formData.expiry_date?.toISOString().split("T")[0] || null,
        comments: formData.comments || null,
        status: recordType === "academic" ? "completed" : "active",
        verification_status: "pending",
        created_by: user?.id || null,
      });

      if (error) throw error;

      toast.success("Qualification added successfully");
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding qualification:", error);
      toast.error(error.message || "Failed to add qualification");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: employeeId || "",
      name: "",
      education_level_id: "",
      qualification_type_id: "",
      field_of_study_id: "",
      specialization: "",
      institution_name: "",
      accrediting_body_id: "",
      accrediting_body_name: "",
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
  };

  const filteredQualificationTypes = qualificationTypes.filter((qt) => {
    if (recordType === "academic") return qt.record_type === "academic";
    return ["certification", "license", "membership", "participation"].includes(qt.record_type);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Qualification</DialogTitle>
          <DialogDescription>
            Add an academic qualification or professional certification/license for an employee.
          </DialogDescription>
        </DialogHeader>

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
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                  disabled={!!employeeId}
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
            </div>

            <TabsContent value="academic" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Education Level</Label>
                  <Select
                    value={formData.education_level_id}
                    onValueChange={(v) => setFormData({ ...formData, education_level_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Qualification Type</Label>
                  <Select
                    value={formData.qualification_type_id}
                    onValueChange={(v) => setFormData({ ...formData, qualification_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredQualificationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
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
                    value={formData.field_of_study_id}
                    onValueChange={(v) => setFormData({ ...formData, field_of_study_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldsOfStudy.map((field) => (
                        <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
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
                  <Input
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    placeholder="e.g., University of Technology"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <Label>Date Awarded</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date_awarded && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_awarded ? format(formData.date_awarded, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date_awarded}
                        onSelect={(date) => setFormData({ ...formData, date_awarded: date })}
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
                  <Label>Type</Label>
                  <Select
                    value={formData.qualification_type_id}
                    onValueChange={(v) => setFormData({ ...formData, qualification_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredQualificationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>License/Certificate Number</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="e.g., PMP-123456"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Certification/License Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Project Management Professional (PMP)"
                  />
                </div>
                <div>
                  <Label>Certifying/Accrediting Body</Label>
                  <Select
                    value={formData.accrediting_body_id}
                    onValueChange={(v) => setFormData({ ...formData, accrediting_body_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body" />
                    </SelectTrigger>
                    <SelectContent>
                      {accreditingBodies.map((body) => (
                        <SelectItem key={body.id} value={body.id}>
                          {body.short_name || body.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Or Enter Manually</Label>
                  <Input
                    value={formData.accrediting_body_name}
                    onChange={(e) => setFormData({ ...formData, accrediting_body_name: e.target.value })}
                    placeholder="Enter body name if not in list"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <Label>Issued Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.issued_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.issued_date ? format(formData.issued_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.issued_date}
                        onSelect={(date) => setFormData({ ...formData, issued_date: date })}
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
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expiry_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiry_date ? format(formData.expiry_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiry_date}
                        onSelect={(date) => setFormData({ ...formData, expiry_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            {/* Comments */}
            <div>
              <Label>Comments/Notes</Label>
              <Textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Qualification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
