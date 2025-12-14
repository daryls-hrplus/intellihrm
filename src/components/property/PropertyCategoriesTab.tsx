import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Tags, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  companyId?: string;
}

const PropertyCategoriesTab = ({ companyId }: Props) => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_id: companyId || "__global__",
    name: "",
    code: "",
    description: "",
    depreciation_years: "",
  });

  const { categories, loadingCategories, createCategory } = usePropertyManagement(companyId);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory.mutateAsync({
      company_id: formData.company_id === "__global__" ? null : formData.company_id || null,
      name: formData.name,
      code: formData.code,
      description: formData.description || null,
      depreciation_years: formData.depreciation_years ? parseInt(formData.depreciation_years) : null,
      is_active: true,
    });
    setIsDialogOpen(false);
    setFormData({ company_id: companyId || "__global__", name: "", code: "", description: "", depreciation_years: "" });
  };

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          {t("companyProperty.categories.title")}
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("companyProperty.categories.addCategory")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("companyProperty.categories.addCategoryTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("companyProperty.categories.company")}</Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData({ ...formData, company_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("companyProperty.categories.selectCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__global__">{t("companyProperty.categories.globalAllCompanies")}</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.name")} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.code")} *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("companyProperty.categories.depreciationYears")}</Label>
                <Input
                  type="number"
                  value={formData.depreciation_years}
                  onChange={(e) => setFormData({ ...formData, depreciation_years: e.target.value })}
                  min="1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createCategory.isPending}>
                  {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("common.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("companyProperty.categories.noCategories")}</p>
            <p className="text-sm">{t("companyProperty.categories.noCategoriesHint")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.code")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.description")}</TableHead>
                <TableHead>{t("companyProperty.categories.depreciation")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.createdAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono">{category.code}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>
                    {category.depreciation_years ? `${category.depreciation_years} ${t("companyProperty.categories.years")}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(category.created_at), "PP")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCategoriesTab;
