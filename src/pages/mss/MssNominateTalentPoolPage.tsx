import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, Plus, Search, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTabState } from "@/hooks/useTabState";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  position_title?: string;
  department_name?: string;
  is_nominated: boolean;
  nomination_status?: string;
}

interface TalentPool {
  id: string;
  name: string;
  description?: string;
}

export default function MssNominateTalentPoolPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [talentPools, setTalentPools] = useState<TalentPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [tabState, setTabState] = useTabState({
    defaultState: { searchTerm: "", selectedPool: "all" },
    syncToUrl: ["selectedPool"],
  });

  const [nominationForm, setNominationForm] = useState({
    talent_pool_id: "",
    justification: "",
    recommended_development: "",
  });

  const breadcrumbItems = [
    { label: t("mss.title"), href: "/mss" },
    { label: t("mss.succession.talentNomination", "Talent Pool Nomination") },
  ];

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    setLoading(true);
    
    // Load team members (direct reports)
    const { data: reports } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        position:positions(title),
        department:departments(name)
      `)
      .eq('manager_id', profile?.id)
      .eq('is_active', true);

    // Load talent pools
    const { data: pools } = await supabase
      .from('talent_pools')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name');

    // Check existing nominations
    const memberIds = reports?.map((r: any) => r.id) || [];
    const { data: nominations } = await (supabase
      .from('talent_pool_members') as any)
      .select('employee_id, status')
      .in('employee_id', memberIds);

    const nominationMap = new Map(nominations?.map(n => [n.employee_id, n.status]));

    const members: TeamMember[] = (reports || []).map((r: any) => ({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      avatar_url: r.avatar_url,
      position_title: r.position?.title,
      department_name: r.department?.name,
      is_nominated: nominationMap.has(r.id),
      nomination_status: nominationMap.get(r.id),
    }));

    setTeamMembers(members);
    setTalentPools(pools || []);
    setLoading(false);
  };

  const handleNominate = (member: TeamMember) => {
    setSelectedMember(member);
    setNominationForm({
      talent_pool_id: "",
      justification: "",
      recommended_development: "",
    });
    setDialogOpen(true);
  };

  const handleSubmitNomination = async () => {
    if (!selectedMember || !nominationForm.talent_pool_id) {
      toast.error("Please select a talent pool");
      return;
    }

    setSubmitting(true);
    
    const { error } = await (supabase
      .from('talent_pool_members') as any)
      .insert({
        pool_id: nominationForm.talent_pool_id,
        employee_id: selectedMember.id,
        added_by: profile?.id,
        status: 'nominated',
        reason: nominationForm.justification,
      });

    if (error) {
      toast.error("Failed to submit nomination");
    } else {
      toast.success(`${selectedMember.full_name} nominated to talent pool`);
      setDialogOpen(false);
      await loadData();
    }
    setSubmitting(false);
  };

  const filteredMembers = teamMembers.filter(m => {
    if (tabState.searchTerm) {
      const search = tabState.searchTerm.toLowerCase();
      if (!m.full_name.toLowerCase().includes(search) && 
          !m.email.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (tabState.selectedPool === "nominated") {
      return m.is_nominated;
    }
    if (tabState.selectedPool === "not_nominated") {
      return !m.is_nominated;
    }
    return true;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'nominated':
        return <Badge className="bg-amber-500/20 text-amber-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("mss.succession.talentNomination", "Talent Pool Nomination")}
            </h1>
            <p className="text-muted-foreground">
              {t("mss.succession.nominateDescription", "Nominate high-potential team members to talent pools")}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <div className="text-xs text-muted-foreground">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {teamMembers.filter(m => m.is_nominated).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Nominated</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {teamMembers.filter(m => m.nomination_status === 'approved').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Team</CardTitle>
            <CardDescription>Select team members to nominate to talent pools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={tabState.searchTerm}
                  onChange={(e) => setTabState({ searchTerm: e.target.value })}
                  className="pl-9"
                />
              </div>
              <Select 
                value={tabState.selectedPool} 
                onValueChange={(v) => setTabState({ selectedPool: v })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  <SelectItem value="nominated">Nominated</SelectItem>
                  <SelectItem value="not_nominated">Not Nominated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>
                              {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.full_name}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.position_title || '—'}</TableCell>
                      <TableCell>{member.department_name || '—'}</TableCell>
                      <TableCell>
                        {member.is_nominated ? getStatusBadge(member.nomination_status) : (
                          <span className="text-muted-foreground text-sm">Not nominated</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!member.is_nominated && (
                          <Button
                            size="sm"
                            onClick={() => handleNominate(member)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Nominate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nomination Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nominate to Talent Pool</DialogTitle>
            <DialogDescription>
              Nominate {selectedMember?.full_name} for consideration in a talent pool
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Talent Pool *</Label>
              <Select
                value={nominationForm.talent_pool_id}
                onValueChange={(v) => setNominationForm({ ...nominationForm, talent_pool_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select talent pool" />
                </SelectTrigger>
                <SelectContent>
                  {talentPools.map((pool) => (
                    <SelectItem key={pool.id} value={pool.id}>
                      {pool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Justification *</Label>
              <Textarea
                value={nominationForm.justification}
                onChange={(e) => setNominationForm({ ...nominationForm, justification: e.target.value })}
                placeholder="Why should this employee be considered for this talent pool?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Recommended Development</Label>
              <Textarea
                value={nominationForm.recommended_development}
                onChange={(e) => setNominationForm({ ...nominationForm, recommended_development: e.target.value })}
                placeholder="What development activities would help prepare them?"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNomination}
              disabled={submitting || !nominationForm.talent_pool_id || !nominationForm.justification}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Nomination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
