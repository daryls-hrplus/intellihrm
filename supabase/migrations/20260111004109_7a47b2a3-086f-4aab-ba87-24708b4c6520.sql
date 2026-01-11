-- Add region column to currencies table
ALTER TABLE currencies ADD COLUMN IF NOT EXISTS region TEXT;

-- Insert Caribbean currencies
INSERT INTO currencies (code, name, symbol, decimal_places, is_active, region) VALUES
('JMD', 'Jamaican Dollar', 'J$', 2, true, 'caribbean'),
('XCD', 'Eastern Caribbean Dollar', 'EC$', 2, true, 'caribbean'),
('BBD', 'Barbados Dollar', 'Bds$', 2, true, 'caribbean'),
('BSD', 'Bahamian Dollar', 'B$', 2, true, 'caribbean'),
('BZD', 'Belize Dollar', 'BZ$', 2, true, 'caribbean'),
('GYD', 'Guyana Dollar', 'G$', 2, true, 'caribbean'),
('HTG', 'Haitian Gourde', 'G', 2, true, 'caribbean'),
('DOP', 'Dominican Peso', 'RD$', 2, true, 'caribbean'),
('CUP', 'Cuban Peso', '₱', 2, true, 'caribbean'),
('AWG', 'Aruban Florin', 'ƒ', 2, true, 'caribbean'),
('ANG', 'Netherlands Antillean Guilder', 'ƒ', 2, true, 'caribbean'),
('KYD', 'Cayman Islands Dollar', 'CI$', 2, true, 'caribbean'),
('SRD', 'Surinamese Dollar', '$', 2, true, 'caribbean')
ON CONFLICT (code) DO UPDATE SET region = 'caribbean';

-- Insert Latin American currencies
INSERT INTO currencies (code, name, symbol, decimal_places, is_active, region) VALUES
('ARS', 'Argentine Peso', '$', 2, true, 'latin_america'),
('CLP', 'Chilean Peso', '$', 0, true, 'latin_america'),
('COP', 'Colombian Peso', '$', 2, true, 'latin_america'),
('PEN', 'Peruvian Sol', 'S/', 2, true, 'latin_america'),
('UYU', 'Uruguayan Peso', '$U', 2, true, 'latin_america'),
('VES', 'Venezuelan Bolívar', 'Bs.', 2, true, 'latin_america'),
('BOB', 'Bolivian Boliviano', 'Bs.', 2, true, 'latin_america'),
('PYG', 'Paraguayan Guaraní', '₲', 0, true, 'latin_america'),
('CRC', 'Costa Rican Colón', '₡', 2, true, 'latin_america'),
('GTQ', 'Guatemalan Quetzal', 'Q', 2, true, 'latin_america'),
('HNL', 'Honduran Lempira', 'L', 2, true, 'latin_america'),
('NIO', 'Nicaraguan Córdoba', 'C$', 2, true, 'latin_america'),
('PAB', 'Panamanian Balboa', 'B/.', 2, true, 'latin_america')
ON CONFLICT (code) DO UPDATE SET region = 'latin_america';

-- Insert African currency (GHS)
INSERT INTO currencies (code, name, symbol, decimal_places, is_active, region) VALUES
('GHS', 'Ghanaian Cedi', '₵', 2, true, 'africa')
ON CONFLICT (code) DO UPDATE SET region = 'africa';

-- Update existing currencies with their regions
UPDATE currencies SET region = 'caribbean' WHERE code = 'TTD' AND region IS NULL;
UPDATE currencies SET region = 'latin_america' WHERE code IN ('MXN', 'BRL') AND region IS NULL;
UPDATE currencies SET region = 'africa' WHERE code IN ('NGN', 'ZAR', 'EGP') AND region IS NULL;
UPDATE currencies SET region = 'europe' WHERE code IN ('EUR', 'GBP', 'CHF', 'DKK', 'NOK', 'SEK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'ISK', 'RUB', 'UAH', 'TRY') AND region IS NULL;
UPDATE currencies SET region = 'asia_pacific' WHERE code IN ('AUD', 'NZD', 'SGD', 'HKD', 'JPY', 'CNY', 'KRW', 'INR', 'MYR', 'THB', 'PHP', 'IDR', 'VND', 'TWD', 'PKR', 'BDT', 'LKR') AND region IS NULL;
UPDATE currencies SET region = 'middle_east' WHERE code IN ('AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'ILS', 'IQD', 'IRR', 'LBP') AND region IS NULL;
UPDATE currencies SET region = 'north_america' WHERE code IN ('USD', 'CAD') AND region IS NULL;