import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Building2, 
  Key, 
  Globe, 
  CheckCircle2, 
  XCircle,
  Pencil,
  Trash2,
  Info,
  ExternalLink
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface SSOProvider {
  id: string;
  company_id: string;
  provider_type: string;
  provider_name: string;
  domain: string;
  metadata_url: string | null;
  metadata_xml: string | null;
  entity_id: string | null;
  sso_url: string | null;
  certificate: string | null;
  attribute_mapping: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

const defaultProvider: Partial<SSOProvider> = {
  provider_type: "saml",
  provider_name: "",
  domain: "",
  metadata_url: "",
  entity_id: "",
  sso_url: "",
  certificate: "",
  attribute_mapping: {
    email: "email",
    name: "name",
  },
  is_active: true,
};

export default function SSOSettingsPage() {
  const { t } = useTranslation();
  const { company, isAdmin } = useAuth();
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Partial<SSOProvider> | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchCompanies();
    } else if (company?.id) {
      setSelectedCompanyId(company.id);
    }
  }, [isAdmin, company]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchProviders();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .order("name");
    
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sso_providers")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProviders((data || []).map(p => ({
        ...p,
        attribute_mapping: (p.attribute_mapping as Record<string, string>) || {}
      })));
    } catch (error) {
      console.error("Error fetching SSO providers:", error);
      toast.error("Failed to load SSO providers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingProvider?.provider_name || !editingProvider?.domain) {
      toast.error("Provider name and domain are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingProvider.id) {
        const { error } = await supabase
          .from("sso_providers")
          .update({
            provider_name: editingProvider.provider_name,
            domain: editingProvider.domain,
            provider_type: editingProvider.provider_type || 'saml',
            metadata_url: editingProvider.metadata_url,
            entity_id: editingProvider.entity_id,
            sso_url: editingProvider.sso_url,
            certificate: editingProvider.certificate,
            attribute_mapping: editingProvider.attribute_mapping || {},
            is_active: editingProvider.is_active,
          })
          .eq("id", editingProvider.id);
        
        if (error) throw error;
        toast.success("SSO provider updated successfully");
      } else {
        const { error } = await supabase
          .from("sso_providers")
          .insert({
            company_id: selectedCompanyId,
            provider_name: editingProvider.provider_name!,
            domain: editingProvider.domain!,
            provider_type: editingProvider.provider_type || 'saml',
            metadata_url: editingProvider.metadata_url,
            entity_id: editingProvider.entity_id,
            sso_url: editingProvider.sso_url,
            certificate: editingProvider.certificate,
            attribute_mapping: editingProvider.attribute_mapping || {},
            is_active: editingProvider.is_active ?? true,
          });
        
        if (error) throw error;
        toast.success("SSO provider created successfully");
      }

      setDialogOpen(false);
      setEditingProvider(null);
      fetchProviders();
    } catch (error: any) {
      console.error("Error saving SSO provider:", error);
      toast.error(error.message || "Failed to save SSO provider");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SSO provider?")) return;

    try {
      const { error } = await supabase
        .from("sso_providers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("SSO provider deleted");
      fetchProviders();
    } catch (error) {
      console.error("Error deleting SSO provider:", error);
      toast.error("Failed to delete SSO provider");
    }
  };

  const handleToggleActive = async (provider: SSOProvider) => {
    try {
      const { error } = await supabase
        .from("sso_providers")
        .update({ is_active: !provider.is_active })
        .eq("id", provider.id);
      
      if (error) throw error;
      toast.success(`SSO provider ${provider.is_active ? "disabled" : "enabled"}`);
      fetchProviders();
    } catch (error) {
      console.error("Error toggling SSO provider:", error);
      toast.error("Failed to update SSO provider");
    }
  };

  const openCreateDialog = () => {
    setEditingProvider({ ...defaultProvider });
    setDialogOpen(true);
  };

  const openEditDialog = (provider: SSOProvider) => {
    setEditingProvider({ ...provider });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("nav.admin", "Admin"), href: "/admin" },
            { label: t("admin.ssoSettings", "SSO Settings") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("admin.ssoSettings", "SSO Settings")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.ssoSettingsDescription", "Configure Single Sign-On for enterprise authentication")}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && companies.length > 1 && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add SSO Provider
            </Button>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Enterprise SSO</AlertTitle>
          <AlertDescription>
            SSO allows your employees to sign in using your company's identity provider (Okta, Azure AD, etc.). 
            Users with email domains matching configured SSO domains will be redirected to your IdP for authentication.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.ssoProviders", "SSO Providers")}</CardTitle>
            <CardDescription>
              {t("admin.ssoProvidersDescription", "Manage identity providers for single sign-on")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name", "Name")}</TableHead>
                  <TableHead>{t("admin.providerType", "Type")}</TableHead>
                  <TableHead>{t("admin.domain", "Domain")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead>{t("common.createdAt", "Created")}</TableHead>
                  <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        {provider.provider_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {provider.provider_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        {provider.domain}
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider.is_active ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(provider.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(provider)}
                        >
                          {provider.is_active ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(provider)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(provider.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {providers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No SSO providers configured. Click "Add SSO Provider" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Provider Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProvider?.id ? "Edit SSO Provider" : "Add SSO Provider"}
              </DialogTitle>
              <DialogDescription>
                Configure a SAML identity provider for single sign-on
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_name">Provider Name *</Label>
                  <Input
                    id="provider_name"
                    placeholder="e.g., Okta, Azure AD"
                    value={editingProvider?.provider_name || ""}
                    onChange={(e) => 
                      setEditingProvider(prev => prev ? { ...prev, provider_name: e.target.value } : null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Email Domain *</Label>
                  <Input
                    id="domain"
                    placeholder="e.g., company.com"
                    value={editingProvider?.domain || ""}
                    onChange={(e) => 
                      setEditingProvider(prev => prev ? { ...prev, domain: e.target.value } : null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Users with this email domain will be redirected to SSO
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata_url">Metadata URL</Label>
                <Input
                  id="metadata_url"
                  placeholder="https://your-idp.com/metadata.xml"
                  value={editingProvider?.metadata_url || ""}
                  onChange={(e) => 
                    setEditingProvider(prev => prev ? { ...prev, metadata_url: e.target.value } : null)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your IdP's SAML metadata URL (preferred method)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity_id">Entity ID / Issuer</Label>
                <Input
                  id="entity_id"
                  placeholder="https://your-idp.com/entity-id"
                  value={editingProvider?.entity_id || ""}
                  onChange={(e) => 
                    setEditingProvider(prev => prev ? { ...prev, entity_id: e.target.value } : null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sso_url">SSO URL (Sign-on URL)</Label>
                <Input
                  id="sso_url"
                  placeholder="https://your-idp.com/sso"
                  value={editingProvider?.sso_url || ""}
                  onChange={(e) => 
                    setEditingProvider(prev => prev ? { ...prev, sso_url: e.target.value } : null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate">X.509 Certificate</Label>
                <Textarea
                  id="certificate"
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  rows={4}
                  value={editingProvider?.certificate || ""}
                  onChange={(e) => 
                    setEditingProvider(prev => prev ? { ...prev, certificate: e.target.value } : null)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this SSO provider
                  </p>
                </div>
                <Switch
                  checked={editingProvider?.is_active ?? true}
                  onCheckedChange={(checked) => 
                    setEditingProvider(prev => prev ? { ...prev, is_active: checked } : null)
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingProvider?.id ? "Update" : "Create"} Provider
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
