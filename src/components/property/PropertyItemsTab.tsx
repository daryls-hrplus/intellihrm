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
import { Plus, Package, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  companyId?: string;
}

const CONDITIONS = ["excellent", "good", "fair", "poor"];
const STATUSES = ["available", "assigned", "maintenance", "retired", "lost"];

const PropertyItemsTab = ({ companyId }: Props) => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    company_id: companyId || "",
    category_id: "",
    asset_tag: "",
    name: "",
    description: "",
    serial_number: "",
    model: "",
    manufacturer: "",
    purchase_date: "",
    purchase_cost: "",
    currency: "USD",
    warranty_expiry: "",
    condition: "good",
    location: "",
    notes: "",
  });

  const { items, categories, loadingItems, createItem } = usePropertyManagement(companyId);

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

  const filteredItems = items.filter((item) => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createItem.mutateAsync({
      company_id: formData.company_id,
      category_id: formData.category_id,
      asset_tag: formData.asset_tag,
      name: formData.name,
      description: formData.description || null,
      serial_number: formData.serial_number || null,
      model: formData.model || null,
      manufacturer: formData.manufacturer || null,
      purchase_date: formData.purchase_date || null,
      purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : null,
      currency: formData.currency,
      warranty_expiry: formData.warranty_expiry || null,
      condition: formData.condition,
      location: formData.location || null,
      notes: formData.notes || null,
      status: "available",
      is_active: true,
    });
    setIsDialogOpen(false);
    setFormData({
      company_id: companyId || "",
      category_id: "",
      asset_tag: "",
      name: "",
      description: "",
      serial_number: "",
      model: "",
      manufacturer: "",
      purchase_date: "",
      purchase_cost: "",
      currency: "USD",
      warranty_expiry: "",
      condition: "good",
      location: "",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-success/10 text-success border-success/20";
      case "assigned": return "bg-info/10 text-info border-info/20";
      case "maintenance": return "bg-warning/10 text-warning border-warning/20";
      case "retired": return "bg-muted text-muted-foreground";
      case "lost": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-success/10 text-success";
      case "good": return "bg-info/10 text-info";
      case "fair": return "bg-warning/10 text-warning";
      case "poor": return "bg-destructive/10 text-destructive";
      default: return "";
    }
  };

  const getConditionLabel = (condition: string) => {
    return t(`companyProperty.assets.conditions.${condition}`) || condition;
  };

  const getStatusLabel = (status: string) => {
    return t(`companyProperty.assets.statuses.${status}`) || status;
  };

  if (loadingItems) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t("companyProperty.assets.title")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("companyProperty.assets.searchAssets")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("common.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatus")}</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("companyProperty.assets.addAsset")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("companyProperty.assets.addAssetTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.company")} *</Label>
                    <Select value={formData.company_id} onValueChange={(v) => setFormData({ ...formData, company_id: v })} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectCompany")} />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.category")} *</Label>
                    <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.assetTag")} *</Label>
                    <Input
                      value={formData.asset_tag}
                      onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.name")} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.serialNumberFull")}</Label>
                    <Input
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.model")}</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.manufacturer")}</Label>
                    <Input
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.purchaseDate")}</Label>
                    <Input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.purchaseCost")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchase_cost}
                      onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.warrantyExpiry")}</Label>
                    <Input
                      type="date"
                      value={formData.warranty_expiry}
                      onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.condition")}</Label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>{getConditionLabel(c)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("companyProperty.assets.location")}</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  <Label>{t("common.notes")}</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createItem.isPending}>
                    {createItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("common.create")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("companyProperty.assets.noAssets")}</p>
            <p className="text-sm">{t("companyProperty.assets.noAssetsHint")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("companyProperty.assets.assetTag")}</TableHead>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.category")}</TableHead>
                  <TableHead>{t("companyProperty.assets.serialNumber")}</TableHead>
                  <TableHead>{t("companyProperty.assets.condition")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("companyProperty.assets.location")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{item.asset_tag}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.model && (
                          <p className="text-xs text-muted-foreground">{item.manufacturer} {item.model}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category?.name || "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{item.serial_number || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getConditionColor(item.condition)}>
                        {getConditionLabel(item.condition)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.location || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyItemsTab;
