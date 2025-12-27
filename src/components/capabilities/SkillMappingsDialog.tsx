import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Zap, Search, Loader2 } from "lucide-react";
import {
  Capability,
  CompetencySkillMapping,
  useCompetencySkillMappings,
  useCapabilities,
} from "@/hooks/useCapabilities";
import { cn } from "@/lib/utils";

interface SkillMappingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competency: Capability | null;
}

export function SkillMappingsDialog({
  open,
  onOpenChange,
  competency,
}: SkillMappingsDialogProps) {
  const { mappings, loading, fetchMappings, addMapping, removeMapping } =
    useCompetencySkillMappings();
  const { capabilities: skills, fetchCapabilities } = useCapabilities();

  const [availableSkills, setAvailableSkills] = useState<Capability[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [weight, setWeight] = useState(50);
  const [isRequired, setIsRequired] = useState(false);
  const [minLevel, setMinLevel] = useState<number | undefined>(undefined);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open && competency) {
      fetchMappings(competency.id);
      fetchCapabilities({ type: "SKILL", status: "active" }).then((data) => {
        setAvailableSkills(data);
      });
    }
  }, [open, competency, fetchMappings, fetchCapabilities]);

  const filteredSkills = availableSkills.filter((skill) => {
    // Exclude already mapped skills
    const isMapped = mappings.some((m) => m.skill_id === skill.id);
    if (isMapped) return false;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        skill.name.toLowerCase().includes(searchLower) ||
        skill.code.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleAddMapping = async () => {
    if (!competency || !selectedSkill) return;

    setAdding(true);
    const success = await addMapping(
      competency.id,
      selectedSkill,
      weight,
      isRequired,
      minLevel
    );

    if (success) {
      await fetchMappings(competency.id);
      setSelectedSkill("");
      setWeight(50);
      setIsRequired(false);
      setMinLevel(undefined);
    }
    setAdding(false);
  };

  const handleRemoveMapping = async (id: string) => {
    const success = await removeMapping(id);
    if (success && competency) {
      await fetchMappings(competency.id);
    }
  };

  if (!competency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Skills Linked to: {competency.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new skill mapping */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Link a Skill
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search Skills</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or code..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select Skill</Label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSkills.slice(0, 50).map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-blue-500" />
                          {skill.name}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Weight ({weight}%)</Label>
                <Slider
                  value={[weight]}
                  onValueChange={([v]) => setWeight(v)}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Proficiency Level</Label>
                <Select
                  value={minLevel?.toString() || "none"}
                  onValueChange={(v) => setMinLevel(v === "none" ? undefined : parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any level</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={isRequired} onCheckedChange={setIsRequired} />
                  <Label>Required</Label>
                </div>
                <Button
                  onClick={handleAddMapping}
                  disabled={!selectedSkill || adding}
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Current mappings */}
          <div className="space-y-2">
            <h4 className="font-medium">Linked Skills ({mappings.length})</h4>
            <ScrollArea className="h-[300px] rounded-md border">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : mappings.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No skills linked yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Weight</TableHead>
                      <TableHead className="text-center">Min Level</TableHead>
                      <TableHead className="text-center">Required</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {(mapping.skill as Capability)?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {(mapping.skill as Capability)?.category || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div
                            className={cn(
                              "inline-flex items-center justify-center w-12 h-6 rounded text-xs font-medium",
                              mapping.weight >= 70
                                ? "bg-green-100 text-green-800"
                                : mapping.weight >= 40
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {mapping.weight}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {mapping.min_proficiency_level || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {mapping.is_required ? (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMapping(mapping.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
