import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Pencil, Trash2, History, Loader2, Languages, Star, Globe } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { LanguageFormDialog, LanguageFormData } from "./LanguageFormDialog";
import { LanguageHistoryModal } from "./LanguageHistoryModal";
import { NUMERIC_PROFICIENCY, CEFR_PROFICIENCY } from "@/constants/languageConstants";

interface EmployeeLanguagesTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

interface EmployeeLanguage {
  id: string;
  employee_id: string;
  company_id: string | null;
  language_code: string;
  language_name: string;
  proficiency_scale: string;
  overall_proficiency: string | null;
  speaking_proficiency: string | null;
  reading_proficiency: string | null;
  writing_proficiency: string | null;
  certification_exam: string | null;
  certification_score: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  is_primary: boolean;
  is_native: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function EmployeeLanguagesTab({ employeeId, viewType = "hr" }: EmployeeLanguagesTabProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<EmployeeLanguage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyLanguage, setHistoryLanguage] = useState<{ id: string; name: string } | null>(null);

  const { data: languages, isLoading } = useQuery({
    queryKey: ["employee-languages", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_languages")
        .select("*")
        .eq("employee_id", employeeId)
        .order("is_primary", { ascending: false })
        .order("language_name", { ascending: true });

      if (error) throw error;
      return data as EmployeeLanguage[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LanguageFormData) => {
      const payload = {
        employee_id: employeeId,
        language_code: data.language_code,
        language_name: data.language_name,
        proficiency_scale: data.proficiency_scale,
        overall_proficiency: data.overall_proficiency || null,
        speaking_proficiency: data.speaking_proficiency || null,
        reading_proficiency: data.reading_proficiency || null,
        writing_proficiency: data.writing_proficiency || null,
        certification_exam: data.certification_exam || null,
        certification_score: data.certification_score || null,
        effective_date: data.effective_date || null,
        expiry_date: data.expiry_date || null,
        is_primary: data.is_primary,
        is_native: data.is_native,
        notes: data.notes || null,
        updated_by: user?.id,
      };

      if (editingLanguage) {
        const { error } = await supabase
          .from("employee_languages")
          .update(payload)
          .eq("id", editingLanguage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("employee_languages")
          .insert({ ...payload, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-languages", employeeId] });
      toast.success(editingLanguage ? "Language updated" : "Language added");
      closeDialog();
    },
    onError: (error) => {
      console.error("Error saving language:", error);
      toast.error("Failed to save language");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_languages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-languages", employeeId] });
      toast.success("Language deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete language"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingLanguage(null);
  };

  const handleEdit = (language: EmployeeLanguage) => {
    setEditingLanguage(language);
    setIsDialogOpen(true);
  };

  const getProficiencyBadge = (value: string | null, scale: string) => {
    if (!value) return <span className="text-muted-foreground">-</span>;
    
    const options = scale === "cefr" ? CEFR_PROFICIENCY : NUMERIC_PROFICIENCY;
    const found = options.find(o => o.value === value);
    
    const colorMap: Record<string, string> = {
      "1": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      "2": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "3": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "4": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "5": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "A1": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      "A2": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "B1": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "B2": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "C1": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      "C2": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };

    return (
      <Badge className={colorMap[value] || "bg-muted text-muted-foreground"}>
        {found?.label.split(" – ")[0] || value}
      </Badge>
    );
  };

  const canEdit = viewType === "hr" || viewType === "ess";
  const canDelete = viewType === "hr";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Languages
        </CardTitle>
        {canEdit && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Language
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !languages?.length ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No languages recorded.</p>
            {canEdit && (
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Add First Language
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead>Overall</TableHead>
                <TableHead>Speaking</TableHead>
                <TableHead>Reading</TableHead>
                <TableHead>Writing</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((lang) => (
                <TableRow key={lang.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lang.language_name}</span>
                      <span className="text-xs text-muted-foreground uppercase">
                        ({lang.language_code})
                      </span>
                      {lang.is_primary && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                      {lang.is_native && (
                        <Badge variant="outline" className="text-xs">Native</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getProficiencyBadge(lang.overall_proficiency, lang.proficiency_scale)}</TableCell>
                  <TableCell>{getProficiencyBadge(lang.speaking_proficiency, lang.proficiency_scale)}</TableCell>
                  <TableCell>{getProficiencyBadge(lang.reading_proficiency, lang.proficiency_scale)}</TableCell>
                  <TableCell>{getProficiencyBadge(lang.writing_proficiency, lang.proficiency_scale)}</TableCell>
                  <TableCell>
                    {lang.certification_exam ? (
                      <div className="text-sm">
                        <span>{lang.certification_exam}</span>
                        {lang.certification_score && (
                          <span className="text-muted-foreground"> ({lang.certification_score})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lang.effective_date ? formatDateForDisplay(lang.effective_date, "PP") : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit && (
                          <DropdownMenuItem onClick={() => handleEdit(lang)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setHistoryLanguage({ id: lang.id, name: lang.language_name })}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => setDeleteId(lang.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <LanguageFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => saveMutation.mutate(data)}
        initialData={editingLanguage ? {
          language_code: editingLanguage.language_code,
          language_name: editingLanguage.language_name,
          proficiency_scale: editingLanguage.proficiency_scale as "numeric" | "cefr",
          overall_proficiency: editingLanguage.overall_proficiency || "",
          speaking_proficiency: editingLanguage.speaking_proficiency || "",
          reading_proficiency: editingLanguage.reading_proficiency || "",
          writing_proficiency: editingLanguage.writing_proficiency || "",
          certification_exam: editingLanguage.certification_exam || "",
          certification_score: editingLanguage.certification_score || "",
          effective_date: editingLanguage.effective_date || "",
          expiry_date: editingLanguage.expiry_date || "",
          is_primary: editingLanguage.is_primary,
          is_native: editingLanguage.is_native,
          notes: editingLanguage.notes || "",
        } : undefined}
        isEditing={!!editingLanguage}
        isLoading={saveMutation.isPending}
        viewType={viewType}
      />

      {historyLanguage && (
        <LanguageHistoryModal
          open={!!historyLanguage}
          onOpenChange={() => setHistoryLanguage(null)}
          languageRecordId={historyLanguage.id}
          languageName={historyLanguage.name}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Language?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The language record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
