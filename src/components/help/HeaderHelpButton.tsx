import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlayCircle } from "lucide-react";
import { HelpVideoPanel } from "./HelpVideoPanel";

export function HeaderHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(true)}
              aria-label="Help videos"
            >
              <PlayCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help Videos</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <HelpVideoPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
