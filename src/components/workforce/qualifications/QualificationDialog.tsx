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
import { CountrySelect } from "@/components/ui/country-select";
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

interface LookupValue {
  id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
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
  const [educationLevels, setEducationLevels] = useState<LookupValue[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<LookupValue[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<LookupValue[]>([]);
  const [institutionNames, setInstitutionNames] = useState<LookupValue[]>([]);
  const [certificationTypes, setCertificationTypes] = useState<LookupValue[]>([]);
  const [certificationNames, setCertificationNames] = useState<LookupValue[]>([]);
  const [accreditingBodies, setAccreditingBodies] = useState<LookupValue[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    employee_id: employeeId || "",
    name: "",
    education_level: "",
    qualification_type: "",
    field_of_study: "",
    specialization: "",
    institution_name: "",
    certification_type: "",
    certification_name: "",
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
    }
  }, [open]);

  const fetchLookupData = async () => {
    try {
      const [employeesRes, lookupRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, company_id").eq("is_active", true).order("full_name"),
        supabase.from("lookup_values").select("id, code, name, description, display_order, is_active, category")
          .eq("is_active", true)
          .in("category", [
            "education_level", 
            "qualification_type", 
            "field_of_study", 
            "institution_name",
            "certification_type",
            "certification_name",
            "accrediting_body"
          ] as any)
          .order("display_order"),
      ]);

      if (employeesRes.data) setEmployees(employeesRes.data);
      
      if (lookupRes.data) {
        const grouped = lookupRes.data.reduce((acc, item) => {
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
        setCertificationNames(grouped["certification_name"] || []);
        setAccreditingBodies(grouped["accrediting_body"] || []);
      }
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
      education_level: "",
      qualification_type: "",
      field_of_study: "",
      specialization: "",
      institution_name: "",
      certification_type: "",
      certification_name: "",
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
  };

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
                      <SelectValue placeholder="Select or type institution" />
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
                    valueType="name"
                    placeholder="Select country"
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
                  <Label>License/Certificate Number</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="e.g., PMP-123456"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Certification/License Name *</Label>
                  <Select
                    value={formData.name}
                    onValueChange={(v) => setFormData({ ...formData, name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or enter name" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationNames.map((cert) => (
                        <SelectItem key={cert.id} value={cert.name}>{cert.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Certifying/Accrediting Body</Label>
                  <Select
                    value={formData.accrediting_body}
                    onValueChange={(v) => setFormData({ ...formData, accrediting_body: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body" />
                    </SelectTrigger>
                    <SelectContent>
                      {accreditingBodies.map((body) => (
                        <SelectItem key={body.id} value={body.name}>
                          {body.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Or Enter Manually</Label>
                  <Input
                    value={formData.accrediting_body_manual}
                    onChange={(e) => setFormData({ ...formData, accrediting_body_manual: e.target.value })}
                    placeholder="Enter body name if not in list"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <CountrySelect
                    value={formData.country}
                    onChange={(v) => setFormData({ ...formData, country: v })}
                    valueType="name"
                    placeholder="Select country"
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
