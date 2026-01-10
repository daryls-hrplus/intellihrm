import { LucideIcon, BookOpen, Target, CheckCircle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ActTheme = "prologue" | "act1" | "act2" | "act3" | "act4" | "act5" | "epilogue";

interface ActThemeConfig {
  title: string;
  description: string;
}

interface ActDividerProps {
  act: ActTheme;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  id?: string;
  /** Story narrative - the compelling story context for this act */
  narrative?: string;
  /** Key themes - 4 major themes covered in this act */
  themes?: ActThemeConfig[];
  /** Outcome previews - what users will achieve */
  outcomes?: string[];
  /** Modules covered in this act */
  modules?: string[];
}

const ACT_CONFIG: Record<ActTheme, { gradient: string; iconBg: string; textColor: string; themeBg: string; accentColor: string }> = {
  prologue: {
    gradient: "from-slate-600/20 via-slate-500/10 to-transparent",
    iconBg: "bg-slate-600/20 text-slate-500",
    textColor: "text-slate-600",
    themeBg: "bg-slate-500/10 border-slate-500/20",
    accentColor: "bg-slate-500",
  },
  act1: {
    gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    iconBg: "bg-blue-600/20 text-blue-500",
    textColor: "text-blue-600",
    themeBg: "bg-blue-500/10 border-blue-500/20",
    accentColor: "bg-blue-500",
  },
  act2: {
    gradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-600/20 text-emerald-500",
    textColor: "text-emerald-600",
    themeBg: "bg-emerald-500/10 border-emerald-500/20",
    accentColor: "bg-emerald-500",
  },
  act3: {
    gradient: "from-amber-600/20 via-amber-500/10 to-transparent",
    iconBg: "bg-amber-600/20 text-amber-500",
    textColor: "text-amber-600",
    themeBg: "bg-amber-500/10 border-amber-500/20",
    accentColor: "bg-amber-500",
  },
  act4: {
    gradient: "from-purple-600/20 via-purple-500/10 to-transparent",
    iconBg: "bg-purple-600/20 text-purple-500",
    textColor: "text-purple-600",
    themeBg: "bg-purple-500/10 border-purple-500/20",
    accentColor: "bg-purple-500",
  },
  act5: {
    gradient: "from-red-600/20 via-red-500/10 to-transparent",
    iconBg: "bg-red-600/20 text-red-500",
    textColor: "text-red-600",
    themeBg: "bg-red-500/10 border-red-500/20",
    accentColor: "bg-red-500",
  },
  epilogue: {
    gradient: "from-indigo-600/20 via-indigo-500/10 to-transparent",
    iconBg: "bg-indigo-600/20 text-indigo-500",
    textColor: "text-indigo-600",
    themeBg: "bg-indigo-500/10 border-indigo-500/20",
    accentColor: "bg-indigo-500",
  },
};

export function ActDivider({ 
  act, 
  title, 
  subtitle, 
  icon: Icon, 
  id,
  narrative,
  themes,
  outcomes,
  modules
}: ActDividerProps) {
  const config = ACT_CONFIG[act];
  const isEnhanced = narrative || themes || outcomes || modules;

  // Simple version for backward compatibility
  if (!isEnhanced) {
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

  // Enhanced rich narrative version
  return (
    <div 
      className={cn(
        "relative py-8 px-6 rounded-xl bg-gradient-to-r border border-border/30",
        config.gradient
      )}
      id={id}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("p-4 rounded-xl", config.iconBg)}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h2 className={cn("text-2xl font-bold", config.textColor)}>{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Narrative Story */}
      {narrative && (
        <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className={cn("h-4 w-4", config.textColor)} />
            <span className={cn("text-xs font-semibold uppercase tracking-wide", config.textColor)}>
              The Story
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{narrative}"
          </p>
        </div>
      )}

      {/* Themes and Outcomes Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Themes */}
        {themes && themes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className={cn("h-4 w-4", config.textColor)} />
              <span className={cn("text-xs font-semibold uppercase tracking-wide", config.textColor)}>
                Key Themes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    config.themeBg
                  )}
                >
                  <p className="text-xs font-semibold text-foreground">{theme.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outcome Previews */}
        {outcomes && outcomes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className={cn("h-4 w-4", config.textColor)} />
              <span className={cn("text-xs font-semibold uppercase tracking-wide", config.textColor)}>
                What You'll Achieve
              </span>
            </div>
            <ul className="space-y-2">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", config.accentColor)} />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modules in This Act */}
      {modules && modules.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Layers className={cn("h-4 w-4", config.textColor)} />
            <span className={cn("text-xs font-semibold uppercase tracking-wide", config.textColor)}>
              Modules in This Act
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {modules.map((module, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={cn("text-xs", config.themeBg)}
              >
                {module}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
