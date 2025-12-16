import { useEffect, useMemo, useState } from "react";
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
import { z } from "zod";

interface Company {
  id: string;
  name: string;
}

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  companyId: z.string().uuid().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function AddEmployeeDialog({ open, onOpenChange, onSuccess }: AddEmployeeDialogProps) {
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

  const formValues: FormValues = useMemo(
    () => ({ fullName, email, companyId }),
    [fullName, email, companyId],
  );

  const handleSave = async () => {
    const parsed = formSchema.safeParse(formValues);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || t("common.invalidInput", "Invalid input"));
      return;
    }

    setSaving(true);
    try {
      const normalizedCompanyId = parsed.data.companyId ? parsed.data.companyId : null;

      const { data, error } = await supabase.functions.invoke("create-employee", {
        body: {
          full_name: parsed.data.fullName,
          email: parsed.data.email,
          company_id: normalizedCompanyId,
        },
      });

      if (error) {
        toast.error(error.message || t("workforce.addEmployeeDialog.error", "Failed to add employee"));
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || t("workforce.addEmployeeDialog.error", "Failed to add employee"));
        return;
      }

      await logAction({
        action: "CREATE",
        entityType: "employee",
        entityId: data.user_id,
        entityName: parsed.data.fullName,
        newValues: {
          full_name: parsed.data.fullName,
          email: parsed.data.email,
          company_id: normalizedCompanyId,
        },
      });

      toast.success(t("workforce.addEmployeeDialog.success", "Employee added successfully"));
      onSuccess?.();
      onOpenChange(false);
    } catch (e: any) {
      console.error("Error adding employee:", e);
      toast.error(t("workforce.addEmployeeDialog.error", "Failed to add employee"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
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
              <SelectTrigger id="company">
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
