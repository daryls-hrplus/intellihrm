-- Create industry_occupation_mappings table for Quick Start Wizard
CREATE TABLE public.industry_occupation_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry_code VARCHAR(50) NOT NULL,
  industry_name VARCHAR(255) NOT NULL,
  industry_name_en VARCHAR(255),
  industry_icon VARCHAR(100),
  occupation_uri TEXT NOT NULL,
  occupation_label VARCHAR(500) NOT NULL,
  occupation_label_en VARCHAR(500),
  priority INTEGER DEFAULT 1,
  is_core_occupation BOOLEAN DEFAULT true,
  skill_count_estimate INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_industry_occupation_industry_code ON public.industry_occupation_mappings(industry_code);
CREATE INDEX idx_industry_occupation_priority ON public.industry_occupation_mappings(industry_code, priority);
CREATE UNIQUE INDEX idx_industry_occupation_unique ON public.industry_occupation_mappings(industry_code, occupation_uri);

-- Enable RLS
ALTER TABLE public.industry_occupation_mappings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read (this is reference data)
CREATE POLICY "Anyone can read industry mappings" 
ON public.industry_occupation_mappings 
FOR SELECT 
USING (true);

-- Insert pre-populated industry-occupation mappings
-- Healthcare & Social Services
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('HEALTHCARE', 'Healthcare & Social Services', 'Heart', 'http://data.europa.eu/esco/occupation/f2b15a0e-e65a-438a-affb-29b9d50b77d1', 'General practitioner', 1, 45),
('HEALTHCARE', 'Healthcare & Social Services', 'Heart', 'http://data.europa.eu/esco/occupation/42eb2d87-a465-4344-bb87-44c0528bb5a5', 'Registered nurse', 2, 55),
('HEALTHCARE', 'Healthcare & Social Services', 'Heart', 'http://data.europa.eu/esco/occupation/6fbe5b3d-8e86-4e1c-b28b-09e8b85eafba', 'Pharmacist', 3, 40),
('HEALTHCARE', 'Healthcare & Social Services', 'Heart', 'http://data.europa.eu/esco/occupation/21f688d1-a66a-4d3a-8e8d-e8e8dd0c6a82', 'Medical laboratory technician', 4, 35),
('HEALTHCARE', 'Healthcare & Social Services', 'Heart', 'http://data.europa.eu/esco/occupation/80d1d1d6-faca-46dd-9ea6-64a30d4c5ae6', 'Physiotherapist', 5, 38);

-- Information Technology
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('IT', 'Information Technology', 'Monitor', 'http://data.europa.eu/esco/occupation/f2b15a0e-e65a-438a-affb-29b9d50b77d2', 'Software developer', 1, 65),
('IT', 'Information Technology', 'Monitor', 'http://data.europa.eu/esco/occupation/7e58fc55-a7d5-404e-b5ba-f9b17b5d8c09', 'Database administrator', 2, 45),
('IT', 'Information Technology', 'Monitor', 'http://data.europa.eu/esco/occupation/557d1c6b-6e08-4d0b-ae33-9e5f8c4b6d42', 'Network administrator', 3, 40),
('IT', 'Information Technology', 'Monitor', 'http://data.europa.eu/esco/occupation/c40a2919-48a9-40ea-b795-1a4e64e9cbe2', 'ICT project manager', 4, 50),
('IT', 'Information Technology', 'Monitor', 'http://data.europa.eu/esco/occupation/b2b92c31-5b10-4a20-a5eb-10c4c5d61d03', 'Data analyst', 5, 48);

