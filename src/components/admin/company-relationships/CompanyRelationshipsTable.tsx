import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Edit, Trash2, ArrowRight, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface CompanyRelationship {
  id: string;
  source_company_id: string;
  target_company_id: string;
  relationship_type: string;
  relationship_reason: string;
  description: string | null;
  is_bidirectional: boolean;
  effective_date: string | null;
  end_date: string | null;
  is_active: boolean;
  source_company?: { code: string; name: string };
  target_company?: { code: string; name: string };
}

interface Props {
  relationships: CompanyRelationship[];
  isLoading: boolean;
  onEdit: (relationship: CompanyRelationship) => void;
  onRefresh: () => void;
}

const RELATIONSHIP_TYPE_COLORS: Record<string, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  matrix: "bg-info/10 text-info border-info/20",
  both: "bg-success/10 text-success border-success/20",
};

const RELATIONSHIP_REASON_LABELS: Record<string, string> = {
  same_group: "Same Group",
  joint_venture: "Joint Venture",
  managed_services: "Managed Services",
  shared_services: "Shared Services",
  custom: "Custom",
};

export function CompanyRelationshipsTable({ relationships, isLoading, onEdit, onRefresh }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("company_reporting_relationships")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;
      toast.success("Relationship deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete relationship");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No cross-company relationships configured.</p>
        <p className="text-sm mt-1">Companies in the same corporate group automatically allow reporting relationships.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Company</TableHead>
              <TableHead className="w-12 text-center">Direction</TableHead>
              <TableHead>Target Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relationships.map((rel) => (
              <TableRow key={rel.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{rel.source_company?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{rel.source_company?.code}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {rel.is_bidirectional ? (
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-auto" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{rel.target_company?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{rel.target_company?.code}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={RELATIONSHIP_TYPE_COLORS[rel.relationship_type]}>
                    {rel.relationship_type === "both" ? "Primary & Matrix" : 
                     rel.relationship_type.charAt(0).toUpperCase() + rel.relationship_type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{RELATIONSHIP_REASON_LABELS[rel.relationship_reason] || rel.relationship_reason}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {rel.effective_date ? format(new Date(rel.effective_date), "PP") : "-"}
                    {rel.end_date && (
                      <span className="text-muted-foreground"> to {format(new Date(rel.end_date), "PP")}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={rel.is_active ? "default" : "secondary"}>
                    {rel.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(rel)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                          setDeletingId(rel.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company relationship? This may affect existing cross-company 
              reporting lines and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
