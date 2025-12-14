import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { Plus, Receipt, DollarSign, Clock, CheckCircle, Send, Trash2 } from "lucide-react";

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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [claimItems, setClaimItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [claimForm, setClaimForm] = useState({ description: "" });
  const [itemForm, setItemForm] = useState({
    expense_date: format(new Date(), "yyyy-MM-dd"),
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

      toast({ title: "Success", description: "Expense claim created" });
      setDialogOpen(false);
      setClaimForm({ description: "" });
      loadClaims();
      setSelectedClaim(data as ExpenseClaim);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create claim", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedClaim || !itemForm.category || !itemForm.amount) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("expense_claim_items").insert({
        claim_id: selectedClaim.id,
        expense_date: itemForm.expense_date,
        category: itemForm.category,
        description: itemForm.description || null,
        amount: parseFloat(itemForm.amount),
      });

      if (error) throw error;

      // Update total
      const newTotal = claimItems.reduce((sum, i) => sum + i.amount, 0) + parseFloat(itemForm.amount);
      await supabase.from("expense_claims").update({ total_amount: newTotal }).eq("id", selectedClaim.id);

      toast({ title: "Success", description: "Expense item added" });
      setItemDialogOpen(false);
      setItemForm({ expense_date: format(new Date(), "yyyy-MM-dd"), category: "", description: "", amount: "" });
      loadClaimItems(selectedClaim.id);
      loadClaims();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
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

      toast({ title: "Success", description: "Item removed" });
      loadClaimItems(selectedClaim.id);
      loadClaims();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedClaim || claimItems.length === 0) {
      toast({ title: "Error", description: "Add at least one expense item", variant: "destructive" });
      return;
    }

    try {
      await supabase
        .from("expense_claims")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", selectedClaim.id);

      toast({ title: "Success", description: "Claim submitted for approval" });
      setSelectedClaim(null);
      loadClaims();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit claim", variant: "destructive" });
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
    };
    return <Badge className={colors[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const totalPending = claims.filter(c => c.status === "submitted" || c.status === "pending_approval").reduce((s, c) => s + c.total_amount, 0);
  const totalApproved = claims.filter(c => c.status === "approved" || c.status === "paid").reduce((s, c) => s + c.total_amount, 0);

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "My Expense Claims" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Expense Claims</h1>
            <p className="text-muted-foreground">Submit and track expense reimbursements</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Claims</CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved/Paid</CardTitle>
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
              <CardTitle>My Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : claims.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No expense claims yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell>{format(new Date(claim.claim_date), "MMM d, yyyy")}</TableCell>
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
                  <CardTitle>Claim {selectedClaim.claim_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: ${selectedClaim.total_amount.toFixed(2)} • {getStatusBadge(selectedClaim.status)}
                  </p>
                </div>
                {selectedClaim.status === "draft" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setItemDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                    <Button size="sm" onClick={handleSubmitClaim}>
                      <Send className="h-4 w-4 mr-1" /> Submit
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {claimItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No items yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        {selectedClaim.status === "draft" && <TableHead></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.expense_date), "MMM d")}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>${item.amount.toFixed(2)}</TableCell>
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
              <DialogTitle>New Expense Claim</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ description: e.target.value })}
                  placeholder="Trip to client site, conference expenses, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateClaim} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Claim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={itemForm.expense_date}
                  onChange={(e) => setItemForm({ ...itemForm, expense_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={itemForm.category} onValueChange={(v) => setItemForm({ ...itemForm, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
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
                <Label>Description</Label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Details about this expense"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddItem} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
