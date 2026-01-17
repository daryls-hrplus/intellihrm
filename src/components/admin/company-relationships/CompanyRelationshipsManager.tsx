import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Info, Building2, GitBranch } from "lucide-react";
import { CompanyRelationshipsTable } from "./CompanyRelationshipsTable";
import { CompanyRelationshipDialog } from "./CompanyRelationshipDialog";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";

export function CompanyRelationshipsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<any>(null);
  const { relationships, isLoading, refetch } = useCompanyRelationships();

  const handleEdit = (relationship: any) => {
    setEditingRelationship(relationship);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRelationship(null);
  };

  const handleSuccess = () => {
    handleDialogClose();
    refetch();
  };

  const primaryCount = relationships.filter(r => r.relationship_type === "primary" || r.relationship_type === "both").length;
  const matrixCount = relationships.filter(r => r.relationship_type === "matrix" || r.relationship_type === "both").length;

  return (
    <div className="space-y-6">
      {/* Industry Standards Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <p className="font-medium">Industry-Aligned Reporting Model</p>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-4 h-0.5 bg-foreground mt-2 shrink-0" />
              <div>
                <strong>Primary (Solid-Line)</strong>: Direct reporting for payroll, performance, and compliance. 
                Typically within the same legal entity or configured cross-company relationships.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-foreground mt-2 shrink-0" />
              <div>
                <strong>Matrix (Dotted-Line)</strong>: Functional or project-based relationships that can cross 
                company boundaries for shared services, regional leadership, or functional oversight.
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationships.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Primary Reporting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{primaryCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matrix Reporting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{matrixCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Cross-Company Reporting Rules</CardTitle>
                <CardDescription>
                  Define which companies can share reporting relationships outside their corporate group
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Relationship
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({relationships.length})</TabsTrigger>
              <TabsTrigger value="primary">Primary Only</TabsTrigger>
              <TabsTrigger value="matrix">Matrix Only</TabsTrigger>
              <TabsTrigger value="both">Both Types</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <CompanyRelationshipsTable 
                relationships={relationships} 
                isLoading={isLoading}
                onEdit={handleEdit}
                onRefresh={refetch}
              />
            </TabsContent>
            <TabsContent value="primary" className="mt-4">
              <CompanyRelationshipsTable 
                relationships={relationships.filter(r => r.relationship_type === "primary")} 
                isLoading={isLoading}
                onEdit={handleEdit}
                onRefresh={refetch}
              />
            </TabsContent>
            <TabsContent value="matrix" className="mt-4">
              <CompanyRelationshipsTable 
                relationships={relationships.filter(r => r.relationship_type === "matrix")} 
                isLoading={isLoading}
                onEdit={handleEdit}
                onRefresh={refetch}
              />
            </TabsContent>
            <TabsContent value="both" className="mt-4">
              <CompanyRelationshipsTable 
                relationships={relationships.filter(r => r.relationship_type === "both")} 
                isLoading={isLoading}
                onEdit={handleEdit}
                onRefresh={refetch}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Automatic Relationships Info */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Automatic Relationships</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Companies within the same <strong>Corporate Group</strong> (group_id) automatically allow both 
            primary and matrix reporting relationships. The rules configured above are for relationships 
            <strong> outside</strong> of corporate groups, such as:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Joint Ventures</strong> - Shared ownership between different corporate groups</li>
            <li><strong>Managed Services</strong> - Outsourced operations managed by another entity</li>
            <li><strong>Shared Services</strong> - Centralized functions serving multiple organizations</li>
          </ul>
        </CardContent>
      </Card>

      <CompanyRelationshipDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        relationship={editingRelationship}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
