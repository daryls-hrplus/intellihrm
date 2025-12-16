import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Company {
  id: string;
  name: string;
}

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEmployeeDialogProps) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);
  const { logAction } = useAuditLog();

  useEffect(() => {
    if (open) {
      fetchCompanies();
      // Reset form when opening
      setFullName("");
      setEmail("");
      setCompanyId("");
    }
  }, [open]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(data || []);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error(t("workforce.addEmployeeDialog.fullNameRequired", "Full name is required"));
      return;
    }
    if (!email.trim()) {
      toast.error(t("workforce.addEmployeeDialog.emailRequired", "Email is required"));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error(t("workforce.addEmployeeDialog.invalidEmail", "Please enter a valid email address"));
      return;
    }

    setSaving(true);
    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        toast.error(t("workforce.addEmployeeDialog.emailExists", "An employee with this email already exists"));
        setSaving(false);
        return;
      }

      // Create new profile - generate UUID for id
      const newId = crypto.randomUUID();
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: newId,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          company_id: companyId || null,
        })
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: "CREATE",
        entityType: "employee",
        entityId: newProfile.id,
        entityName: fullName,
        newValues: {
          full_name: fullName,
          email: email,
          company_id: companyId || null,
        },
      });

      toast.success(t("workforce.addEmployeeDialog.success", "Employee added successfully"));
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding employee:", error);
      if (error.code === "23505") {
        toast.error(t("workforce.addEmployeeDialog.emailExists", "An employee with this email already exists"));
      } else {
        toast.error(t("workforce.addEmployeeDialog.error", "Failed to add employee"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("workforce.addEmployee", "Add Employee")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">{t("workforce.addEmployeeDialog.fullName", "Full Name")} *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("workforce.addEmployeeDialog.fullNamePlaceholder", "Enter full name")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("workforce.addEmployeeDialog.email", "Email")} *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("workforce.addEmployeeDialog.emailPlaceholder", "Enter email address")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">{t("workforce.addEmployeeDialog.company", "Company")}</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder={t("workforce.addEmployeeDialog.selectCompany", "Select company (optional)")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("workforce.addEmployeeDialog.add", "Add Employee")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
