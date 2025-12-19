import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";

interface CompanyFiscalYear {
  id: string;
  company_id: string;
  fiscal_year_start_month: number;
  fiscal_year_start_day: number;
  effective_start_date: string;
  effective_end_date: string | null;
  use_country_fiscal_year: boolean;
  notes: string | null;
  created_at: string;
}

interface Props {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CompanyFiscalYearsManager({ companyId, companyName, isOpen, onClose }: Props) {
  const [fiscalYears, setFiscalYears] = useState<CompanyFiscalYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    use_country_fiscal_year: true,
    fiscal_year_start_month: 1,
    fiscal_year_start_day: 1,
    effective_start_date: format(new Date(), "yyyy-MM-dd"),
    effective_end_date: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && companyId) {
      fetchFiscalYears();
    }
  }, [isOpen, companyId]);

  const fetchFiscalYears = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company_fiscal_years")
        .select("*")
        .eq("company_id", companyId)
        .order("effective_start_date", { ascending: false });

      if (error) throw error;
      setFiscalYears(data || []);
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
      toast({
        title: "Error",
        description: "Failed to load fiscal year configurations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (fiscalYear?: CompanyFiscalYear) => {
    if (fiscalYear) {
      setEditingId(fiscalYear.id);
      setFormData({
        use_country_fiscal_year: fiscalYear.use_country_fiscal_year,
        fiscal_year_start_month: fiscalYear.fiscal_year_start_month,
        fiscal_year_start_day: fiscalYear.fiscal_year_start_day,
        effective_start_date: fiscalYear.effective_start_date,
        effective_end_date: fiscalYear.effective_end_date || "",
        notes: fiscalYear.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        use_country_fiscal_year: true,
        fiscal_year_start_month: 1,
        fiscal_year_start_day: 1,
        effective_start_date: format(new Date(), "yyyy-MM-dd"),
        effective_end_date: "",
        notes: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const saveData = {
        company_id: companyId,
        use_country_fiscal_year: formData.use_country_fiscal_year,
        fiscal_year_start_month: formData.fiscal_year_start_month,
        fiscal_year_start_day: formData.fiscal_year_start_day,
        effective_start_date: formData.effective_start_date,
        effective_end_date: formData.effective_end_date || null,
        notes: formData.notes || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("company_fiscal_years")
          .update(saveData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Updated", description: "Fiscal year configuration updated." });
      } else {
        const { error } = await supabase
          .from("company_fiscal_years")
          .insert(saveData);

        if (error) {
          if (error.message.includes("no_overlapping_fiscal_years")) {
            toast({
              title: "Date Overlap",
              description: "This date range overlaps with an existing configuration.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          throw error;
        }
        toast({ title: "Created", description: "Fiscal year configuration added." });
      }

      handleCloseForm();
      fetchFiscalYears();
    } catch (error) {
      console.error("Error saving fiscal year:", error);
      toast({
        title: "Error",
        description: "Failed to save fiscal year configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fiscal year configuration?")) return;

    try {
      const { error } = await supabase
        .from("company_fiscal_years")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Fiscal year configuration removed." });
      fetchFiscalYears();
    } catch (error) {
      console.error("Error deleting fiscal year:", error);
      toast({
        title: "Error",
        description: "Failed to delete fiscal year configuration.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Fiscal Year Configuration</h2>
            <p className="text-sm text-muted-foreground">{companyName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          {!isFormOpen && (
            <button
              onClick={() => handleOpenForm()}
              className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Fiscal Year Period
            </button>
          )}

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="use_country_fiscal_year"
                  checked={formData.use_country_fiscal_year}
                  onChange={(e) => setFormData({ ...formData, use_country_fiscal_year: e.target.checked })}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="use_country_fiscal_year" className="text-sm text-foreground">
                  Use country default fiscal year settings
                </label>
              </div>

              {!formData.use_country_fiscal_year && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Start Month</label>
                    <select
                      value={formData.fiscal_year_start_month}
                      onChange={(e) => setFormData({ ...formData, fiscal_year_start_month: parseInt(e.target.value) })}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground"
                    >
                      {monthNames.map((month, i) => (
                        <option key={i} value={i + 1}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Start Day</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={formData.fiscal_year_start_day}
                      onChange={(e) => setFormData({ ...formData, fiscal_year_start_day: parseInt(e.target.value) || 1 })}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Effective From *</label>
                  <input
                    type="date"
                    required
                    value={formData.effective_start_date}
                    onChange={(e) => setFormData({ ...formData, effective_start_date: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Effective Until</label>
                  <input
                    type="date"
                    value={formData.effective_end_date}
                    onChange={(e) => setFormData({ ...formData, effective_end_date: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for ongoing</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fiscalYears.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No fiscal year configurations</p>
              <p className="text-xs text-muted-foreground">Country defaults will be used</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fiscalYears.map((fy) => (
                <div
                  key={fy.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {fy.use_country_fiscal_year
                          ? "Country Default"
                          : `${monthNames[fy.fiscal_year_start_month - 1]} ${fy.fiscal_year_start_day}`}
                      </span>
                      {!fy.effective_end_date && (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(fy.effective_start_date), "MMM d, yyyy")}
                      {fy.effective_end_date
                        ? ` → ${format(new Date(fy.effective_end_date), "MMM d, yyyy")}`
                        : " → Ongoing"}
                    </p>
                    {fy.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{fy.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenForm(fy)}
                      className="rounded-lg p-2 hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(fy.id)}
                      className="rounded-lg p-2 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
