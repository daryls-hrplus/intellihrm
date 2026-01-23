import { Card, CardContent } from "@/components/ui/card";
import { Target, Award, Briefcase, TrendingUp, Heart } from "lucide-react";

interface ScoreSummaryProps {
  competencyScore: number | null;
  responsibilityScore: number | null;
  goalScore: number | null;
  valuesScore?: number | null;
  overallScore: number | null;
  weights: {
    competency: number;
    responsibility: number;
    goal: number;
    values?: number;
  };
}

export function AppraisalScoreSummaryCards({
  competencyScore,
  responsibilityScore,
  goalScore,
  valuesScore,
  overallScore,
  weights,
}: ScoreSummaryProps) {
  const formatScore = (score: number | null) => {
    if (score === null) return "—";
    return `${score.toFixed(0)}%`;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const cards = [
    {
      title: "Competencies",
      score: competencyScore,
      weight: weights.competency,
      icon: Award,
      show: weights.competency > 0,
    },
    {
      title: "Responsibilities",
      score: responsibilityScore,
      weight: weights.responsibility,
      icon: Briefcase,
      show: weights.responsibility > 0,
    },
    {
      title: "Goals",
      score: goalScore,
      weight: weights.goal,
      icon: Target,
      show: weights.goal > 0,
    },
    {
      title: "Values",
      score: valuesScore ?? null,
      weight: weights.values ?? 0,
      icon: Heart,
      show: (weights.values ?? 0) > 0,
    },
    {
      title: "Overall",
      score: overallScore,
      weight: null,
      icon: TrendingUp,
      show: true,
      isOverall: true,
    },
  ].filter(c => c.show);

  // Dynamic grid based on number of cards
  const getGridCols = () => {
    if (cards.length >= 5) return "grid-cols-5";
    if (cards.length === 4) return "grid-cols-4";
    if (cards.length === 3) return "grid-cols-3";
    if (cards.length === 2) return "grid-cols-2";
    return "grid-cols-1";
  };

  return (
    <div className={`grid gap-3 ${getGridCols()}`}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.title} 
            className={`${card.isOverall ? "border-primary/40 bg-primary/5" : "bg-muted/30"}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${card.isOverall ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs text-muted-foreground">{card.title}</span>
                {card.weight !== null && (
                  <span className="text-[10px] text-muted-foreground/60 ml-auto">
                    ({card.weight}%)
                  </span>
                )}
              </div>
              <div className={`text-xl font-bold ${getScoreColor(card.score)}`}>
                {formatScore(card.score)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}