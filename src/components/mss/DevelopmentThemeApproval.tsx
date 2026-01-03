import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Check, 
  Eye, 
  EyeOff, 
  Pencil, 
  Sparkles, 
  Clock,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDevelopmentThemes, useConfirmTheme } from '@/hooks/feedback/useDevelopmentThemes';
import { useQueryClient } from '@tanstack/react-query';
import type { DevelopmentTheme } from '@/types/developmentThemes';

interface DevelopmentThemeApprovalProps {
  employeeId: string;
  managerId: string;
  onThemeUpdated?: () => void;
}

type ThemeStatus = 'pending' | 'confirmed' | 'released';

function getThemeStatus(theme: DevelopmentTheme & { is_visible_to_employee?: boolean }): ThemeStatus {
  if (theme.is_visible_to_employee) return 'released';
  if (theme.is_confirmed) return 'confirmed';
  return 'pending';
}

function getStatusBadge(status: ThemeStatus) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Review</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Confirmed</Badge>;
    case 'released':
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Released to Employee</Badge>;
  }
}

export function DevelopmentThemeApproval({ 
  employeeId, 
  managerId,
  onThemeUpdated 
}: DevelopmentThemeApprovalProps) {
  const { data: themes, isLoading } = useDevelopmentThemes(employeeId);
  const confirmTheme = useConfirmTheme();
  const queryClient = useQueryClient();
  
  const [editingTheme, setEditingTheme] = useState<DevelopmentTheme | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [themeToRelease, setThemeToRelease] = useState<string | null>(null);

  const handleEdit = (theme: DevelopmentTheme) => {
    setEditingTheme(theme);
    setEditName(theme.theme_name);
    setEditDescription(theme.theme_description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingTheme) return;

    try {
      const { error } = await supabase
        .from('development_themes')
        .update({
          theme_name: editName,
          theme_description: editDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTheme.id);

      if (error) throw error;

      toast.success('Theme updated');
      setEditingTheme(null);
      queryClient.invalidateQueries({ queryKey: ['development-themes'] });
      onThemeUpdated?.();
    } catch (error) {
      toast.error('Failed to update theme');
    }
  };

  const handleConfirm = async (themeId: string) => {
    confirmTheme.mutate({ themeId, userId: managerId });
  };

  const handleRelease = async (themeId: string) => {
    try {
      const { error } = await supabase
        .from('development_themes')
        .update({
          is_visible_to_employee: true,
          visibility_changed_at: new Date().toISOString(),
          visibility_changed_by: managerId,
        } as any)
        .eq('id', themeId);

      if (error) throw error;

      toast.success('Theme released to employee');
      setReleaseDialogOpen(false);
      setThemeToRelease(null);
      queryClient.invalidateQueries({ queryKey: ['development-themes'] });
      onThemeUpdated?.();
    } catch (error) {
      toast.error('Failed to release theme');
    }
  };

  const handleBulkConfirm = async () => {
    for (const themeId of selectedThemes) {
      await handleConfirm(themeId);
    }
    setSelectedThemes(new Set());
  };

  const handleBulkRelease = async () => {
    for (const themeId of selectedThemes) {
      const theme = themes?.find(t => t.id === themeId);
      if (theme?.is_confirmed) {
        await handleRelease(themeId);
      }
    }
    setSelectedThemes(new Set());
  };

  const toggleThemeSelection = (themeId: string) => {
    const newSelection = new Set(selectedThemes);
    if (newSelection.has(themeId)) {
      newSelection.delete(themeId);
    } else {
      newSelection.add(themeId);
    }
    setSelectedThemes(newSelection);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const allThemes = themes || [];
  const pendingThemes = allThemes.filter(t => !t.is_confirmed);
  const confirmedThemes = allThemes.filter(t => t.is_confirmed && !(t as any).is_visible_to_employee);
  const releasedThemes = allThemes.filter(t => (t as any).is_visible_to_employee);

  if (allThemes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No development themes generated yet.</p>
          <p className="text-sm mt-1">
            Use the development bridge above to generate themes from 360 feedback.
          </p>
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
              <CardTitle className="text-lg">Development Theme Management</CardTitle>
              <CardDescription>
                Review, edit, confirm, and release themes to the employee
              </CardDescription>
            </div>
            {selectedThemes.size > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkConfirm}
                  disabled={confirmTheme.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirm Selected ({selectedThemes.size})
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkRelease}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Release Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending Themes */}
          {pendingThemes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Review ({pendingThemes.length})
              </h4>
              <div className="space-y-2">
                {pendingThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-start justify-between p-3 border rounded-lg bg-amber-500/5 border-amber-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedThemes.has(theme.id)}
                        onCheckedChange={() => toggleThemeSelection(theme.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{theme.theme_name}</span>
                          {theme.ai_generated && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        {theme.theme_description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {theme.theme_description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(theme)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(theme.id)}
                        disabled={confirmTheme.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed but not released */}
          {confirmedThemes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-blue-500" />
                Confirmed - Not Yet Visible ({confirmedThemes.length})
              </h4>
              <div className="space-y-2">
                {confirmedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-start justify-between p-3 border rounded-lg bg-blue-500/5 border-blue-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedThemes.has(theme.id)}
                        onCheckedChange={() => toggleThemeSelection(theme.id)}
                      />
                      <div>
                        <span className="font-medium">{theme.theme_name}</span>
                        {theme.theme_description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {theme.theme_description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(theme)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setThemeToRelease(theme.id);
                          setReleaseDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Release to Employee
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Released themes */}
          {releasedThemes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-500" />
                Released to Employee ({releasedThemes.length})
              </h4>
              <div className="space-y-2">
                {releasedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-start justify-between p-3 border rounded-lg bg-green-500/5 border-green-500/20"
                  >
                    <div>
                      <span className="font-medium">{theme.theme_name}</span>
                      {theme.theme_description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {theme.theme_description}
                        </p>
                      )}
                    </div>
                    {getStatusBadge('released')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTheme} onOpenChange={() => setEditingTheme(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Development Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-description">Description</Label>
              <Textarea
                id="theme-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTheme(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Confirmation Dialog */}
      <AlertDialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Theme to Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the development theme visible to the employee in their 
              "My Development Themes" page. They will be able to view recommendations 
              and link it to their development plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => themeToRelease && handleRelease(themeToRelease)}
            >
              Release to Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
