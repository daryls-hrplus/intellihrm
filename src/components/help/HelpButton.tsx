import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { HelpVideoPanel } from "./HelpVideoPanel";

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-0"
        onClick={() => setOpen(true)}
        aria-label="Help videos"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
      <HelpVideoPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
