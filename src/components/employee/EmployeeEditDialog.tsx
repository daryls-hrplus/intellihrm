import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  } | null;
  onSuccess?: () => void;
}

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeEditDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [timeFormat, setTimeFormat] = useState("");
  const [saving, setSaving] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | number | boolean | string[] | null>>({});
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
        },
        newValues: {
          full_name: fullName,
          avatar_url: avatarUrl || null,
          timezone: timezone || null,
          preferred_language: preferredLanguage || null,
          date_format: dateFormat || null,
          time_format: timeFormat || null,
        },
      });

      toast.success("Employee updated successfully");
      onOpenChange(false);
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
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
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
