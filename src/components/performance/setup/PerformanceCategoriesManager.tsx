import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Wand2, Award, TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";
import { usePerformanceCategories, useSeedPerformanceCategories, useManagePerformanceCategories, PerformanceCategory } from "@/hooks/usePerformanceCategories";
import { PerformanceCategoryDialog } from "./PerformanceCategoryDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PerformanceCategoriesManagerProps {
  companyId: string;
}

export function PerformanceCategoriesManager({ companyId }: PerformanceCategoriesManagerProps) {
  const { data: categories, isLoading } = usePerformanceCategories(companyId);
  const seedCategories = useSeedPerformanceCategories();
  const { deleteCategory } = useManagePerformanceCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PerformanceCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<PerformanceCategory | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: PerformanceCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteClick = (category: PerformanceCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate({ id: categoryToDelete.id, companyId });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleSeedDefaults = () => {
    seedCategories.mutate(companyId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance Categories
              </CardTitle>
              <CardDescription>
                Define performance levels and their score thresholds for the appraisal system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(!categories || categories.length === 0) && (
                <Button 
                  variant="outline" 
                  onClick={handleSeedDefaults}
                  disabled={seedCategories.isPending}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Seed Defaults
                </Button>
              )}
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Score Range</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-sm">{category.code}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category.min_score}% - {category.max_score}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: category.color }}
                        title={category.color}
                      />
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex gap-1">
                          {category.promotion_eligible && (
                            <Tooltip>
                              <TooltipTrigger>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>Promotion Eligible</TooltipContent>
                            </Tooltip>
                          )}
                          {category.succession_eligible && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Users className="h-4 w-4 text-blue-600" />
                              </TooltipTrigger>
                              <TooltipContent>Succession Eligible</TooltipContent>
                            </Tooltip>
                          )}
                          {category.bonus_eligible && (
                            <Tooltip>
                              <TooltipTrigger>
                                <DollarSign className="h-4 w-4 text-amber-600" />
                              </TooltipTrigger>
                              <TooltipContent>Bonus Eligible</TooltipContent>
                            </Tooltip>
                          )}
                          {category.requires_pip && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </TooltipTrigger>
                              <TooltipContent>Requires PIP</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No performance categories configured</p>
              <Button variant="outline" onClick={handleSeedDefaults} disabled={seedCategories.isPending}>
                <Wand2 className="mr-2 h-4 w-4" />
                Create Default Categories
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PerformanceCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
        editingCategory={editingCategory}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{categoryToDelete?.name}"? This category will no longer be used for new appraisals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
