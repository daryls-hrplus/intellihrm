import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useManagePerformanceCategories, PerformanceCategory } from "@/hooks/usePerformanceCategories";

const categorySchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  name: z.string().min(1, "Name is required").max(100),
  name_en: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  description_en: z.string().max(500).optional().nullable(),
  min_score: z.coerce.number().min(0).max(100),
  max_score: z.coerce.number().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  icon: z.string().max(50).optional().nullable(),
  promotion_eligible: z.boolean(),
  succession_eligible: z.boolean(),
  bonus_eligible: z.boolean(),
  requires_pip: z.boolean(),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
}).refine((data) => data.max_score > data.min_score, {
  message: "Max score must be greater than min score",
  path: ["max_score"],
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface PerformanceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingCategory: PerformanceCategory | null;
}

const defaultColors = [
  "#22c55e", // Green - Exceptional
  "#3b82f6", // Blue - Exceeds
  "#f59e0b", // Amber - Meets
  "#f97316", // Orange - Needs Improvement
  "#ef4444", // Red - Unsatisfactory
];

export function PerformanceCategoryDialog({
  open,
  onOpenChange,
  companyId,
  editingCategory,
}: PerformanceCategoryDialogProps) {
  const { createCategory, updateCategory } = useManagePerformanceCategories();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: "",
      name: "",
      name_en: "",
      description: "",
      description_en: "",
      min_score: 0,
      max_score: 100,
      color: "#3b82f6",
      icon: "",
      promotion_eligible: false,
      succession_eligible: false,
      bonus_eligible: false,
      requires_pip: false,
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.reset({
          code: editingCategory.code,
          name: editingCategory.name,
          name_en: editingCategory.name_en || "",
          description: editingCategory.description || "",
          description_en: editingCategory.description_en || "",
          min_score: editingCategory.min_score,
          max_score: editingCategory.max_score,
          color: editingCategory.color,
          icon: editingCategory.icon || "",
          promotion_eligible: editingCategory.promotion_eligible,
          succession_eligible: editingCategory.succession_eligible,
          bonus_eligible: editingCategory.bonus_eligible,
          requires_pip: editingCategory.requires_pip,
          display_order: editingCategory.display_order,
          is_active: editingCategory.is_active,
        });
      } else {
        form.reset({
          code: "",
          name: "",
          name_en: "",
          description: "",
          description_en: "",
          min_score: 0,
          max_score: 100,
          color: "#3b82f6",
          icon: "",
          promotion_eligible: false,
          succession_eligible: false,
          bonus_eligible: false,
          requires_pip: false,
          display_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, editingCategory, form]);

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory.mutate(
        { 
          id: editingCategory.id, 
          ...data,
          name_en: data.name_en || null,
          description: data.description || null,
          description_en: data.description_en || null,
          icon: data.icon || null,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      const payload = {
        company_id: companyId,
        code: data.code,
        name: data.name,
        name_en: data.name_en || null,
        description: data.description || null,
        description_en: data.description_en || null,
        min_score: data.min_score,
        max_score: data.max_score,
        color: data.color,
        icon: data.icon || null,
        promotion_eligible: data.promotion_eligible,
        succession_eligible: data.succession_eligible,
        bonus_eligible: data.bonus_eligible,
        requires_pip: data.requires_pip,
        display_order: data.display_order,
        is_active: data.is_active,
      };
      createCategory.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Edit" : "Add"} Performance Category</DialogTitle>
          <DialogDescription>
            Configure a performance level category with score thresholds and eligibility settings
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., exceptional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Exceptional Performance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="English name (optional)" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Category description..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="English description (optional)..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Score Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Score (%) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={1} {...field} />
                    </FormControl>
                    <FormDescription>Minimum score threshold</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score (%) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={1} {...field} />
                    </FormControl>
                    <FormDescription>Maximum score threshold</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Appearance */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                      </FormControl>
                      <Input 
                        placeholder="#3b82f6" 
                        value={field.value} 
                        onChange={(e) => field.onChange(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-1 mt-2">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border-2 border-transparent hover:border-foreground transition-colors"
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., star, trophy" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Lucide icon name (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Eligibility Toggles */}
            <div className="space-y-4">
              <Label>Eligibility Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="promotion_eligible"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Promotion Eligible</FormLabel>
                        <FormDescription>Employee can be considered for promotion</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="succession_eligible"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Succession Eligible</FormLabel>
                        <FormDescription>Can be added to succession plans</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bonus_eligible"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Bonus Eligible</FormLabel>
                        <FormDescription>Eligible for performance bonus</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requires_pip"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requires PIP</FormLabel>
                        <FormDescription>Triggers performance improvement plan</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>Category is available for use in appraisals</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingCategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
