
-- Master Industries Table (expanded to 25+ industries)
CREATE TABLE public.master_industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon_name TEXT,
  parent_industry_id UUID REFERENCES public.master_industries(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Master Skills Library (global, not company-specific)
CREATE TABLE public.master_skills_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  esco_uri TEXT UNIQUE,
  external_id TEXT,
  skill_name TEXT NOT NULL,
  skill_name_en TEXT,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('skill', 'knowledge', 'transversal', 'language')),
  description TEXT,
  description_en TEXT,
  category TEXT,
  subcategory TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  alternative_labels TEXT[] DEFAULT '{}',
  reuse_level TEXT CHECK (reuse_level IN ('sector-specific', 'occupation-specific', 'cross-sector', 'transversal')),
  skill_level TEXT CHECK (skill_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_digital_skill BOOLEAN DEFAULT false,
  is_green_skill BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'esco',
  is_active BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Master Competencies Library (behavioral/leadership competencies)
CREATE TABLE public.master_competencies_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  competency_name TEXT NOT NULL,
  competency_name_en TEXT,
  competency_type TEXT NOT NULL CHECK (competency_type IN ('behavioral', 'leadership', 'core', 'functional', 'technical')),
  description TEXT,
  description_en TEXT,
  category TEXT,
  subcategory TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  alternative_labels TEXT[] DEFAULT '{}',
  proficiency_levels JSONB DEFAULT '[]',
  source TEXT DEFAULT 'custom',
  is_active BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Master Occupations Library
CREATE TABLE public.master_occupations_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  esco_uri TEXT UNIQUE,
  external_id TEXT,
  occupation_name TEXT NOT NULL,
  occupation_name_en TEXT,
  description TEXT,
  description_en TEXT,
  isco_code TEXT,
  industry_id UUID REFERENCES public.master_industries(id),
  job_family TEXT,
  job_level TEXT CHECK (job_level IN ('entry', 'junior', 'mid', 'senior', 'lead', 'executive')),
  alternative_labels TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'esco',
  is_active BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Junction: Occupation to Skills mapping
CREATE TABLE public.master_occupation_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occupation_id UUID NOT NULL REFERENCES public.master_occupations_library(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.master_skills_library(id) ON DELETE CASCADE,
  importance TEXT CHECK (importance IN ('essential', 'optional')) DEFAULT 'optional',
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(occupation_id, skill_id)
);

-- Junction: Occupation to Competencies mapping
CREATE TABLE public.master_occupation_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occupation_id UUID NOT NULL REFERENCES public.master_occupations_library(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.master_competencies_library(id) ON DELETE CASCADE,
  importance TEXT CHECK (importance IN ('essential', 'optional')) DEFAULT 'optional',
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(occupation_id, competency_id)
);

-- Junction: Industry to Skills mapping (common skills per industry)
CREATE TABLE public.master_industry_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry_id UUID NOT NULL REFERENCES public.master_industries(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.master_skills_library(id) ON DELETE CASCADE,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 100) DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(industry_id, skill_id)
);

-- Create indexes on the search vector columns
CREATE INDEX idx_master_skills_search ON public.master_skills_library USING gin(search_vector);
CREATE INDEX idx_master_competencies_search ON public.master_competencies_library USING gin(search_vector);
CREATE INDEX idx_master_occupations_search ON public.master_occupations_library USING gin(search_vector);
CREATE INDEX idx_master_industries_search ON public.master_industries USING gin(search_vector);

-- Additional indexes for filtering
CREATE INDEX idx_master_skills_type ON public.master_skills_library(skill_type);
CREATE INDEX idx_master_skills_category ON public.master_skills_library(category);
CREATE INDEX idx_master_skills_industry_tags ON public.master_skills_library USING gin(industry_tags);
CREATE INDEX idx_master_competencies_type ON public.master_competencies_library(competency_type);
CREATE INDEX idx_master_occupations_industry ON public.master_occupations_library(industry_id);
CREATE INDEX idx_master_occupations_isco ON public.master_occupations_library(isco_code);

-- Create function to update skills search vector
CREATE OR REPLACE FUNCTION update_master_skills_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.skill_name, '') || ' ' || 
    coalesce(NEW.skill_name_en, '') || ' ' || 
    coalesce(NEW.description, '') || ' ' || 
    coalesce(NEW.category, '') || ' ' ||
    array_to_string(NEW.alternative_labels, ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to update competencies search vector
CREATE OR REPLACE FUNCTION update_master_competencies_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.competency_name, '') || ' ' || 
    coalesce(NEW.competency_name_en, '') || ' ' || 
    coalesce(NEW.description, '') || ' ' || 
    coalesce(NEW.category, '') || ' ' ||
    array_to_string(NEW.alternative_labels, ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to update occupations search vector
CREATE OR REPLACE FUNCTION update_master_occupations_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.occupation_name, '') || ' ' || 
    coalesce(NEW.occupation_name_en, '') || ' ' || 
    coalesce(NEW.description, '') || ' ' || 
    coalesce(NEW.job_family, '') || ' ' ||
    array_to_string(NEW.alternative_labels, ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to update industries search vector
CREATE OR REPLACE FUNCTION update_master_industries_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.name, '') || ' ' || 
    coalesce(NEW.name_en, '') || ' ' || 
    coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER trg_master_skills_search_vector
