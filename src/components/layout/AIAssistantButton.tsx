import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AIAssistantDialog } from "@/components/ai/AIAssistantDialog";

export function AIAssistantButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="relative"
          >
            <Brain 
              className={`h-5 w-5 text-sky-400 ${open ? "animate-heartbeat" : ""}`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("navigation.aiAssistant")}</TooltipContent>
      </Tooltip>

      <AIAssistantDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
