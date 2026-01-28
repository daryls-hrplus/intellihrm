import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ArchivedEntriesPanelProps {
  archivedEntries: OrphanEntry[];
  isLoading: boolean;
  onRestore: (id: string) => Promise<void>;
  onRestoreMultiple: (ids: string[]) => Promise<void>;
  onDeletePermanently: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
  isProcessing: boolean;
}

export function ArchivedEntriesPanel({
  archivedEntries,
  isLoading,
  onRestore,
  onRestoreMultiple,
  onDeletePermanently,
  onDeleteMultiple,
  isProcessing,
}: ArchivedEntriesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'restore' | 'delete' | 'restore_bulk' | 'delete_bulk';
    entry?: OrphanEntry;
  }>({ open: false, type: 'restore' });

  // Get unique modules for filter
  const modules = [...new Set(archivedEntries.map(e => e.moduleCode || 'unassigned'))].sort();

  // Filter entries
  const filteredEntries = archivedEntries.filter(entry => {
    const matchesSearch = 
      entry.featureCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.routePath?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesModule = moduleFilter === "all" || entry.moduleCode === moduleFilter;

    return matchesSearch && matchesModule;
  });

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredEntries.map(e => e.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Action handlers
  const handleRestore = async (entry: OrphanEntry) => {
    await onRestore(entry.id);
    setConfirmDialog({ open: false, type: 'restore' });
  };

  const handleDelete = async (entry: OrphanEntry) => {
    await onDeletePermanently(entry.id);
    setConfirmDialog({ open: false, type: 'delete' });
  };

  const handleBulkRestore = async () => {
    await onRestoreMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
    setConfirmDialog({ open: false, type: 'restore_bulk' });
  };

  const handleBulkDelete = async () => {
    await onDeleteMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
    setConfirmDialog({ open: false, type: 'delete_bulk' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (archivedEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-medium">No Archived Features</h3>
              <p className="text-sm text-muted-foreground">
                Archived features will appear here. You can restore them to the code registry.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Features
              </CardTitle>
              <CardDescription>
                {archivedEntries.length} feature(s) have been archived. Restore them to add back to the system.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {archivedEntries.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feature codes, names, routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.size} feature(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => setConfirmDialog({ open: true, type: 'restore_bulk' })}
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmDialog({ open: true, type: 'delete_bulk' })}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredEntries.length && filteredEntries.length > 0}
                      onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                      className="rounded border-muted-foreground/30"
                    />
                  </TableHead>
                  <TableHead>Feature Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Route Path</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(entry.id)}
                        onChange={() => toggleSelection(entry.id)}
                        className="rounded border-muted-foreground/30"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.featureCode}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">{entry.featureName}</p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.moduleCode || 'unassigned'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.routePath || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(entry.createdAt, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setConfirmDialog({ open: true, type: 'restore', entry })}
                          disabled={isProcessing}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDialog({ open: true, type: 'delete', entry })}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.type.includes('restore') ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Restore Feature{confirmDialog.type === 'restore_bulk' ? 's' : ''}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Feature{confirmDialog.type === 'delete_bulk' ? 's' : ''} Permanently
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'restore' && confirmDialog.entry && (
                <>
                  This will restore <strong>{confirmDialog.entry.featureName}</strong> ({confirmDialog.entry.featureCode}) 
                  to active status. It will reappear in the orphan management list unless added to the code registry.
                </>
              )}
              {confirmDialog.type === 'restore_bulk' && (
                <>
                  This will restore {selectedIds.size} feature(s) to active status. 
                  They will reappear in the orphan management list unless added to the code registry.
                </>
              )}
              {confirmDialog.type === 'delete' && confirmDialog.entry && (
                <>
                  This will <strong className="text-destructive">permanently delete</strong> {confirmDialog.entry.featureName} ({confirmDialog.entry.featureCode}). 
                  This action cannot be undone.
                </>
              )}
              {confirmDialog.type === 'delete_bulk' && (
                <>
                  This will <strong className="text-destructive">permanently delete</strong> {selectedIds.size} feature(s). 
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {confirmDialog.type === 'restore' && confirmDialog.entry && (
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleRestore(confirmDialog.entry!)}
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Restore
              </AlertDialogAction>
            )}
            {confirmDialog.type === 'restore_bulk' && (
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                onClick={handleBulkRestore}
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Restore {selectedIds.size} Feature(s)
              </AlertDialogAction>
            )}
            {confirmDialog.type === 'delete' && confirmDialog.entry && (
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => handleDelete(confirmDialog.entry!)}
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete Permanently
              </AlertDialogAction>
            )}
            {confirmDialog.type === 'delete_bulk' && (
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleBulkDelete}
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete {selectedIds.size} Feature(s)
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
