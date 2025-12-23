import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DeleteCompensationHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onSuccess: () => void;
}

export function DeleteCompensationHistoryDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: DeleteCompensationHistoryDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!record?.id) return;

    setIsDeleting(true);
    try {
      // @ts-ignore - Supabase type instantiation issue
      const { error } = await supabase
        .from("compensation_history")
        .delete()
        .eq("id", record.id);

      if (error) throw error;

      toast.success(t("compensation.history.recordDeleted"));
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("common.error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("compensation.history.deleteRecord")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("compensation.history.deleteConfirmation", {
              employee: record?.employee?.full_name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
