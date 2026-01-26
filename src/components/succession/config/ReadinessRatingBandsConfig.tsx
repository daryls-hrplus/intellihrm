import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useReadinessRatingBands, ReadinessRatingBand } from '@/hooks/succession/useReadinessRatingBands';

interface ReadinessRatingBandsConfigProps {
  companyId: string;
}

export function ReadinessRatingBandsConfig({ companyId }: ReadinessRatingBandsConfigProps) {
  const {
    loading,
    bands,
    fetchBands,
    createBand,
    updateBand,
    deleteBand,
    seedDefaultBands,
  } = useReadinessRatingBands(companyId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBand, setEditingBand] = useState<Partial<ReadinessRatingBand> | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchBands();
    }
  }, [companyId]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    await seedDefaultBands();
    setSeeding(false);
  };

  const handleSave = async () => {
    if (!editingBand) return;
    
    if (editingBand.id) {
      await updateBand(editingBand.id, editingBand);
    } else {
      await createBand(editingBand);
    }
    setDialogOpen(false);
    setEditingBand(null);
  };

  const handleEdit = (band: ReadinessRatingBand) => {
    setEditingBand(band);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBand({
      rating_label: '',
      min_percentage: 0,
      max_percentage: 100,
      color_code: '#3b82f6',
      is_successor_eligible: true,
      sort_order: bands.length + 1,
    });
    setDialogOpen(true);
  };

  const handleToggleEligible = async (band: ReadinessRatingBand) => {
    await updateBand(band.id, { is_successor_eligible: !band.is_successor_eligible });
  };

  if (loading && bands.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bands.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <p className="text-muted-foreground mb-4">No readiness bands configured</p>
          <Button onClick={handleSeedDefaults} disabled={seeding}>
            {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Initialize Default Bands
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Band
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rating Label</TableHead>
                <TableHead>Min %</TableHead>
                <TableHead>Max %</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Successor Eligible</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bands.map((band) => (
                <TableRow key={band.id}>
                  <TableCell>
                    <Badge 
                      style={{ backgroundColor: band.color_code || '#6b7280' }}
                      className="text-white"
                    >
                      {band.rating_label}
                    </Badge>
                  </TableCell>
                  <TableCell>{band.min_percentage}%</TableCell>
                  <TableCell>{band.max_percentage}%</TableCell>
                  <TableCell>
                    <div 
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: band.color_code || '#6b7280' }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={band.is_successor_eligible}
                        onCheckedChange={() => handleToggleEligible(band)}
                      />
                      {band.is_successor_eligible ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{band.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(band)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteBand(band.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBand?.id ? 'Edit' : 'Add'} Readiness Band
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating Label</Label>
              <Input
                value={editingBand?.rating_label || ''}
                onChange={(e) => setEditingBand({ ...editingBand, rating_label: e.target.value })}
                placeholder="e.g., Ready Now"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Percentage</Label>
                <Input
                  type="number"
                  value={editingBand?.min_percentage || 0}
                  onChange={(e) => setEditingBand({ ...editingBand, min_percentage: parseFloat(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Percentage</Label>
                <Input
                  type="number"
                  value={editingBand?.max_percentage || 100}
                  onChange={(e) => setEditingBand({ ...editingBand, max_percentage: parseFloat(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editingBand?.color_code || '#3b82f6'}
                    onChange={(e) => setEditingBand({ ...editingBand, color_code: e.target.value })}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    value={editingBand?.color_code || '#3b82f6'}
                    onChange={(e) => setEditingBand({ ...editingBand, color_code: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editingBand?.sort_order || 1}
                  onChange={(e) => setEditingBand({ ...editingBand, sort_order: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Successor Eligible</Label>
                <p className="text-xs text-muted-foreground">
                  Can candidates in this band be designated as successors?
                </p>
              </div>
              <Switch
                checked={editingBand?.is_successor_eligible !== false}
                onCheckedChange={(v) => setEditingBand({ ...editingBand, is_successor_eligible: v })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editingBand?.rating_label}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
