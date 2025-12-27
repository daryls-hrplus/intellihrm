-- First, clear existing master_industries data to avoid duplicates
DELETE FROM master_industries;

-- Insert all 31 HRplus industries with codes and metadata
INSERT INTO master_industries (name, code, description, is_active, icon_name) VALUES
-- Original industries from screenshots
('Agriculture & Agribusiness', 'AGRI', 'Farming, livestock, agro-processing, and agricultural services', true, 'Wheat'),
('Aerospace & Defense', 'AERO', 'Aircraft manufacturing, defense systems, and aerospace services', true, 'Plane'),
('Automotive', 'AUTO', 'Vehicle manufacturing, parts, sales, and automotive services', true, 'Car'),
('Banking & Financial Services', 'BANK', 'Commercial banking, retail banking, and financial institutions', true, 'Landmark'),
('Construction & Real Estate', 'CONS', 'Building construction, civil engineering, and property development', true, 'Building2'),
('Professional Services', 'PROF', 'Consulting, advisory, and business services', true, 'Briefcase'),
('Education & Training', 'EDU', 'Schools, universities, training providers, and e-learning', true, 'GraduationCap'),
('Energy & Utilities', 'ENUT', 'Power generation, electricity distribution, and energy services', true, 'Zap'),
('Media & Entertainment', 'MEDIA', 'Broadcasting, publishing, film, music, and digital content', true, 'Film'),
('Food & Beverage', 'FOOD', 'Food processing, beverages, restaurants, and catering', true, 'UtensilsCrossed'),
('Government & Public Sector', 'GOV', 'Public administration, government agencies, and civil service', true, 'Building'),
('Healthcare & Life Sciences', 'HLTH', 'Hospitals, clinics, pharmaceuticals, and medical research', true, 'Heart'),
('Hospitality & Tourism', 'HOSP', 'Hotels, resorts, travel agencies, and tourism services', true, 'Hotel'),
('Insurance', 'INS', 'Life insurance, general insurance, and reinsurance', true, 'Shield'),
('Legal Services', 'LEGAL', 'Law firms, legal departments, and legal advisory', true, 'Scale'),
('Transportation & Logistics', 'LOG', 'Freight, warehousing, distribution, and supply chain', true, 'Truck'),
('Manufacturing', 'MFG', 'Industrial production, assembly, and factory operations', true, 'Factory'),
('Maritime & Shipping', 'SHIP', 'Shipping lines, ports, marine services, and logistics', true, 'Ship'),
('Mining & Extractives', 'MINE', 'Mining, quarrying, and mineral extraction', true, 'Mountain'),
('Non-Profit & NGO', 'NGO', 'Charitable organizations, foundations, and development agencies', true, 'HeartHandshake'),
('Oil & Gas', 'OILG', 'Upstream, midstream, downstream, and oilfield services', true, 'Fuel'),
('Pharmaceutical & Biotechnology', 'PHAR', 'Drug manufacturing, biotech research, and clinical trials', true, 'Pill'),
('Retail & Consumer Goods', 'RETL', 'Retail stores, e-commerce, and consumer products', true, 'ShoppingCart'),
('Technology & Software', 'TECH', 'Software development, IT services, and technology products', true, 'Monitor'),
('Telecommunications', 'TEL', 'Mobile networks, internet services, and telecom infrastructure', true, 'Wifi'),
('Utilities (Water & Wastewater)', 'WATR', 'Water treatment, distribution, and sanitation services', true, 'Droplet'),
-- Extra industries for comprehensive coverage
('Financial Services (Non-Bank)', 'FINS', 'Microfinance, credit unions, fintech, and non-bank financial services', true, 'Wallet'),
('Security Services', 'SECU', 'Physical security, surveillance, and security systems', true, 'ShieldCheck'),
('Aviation (Commercial)', 'AVIA', 'Airlines, airports, ground handling, and aviation services', true, 'PlaneTakeoff'),
('Environment & Climate', 'ENVI', 'Environmental consulting, sustainability, and climate services', true, 'Leaf'),
('Arts, Culture & Creative Industries', 'ARTS', 'Visual arts, performing arts, design, and cultural institutions', true, 'Palette');

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_master_industries_code ON master_industries(code);