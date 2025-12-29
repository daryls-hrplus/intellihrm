import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { Loader2, HelpCircle, Upload, AlertTriangle } from "lucide-react";
import { CustomFieldsRenderer } from "@/components/custom-fields/CustomFieldsRenderer";
import { useCustomFields } from "@/hooks/useCustomFields";
import { format } from "date-fns";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const TIME_FORMATS = [
  { value: "12h", label: "12-hour (AM/PM)" },
  { value: "24h", label: "24-hour" },
];

const EMPLOYMENT_STATUSES = [
  { value: "on_probation", label: "On Probation" },
  { value: "temporary", label: "Temporary" },
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part Time" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer Not to Say" },
];

const MARITAL_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
  { value: "domestic_partnership", label: "Domestic Partnership" },
];

interface EmployeeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    timezone?: string | null;
    preferred_language?: string | null;
    date_format?: string | null;
    time_format?: string | null;
    company_id?: string | null;
    first_hire_date?: string | null;
    last_hire_date?: string | null;
    start_date?: string | null;
    continuous_service_date?: string | null;
    seniority_date?: string | null;
    adjusted_service_date?: string | null;
    employment_status?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    marital_status?: string | null;
    nationality?: string | null;
    // Employee identifiers
    employee_id?: string | null;
    badge_number?: string | null;
    global_id?: string | null;
    cedula_number?: string | null;
    time_clock_id?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeEditDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [timeFormat, setTimeFormat] = useState("");
  const [firstHireDate, setFirstHireDate] = useState("");
  const [lastHireDate, setLastHireDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [continuousServiceDate, setContinuousServiceDate] = useState("");
  const [seniorityDate, setSeniorityDate] = useState("");
  const [adjustedServiceDate, setAdjustedServiceDate] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [nationality, setNationality] = useState("");
  // Employee identifiers (employee_id is system-generated, not editable)
  const [badgeNumber, setBadgeNumber] = useState("");
  const [globalId, setGlobalId] = useState("");
  const [cedulaNumber, setCedulaNumber] = useState("");
  const [timeClockId, setTimeClockId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | number | boolean | string[] | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logAction } = useAuditLog();

  const { fields, values, saveValues } = useCustomFields({
    formContext: 'employee_profile',
    entityId: employee?.id,
    entityType: 'profiles',
    companyId: employee?.company_id,
  });

  useEffect(() => {
    if (employee) {
      setFullName(employee.full_name || "");
      setEmail(employee.email || "");
      setAvatarUrl(employee.avatar_url || "");
      setTimezone(employee.timezone || "");
      setPreferredLanguage(employee.preferred_language || "");
      setDateFormat(employee.date_format || "");
      setTimeFormat(employee.time_format || "");
      setFirstHireDate(employee.first_hire_date || "");
      setLastHireDate(employee.last_hire_date || "");
      setStartDate(employee.start_date || "");
      setContinuousServiceDate(employee.continuous_service_date || "");
      setSeniorityDate(employee.seniority_date || "");
      setAdjustedServiceDate(employee.adjusted_service_date || "");
      setEmploymentStatus(employee.employment_status || "permanent");
      setGender(employee.gender || "");
      setDateOfBirth(employee.date_of_birth || "");
      setMaritalStatus(employee.marital_status || "");
      setNationality(employee.nationality || "");
      // Employee identifiers (employee_id is system-generated, not editable)
      setBadgeNumber(employee.badge_number || "");
      setGlobalId(employee.global_id || "");
      setCedulaNumber(employee.cedula_number || "");
      setTimeClockId(employee.time_clock_id || "");
    }
  }, [employee]);

  // Sync custom field values from hook
  useEffect(() => {
    setCustomFieldValues(values);
  }, [values]);

  const handleCustomFieldChange = useCallback((fieldId: string, value: string | number | boolean | string[] | null) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employee) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employee.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar. Please ensure storage is configured.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if (!employee) return;
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim() || null,
          timezone: timezone || null,
          preferred_language: preferredLanguage || null,
          date_format: dateFormat || null,
          time_format: timeFormat || null,
          first_hire_date: firstHireDate || null,
          last_hire_date: lastHireDate || null,
          start_date: startDate || null,
          continuous_service_date: continuousServiceDate || null,
          seniority_date: seniorityDate || null,
          adjusted_service_date: adjustedServiceDate || null,
          employment_status: employmentStatus || 'permanent',
          gender: gender || null,
          date_of_birth: dateOfBirth || null,
          marital_status: maritalStatus || null,
          nationality: nationality || null,
          // Employee identifiers (employee_id is system-generated, not updated here)
          badge_number: badgeNumber || null,
          global_id: globalId || null,
          cedula_number: cedulaNumber || null,
          time_clock_id: timeClockId || null,
        })
        .eq("id", employee.id);

      if (error) throw error;

      // Save custom field values
      if (Object.keys(customFieldValues).length > 0) {
        await saveValues(employee.id, 'profiles');
      }

      await logAction({
        action: "UPDATE",
        entityType: "employee",
        entityId: employee.id,
        entityName: fullName,
        oldValues: {
          full_name: employee.full_name,
          avatar_url: employee.avatar_url,
          timezone: employee.timezone,
          preferred_language: employee.preferred_language,
          date_format: employee.date_format,
          time_format: employee.time_format,
          first_hire_date: employee.first_hire_date,
          last_hire_date: employee.last_hire_date,
          start_date: employee.start_date,
          continuous_service_date: employee.continuous_service_date,
          seniority_date: employee.seniority_date,
          adjusted_service_date: employee.adjusted_service_date,
          employment_status: employee.employment_status,
          gender: employee.gender,
          date_of_birth: employee.date_of_birth,
          marital_status: employee.marital_status,
          nationality: employee.nationality,
          employee_id: employee.employee_id,
          badge_number: employee.badge_number,
          global_id: employee.global_id,
          cedula_number: employee.cedula_number,
          time_clock_id: employee.time_clock_id,
        },
        newValues: {
          full_name: fullName,
          avatar_url: avatarUrl || null,
          timezone: timezone || null,
          preferred_language: preferredLanguage || null,
          date_format: dateFormat || null,
          time_format: timeFormat || null,
          first_hire_date: firstHireDate || null,
          last_hire_date: lastHireDate || null,
          start_date: startDate || null,
          continuous_service_date: continuousServiceDate || null,
          seniority_date: seniorityDate || null,
          adjusted_service_date: adjustedServiceDate || null,
          employment_status: employmentStatus || 'permanent',
          gender: gender || null,
          date_of_birth: dateOfBirth || null,
          marital_status: maritalStatus || null,
          nationality: nationality || null,
          badge_number: badgeNumber || null,
          global_id: globalId || null,
          cedula_number: cedulaNumber || null,
          time_clock_id: timeClockId || null,
        },
      });

      toast.success("Employee updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Two column layout for basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info & Avatar */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed as it's linked to authentication
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Employee Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback className="text-lg">
                      {fullName ? getInitials(fullName) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <Label htmlFor="avatarUrl" className="text-xs text-muted-foreground">Or enter URL directly</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Preferences */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <DatePicker
                  value={dateOfBirth}
                  onChange={(date) => setDateOfBirth(date ? format(date, 'yyyy-MM-dd') : "")}
                  placeholder="Select date of birth"
                  maxYear={new Date().getFullYear()}
                  minYear={1920}
                  toDate={new Date()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Enter nationality"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Employee Identifiers Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Employee Identifiers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="badgeNumber">Badge Number</Label>
                <Input
                  id="badgeNumber"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="Enter badge number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="globalId">Global ID</Label>
                <Input
                  id="globalId"
                  value={globalId}
                  onChange={(e) => setGlobalId(e.target.value)}
                  placeholder="Enter global ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cedulaNumber">Cédula Number</Label>
                <Input
                  id="cedulaNumber"
                  value={cedulaNumber}
                  onChange={(e) => setCedulaNumber(e.target.value)}
                  placeholder="Enter cédula number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeClockId">Time Clock ID</Label>
                <Input
                  id="timeClockId"
                  value={timeClockId}
                  onChange={(e) => setTimeClockId(e.target.value)}
                  placeholder="Enter time clock ID"
                />
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Employment Dates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Employment Dates</h4>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-destructive font-medium">
                  These dates should be updated via Employee Transactions
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  Use Hire, Rehire, or other transaction types to properly manage employment dates with full audit trail and workflow approval.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Priority for calculations: Adjusted Service → Continuous Service → Seniority → Start Date → First Hire.
            </p>
          
            <TooltipProvider>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="firstHireDate">First Hire Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The original date the employee was first hired by the organization. Used as fallback for leave calculations if no other service dates are set.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={firstHireDate}
                    onChange={(date) => setFirstHireDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    placeholder="Select date"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="lastHireDate">Last Hire Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The most recent hire date if the employee was rehired. Useful for tracking employment gaps.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={lastHireDate}
                    onChange={(date) => setLastHireDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    placeholder="Select date"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="startDate">Start Date (First Day)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The employee's first day on the job. Use when there is no waiting period before leave accrual begins.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={startDate}
                    onChange={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    placeholder="Select date"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="continuousServiceDate">Continuous Service Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Used to grant prior service credit, typically for rehires. Leave calculations will use this date to include previous tenure with the organization.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={continuousServiceDate}
                    onChange={(date) => setContinuousServiceDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    placeholder="Select date"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="seniorityDate">Seniority Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Date from which leave is calculated after probation ends. Use when employees must complete a probationary period before accruing leave.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={seniorityDate}
                    onChange={(date) => setSeniorityDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    placeholder="Select date"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="adjustedServiceDate">Adjusted Service Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Used to credit work from a previous tenure or external organization. Takes highest priority in leave calculations when set.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={adjustedServiceDate}
                    onChange={(date) => setAdjustedServiceDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    placeholder="Select date"
                  />
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Custom Fields Section */}
          {fields.length > 0 && (
            <>
              <Separator className="my-2" />
              <CustomFieldsRenderer
                formContext="employee_profile"
                entityId={employee?.id}
                entityType="profiles"
                companyId={employee?.company_id}
                values={customFieldValues}
                onChange={handleCustomFieldChange}
              />
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
