import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useShiftBidding } from "@/hooks/useShiftBidding";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { Gavel, Plus, Play, Check, X, Users, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShiftBiddingTabProps {
  companyId: string;
}

export function ShiftBiddingTab({ companyId }: ShiftBiddingTabProps) {
  const { biddingPeriods, isLoading, createBiddingPeriod, updateBiddingPeriodStatus, submitBid, withdrawBid, allocateBids } = useShiftBidding(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [shifts, setShifts] = useState<{ id: string; name: string; code: string; start_time: string; end_time: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schedule_start_date: getTodayString(),
    schedule_end_date: "",
    bidding_opens_at: "",
    bidding_closes_at: "",
    allocation_method: "seniority",
    department_id: "",
  });

  const [bidData, setBidData] = useState({
    shift_id: "",
    preference_rank: 1,
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [shiftRes, deptRes] = await Promise.all([
        supabase.from("shifts").select("id, name, code, start_time, end_time").eq("company_id", companyId).eq("is_active", true),
        supabase.from("departments").select("id, name").eq("company_id", companyId),
      ]);
      setShifts(shiftRes.data || []);
      setDepartments(deptRes.data || []);
    };
    loadData();
  }, [companyId]);

  const handleCreatePeriod = async () => {
    await createBiddingPeriod({
      name: formData.name,
      description: formData.description || undefined,
      schedule_start_date: formData.schedule_start_date,
      schedule_end_date: formData.schedule_end_date,
      bidding_opens_at: formData.bidding_opens_at,
      bidding_closes_at: formData.bidding_closes_at,
      allocation_method: formData.allocation_method,
      department_id: formData.department_id || undefined,
    });
    setDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      schedule_start_date: getTodayString(),
      schedule_end_date: "",
      bidding_opens_at: "",
      bidding_closes_at: "",
      allocation_method: "seniority",
      department_id: "",
    });
  };

  const handleSubmitBid = async () => {
    if (!selectedPeriod) return;
    await submitBid({
      bidding_period_id: selectedPeriod,
      shift_id: bidData.shift_id,
      preference_rank: bidData.preference_rank,
      notes: bidData.notes || undefined,
    });
    setBidDialogOpen(false);
    setBidData({ shift_id: "", preference_rank: 1, notes: "" });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      open: "default",
      closed: "outline",
      allocating: "secondary",
      finalized: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getBidStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "secondary",
      allocated: "default",
      not_allocated: "outline",
      withdrawn: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const currentPeriod = biddingPeriods.find(p => p.id === selectedPeriod);
  const activePeriods = biddingPeriods.filter(p => p.status === "open");
  const otherPeriods = biddingPeriods.filter(p => p.status !== "open");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Shift Bidding
          </h3>
          <p className="text-sm text-muted-foreground">Seniority-based shift preference selection</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Bidding Period
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Bidding Period</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Period Name</Label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Q1 2025 Shift Bidding" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Schedule Start</Label>
                  <Input type="date" value={formData.schedule_start_date} onChange={e => setFormData(p => ({ ...p, schedule_start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Schedule End</Label>
                  <Input type="date" value={formData.schedule_end_date} onChange={e => setFormData(p => ({ ...p, schedule_end_date: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bidding Opens</Label>
                  <Input type="datetime-local" value={formData.bidding_opens_at} onChange={e => setFormData(p => ({ ...p, bidding_opens_at: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bidding Closes</Label>
                  <Input type="datetime-local" value={formData.bidding_closes_at} onChange={e => setFormData(p => ({ ...p, bidding_closes_at: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allocation Method</Label>
                  <Select value={formData.allocation_method} onValueChange={v => setFormData(p => ({ ...p, allocation_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seniority">By Seniority</SelectItem>
                      <SelectItem value="rotation">Rotation</SelectItem>
                      <SelectItem value="lottery">Lottery</SelectItem>
                      <SelectItem value="first_come">First Come First Serve</SelectItem>
                      <SelectItem value="manager_discretion">Manager Discretion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={formData.department_id} onValueChange={v => setFormData(p => ({ ...p, department_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All departments</SelectItem>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePeriod} disabled={!formData.name || !formData.schedule_end_date}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Bidding Periods */}
      {activePeriods.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Active Bidding</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {activePeriods.map(period => (
              <Card key={period.id} className="border-primary/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{period.name}</CardTitle>
                      <CardDescription>
                        {formatDateForDisplay(period.schedule_start_date)} - {formatDateForDisplay(period.schedule_end_date)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(period.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{period.bids?.length || 0} bids</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Closes: {new Date(period.bidding_closes_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={bidDialogOpen && selectedPeriod === period.id} onOpenChange={(open) => {
                      setBidDialogOpen(open);
                      if (open) setSelectedPeriod(period.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1">
                          <Gavel className="h-4 w-4 mr-1" />
                          Submit Bid
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Your Bid</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Preferred Shift</Label>
                            <Select value={bidData.shift_id} onValueChange={v => setBidData(p => ({ ...p, shift_id: v }))}>
                              <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                              <SelectContent>
                                {shifts.map(s => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name} ({s.start_time} - {s.end_time})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Preference Rank</Label>
                            <Input type="number" min={1} max={10} value={bidData.preference_rank} onChange={e => setBidData(p => ({ ...p, preference_rank: parseInt(e.target.value) || 1 }))} />
                            <p className="text-xs text-muted-foreground">1 = Most preferred</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Textarea value={bidData.notes} onChange={e => setBidData(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requests..." />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmitBid} disabled={!bidData.shift_id}>Submit Bid</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPeriod(period.id)}>
                      View Bids
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Periods List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Bidding Periods</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : biddingPeriods.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No bidding periods created</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {biddingPeriods.map(period => (
                  <TableRow key={period.id} className={selectedPeriod === period.id ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateForDisplay(period.schedule_start_date)} - {formatDateForDisplay(period.schedule_end_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{period.allocation_method}</Badge>
                    </TableCell>
                    <TableCell>{period.bids?.length || 0}</TableCell>
                    <TableCell>{getStatusBadge(period.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {period.status === "draft" && (
                          <Button size="sm" variant="ghost" onClick={() => updateBiddingPeriodStatus(period.id, "open")}>
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {period.status === "open" && (
                          <Button size="sm" variant="ghost" onClick={() => updateBiddingPeriodStatus(period.id, "closed")}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {period.status === "closed" && (
                          <Button size="sm" variant="outline" onClick={() => allocateBids(period.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Allocate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bids for Selected Period */}
      {currentPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bids for {currentPeriod.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {!currentPeriod.bids || currentPeriod.bids.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No bids submitted yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Preference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPeriod.bids.map(bid => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium">{bid.employee?.full_name}</TableCell>
                      <TableCell>{bid.shift?.name}</TableCell>
                      <TableCell>#{bid.preference_rank}</TableCell>
                      <TableCell>{getBidStatusBadge(bid.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
