import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  skill_name: string;
  category: string | null;
  skill_type: string | null;
  description: string | null;
  is_active: boolean;
}

export function SkillsLibraryTab() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["master-skills-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_skills_library")
        .select("id, skill_name, category, skill_type, description, is_active")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("skill_name", { ascending: true });
      if (error) throw error;
      return data as Skill[];
    },
  });

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(skills.map((s) => s.category).filter(Boolean))];
    return uniqueCategories.sort() as string[];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    let result = skills;
    
    if (selectedCategory !== "all") {
      result = result.filter((s) => s.category === selectedCategory);
    }
    
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.skill_name.toLowerCase().includes(lowerSearch) ||
          s.id.toLowerCase().includes(lowerSearch) ||
          (s.category?.toLowerCase().includes(lowerSearch)) ||
          (s.description?.toLowerCase().includes(lowerSearch))
      );
    }
    
    return result;
  }, [search, selectedCategory, skills]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied: ${code}`);
  };

  const handleDownloadCSV = () => {
    const headers = ["id", "skill_name", "category", "skill_type", "description"];
    const rows = filteredSkills.map((s) => [
      s.id, 
      s.skill_name, 
      s.category || "", 
      s.skill_type || "",
      s.description || ""
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skills_library${selectedCategory !== "all" ? `_${selectedCategory}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded skills library CSV");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredSkills.length} records
          </Badge>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Skill Name</TableHead>
                <TableHead className="w-40">Category</TableHead>
                <TableHead className="w-32">Type</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSkills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{skill.skill_name}</span>
                      {skill.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{skill.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {skill.category && (
                      <Badge variant="outline" className="font-normal">
                        {skill.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{skill.skill_type || "-"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(skill.skill_name)}
                      className="h-8 w-8"
                    >
                      {copiedCode === skill.skill_name ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Master skills library used for skill assessments, job requirements, and workforce planning.
      </p>
    </div>
  );
}
