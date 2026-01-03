import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Users, Shield, BarChart3, Building2, ArrowRight, Sparkles } from "lucide-react";
import { useDemoExperiences } from "@/hooks/useDemoExperience";
import { useDemoSession } from "@/hooks/useDemoSession";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PersonalizationModal } from "./components/PersonalizationModal";

const audienceIcons: Record<string, React.ReactNode> = {
  "hr-leaders": <Users className="h-6 w-6" />,
  "payroll-managers": <BarChart3 className="h-6 w-6" />,
  "it-admins": <Shield className="h-6 w-6" />,
  "quick-overview": <Sparkles className="h-6 w-6" />,
};

const audienceColors: Record<string, string> = {
  "hr-leaders": "from-primary/20 to-primary/5",
  "payroll-managers": "from-emerald-500/20 to-emerald-500/5",
  "it-admins": "from-violet-500/20 to-violet-500/5",
  "quick-overview": "from-amber-500/20 to-amber-500/5",
};

export default function ProductTourLandingPage() {
  const navigate = useNavigate();
  const { data: experiences, isLoading } = useDemoExperiences();
  const { session, trackEvent, updatePersonalization } = useDemoSession();
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);

  const handleExperienceSelect = async (experienceCode: string) => {
    setSelectedExperience(experienceCode);
    
    // Track experience selection
    await trackEvent("experience_start", { experience_code: experienceCode });
    
    // If quick overview, skip personalization
    if (experienceCode === "quick-overview") {
      navigate(`/product-tour/${experienceCode}`);
      return;
    }
    
    // Show personalization for other experiences
    setShowPersonalization(true);
  };

  const handlePersonalizationComplete = async (answers: Record<string, unknown>) => {
    await updatePersonalization(answers);
    setShowPersonalization(false);
    if (selectedExperience) {
      navigate(`/product-tour/${selectedExperience}`);
    }
  };

  const handleSkipPersonalization = () => {
    setShowPersonalization(false);
    if (selectedExperience) {
      navigate(`/product-tour/${selectedExperience}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Interactive Product Tour | intellihrm</title>
        <meta
          name="description"
          content="Explore intellihrm's AI-powered HRMS through personalized video tours. Choose your role and see how we can transform your HR operations."
        />
      </Helmet>

      <MarketingHeader />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Play className="h-3 w-3 mr-1" />
                Self-Guided Product Tour
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                See intellihrm in Action
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose an experience tailored to your role and discover how intellihrm 
                can transform HR operations for your organization.
              </p>
            </div>

            {/* Experience Cards */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {experiences?.map((experience) => (
                  <Card
                    key={experience.id}
                    className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                    onClick={() => handleExperienceSelect(experience.experience_code)}
                  >
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${audienceColors[experience.experience_code] || "from-primary/20 to-primary/5"} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        {audienceIcons[experience.experience_code] || <Building2 className="h-6 w-6" />}
                      </div>
                      <CardTitle className="text-lg">{experience.experience_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {experience.estimated_duration_minutes} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {experience.description}
                      </p>
                      <Button 
                        variant="ghost" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Start Tour
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Join organizations across the Caribbean and Africa
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50">
                <div className="h-8 w-24 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-8 w-28 bg-muted rounded" />
                <div className="h-8 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">What You'll Discover</h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-background rounded-lg">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    See how our AI anticipates HR needs before they become issues.
                  </p>
                </div>
                <div className="p-6 bg-background rounded-lg">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Regional Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic updates for Caribbean and African labor laws.
                  </p>
                </div>
                <div className="p-6 bg-background rounded-lg">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Unified Platform</h3>
                  <p className="text-sm text-muted-foreground">
                    All HR modules working together seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PersonalizationModal
        open={showPersonalization}
        onClose={handleSkipPersonalization}
        onComplete={handlePersonalizationComplete}
      />
    </>
  );
}
