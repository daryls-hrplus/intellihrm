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
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { Loader2, HelpCircle, Upload, AlertTriangle } from "lucide-react";
import { CustomFieldsRenderer } from "@/components/custom-fields/CustomFieldsRenderer";
import { useCustomFields } from "@/hooks/useCustomFields";

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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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

          <Separator className="my-2" />
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
            <div className="grid grid-cols-2 gap-4">
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
                <Input
                  id="firstHireDate"
                  type="date"
                  value={firstHireDate}
                  onChange={(e) => setFirstHireDate(e.target.value)}
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
                <Input
                  id="lastHireDate"
                  type="date"
                  value={lastHireDate}
                  onChange={(e) => setLastHireDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                <Input
                  id="continuousServiceDate"
                  type="date"
                  value={continuousServiceDate}
                  onChange={(e) => setContinuousServiceDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                <Input
                  id="seniorityDate"
                  type="date"
                  value={seniorityDate}
                  onChange={(e) => setSeniorityDate(e.target.value)}
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
                <Input
                  id="adjustedServiceDate"
                  type="date"
                  value={adjustedServiceDate}
                  onChange={(e) => setAdjustedServiceDate(e.target.value)}
                />
              </div>
            </div>
          </TooltipProvider>

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
