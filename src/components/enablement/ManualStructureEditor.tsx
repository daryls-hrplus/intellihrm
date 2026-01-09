// Editor for managing manual section structure (add/remove/reorder sections)

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Edit2, 
  Check, 
  X,
  Layers,
  ChevronRight,
  Loader2
} from "lucide-react";
import { 
  ManualSection, 
  ManualDefinition,
  useCreateSection,
  useDeleteSection,
  useUpdateSectionTitle,
  useUpdateSectionOrder
} from "@/hooks/useManualGeneration";

interface ManualStructureEditorProps {
  manual: ManualDefinition;
  sections: ManualSection[];
  onSectionUpdated?: () => void;
}

export function ManualStructureEditor({ 
  manual, 
  sections,
  onSectionUpdated 
}: ManualStructureEditorProps) {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSectionNumber, setNewSectionNumber] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  const updateTitle = useUpdateSectionTitle();
  const updateOrder = useUpdateSectionOrder();

  // Build hierarchical structure
  const buildTree = () => {
    const parentSections = sections.filter(s => !s.section_number.includes('.'));
    const tree: { parent: ManualSection; children: ManualSection[] }[] = [];

    for (const parent of parentSections) {
      const children = sections.filter(s => 
        s.section_number.startsWith(parent.section_number + '.') &&
        s.section_number.split('.').length === parent.section_number.split('.').length + 1
      );
      tree.push({ parent, children: children.sort((a, b) => a.display_order - b.display_order) });
    }

    return tree.sort((a, b) => a.parent.display_order - b.parent.display_order);
  };

  const handleStartEdit = (section: ManualSection) => {
    setEditingSectionId(section.id);
    setEditingTitle(section.title);
  };

  const handleSaveEdit = async () => {
    if (!editingSectionId || !editingTitle.trim()) return;
    
    await updateTitle.mutateAsync({ sectionId: editingSectionId, title: editingTitle.trim() });
    setEditingSectionId(null);
    setEditingTitle("");
    onSectionUpdated?.();
  };

  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditingTitle("");
  };

  const handleAddSection = async () => {
    if (!newSectionNumber.trim() || !newSectionTitle.trim()) return;

    const maxOrder = Math.max(...sections.map(s => s.display_order), 0);
    
    await createSection.mutateAsync({
      manual_id: manual.id,
      section_number: newSectionNumber.trim(),
      title: newSectionTitle.trim(),
      content: {},
      source_feature_codes: [],
      source_module_codes: manual.module_codes || [],
      display_order: maxOrder + 1,
      parent_section_id: null,
      needs_regeneration: true,
      last_generated_at: null,
      generation_hash: null
    });

    setNewSectionNumber("");
    setNewSectionTitle("");
    setShowAddDialog(false);
    onSectionUpdated?.();
  };

  const handleDeleteSection = async (sectionId: string) => {
    await deleteSection.mutateAsync(sectionId);
    onSectionUpdated?.();
  };

  const handleMoveUp = async (section: ManualSection, allSections: ManualSection[]) => {
    const currentIndex = allSections.findIndex(s => s.id === section.id);
    if (currentIndex <= 0) return;

    const prevSection = allSections[currentIndex - 1];
    await updateOrder.mutateAsync([
      { id: section.id, display_order: prevSection.display_order },
      { id: prevSection.id, display_order: section.display_order }
    ]);
    onSectionUpdated?.();
  };

  const handleMoveDown = async (section: ManualSection, allSections: ManualSection[]) => {
    const currentIndex = allSections.findIndex(s => s.id === section.id);
    if (currentIndex >= allSections.length - 1) return;

    const nextSection = allSections[currentIndex + 1];
    await updateOrder.mutateAsync([
      { id: section.id, display_order: nextSection.display_order },
      { id: nextSection.id, display_order: section.display_order }
    ]);
    onSectionUpdated?.();
  };

  const tree = buildTree();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Section Structure
            </CardTitle>
            <CardDescription>
              Add, remove, or reorder sections in {manual.manual_name}
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
                <DialogDescription>
                  Create a new section in the manual structure
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Section Number</Label>
                  <Input
                    placeholder="e.g., 3.2 or 4"
                    value={newSectionNumber}
                    onChange={(e) => setNewSectionNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use format like "1", "1.1", "2.3" etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    placeholder="e.g., Advanced Configuration"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddSection}
                  disabled={!newSectionNumber.trim() || !newSectionTitle.trim() || createSection.isPending}
                >
                  {createSection.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {tree.map(({ parent, children }) => (
              <div key={parent.id} className="border rounded-lg">
                {/* Parent Section */}
                <div className="flex items-center gap-2 p-3 bg-muted/30">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Badge variant="secondary" className="font-mono">
                    {parent.section_number}
                  </Badge>
                  
                  {editingSectionId === parent.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{parent.title}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleStartEdit(parent)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{parent.title}" and all its content.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSection(parent.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Child Sections */}
                {children.length > 0 && (
                  <div className="pl-8 py-1 space-y-1">
                    {children.map((child, idx) => (
                      <div 
                        key={child.id} 
                        className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded"
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono text-xs">
                          {child.section_number}
                        </Badge>
                        
                        {editingSectionId === child.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                              <Check className="h-3 w-3 text-green-500" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">{child.title}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleStartEdit(child)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{child.title}" and all its content.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSection(child.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sections defined</p>
                <p className="text-sm">Click "Add Section" to create your first section</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Use section numbers like "1", "1.1", "1.2" for hierarchy</li>
            <li>Sections without content will be marked for AI generation</li>
            <li>Delete sections carefully - content cannot be recovered</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}