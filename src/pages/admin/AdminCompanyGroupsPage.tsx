import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageTourPrompt } from "@/components/tours/PageTourPrompt";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  Building,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Upload,
  Image,
} from "lucide-react";

interface CompanyGroup {
  id: string;
  name: string;
  code: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  divisions: Division[];
  company_count?: number;
}

interface Division {
  id: string;
  group_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  company_count?: number;
  companies?: Company[];
}

interface Company {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  division_id: string | null;
  group_id: string | null;
}

const groupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z.string().min(2, "Code must be at least 2 characters").max(20).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric"),
  description: z.string().max(500).optional().or(z.literal("")),
});

const divisionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z.string().min(2, "Code must be at least 2 characters").max(20).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric"),
  description: z.string().max(500).optional().or(z.literal("")),
});

type GroupFormData = z.infer<typeof groupSchema>;
type DivisionFormData = z.infer<typeof divisionSchema>;

const emptyGroupFormData: GroupFormData = { name: "", code: "", description: "" };
const emptyDivisionFormData: DivisionFormData = { name: "", code: "", description: "" };

export default function AdminCompanyGroupsPage() {
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  
  // Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CompanyGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState<GroupFormData>(emptyGroupFormData);
  const [groupErrors, setGroupErrors] = useState<Record<string, string>>({});
  const [groupLogoFile, setGroupLogoFile] = useState<File | null>(null);
  const [groupLogoPreview, setGroupLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const groupLogoInputRef = useRef<HTMLInputElement>(null);
  
  // Division Modal
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [divisionFormData, setDivisionFormData] = useState<DivisionFormData>(emptyDivisionFormData);
  const [divisionErrors, setDivisionErrors] = useState<Record<string, string>>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { toast } = useToast();
  const { logView } = useAuditLog();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Log view when groups are loaded
  useEffect(() => {
    if (groups.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('company_groups_list', undefined, 'Company Groups', { group_count: groups.length });
    }
  }, [groups]);

  const fetchGroups = async () => {
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from("company_groups")
        .select("*")
        .order("name");

      if (groupsError) throw groupsError;

      const { data: divisionsData, error: divisionsError } = await supabase
        .from("divisions")
        .select("*")
        .order("name");

      if (divisionsError) throw divisionsError;

      const { data: companiesData } = await supabase
        .from("companies")
        .select("id, name, code, is_active, group_id, division_id")
        .order("name");

      // Count and group companies per group and division
      const groupCounts: Record<string, number> = {};
      const divisionCounts: Record<string, number> = {};
      const divisionCompanies: Record<string, Company[]> = {};
      
      (companiesData || []).forEach((c) => {
        if (c.group_id) groupCounts[c.group_id] = (groupCounts[c.group_id] || 0) + 1;
        if (c.division_id) {
          divisionCounts[c.division_id] = (divisionCounts[c.division_id] || 0) + 1;
          if (!divisionCompanies[c.division_id]) divisionCompanies[c.division_id] = [];
          divisionCompanies[c.division_id].push(c);
        }
      });

      const divisionsWithCounts = (divisionsData || []).map((d) => ({
        ...d,
        company_count: divisionCounts[d.id] || 0,
        companies: divisionCompanies[d.id] || [],
      }));

      const groupsWithDivisions = (groupsData || []).map((g) => ({
        ...g,
        divisions: divisionsWithCounts.filter((d) => d.group_id === g.id),
        company_count: groupCounts[g.id] || 0,
      }));

      setGroups(groupsWithDivisions);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load company groups.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleDivisionExpand = (divisionId: string) => {
    const newExpanded = new Set(expandedDivisions);
    if (newExpanded.has(divisionId)) {
      newExpanded.delete(divisionId);
    } else {
      newExpanded.add(divisionId);
    }
    setExpandedDivisions(newExpanded);
  };

  // Group handlers
  const handleOpenGroupModal = (group?: CompanyGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData({ name: group.name, code: group.code, description: group.description || "" });
      setGroupLogoPreview(group.logo_url);
    } else {
      setEditingGroup(null);
      setGroupFormData(emptyGroupFormData);
      setGroupLogoPreview(null);
    }
    setGroupLogoFile(null);
    setGroupErrors({});
    setIsGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
    setGroupFormData(emptyGroupFormData);
    setGroupErrors({});
    setGroupLogoFile(null);
    setGroupLogoPreview(null);
  };

  const handleGroupLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Logo must be less than 5MB", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
        return;
      }
      setGroupLogoFile(file);
      setGroupLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadGroupLogo = async (groupId: string): Promise<string | null> => {
    if (!groupLogoFile) return groupLogoPreview;
    
    setIsUploadingLogo(true);
    try {
      const fileExt = groupLogoFile.name.split(".").pop();
      const filePath = `groups/${groupId}/logo.${fileExt}`;

      // Delete existing logo if any
      await supabase.storage.from("company-logos").remove([
        `groups/${groupId}/logo.png`, 
        `groups/${groupId}/logo.jpg`, 
        `groups/${groupId}/logo.jpeg`, 
        `groups/${groupId}/logo.webp`
      ]);

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(filePath, groupLogoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("company-logos").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({ title: "Upload failed", description: "Failed to upload group logo", variant: "destructive" });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeGroupLogo = () => {
    setGroupLogoFile(null);
    setGroupLogoPreview(null);
    if (groupLogoInputRef.current) groupLogoInputRef.current.value = "";
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = groupSchema.safeParse(groupFormData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setGroupErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        name: groupFormData.name,
        code: groupFormData.code.toUpperCase(),
        description: groupFormData.description || null,
      };

      let logoUrl: string | null = null;

      if (editingGroup) {
        // Upload logo first if provided
        if (groupLogoFile) {
          logoUrl = await uploadGroupLogo(editingGroup.id);
        } else if (groupLogoPreview === null && editingGroup.logo_url) {
          // Logo was removed
          logoUrl = null;
        } else {
          logoUrl = groupLogoPreview;
        }

        const { error } = await supabase.from("company_groups").update({ ...data, logo_url: logoUrl }).eq("id", editingGroup.id);
        if (error) throw error;
        toast({ title: "Group updated" });
      } else {
        const { data: newGroup, error } = await supabase.from("company_groups").insert(data).select().single();
        if (error) {
          if (error.code === "23505") {
            setGroupErrors({ code: "This code already exists" });
            setIsSaving(false);
            return;
          }
          throw error;
        }

        // Upload logo if provided
        if (groupLogoFile && newGroup) {
          logoUrl = await uploadGroupLogo(newGroup.id);
          if (logoUrl) {
            await supabase.from("company_groups").update({ logo_url: logoUrl }).eq("id", newGroup.id);
          }
        }

        toast({ title: "Group created" });
      }

      handleCloseGroupModal();
      fetchGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      toast({ title: "Error", description: "Failed to save group.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (group: CompanyGroup) => {
    if (group.divisions.length > 0) {
      toast({ title: "Cannot delete", description: "Remove all divisions first.", variant: "destructive" });
      return;
    }
    if (!confirm(`Delete ${group.name}?`)) return;

    try {
      const { error } = await supabase.from("company_groups").delete().eq("id", group.id);
      if (error) throw error;
      toast({ title: "Group deleted" });
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ title: "Error", description: "Failed to delete group.", variant: "destructive" });
    }
    setOpenDropdown(null);
  };

  const toggleGroupActive = async (group: CompanyGroup) => {
    try {
      const { error } = await supabase.from("company_groups").update({ is_active: !group.is_active }).eq("id", group.id);
      if (error) throw error;
      toast({ title: group.is_active ? "Group deactivated" : "Group activated" });
      fetchGroups();
    } catch (error) {
      console.error("Error toggling group status:", error);
      toast({ title: "Error", description: "Failed to update group.", variant: "destructive" });
    }
    setOpenDropdown(null);
  };

  // Division handlers
  const handleOpenDivisionModal = (groupId: string, division?: Division) => {
    setSelectedGroupId(groupId);
    if (division) {
      setEditingDivision(division);
      setDivisionFormData({ name: division.name, code: division.code, description: division.description || "" });
    } else {
      setEditingDivision(null);
      setDivisionFormData(emptyDivisionFormData);
    }
    setDivisionErrors({});
    setIsDivisionModalOpen(true);
  };

  const handleCloseDivisionModal = () => {
    setIsDivisionModalOpen(false);
    setEditingDivision(null);
    setSelectedGroupId(null);
    setDivisionFormData(emptyDivisionFormData);
    setDivisionErrors({});
  };

  const handleDivisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = divisionSchema.safeParse(divisionFormData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setDivisionErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        group_id: selectedGroupId!,
        name: divisionFormData.name,
        code: divisionFormData.code.toUpperCase(),
        description: divisionFormData.description || null,
      };

      if (editingDivision) {
        const { error } = await supabase.from("divisions").update(data).eq("id", editingDivision.id);
        if (error) throw error;
        toast({ title: "Division updated" });
      } else {
        const { error } = await supabase.from("divisions").insert(data);
        if (error) {
          if (error.code === "23505") {
            setDivisionErrors({ code: "This code already exists in this group" });
            setIsSaving(false);
            return;
          }
          throw error;
        }
        toast({ title: "Division created" });
      }

      handleCloseDivisionModal();
      fetchGroups();
    } catch (error) {
      console.error("Error saving division:", error);
      toast({ title: "Error", description: "Failed to save division.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDivision = async (division: Division) => {
    if (division.company_count && division.company_count > 0) {
      toast({ title: "Cannot delete", description: "Remove companies from this division first.", variant: "destructive" });
      return;
    }
    if (!confirm(`Delete ${division.name}?`)) return;

    try {
      const { error } = await supabase.from("divisions").delete().eq("id", division.id);
      if (error) throw error;
      toast({ title: "Division deleted" });
      fetchGroups();
    } catch (error) {
      console.error("Error deleting division:", error);
      toast({ title: "Error", description: "Failed to delete division.", variant: "destructive" });
    }
    setOpenDropdown(null);
  };

  const toggleDivisionActive = async (division: Division) => {
    try {
      const { error } = await supabase.from("divisions").update({ is_active: !division.is_active }).eq("id", division.id);
      if (error) throw error;
      toast({ title: division.is_active ? "Division deactivated" : "Division activated" });
      fetchGroups();
    } catch (error) {
      console.error("Error toggling division status:", error);
      toast({ title: "Error", description: "Failed to update division.", variant: "destructive" });
    }
    setOpenDropdown(null);
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.divisions.some(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const totalDivisions = groups.reduce((sum, g) => sum + g.divisions.length, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Workforce", href: "/workforce" },
          { label: "Company Groups" }
        ]} />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Company Groups</h1>
            <p className="mt-1 text-muted-foreground">Manage company groups and divisions</p>
          </div>
          <button
            onClick={() => handleOpenGroupModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Group
          </button>
        </div>

        {/* Tour Prompt */}
        <PageTourPrompt />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Groups</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{groups.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Divisions</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{totalDivisions}</p>
              </div>
              <div className="rounded-lg bg-info/10 p-3 text-info">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Groups</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{groups.filter((g) => g.is_active).length}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups and divisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Groups List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery ? "No groups found." : "No company groups yet. Add your first group."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group, index) => (
              <div
                key={group.id}
                className={cn(
                  "rounded-xl border bg-card shadow-card animate-slide-up",
                  !group.is_active && "opacity-60"
                )}
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(group.id)}
                      className="rounded p-1 hover:bg-muted"
                    >
                      {expandedGroups.has(group.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {group.code.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.code} • {group.divisions.length} divisions • {group.company_count} companies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDivisionModal(group.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Division
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === group.id ? null : group.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openDropdown === group.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                            <button
                              onClick={() => {
                                handleOpenGroupModal(group);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => toggleGroupActive(group)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                            >
                              {group.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divisions */}
                {expandedGroups.has(group.id) && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3">
                    {group.divisions.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">No divisions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {group.divisions.map((division) => (
                          <div key={division.id} className="space-y-2">
                            <div
                              className={cn(
                                "flex items-center justify-between rounded-lg border border-border bg-card p-3",
                                !division.is_active && "opacity-60"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {division.company_count && division.company_count > 0 ? (
                                  <button
                                    onClick={() => toggleDivisionExpand(division.id)}
                                    className="rounded p-0.5 hover:bg-muted"
                                  >
                                    {expandedDivisions.has(division.id) ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-5" />
                                )}
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-info/10 text-xs font-bold text-info">
                                  {division.code.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-medium text-card-foreground">{division.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {division.code} • {division.company_count} companies
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === division.id ? null : division.id)}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                {openDropdown === division.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                                    <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                                      <button
                                        onClick={() => {
                                          handleOpenDivisionModal(group.id, division);
                                          setOpenDropdown(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => toggleDivisionActive(division)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                                      >
                                        {division.is_active ? "Deactivate" : "Activate"}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDivision(division)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {/* Companies within Division */}
                            {expandedDivisions.has(division.id) && division.companies && division.companies.length > 0 && (
                              <div className="ml-8 space-y-1.5">
                                {division.companies.map((company) => (
                                  <div
                                    key={company.id}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-2.5",
                                      !company.is_active && "opacity-60"
                                    )}
                                  >
                                    <div className="flex h-7 w-7 items-center justify-center rounded bg-success/10 text-xs font-bold text-success">
                                      {company.code.slice(0, 2)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-card-foreground">{company.name}</p>
                                      <p className="text-xs text-muted-foreground">{company.code}</p>
                                    </div>
                                    {!company.is_active && (
                                      <span className="ml-auto text-xs text-muted-foreground">Inactive</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Group Modal */}
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {editingGroup ? "Edit Group" : "Add Group"}
                </h2>
                <button onClick={handleCloseGroupModal} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground",
                      groupErrors.name ? "border-destructive" : "border-input"
                    )}
                  />
                  {groupErrors.name && <p className="mt-1 text-xs text-destructive">{groupErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={groupFormData.code}
                    onChange={(e) => setGroupFormData({ ...groupFormData, code: e.target.value.toUpperCase() })}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground uppercase",
                      groupErrors.code ? "border-destructive" : "border-input"
                    )}
                  />
                  {groupErrors.code && <p className="mt-1 text-xs text-destructive">{groupErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={groupFormData.description}
                    onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground resize-none"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground">Group Logo</label>
                  <div className="flex items-center gap-4">
                    {groupLogoPreview ? (
                      <div className="relative">
                        <img 
                          src={groupLogoPreview} 
                          alt="Logo preview" 
                          className="h-16 w-16 rounded-lg object-cover border border-border"
                        />
                        <button
                          type="button"
                          onClick={removeGroupLogo}
                          className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                        <Image className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={groupLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleGroupLogoChange}
                        className="hidden"
                        id="group-logo-upload"
                      />
                      <label
                        htmlFor="group-logo-upload"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        {groupLogoPreview ? "Change" : "Upload"}
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG or WebP. Max 5MB. Recommended: 200×200px (square)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseGroupModal}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingGroup ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Division Modal */}
        {isDivisionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {editingDivision ? "Edit Division" : "Add Division"}
                </h2>
                <button onClick={handleCloseDivisionModal} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleDivisionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={divisionFormData.name}
                    onChange={(e) => setDivisionFormData({ ...divisionFormData, name: e.target.value })}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground",
                      divisionErrors.name ? "border-destructive" : "border-input"
                    )}
                  />
                  {divisionErrors.name && <p className="mt-1 text-xs text-destructive">{divisionErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={divisionFormData.code}
                    onChange={(e) => setDivisionFormData({ ...divisionFormData, code: e.target.value.toUpperCase() })}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground uppercase",
                      divisionErrors.code ? "border-destructive" : "border-input"
                    )}
                  />
                  {divisionErrors.code && <p className="mt-1 text-xs text-destructive">{divisionErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={divisionFormData.description}
                    onChange={(e) => setDivisionFormData({ ...divisionFormData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseDivisionModal}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingDivision ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}