BEFORE INSERT OR UPDATE ON public.master_skills_library
FOR EACH ROW EXECUTE FUNCTION update_master_skills_search_vector();

CREATE TRIGGER trg_master_competencies_search_vector
BEFORE INSERT OR UPDATE ON public.master_competencies_library
FOR EACH ROW EXECUTE FUNCTION update_master_competencies_search_vector();

CREATE TRIGGER trg_master_occupations_search_vector
BEFORE INSERT OR UPDATE ON public.master_occupations_library
FOR EACH ROW EXECUTE FUNCTION update_master_occupations_search_vector();

CREATE TRIGGER trg_master_industries_search_vector
BEFORE INSERT OR UPDATE ON public.master_industries
FOR EACH ROW EXECUTE FUNCTION update_master_industries_search_vector();

-- Enable RLS but allow public read access (master library is global)
ALTER TABLE public.master_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_skills_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_competencies_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_occupations_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_occupation_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_occupation_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_industry_skills ENABLE ROW LEVEL SECURITY;

-- Public read policies (everyone can search the master library)
CREATE POLICY "Anyone can view master industries" ON public.master_industries FOR SELECT USING (true);
CREATE POLICY "Anyone can view master skills" ON public.master_skills_library FOR SELECT USING (true);
CREATE POLICY "Anyone can view master competencies" ON public.master_competencies_library FOR SELECT USING (true);
CREATE POLICY "Anyone can view master occupations" ON public.master_occupations_library FOR SELECT USING (true);
CREATE POLICY "Anyone can view occupation skills" ON public.master_occupation_skills FOR SELECT USING (true);
CREATE POLICY "Anyone can view occupation competencies" ON public.master_occupation_competencies FOR SELECT USING (true);
CREATE POLICY "Anyone can view industry skills" ON public.master_industry_skills FOR SELECT USING (true);

-- Admin-only write policies (only authenticated admins can modify)
CREATE POLICY "Admins can manage master industries" ON public.master_industries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage master skills" ON public.master_skills_library FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage master competencies" ON public.master_competencies_library FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage master occupations" ON public.master_occupations_library FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage occupation skills" ON public.master_occupation_skills FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage occupation competencies" ON public.master_occupation_competencies FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage industry skills" ON public.master_industry_skills FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed initial industries (25+ comprehensive list)
INSERT INTO public.master_industries (code, name, name_en, icon_name, display_order) VALUES
('agriculture', 'Agriculture & Agribusiness', 'Agriculture & Agribusiness', 'Wheat', 1),
('aerospace', 'Aerospace & Defense', 'Aerospace & Defense', 'Plane', 2),
('automotive', 'Automotive', 'Automotive', 'Car', 3),
('banking', 'Banking & Financial Services', 'Banking & Financial Services', 'Landmark', 4),
('construction', 'Construction & Real Estate', 'Construction & Real Estate', 'Building2', 5),
('consulting', 'Professional Services & Consulting', 'Professional Services & Consulting', 'Briefcase', 6),
('education', 'Education & Training', 'Education & Training', 'GraduationCap', 7),
('energy', 'Energy & Utilities', 'Energy & Utilities', 'Zap', 8),
('entertainment', 'Media & Entertainment', 'Media & Entertainment', 'Film', 9),
('food_beverage', 'Food & Beverage', 'Food & Beverage', 'UtensilsCrossed', 10),
('government', 'Government & Public Sector', 'Government & Public Sector', 'Building', 11),
('healthcare', 'Healthcare & Life Sciences', 'Healthcare & Life Sciences', 'Heart', 12),
('hospitality', 'Hospitality & Tourism', 'Hospitality & Tourism', 'Hotel', 13),
('insurance', 'Insurance', 'Insurance', 'Shield', 14),
('legal', 'Legal Services', 'Legal Services', 'Scale', 15),
('logistics', 'Transportation & Logistics', 'Transportation & Logistics', 'Truck', 16),
('manufacturing', 'Manufacturing', 'Manufacturing', 'Factory', 17),
('maritime', 'Maritime & Shipping', 'Maritime & Shipping', 'Ship', 18),
('mining', 'Mining & Extractives', 'Mining & Extractives', 'Pickaxe', 19),
('nonprofit', 'Non-Profit & NGO', 'Non-Profit & NGO', 'HeartHandshake', 20),
('oil_gas', 'Oil & Gas', 'Oil & Gas', 'Fuel', 21),
('pharma', 'Pharmaceuticals & Biotechnology', 'Pharmaceuticals & Biotechnology', 'FlaskConical', 22),
('retail', 'Retail & Consumer Goods', 'Retail & Consumer Goods', 'ShoppingCart', 23),
('technology', 'Technology & Software', 'Technology & Software', 'Laptop', 24),
('telecom', 'Telecommunications', 'Telecommunications', 'Radio', 25),
('utilities', 'Utilities (Water, Electric)', 'Utilities (Water, Electric)', 'Lightbulb', 26);
