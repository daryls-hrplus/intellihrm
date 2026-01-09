import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ActTheme = "prologue" | "act1" | "act2" | "act3" | "act4" | "act5" | "epilogue";

interface ActDividerProps {
  act: ActTheme;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  id?: string;
}

const ACT_CONFIG: Record<ActTheme, { gradient: string; iconBg: string; textColor: string }> = {
  prologue: {
    gradient: "from-slate-600/20 via-slate-500/10 to-transparent",
    iconBg: "bg-slate-600/20 text-slate-500",
    textColor: "text-slate-600",
  },
  act1: {
    gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    iconBg: "bg-blue-600/20 text-blue-500",
    textColor: "text-blue-600",
  },
  act2: {
    gradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-600/20 text-emerald-500",
    textColor: "text-emerald-600",
  },
  act3: {
    gradient: "from-amber-600/20 via-amber-500/10 to-transparent",
    iconBg: "bg-amber-600/20 text-amber-500",
    textColor: "text-amber-600",
  },
  act4: {
    gradient: "from-purple-600/20 via-purple-500/10 to-transparent",
    iconBg: "bg-purple-600/20 text-purple-500",
    textColor: "text-purple-600",
  },
  act5: {
    gradient: "from-red-600/20 via-red-500/10 to-transparent",
    iconBg: "bg-red-600/20 text-red-500",
    textColor: "text-red-600",
  },
  epilogue: {
    gradient: "from-indigo-600/20 via-indigo-500/10 to-transparent",
    iconBg: "bg-indigo-600/20 text-indigo-500",
    textColor: "text-indigo-600",
  },
};

export function ActDivider({ act, title, subtitle, icon: Icon, id }: ActDividerProps) {
  const config = ACT_CONFIG[act];

  return (
    <div 
      className={cn(
        "relative py-8 px-6 rounded-xl bg-gradient-to-r",
        config.gradient
      )}
      id={id}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-4 rounded-xl", config.iconBg)}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h2 className={cn("text-2xl font-bold", config.textColor)}>{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
