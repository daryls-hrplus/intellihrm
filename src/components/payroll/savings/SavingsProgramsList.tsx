import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import {
  SavingsProgramType,
  useSavingsPrograms,
  useDeleteSavingsProgram,
  CATEGORY_LABELS,
  SavingsProgramCategory,
} from "@/hooks/useSavingsPrograms";
import { SavingsProgramTypeCard } from "./SavingsProgramTypeCard";
import { SavingsProgramFormDialog } from "./SavingsProgramFormDialog";

interface SavingsProgramsListProps {
  companyId: string;
}

export function SavingsProgramsList({ companyId }: SavingsProgramsListProps) {
  const { data: programs, isLoading, error } = useSavingsPrograms(companyId);
  const deleteProgram = useDeleteSavingsProgram();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<SavingsProgramType | null>(null);
  const [duplicatingProgram, setDuplicatingProgram] = useState<SavingsProgramType | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<SavingsProgramType | null>(null);

  const filteredPrograms = programs?.filter((program) => {
    const matchesSearch =
      searchQuery === "" ||
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || program.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && program.is_active) ||
      (statusFilter === "inactive" && !program.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (program: SavingsProgramType) => {
    setEditingProgram(program);
    setDuplicatingProgram(null);
    setIsFormOpen(true);
  };

  const handleDuplicate = (program: SavingsProgramType) => {
    setEditingProgram(null);
    setDuplicatingProgram(program);
    setIsFormOpen(true);
  };

  const handleDelete = (program: SavingsProgramType) => {
    setDeletingProgram(program);
  };

  const confirmDelete = async () => {
    if (deletingProgram) {
      await deleteProgram.mutateAsync(deletingProgram.id);
      setDeletingProgram(null);
    }
  };

  const handleViewEnrollments = (program: SavingsProgramType) => {
    // TODO: Navigate to enrollments page
    console.log("View enrollments for:", program.id);
  };

  const handleCreateNew = () => {
    setEditingProgram(null);
    setDuplicatingProgram(null);
    setIsFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingProgram(null);
      setDuplicatingProgram(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load savings programs</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  // Group programs by category
  const programsByCategory = filteredPrograms?.reduce((acc, program) => {
    const category = program.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(program);
    return acc;
  }, {} as Record<SavingsProgramCategory, SavingsProgramType[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Savings Programs</h2>
          <p className="text-muted-foreground">
            Configure savings program types for employee enrollment
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Programs Grid */}
      {filteredPrograms?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No savings programs found</p>
          <Button variant="outline" className="mt-4" onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first program
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {programsByCategory &&
            Object.entries(programsByCategory).map(([category, categoryPrograms]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {CATEGORY_LABELS[category as SavingsProgramCategory]}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({categoryPrograms.length})
                  </span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryPrograms.map((program) => (
                    <SavingsProgramTypeCard
                      key={program.id}
                      program={program}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onViewEnrollments={handleViewEnrollments}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Form Dialog */}
      <SavingsProgramFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        companyId={companyId}
        program={editingProgram}
        duplicateFrom={duplicatingProgram}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProgram}
        onOpenChange={(open) => !open && setDeletingProgram(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProgram?.name}"? This action cannot be
              undone. Any existing enrollments will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProgram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
