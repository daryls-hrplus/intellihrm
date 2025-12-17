import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, Receipt, DollarSign, Clock, CheckCircle, Send, Trash2, Upload, FileText, ExternalLink, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExpenseClaim {
  id: string;
  claim_number: string;
  claim_date: string;
  total_amount: number;
  currency: string;
  status: string;
  description: string | null;
}

interface ExpenseItem {
  id: string;
  expense_date: string;
  category: string;
  description: string | null;
  amount: number;
  receipt_url: string | null;
}

const EXPENSE_CATEGORIES = [
  "Travel",
  "Meals",
  "Accommodation",
  "Transportation",
  "Office Supplies",
  "Software",
  "Training",
  "Entertainment",
  "Other",
];

export default function MyExpenseClaimsPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [claimItems, setClaimItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  
  const [claimForm, setClaimForm] = useState({ description: "" });
  const [itemForm, setItemForm] = useState({
    expense_date: getTodayString(),
    category: "",
    description: "",
    amount: "",
  });

  useEffect(() => {
    if (user) loadClaims();
  }, [user]);

  useEffect(() => {
    if (selectedClaim) loadClaimItems(selectedClaim.id);
  }, [selectedClaim]);

  const loadClaims = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data } = await supabase
        .from("expense_claims")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      setClaims((data || []) as ExpenseClaim[]);
    } catch (error) {
      console.error("Error loading claims:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClaimItems = async (claimId: string) => {
    const { data } = await supabase
      .from("expense_claim_items")
      .select("*")
      .eq("claim_id", claimId)
      .order("expense_date", { ascending: false });

    setClaimItems((data || []) as ExpenseItem[]);
  };

  const handleCreateClaim = async () => {
    if (!user || !profile?.company_id) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("expense_claims")
        .insert({
          employee_id: user.id,
          company_id: profile.company_id,
          description: claimForm.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: t('ess.myExpenseClaims.toast.success'), description: t('ess.myExpenseClaims.toast.claimCreated') });
      setDialogOpen(false);
      setClaimForm({ description: "" });
      loadClaims();
      setSelectedClaim(data as ExpenseClaim);
    } catch (error) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.createFailed'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.invalidFileType'), variant: "destructive" });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.fileTooLarge'), variant: "destructive" });
      return;
    }
    
    setSelectedFile(file);
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;
    
    setUploadingFile(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedClaim || !itemForm.category || !itemForm.amount) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.fillRequired'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      // Upload receipt if selected
      let uploadedReceiptUrl: string | null = null;
      if (selectedFile) {
        uploadedReceiptUrl = await uploadReceipt();
      }

      const { error } = await supabase.from("expense_claim_items").insert({
        claim_id: selectedClaim.id,
        expense_date: itemForm.expense_date,
        category: itemForm.category,
        description: itemForm.description || null,
        amount: parseFloat(itemForm.amount),
        receipt_url: uploadedReceiptUrl,
      });

      if (error) throw error;

      const newTotal = claimItems.reduce((sum, i) => sum + i.amount, 0) + parseFloat(itemForm.amount);
      await supabase.from("expense_claims").update({ total_amount: newTotal }).eq("id", selectedClaim.id);

      toast({ title: t('ess.myExpenseClaims.toast.success'), description: t('ess.myExpenseClaims.toast.itemAdded') });
      setItemDialogOpen(false);
      setItemForm({ expense_date: getTodayString(), category: "", description: "", amount: "" });
      setSelectedFile(null);
      setReceiptUrl("");
      loadClaimItems(selectedClaim.id);
      loadClaims();
    } catch (error) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.addFailed'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string, amount: number) => {
    if (!selectedClaim) return;

    try {
      await supabase.from("expense_claim_items").delete().eq("id", itemId);
      const newTotal = Math.max(0, selectedClaim.total_amount - amount);
      await supabase.from("expense_claims").update({ total_amount: newTotal }).eq("id", selectedClaim.id);

      toast({ title: t('ess.myExpenseClaims.toast.success'), description: t('ess.myExpenseClaims.toast.itemRemoved') });
      loadClaimItems(selectedClaim.id);
      loadClaims();
    } catch (error) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.deleteFailed'), variant: "destructive" });
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedClaim || claimItems.length === 0) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.addItem'), variant: "destructive" });
      return;
    }

    try {
      await supabase
        .from("expense_claims")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", selectedClaim.id);

      toast({ title: t('ess.myExpenseClaims.toast.success'), description: t('ess.myExpenseClaims.toast.submitted') });
      setSelectedClaim(null);
      loadClaims();
    } catch (error) {
      toast({ title: t('ess.myExpenseClaims.toast.error'), description: t('ess.myExpenseClaims.toast.submitFailed'), variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      submitted: "bg-yellow-500/20 text-yellow-700",
      pending_approval: "bg-blue-500/20 text-blue-700",
      approved: "bg-green-500/20 text-green-700",
      rejected: "bg-red-500/20 text-red-700",
      paid: "bg-emerald-500/20 text-emerald-700",
      pending_payment: "bg-blue-500/20 text-blue-700",
    };
    const statusKey = status as keyof typeof colors;
    return <Badge className={colors[statusKey] || "bg-muted"}>{t(`ess.myExpenseClaims.statuses.${status}`, status.replace("_", " "))}</Badge>;
  };

  const totalPending = claims.filter(c => c.status === "submitted" || c.status === "pending_approval").reduce((s, c) => s + c.total_amount, 0);
  const totalApproved = claims.filter(c => c.status === "approved" || c.status === "paid").reduce((s, c) => s + c.total_amount, 0);

  const breadcrumbItems = [
    { label: t('navigation.ess'), href: "/ess" },
    { label: t('ess.myExpenseClaims.breadcrumb') },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('ess.myExpenseClaims.title')}</h1>
            <p className="text-muted-foreground">{t('ess.myExpenseClaims.subtitle')}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('ess.myExpenseClaims.newClaim')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('ess.myExpenseClaims.totalClaims')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{claims.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('ess.myExpenseClaims.pendingAmount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">${totalPending.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('ess.myExpenseClaims.approvedPaid')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">${totalApproved.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('ess.myExpenseClaims.myClaims')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('ess.myExpenseClaims.loading')}</div>
              ) : claims.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('ess.myExpenseClaims.noClaimsYet')}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('ess.myExpenseClaims.claimNumber')}</TableHead>
                      <TableHead>{t('ess.myExpenseClaims.date')}</TableHead>
                      <TableHead>{t('ess.myExpenseClaims.amount')}</TableHead>
                      <TableHead>{t('ess.myExpenseClaims.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow
                        key={claim.id}
                        className={`cursor-pointer ${selectedClaim?.id === claim.id ? "bg-muted" : ""}`}
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <TableCell className="font-medium">{claim.claim_number}</TableCell>
                        <TableCell>{formatDateForDisplay(claim.claim_date, "MMM d, yyyy")}</TableCell>
                        <TableCell>${claim.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {selectedClaim && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('ess.myExpenseClaims.claim')} {selectedClaim.claim_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('ess.myExpenseClaims.total')}: ${selectedClaim.total_amount.toFixed(2)} • {getStatusBadge(selectedClaim.status)}
                  </p>
                </div>
                {selectedClaim.status === "draft" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setItemDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> {t('ess.myExpenseClaims.addItem')}
                    </Button>
                    <Button size="sm" onClick={handleSubmitClaim}>
                      <Send className="h-4 w-4 mr-1" /> {t('ess.myExpenseClaims.submit')}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {claimItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">{t('ess.myExpenseClaims.noItemsYet')}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('ess.myExpenseClaims.date')}</TableHead>
                        <TableHead>{t('ess.myExpenseClaims.category')}</TableHead>
                        <TableHead>{t('ess.myExpenseClaims.amount')}</TableHead>
                        <TableHead>{t('ess.myExpenseClaims.receipt')}</TableHead>
                        {selectedClaim.status === "draft" && <TableHead></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDateForDisplay(item.expense_date, "MMM d")}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>${item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {item.receipt_url ? (
                              <a
                                href={item.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          {selectedClaim.status === "draft" && (
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id, item.amount)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ess.myExpenseClaims.newClaimDialog.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('ess.myExpenseClaims.newClaimDialog.description')}</Label>
                <Textarea
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ description: e.target.value })}
                  placeholder={t('ess.myExpenseClaims.newClaimDialog.descriptionPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('ess.myExpenseClaims.newClaimDialog.cancel')}</Button>
              <Button onClick={handleCreateClaim} disabled={isSubmitting}>
                {isSubmitting ? t('ess.myExpenseClaims.newClaimDialog.creating') : t('ess.myExpenseClaims.newClaimDialog.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ess.myExpenseClaims.addItemDialog.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('ess.myExpenseClaims.addItemDialog.date')}</Label>
                <Input
                  type="date"
                  value={itemForm.expense_date}
                  onChange={(e) => setItemForm({ ...itemForm, expense_date: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('ess.myExpenseClaims.addItemDialog.category')}</Label>
                <Select value={itemForm.category} onValueChange={(v) => setItemForm({ ...itemForm, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ess.myExpenseClaims.addItemDialog.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('ess.myExpenseClaims.addItemDialog.amount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.amount}
                  onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>{t('ess.myExpenseClaims.addItemDialog.description')}</Label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder={t('ess.myExpenseClaims.addItemDialog.descriptionPlaceholder')}
                />
              </div>
              <div>
                <Label>{t('ess.myExpenseClaims.addItemDialog.receipt')}</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('ess.myExpenseClaims.addItemDialog.uploadReceipt')}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('ess.myExpenseClaims.addItemDialog.fileHint')}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>{t('ess.myExpenseClaims.addItemDialog.cancel')}</Button>
              <Button onClick={handleAddItem} disabled={isSubmitting}>
                {isSubmitting ? t('ess.myExpenseClaims.addItemDialog.adding') : t('ess.myExpenseClaims.addItemDialog.add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
