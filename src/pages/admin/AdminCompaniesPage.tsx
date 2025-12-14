import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
  X,
  Check,
  Upload,
  Image,
  Building,
} from "lucide-react";
import { CompanyBranchLocations } from "@/components/admin/CompanyBranchLocations";

interface Company {
  id: string;
  name: string;
  code: string;
  industry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  group_id: string | null;
  division_id: string | null;
  employee_count?: number;
  group_name?: string;
  division_name?: string;
}

interface CompanyGroup {
  id: string;
  name: string;
  code: string;
}

interface Division {
  id: string;
  group_id: string;
  name: string;
  code: string;
}

const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z.string().min(2, "Code must be at least 2 characters").max(20).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric"),
  industry: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  group_id: z.string().optional().or(z.literal("")),
  division_id: z.string().optional().or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companySchema>;

const emptyFormData: CompanyFormData = {
  name: "",
  code: "",
  industry: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  phone: "",
  email: "",
  website: "",
  group_id: "",
  division_id: "",
};

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Construction",
  "Transportation",
  "Energy",
  "Real Estate",
  "Other",
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(emptyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [branchDialogCompany, setBranchDialogCompany] = useState<Company | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { logView } = useAuditLog();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchCompanies();
    fetchGroupsAndDivisions();
  }, []);

  // Log view when companies are loaded
  useEffect(() => {
    if (companies.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('companies_list', undefined, 'Companies', { company_count: companies.length });
    }
  }, [companies]);

  const fetchGroupsAndDivisions = async () => {
    try {
      const [groupsRes, divisionsRes] = await Promise.all([
        supabase.from("company_groups").select("id, name, code").eq("is_active", true).order("name"),
        supabase.from("divisions").select("id, group_id, name, code").eq("is_active", true).order("name"),
      ]);
      if (groupsRes.data) setGroups(groupsRes.data);
      if (divisionsRes.data) setDivisions(divisionsRes.data);
    } catch (error) {
      console.error("Error fetching groups/divisions:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (companiesError) throw companiesError;

      // Get employee counts
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("company_id");

      // Get groups and divisions for names
      const { data: groupsData } = await supabase.from("company_groups").select("id, name");
      const { data: divisionsData } = await supabase.from("divisions").select("id, name");

      const groupMap = Object.fromEntries((groupsData || []).map((g) => [g.id, g.name]));
      const divisionMap = Object.fromEntries((divisionsData || []).map((d) => [d.id, d.name]));

      const employeeCounts: Record<string, number> = {};
      (profilesData || []).forEach((p) => {
        if (p.company_id) {
          employeeCounts[p.company_id] = (employeeCounts[p.company_id] || 0) + 1;
        }
      });

      const companiesWithCounts = (companiesData || []).map((c) => ({
        ...c,
        employee_count: employeeCounts[c.id] || 0,
        group_name: c.group_id ? groupMap[c.group_id] : undefined,
        division_name: c.division_id ? divisionMap[c.division_id] : undefined,
      }));

      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        code: company.code,
        industry: company.industry || "",
        address: company.address || "",
        city: company.city || "",
        state: company.state || "",
        country: company.country || "",
        postal_code: company.postal_code || "",
        phone: company.phone || "",
        email: company.email || "",
        website: company.website || "",
        group_id: company.group_id || "",
        division_id: company.division_id || "",
      });
      setLogoPreview(company.logo_url);
    } else {
      setEditingCompany(null);
      setFormData(emptyFormData);
      setLogoPreview(null);
    }
    setLogoFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setFormData(emptyFormData);
    setErrors({});
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async (companyId: string): Promise<string | null> => {
    if (!logoFile) return logoPreview;
    
    setIsUploadingLogo(true);
    try {
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `${companyId}/logo.${fileExt}`;

      // Delete existing logo if any
      await supabase.storage.from("company-logos").remove([`${companyId}/logo.png`, `${companyId}/logo.jpg`, `${companyId}/logo.jpeg`, `${companyId}/logo.webp`]);

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("company-logos").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload company logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = companySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);

    try {
      let logoUrl: string | null = null;

      if (editingCompany) {
        // Upload logo if there's a new file
        logoUrl = await uploadLogo(editingCompany.id);
        
        const companyData = {
          name: formData.name,
          code: formData.code.toUpperCase(),
          industry: formData.industry || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          postal_code: formData.postal_code || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          group_id: formData.group_id || null,
          division_id: formData.division_id || null,
          logo_url: logoUrl,
        };

        const { error } = await supabase
          .from("companies")
          .update(companyData)
          .eq("id", editingCompany.id);

        if (error) throw error;

        toast({ title: "Company updated", description: "Company details have been updated." });
      } else {
        // First create the company to get the ID
        const companyData = {
          name: formData.name,
          code: formData.code.toUpperCase(),
          industry: formData.industry || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          postal_code: formData.postal_code || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          group_id: formData.group_id || null,
          division_id: formData.division_id || null,
        };

        const { data: newCompany, error } = await supabase
          .from("companies")
          .insert(companyData)
          .select("id")
          .single();

        if (error) {
          if (error.code === "23505") {
            setErrors({ code: "This company code already exists" });
            setIsSaving(false);
            return;
          }
          throw error;
        }

        // Upload logo if provided
        if (logoFile && newCompany) {
          logoUrl = await uploadLogo(newCompany.id);
          if (logoUrl) {
            await supabase
              .from("companies")
              .update({ logo_url: logoUrl })
              .eq("id", newCompany.id);
          }
        }

        toast({ title: "Company created", description: "New company has been added." });
      }

      handleCloseModal();
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Error",
        description: "Failed to save company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (company: Company) => {
    if (company.employee_count && company.employee_count > 0) {
      toast({
        title: "Cannot delete",
        description: "This company has employees assigned. Remove employees first.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${company.name}?`)) return;

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", company.id);

      if (error) throw error;

      toast({ title: "Company deleted", description: "Company has been removed." });
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: "Failed to delete company.",
        variant: "destructive",
      });
    }
    setOpenDropdown(null);
  };

  const toggleActive = async (company: Company) => {
    try {
      const { error } = await supabase
        .from("companies")
        .update({ is_active: !company.is_active })
        .eq("id", company.id);

      if (error) throw error;

      toast({
        title: company.is_active ? "Company deactivated" : "Company activated",
      });
      fetchCompanies();
    } catch (error) {
      console.error("Error toggling company status:", error);
      toast({
        title: "Error",
        description: "Failed to update company status.",
        variant: "destructive",
      });
    }
    setOpenDropdown(null);
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Workforce", href: "/workforce" },
          { label: "Companies" }
        ]} />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Companies
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage organizations in the system
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{companies.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">
                  {companies.filter((c) => c.is_active).length}
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <Check className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">
                  {companies.reduce((sum, c) => sum + (c.employee_count || 0), 0)}
                </p>
              </div>
              <div className="rounded-lg bg-info/10 p-3 text-info">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery ? "No companies found matching your search." : "No companies yet. Add your first company."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company, index) => (
              <div
                key={company.id}
                className={cn(
                  "group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-slide-up",
                  !company.is_active && "opacity-60"
                )}
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.name} 
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        {company.code.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-card-foreground">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.code}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === company.id ? null : company.id)}
                      className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openDropdown === company.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                          <button
                            onClick={() => {
                              handleOpenModal(company);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setBranchDialogCompany(company);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                          >
                            <Building className="h-4 w-4" />
                            Branch Locations
                          </button>
                          <button
                            onClick={() => toggleActive(company)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                          >
                            {company.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
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

                <div className="mt-4 space-y-2">
                  {(company.group_name || company.division_name) && (
                    <div className="flex flex-wrap gap-1.5">
                      {company.group_name && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {company.group_name}
                        </span>
                      )}
                      {company.division_name && (
                        <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
                          {company.division_name}
                        </span>
                      )}
                    </div>
                  )}
                  {company.industry && (
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  )}
                  {(company.city || company.country) && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[company.city, company.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {company.phone}
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {company.email}
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {company.employee_count} employee{company.employee_count !== 1 ? "s" : ""}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      company.is_active
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {company.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-lg animate-slide-up">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-card-foreground">
                {editingCompany ? "Edit Company" : "Add Company"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Company Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="h-20 w-20 rounded-lg object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                      <Image className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG or WebP. Max 5MB. Recommended: 200×200px (square)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.name ? "border-destructive" : "border-input"
                    )}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="ACME"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground uppercase placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.code ? "border-destructive" : "border-input"
                    )}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company Group</label>
                  <select
                    name="group_id"
                    value={formData.group_id}
                    onChange={(e) => {
                      setFormData({ ...formData, group_id: e.target.value, division_id: "" });
                    }}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">No group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Division</label>
                  <select
                    name="division_id"
                    value={formData.division_id}
                    onChange={handleChange}
                    disabled={!formData.group_id}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  >
                    <option value="">No division</option>
                    {divisions
                      .filter((d) => d.group_id === formData.group_id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.email ? "border-destructive" : "border-input"
                    )}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.website ? "border-destructive" : "border-input"
                    )}
                  />
                  {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="NY"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="10001"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {editingCompany ? "Save Changes" : "Create Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Locations Dialog */}
      {branchDialogCompany && (
        <CompanyBranchLocations
          companyId={branchDialogCompany.id}
          companyName={branchDialogCompany.name}
          isOpen={!!branchDialogCompany}
          onClose={() => setBranchDialogCompany(null)}
        />
      )}
    </AppLayout>
  );
}
