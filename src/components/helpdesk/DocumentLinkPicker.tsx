import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Link2, Loader2 } from "lucide-react";

interface DocumentLinkPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (document: { type: string; id: string; name: string; url?: string }) => void;
}

export function DocumentLinkPicker({ open, onOpenChange, onSelect }: DocumentLinkPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("letters");

  const { data: letterTemplates = [], isLoading: loadingLetters } = useQuery({
    queryKey: ["letter-templates-picker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letter_templates")
        .select("id, name, category, description")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: sopDocuments = [], isLoading: loadingSops } = useQuery<any[]>({
    queryKey: ["sop-documents-picker"],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await (supabase
        .from("sop_documents" as any)
        .select("id, title, category, status")
        .eq("status", "published")
        .order("title") as any);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const { data: policyDocuments = [], isLoading: loadingPolicies } = useQuery<any[]>({
    queryKey: ["policy-documents-picker"],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await (supabase
        .from("policy_documents" as any)
        .select("id, title, category, status")
        .eq("status", "published")
        .order("title") as any);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const filteredLetters = letterTemplates.filter((l: any) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSops = sopDocuments.filter((s: any) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPolicies = policyDocuments.filter((p: any) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (type: string, item: any) => {
    onSelect({
      type,
      id: item.id,
      name: type === "letter" ? item.name : item.title,
    });
    onOpenChange(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link HR Hub Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="pl-9"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="letters">
                Letters ({filteredLetters.length})
              </TabsTrigger>
              <TabsTrigger value="sops">
                SOPs ({filteredSops.length})
              </TabsTrigger>
              <TabsTrigger value="policies">
                Policies ({filteredPolicies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="letters">
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {loadingLetters ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredLetters.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No letter templates found</p>
                  ) : (
                    filteredLetters.map((letter: any) => (
                      <div
                        key={letter.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSelect("letter", letter)}
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{letter.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{letter.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{letter.category}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sops">
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {loadingSops ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredSops.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No SOPs found</p>
                  ) : (
                    filteredSops.map((sop: any) => (
                      <div
                        key={sop.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSelect("sop", sop)}
                      >
                        <FileText className="h-4 w-4 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{sop.title}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{sop.category}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="policies">
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {loadingPolicies ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredPolicies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No policy documents found</p>
                  ) : (
                    filteredPolicies.map((policy: any) => (
                      <div
                        key={policy.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSelect("policy", policy)}
                      >
                        <FileText className="h-4 w-4 text-purple-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{policy.title}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{policy.category}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