-- Financial Services & Insurance
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('FINANCE', 'Financial Services & Insurance', 'Landmark', 'http://data.europa.eu/esco/occupation/8e6ad1f0-d8c3-4d28-8a4e-1c9eda8c6f37', 'Financial analyst', 1, 52),
('FINANCE', 'Financial Services & Insurance', 'Landmark', 'http://data.europa.eu/esco/occupation/9a5e9d8a-7f6c-4c83-b5d2-3e8f7a9b0c12', 'Accountant', 2, 48),
('FINANCE', 'Financial Services & Insurance', 'Landmark', 'http://data.europa.eu/esco/occupation/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Insurance underwriter', 3, 35),
('FINANCE', 'Financial Services & Insurance', 'Landmark', 'http://data.europa.eu/esco/occupation/d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Compliance officer', 4, 42),
('FINANCE', 'Financial Services & Insurance', 'Landmark', 'http://data.europa.eu/esco/occupation/e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'Bank manager', 5, 55);

-- Retail & Wholesale Trade
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('RETAIL', 'Retail & Wholesale Trade', 'ShoppingCart', 'http://data.europa.eu/esco/occupation/5f6a7b8c-9d0e-4f1a-2b3c-4d5e6f7a8b9c', 'Store manager', 1, 40),
('RETAIL', 'Retail & Wholesale Trade', 'ShoppingCart', 'http://data.europa.eu/esco/occupation/6a7b8c9d-0e1f-4a2b-3c4d-5e6f7a8b9c0d', 'Sales representative', 2, 35),
('RETAIL', 'Retail & Wholesale Trade', 'ShoppingCart', 'http://data.europa.eu/esco/occupation/7b8c9d0e-1f2a-4b3c-4d5e-6f7a8b9c0d1e', 'Purchasing manager', 3, 45),
('RETAIL', 'Retail & Wholesale Trade', 'ShoppingCart', 'http://data.europa.eu/esco/occupation/8c9d0e1f-2a3b-4c4d-5e6f-7a8b9c0d1e2f', 'Supply chain coordinator', 4, 42),
('RETAIL', 'Retail & Wholesale Trade', 'ShoppingCart', 'http://data.europa.eu/esco/occupation/9d0e1f2a-3b4c-4d5e-6f7a-8b9c0d1e2f3a', 'Customer service manager', 5, 38);

-- Manufacturing
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('MANUFACTURING', 'Manufacturing', 'Factory', 'http://data.europa.eu/esco/occupation/0e1f2a3b-4c5d-4e6f-7a8b-9c0d1e2f3a4b', 'Production manager', 1, 50),
('MANUFACTURING', 'Manufacturing', 'Factory', 'http://data.europa.eu/esco/occupation/1f2a3b4c-5d6e-4f7a-8b9c-0d1e2f3a4b5c', 'Quality control technician', 2, 42),
('MANUFACTURING', 'Manufacturing', 'Factory', 'http://data.europa.eu/esco/occupation/2a3b4c5d-6e7f-4a8b-9c0d-1e2f3a4b5c6d', 'Industrial engineer', 3, 55),
('MANUFACTURING', 'Manufacturing', 'Factory', 'http://data.europa.eu/esco/occupation/3b4c5d6e-7f8a-4b9c-0d1e-2f3a4b5c6d7e', 'Maintenance technician', 4, 45),
('MANUFACTURING', 'Manufacturing', 'Factory', 'http://data.europa.eu/esco/occupation/4c5d6e7f-8a9b-4c0d-1e2f-3a4b5c6d7e8f', 'Health and safety officer', 5, 40);

-- Construction
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('CONSTRUCTION', 'Construction', 'Building', 'http://data.europa.eu/esco/occupation/5d6e7f8a-9b0c-4d1e-2f3a-4b5c6d7e8f9a', 'Construction project manager', 1, 55),
('CONSTRUCTION', 'Construction', 'Building', 'http://data.europa.eu/esco/occupation/6e7f8a9b-0c1d-4e2f-3a4b-5c6d7e8f9a0b', 'Civil engineer', 2, 52),
('CONSTRUCTION', 'Construction', 'Building', 'http://data.europa.eu/esco/occupation/7f8a9b0c-1d2e-4f3a-4b5c-6d7e8f9a0b1c', 'Architect', 3, 48),
('CONSTRUCTION', 'Construction', 'Building', 'http://data.europa.eu/esco/occupation/8a9b0c1d-2e3f-4a4b-5c6d-7e8f9a0b1c2d', 'Electrical installer', 4, 40),
('CONSTRUCTION', 'Construction', 'Building', 'http://data.europa.eu/esco/occupation/9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 'Surveyor', 5, 45);

-- Education
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('EDUCATION', 'Education', 'GraduationCap', 'http://data.europa.eu/esco/occupation/0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 'Secondary school teacher', 1, 42),
('EDUCATION', 'Education', 'GraduationCap', 'http://data.europa.eu/esco/occupation/1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a', 'University lecturer', 2, 45),
('EDUCATION', 'Education', 'GraduationCap', 'http://data.europa.eu/esco/occupation/2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 'School principal', 3, 50),
('EDUCATION', 'Education', 'GraduationCap', 'http://data.europa.eu/esco/occupation/3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 'Training coordinator', 4, 38),
('EDUCATION', 'Education', 'GraduationCap', 'http://data.europa.eu/esco/occupation/4a5b6c7d-8e9f-4a0b-1c2d-3e4f5a6b7c8d', 'Education counsellor', 5, 35);

-- Hospitality & Tourism
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('HOSPITALITY', 'Hospitality & Tourism', 'UtensilsCrossed', 'http://data.europa.eu/esco/occupation/5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Hotel manager', 1, 52),
('HOSPITALITY', 'Hospitality & Tourism', 'UtensilsCrossed', 'http://data.europa.eu/esco/occupation/6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'Restaurant manager', 2, 45),
('HOSPITALITY', 'Hospitality & Tourism', 'UtensilsCrossed', 'http://data.europa.eu/esco/occupation/7d8e9f0a-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 'Chef', 3, 40),
('HOSPITALITY', 'Hospitality & Tourism', 'UtensilsCrossed', 'http://data.europa.eu/esco/occupation/8e9f0a1b-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'Tour guide', 4, 35),
('HOSPITALITY', 'Hospitality & Tourism', 'UtensilsCrossed', 'http://data.europa.eu/esco/occupation/9f0a1b2c-3d4e-4f5a-6b7c-8d9e0f1a2b3c', 'Events coordinator', 5, 42);

-- Agriculture
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('AGRICULTURE', 'Agriculture', 'Leaf', 'http://data.europa.eu/esco/occupation/0a1b2c3d-4e5f-4a6b-7c8d-9e0f1a2b3c4d', 'Farm manager', 1, 45),
('AGRICULTURE', 'Agriculture', 'Leaf', 'http://data.europa.eu/esco/occupation/1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e', 'Agronomist', 2, 48),
('AGRICULTURE', 'Agriculture', 'Leaf', 'http://data.europa.eu/esco/occupation/2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f', 'Agricultural technician', 3, 40),
('AGRICULTURE', 'Agriculture', 'Leaf', 'http://data.europa.eu/esco/occupation/3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a', 'Veterinarian', 4, 55),
('AGRICULTURE', 'Agriculture', 'Leaf', 'http://data.europa.eu/esco/occupation/4e5f6a7b-8c9d-4e0f-1a2b-3c4d5e6f7a8b', 'Food safety inspector', 5, 42);

-- Public Administration
INSERT INTO public.industry_occupation_mappings (industry_code, industry_name, industry_icon, occupation_uri, occupation_label, priority, skill_count_estimate) VALUES
('PUBLIC_ADMIN', 'Public Administration', 'Building2', 'http://data.europa.eu/esco/occupation/5f6a7b8c-9d0e-4f1a-2b3c-4d5e6f7a8b9d', 'Public administration manager', 1, 50),
('PUBLIC_ADMIN', 'Public Administration', 'Building2', 'http://data.europa.eu/esco/occupation/6a7b8c9d-0e1f-4a2b-3c4d-5e6f7a8b9c0e', 'Policy analyst', 2, 45),
('PUBLIC_ADMIN', 'Public Administration', 'Building2', 'http://data.europa.eu/esco/occupation/7b8c9d0e-1f2a-4b3c-4d5e-6f7a8b9c0d1f', 'Human resources officer', 3, 48),
('PUBLIC_ADMIN', 'Public Administration', 'Building2', 'http://data.europa.eu/esco/occupation/8c9d0e1f-2a3b-4c4d-5e6f-7a8b9c0d1e2a', 'Public relations specialist', 4, 40),
('PUBLIC_ADMIN', 'Public Administration', 'Building2', 'http://data.europa.eu/esco/occupation/9d0e1f2a-3b4c-4d5e-6f7a-8b9c0d1e2f3b', 'Legal adviser', 5, 52);

-- Create updated_at trigger
CREATE TRIGGER update_industry_occupation_mappings_updated_at
BEFORE UPDATE ON public.industry_occupation_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();