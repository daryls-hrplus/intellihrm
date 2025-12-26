-- Caribbean Countries (additional to existing TT, JM, BB)

-- Bahamas (BS)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('BS', 'NIB', 'National Insurance Number', 'National Insurance Board registration number', true, true, 1),
('BS', 'TIN', 'Tax Identification Number', 'Business License/Tax number', true, false, 2),
('BS', 'NIB_ER', 'Employer NIB Number', 'National Insurance Board employer registration', false, true, 1),
('BS', 'BL', 'Business License Number', 'Government business license number', false, true, 2);

-- Dominican Republic (DO)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('DO', 'CEDULA', 'Cédula de Identidad', 'National identity card number', true, true, 1),
('DO', 'NSS', 'Número de Seguridad Social', 'Social Security Number (TSS)', true, true, 2),
('DO', 'RNC', 'Registro Nacional del Contribuyente', 'National Taxpayer Registry', true, false, 3),
('DO', 'RNC_ER', 'RNC Empleador', 'Employer tax registration number', false, true, 1),
('DO', 'TSS_ER', 'Registro TSS Empleador', 'Employer Social Security registration', false, true, 2);

-- Haiti (HT)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('HT', 'CIN', 'Carte d''Identification Nationale', 'National ID card number', true, true, 1),
('HT', 'NIF', 'Numéro d''Identification Fiscale', 'Tax identification number', true, false, 2),
('HT', 'ONA', 'Numéro ONA', 'Office of Old Age Insurance number', true, false, 3),
('HT', 'NIF_ER', 'NIF Employeur', 'Employer tax identification', false, true, 1),
('HT', 'ONA_ER', 'Numéro ONA Employeur', 'Employer ONA registration', false, true, 2);

-- Cuba (CU)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CU', 'CI', 'Carnet de Identidad', 'National identity card number', true, true, 1),
('CU', 'NIT', 'Número de Identificación Tributaria', 'Tax identification number', true, false, 2),
('CU', 'ONIT_ER', 'Registro ONIT', 'Employer tax registration', false, true, 1);

-- Grenada (GD)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('GD', 'NIS', 'National Insurance Number', 'NIS registration number', true, true, 1),
('GD', 'TIN', 'Tax Identification Number', 'Inland Revenue tax number', true, false, 2),
('GD', 'NIS_ER', 'Employer NIS Number', 'Employer NIS registration', false, true, 1),
('GD', 'TIN_ER', 'Employer TIN', 'Employer tax identification', false, true, 2);

-- Saint Lucia (LC)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('LC', 'NIC', 'National Insurance Number', 'NIC registration number', true, true, 1),
('LC', 'TIN', 'Tax Identification Number', 'Inland Revenue Department number', true, false, 2),
('LC', 'NIC_ER', 'Employer NIC Number', 'Employer NIC registration', false, true, 1),
('LC', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 2);

-- Saint Vincent and the Grenadines (VC)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('VC', 'NIS', 'National Insurance Number', 'NIS registration number', true, true, 1),
('VC', 'TIN', 'Tax Identification Number', 'Inland Revenue number', true, false, 2),
('VC', 'NIS_ER', 'Employer NIS Number', 'Employer NIS registration', false, true, 1),
('VC', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 2);

-- Antigua and Barbuda (AG)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('AG', 'SSB', 'Social Security Number', 'Social Security Board number', true, true, 1),
('AG', 'TIN', 'Tax Identification Number', 'Inland Revenue number', true, false, 2),
('AG', 'SSB_ER', 'Employer SSB Number', 'Employer Social Security registration', false, true, 1),
('AG', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 2);

-- Dominica (DM)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('DM', 'DSS', 'Social Security Number', 'Dominica Social Security number', true, true, 1),
('DM', 'TIN', 'Tax Identification Number', 'Inland Revenue number', true, false, 2),
('DM', 'DSS_ER', 'Employer DSS Number', 'Employer Social Security registration', false, true, 1),
('DM', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 2);

-- Saint Kitts and Nevis (KN)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('KN', 'SSB', 'Social Security Number', 'Social Security Board number', true, true, 1),
('KN', 'TIN', 'Tax Identification Number', 'Inland Revenue number', true, false, 2),
('KN', 'SSB_ER', 'Employer SSB Number', 'Employer Social Security registration', false, true, 1),
('KN', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 2);

-- Cayman Islands (KY)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('KY', 'NPF', 'National Pension Fund Number', 'NPF registration number', true, true, 1),
('KY', 'NHIF', 'Health Insurance Number', 'National Health Insurance number', true, true, 2),
('KY', 'NPF_ER', 'Employer NPF Number', 'Employer pension fund registration', false, true, 1),
('KY', 'NHIF_ER', 'Employer NHIF Number', 'Employer health insurance registration', false, true, 2);

-- Guyana (GY)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('GY', 'NIS', 'National Insurance Number', 'NIS registration number', true, true, 1),
('GY', 'TIN', 'Tax Identification Number', 'GRA tax number', true, true, 2),
('GY', 'NID', 'National ID Number', 'National identification card number', true, false, 3),
('GY', 'NIS_ER', 'Employer NIS Number', 'Employer NIS registration', false, true, 1),
('GY', 'TIN_ER', 'Employer TIN', 'Employer tax registration (GRA)', false, true, 2);

-- Suriname (SR)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('SR', 'ID', 'Persoonsbewijs Nummer', 'National ID card number', true, true, 1),
('SR', 'AOV', 'AOV Number', 'Old Age Pension number', true, true, 2),
('SR', 'TIN', 'Belastingnummer', 'Tax identification number', true, false, 3),
('SR', 'AOV_ER', 'Employer AOV Number', 'Employer pension registration', false, true, 1),
('SR', 'TIN_ER', 'Employer Tax Number', 'Employer tax registration', false, true, 2);

-- Belize (BZ)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('BZ', 'SSB', 'Social Security Number', 'Social Security Board number', true, true, 1),
('BZ', 'TIN', 'Tax Identification Number', 'Income Tax Department number', true, true, 2),
('BZ', 'SSB_ER', 'Employer SSB Number', 'Employer Social Security registration', false, true, 1),
('BZ', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 2);

-- Aruba (AW)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('AW', 'CRIB', 'CRIB Number', 'Tax registration number', true, true, 1),
('AW', 'SVB', 'SVB Number', 'Social Insurance Bank number', true, true, 2),
('AW', 'CRIB_ER', 'Employer CRIB', 'Employer tax registration', false, true, 1),
('AW', 'SVB_ER', 'Employer SVB Number', 'Employer social insurance registration', false, true, 2);

-- Curaçao (CW)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CW', 'CRIB', 'CRIB Number', 'Tax registration number', true, true, 1),
('CW', 'SVB', 'SVB Number', 'Social Insurance Bank number', true, true, 2),
('CW', 'CRIB_ER', 'Employer CRIB', 'Employer tax registration', false, true, 1),
('CW', 'SVB_ER', 'Employer SVB Number', 'Employer social insurance registration', false, true, 2);

-- Central America

-- Mexico (MX)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('MX', 'CURP', 'CURP', 'Clave Única de Registro de Población', true, true, 1),
('MX', 'RFC', 'RFC', 'Registro Federal de Contribuyentes', true, true, 2),
('MX', 'NSS', 'Número de Seguro Social', 'IMSS Social Security number', true, true, 3),
('MX', 'INE', 'INE Number', 'National Electoral Institute ID', true, false, 4),
('MX', 'RFC_ER', 'RFC Empleador', 'Employer tax registration', false, true, 1),
('MX', 'IMSS_ER', 'Registro Patronal IMSS', 'Employer IMSS registration', false, true, 2),
('MX', 'INFONAVIT_ER', 'Registro INFONAVIT', 'Employer housing fund registration', false, true, 3);

-- Guatemala (GT)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('GT', 'DPI', 'DPI', 'Documento Personal de Identificación', true, true, 1),
('GT', 'NIT', 'NIT', 'Número de Identificación Tributaria', true, true, 2),
('GT', 'IGSS', 'Número IGSS', 'Social Security number', true, true, 3),
('GT', 'NIT_ER', 'NIT Patronal', 'Employer tax registration', false, true, 1),
('GT', 'IGSS_ER', 'Registro Patronal IGSS', 'Employer IGSS registration', false, true, 2);

-- Honduras (HN)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('HN', 'DNI', 'DNI', 'Documento Nacional de Identidad', true, true, 1),
('HN', 'RTN', 'RTN', 'Registro Tributario Nacional', true, true, 2),
('HN', 'IHSS', 'Número IHSS', 'Social Security number', true, true, 3),
('HN', 'RTN_ER', 'RTN Patronal', 'Employer tax registration', false, true, 1),
('HN', 'IHSS_ER', 'Registro Patronal IHSS', 'Employer IHSS registration', false, true, 2);

-- El Salvador (SV)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('SV', 'DUI', 'DUI', 'Documento Único de Identidad', true, true, 1),
('SV', 'NIT', 'NIT', 'Número de Identificación Tributaria', true, true, 2),
('SV', 'NUP', 'NUP', 'Número Único Previsional (AFP)', true, true, 3),
('SV', 'ISSS', 'Número ISSS', 'Social Security number', true, true, 4),
('SV', 'NIT_ER', 'NIT Patronal', 'Employer tax registration', false, true, 1),
('SV', 'ISSS_ER', 'Registro Patronal ISSS', 'Employer ISSS registration', false, true, 2);

-- Nicaragua (NI)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('NI', 'CEDULA', 'Cédula de Identidad', 'National identity card', true, true, 1),
('NI', 'RUC', 'RUC', 'Registro Único del Contribuyente', true, true, 2),
('NI', 'INSS', 'Número INSS', 'Social Security number', true, true, 3),
('NI', 'RUC_ER', 'RUC Patronal', 'Employer tax registration', false, true, 1),
('NI', 'INSS_ER', 'Registro Patronal INSS', 'Employer INSS registration', false, true, 2);

-- Costa Rica (CR)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CR', 'CEDULA', 'Cédula de Identidad', 'National identity card', true, true, 1),
('CR', 'CCSS', 'Número CCSS', 'Caja Costarricense de Seguro Social number', true, true, 2),
('CR', 'NIT', 'NIT', 'Tax identification number', true, false, 3),
('CR', 'CCSS_ER', 'Registro Patronal CCSS', 'Employer CCSS registration', false, true, 1),
('CR', 'NIT_ER', 'Cédula Jurídica', 'Employer legal ID/tax registration', false, true, 2);

-- Panama (PA)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('PA', 'CEDULA', 'Cédula de Identidad Personal', 'National identity card', true, true, 1),
('PA', 'CSS', 'Número CSS', 'Caja de Seguro Social number', true, true, 2),
('PA', 'RUC', 'RUC', 'Registro Único de Contribuyente', true, false, 3),
('PA', 'CSS_ER', 'Número Patronal CSS', 'Employer CSS registration', false, true, 1),
('PA', 'RUC_ER', 'RUC Empleador', 'Employer tax registration', false, true, 2);

-- South America

-- Brazil (BR)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('BR', 'CPF', 'CPF', 'Cadastro de Pessoas Físicas', true, true, 1),
('BR', 'PIS', 'PIS/PASEP', 'Programa de Integração Social number', true, true, 2),
('BR', 'RG', 'RG', 'Registro Geral (ID card)', true, false, 3),
('BR', 'CTPS', 'CTPS', 'Carteira de Trabalho e Previdência Social', true, true, 4),
('BR', 'CNPJ', 'CNPJ', 'Cadastro Nacional da Pessoa Jurídica', false, true, 1),
('BR', 'CEI', 'CEI/CAEPF', 'Employer registration number', false, true, 2);

-- Argentina (AR)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('AR', 'DNI', 'DNI', 'Documento Nacional de Identidad', true, true, 1),
('AR', 'CUIL', 'CUIL', 'Código Único de Identificación Laboral', true, true, 2),
('AR', 'CUIT', 'CUIT', 'Código Único de Identificación Tributaria', true, false, 3),
('AR', 'CUIT_ER', 'CUIT Empleador', 'Employer tax identification', false, true, 1);

-- Colombia (CO)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CO', 'CC', 'Cédula de Ciudadanía', 'National identity card', true, true, 1),
('CO', 'NIT', 'NIT Personal', 'Tax identification number', true, false, 2),
('CO', 'EPS', 'Número EPS', 'Health insurance number', true, true, 3),
('CO', 'AFP', 'Número AFP', 'Pension fund number', true, true, 4),
('CO', 'NIT_ER', 'NIT Empleador', 'Employer tax registration', false, true, 1),
('CO', 'ARL_ER', 'Número ARL', 'Employer occupational risk insurance', false, true, 2);

-- Peru (PE)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('PE', 'DNI', 'DNI', 'Documento Nacional de Identidad', true, true, 1),
('PE', 'RUC', 'RUC Personal', 'Registro Único de Contribuyente', true, false, 2),
('PE', 'CUSPP', 'CUSPP', 'Código Único del Sistema Privado de Pensiones', true, true, 3),
('PE', 'ESSALUD', 'Código ESSALUD', 'Social health insurance number', true, true, 4),
('PE', 'RUC_ER', 'RUC Empleador', 'Employer tax registration', false, true, 1);

-- Chile (CL)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CL', 'RUT', 'RUT', 'Rol Único Tributario', true, true, 1),
('CL', 'AFP', 'Número AFP', 'Pension fund registration', true, true, 2),
('CL', 'FONASA', 'Número FONASA/ISAPRE', 'Health insurance number', true, true, 3),
('CL', 'RUT_ER', 'RUT Empleador', 'Employer tax registration', false, true, 1);

-- Venezuela (VE)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('VE', 'CI', 'Cédula de Identidad', 'National identity card', true, true, 1),
('VE', 'RIF', 'RIF', 'Registro de Información Fiscal', true, true, 2),
('VE', 'IVSS', 'Número IVSS', 'Social Security number', true, true, 3),
('VE', 'RIF_ER', 'RIF Empleador', 'Employer tax registration', false, true, 1),
('VE', 'NIE_ER', 'NIE Patronal', 'Employer IVSS registration', false, true, 2);

-- Ecuador (EC)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('EC', 'CEDULA', 'Cédula de Identidad', 'National identity card', true, true, 1),
('EC', 'RUC', 'RUC', 'Registro Único de Contribuyente', true, false, 2),
('EC', 'IESS', 'Número IESS', 'Social Security number', true, true, 3),
('EC', 'RUC_ER', 'RUC Empleador', 'Employer tax registration', false, true, 1),
('EC', 'IESS_ER', 'Registro Patronal IESS', 'Employer IESS registration', false, true, 2);

-- Bolivia (BO)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('BO', 'CI', 'Cédula de Identidad', 'National identity card', true, true, 1),
('BO', 'NIT', 'NIT', 'Número de Identificación Tributaria', true, true, 2),
('BO', 'NUA', 'NUA', 'Número Único de Afiliado (AFP)', true, true, 3),
('BO', 'NIT_ER', 'NIT Empleador', 'Employer tax registration', false, true, 1),
('BO', 'NUE_ER', 'NUE', 'Número Único de Empleador', false, true, 2);

-- Paraguay (PY)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('PY', 'CI', 'Cédula de Identidad', 'National identity card', true, true, 1),
('PY', 'RUC', 'RUC', 'Registro Único de Contribuyente', true, false, 2),
('PY', 'IPS', 'Número IPS', 'Social Security number', true, true, 3),
('PY', 'RUC_ER', 'RUC Empleador', 'Employer tax registration', false, true, 1),
('PY', 'IPS_ER', 'Registro Patronal IPS', 'Employer IPS registration', false, true, 2);

-- Uruguay (UY)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('UY', 'CI', 'Cédula de Identidad', 'National identity card', true, true, 1),
('UY', 'RUT', 'RUT', 'Registro Único Tributario', true, true, 2),
('UY', 'BPS', 'Número BPS', 'Banco de Previsión Social number', true, true, 3),
('UY', 'RUT_ER', 'RUT Empleador', 'Employer tax registration', false, true, 1),
('UY', 'BPS_ER', 'Número Patronal BPS', 'Employer BPS registration', false, true, 2);

-- Africa

-- Nigeria (NG) - Update existing if any, or add
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('NG', 'NIN', 'National Identification Number', 'National Identity Management Commission number', true, true, 1),
('NG', 'TIN', 'Tax Identification Number', 'FIRS tax number', true, true, 2),
('NG', 'BVN', 'Bank Verification Number', 'Central Bank verification number', true, false, 3),
('NG', 'NSITF', 'NSITF Number', 'Nigeria Social Insurance Trust Fund number', true, false, 4),
('NG', 'TIN_ER', 'Employer TIN', 'Employer tax identification', false, true, 1),
('NG', 'CAC', 'CAC Registration Number', 'Corporate Affairs Commission registration', false, true, 2),
('NG', 'NSITF_ER', 'Employer NSITF', 'Employer social insurance registration', false, true, 3)
ON CONFLICT DO NOTHING;

-- Ghana (GH)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('GH', 'GCN', 'Ghana Card Number', 'National identification card', true, true, 1),
('GH', 'TIN', 'Tax Identification Number', 'GRA tax number', true, true, 2),
('GH', 'SSNIT', 'SSNIT Number', 'Social Security number', true, true, 3),
('GH', 'TIN_ER', 'Employer TIN', 'Employer tax identification', false, true, 1),
('GH', 'SSNIT_ER', 'Employer SSNIT', 'Employer SSNIT registration', false, true, 2)
ON CONFLICT DO NOTHING;

-- South Africa (ZA)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('ZA', 'ID', 'South African ID Number', 'National identity number', true, true, 1),
('ZA', 'TAX', 'Tax Reference Number', 'SARS tax number', true, true, 2),
('ZA', 'UIF', 'UIF Number', 'Unemployment Insurance Fund number', true, false, 3),
('ZA', 'PAYE', 'Employer PAYE Number', 'Employer SARS PAYE registration', false, true, 1),
('ZA', 'UIF_ER', 'Employer UIF Number', 'Employer UIF registration', false, true, 2),
('ZA', 'SDL', 'SDL Number', 'Skills Development Levy registration', false, false, 3);

-- Kenya (KE)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('KE', 'ID', 'National ID Number', 'National identity card', true, true, 1),
('KE', 'KRA', 'KRA PIN', 'Kenya Revenue Authority PIN', true, true, 2),
('KE', 'NSSF', 'NSSF Number', 'National Social Security Fund number', true, true, 3),
('KE', 'NHIF', 'NHIF Number', 'National Hospital Insurance Fund number', true, true, 4),
('KE', 'KRA_ER', 'Employer KRA PIN', 'Employer tax registration', false, true, 1),
('KE', 'NSSF_ER', 'Employer NSSF', 'Employer NSSF registration', false, true, 2),
('KE', 'NHIF_ER', 'Employer NHIF', 'Employer NHIF registration', false, true, 3);

-- Ethiopia (ET)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('ET', 'ID', 'Kebele ID', 'Local administration ID', true, true, 1),
('ET', 'TIN', 'Tax Identification Number', 'ERCA tax number', true, true, 2),
('ET', 'PSSSA', 'PSSSA Number', 'Public Servants Social Security number', true, false, 3),
('ET', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1);

-- Tanzania (TZ)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('TZ', 'NIDA', 'NIDA Number', 'National Identification Authority number', true, true, 1),
('TZ', 'TIN', 'Tax Identification Number', 'TRA tax number', true, true, 2),
('TZ', 'NSSF', 'NSSF Number', 'National Social Security Fund number', true, true, 3),
('TZ', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1),
('TZ', 'NSSF_ER', 'Employer NSSF', 'Employer NSSF registration', false, true, 2);

-- Uganda (UG)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('UG', 'NIN', 'National Identification Number', 'National ID number', true, true, 1),
('UG', 'TIN', 'Tax Identification Number', 'URA tax number', true, true, 2),
('UG', 'NSSF', 'NSSF Number', 'National Social Security Fund number', true, true, 3),
('UG', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1),
('UG', 'NSSF_ER', 'Employer NSSF', 'Employer NSSF registration', false, true, 2);

-- Rwanda (RW)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('RW', 'NID', 'National ID Number', 'National identity card number', true, true, 1),
('RW', 'TIN', 'Tax Identification Number', 'RRA tax number', true, true, 2),
('RW', 'RSSB', 'RSSB Number', 'Rwanda Social Security Board number', true, true, 3),
('RW', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1),
('RW', 'RSSB_ER', 'Employer RSSB', 'Employer RSSB registration', false, true, 2);

-- Egypt (EG)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('EG', 'NID', 'National ID Number', 'بطاقة الرقم القومي', true, true, 1),
('EG', 'TIN', 'Tax Card Number', 'Tax registration number', true, true, 2),
('EG', 'SI', 'Social Insurance Number', 'National Social Insurance number', true, true, 3),
('EG', 'TIN_ER', 'Employer Tax Number', 'Employer tax registration', false, true, 1),
('EG', 'SI_ER', 'Employer SI Number', 'Employer social insurance registration', false, true, 2);

-- Morocco (MA)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('MA', 'CIN', 'Carte d''Identité Nationale', 'National identity card', true, true, 1),
('MA', 'IF', 'Identifiant Fiscal', 'Tax identification number', true, false, 2),
('MA', 'CNSS', 'Numéro CNSS', 'Social Security number', true, true, 3),
('MA', 'IF_ER', 'IF Employeur', 'Employer tax registration', false, true, 1),
('MA', 'CNSS_ER', 'Numéro Patronal CNSS', 'Employer CNSS registration', false, true, 2);

-- Algeria (DZ)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('DZ', 'NIN', 'Numéro d''Identification Nationale', 'National ID number', true, true, 1),
('DZ', 'NIF', 'Numéro d''Identification Fiscale', 'Tax identification number', true, true, 2),
('DZ', 'CNAS', 'Numéro CNAS', 'Social Security number', true, true, 3),
('DZ', 'NIF_ER', 'NIF Employeur', 'Employer tax registration', false, true, 1),
('DZ', 'CNAS_ER', 'Numéro Patronal CNAS', 'Employer CNAS registration', false, true, 2);

-- Tunisia (TN)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('TN', 'CIN', 'Carte d''Identité Nationale', 'National identity card', true, true, 1),
('TN', 'MF', 'Matricule Fiscal', 'Tax registration number', true, false, 2),
('TN', 'CNSS', 'Numéro CNSS', 'Social Security number', true, true, 3),
('TN', 'MF_ER', 'Matricule Fiscal Employeur', 'Employer tax registration', false, true, 1),
('TN', 'CNSS_ER', 'Numéro Patronal CNSS', 'Employer CNSS registration', false, true, 2);

-- Senegal (SN)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('SN', 'CNI', 'Carte Nationale d''Identité', 'National identity card', true, true, 1),
('SN', 'NINEA', 'NINEA', 'National business identification number', true, false, 2),
('SN', 'IPRES', 'Numéro IPRES', 'Retirement institution number', true, true, 3),
('SN', 'CSS', 'Numéro CSS', 'Social Security number', true, true, 4),
('SN', 'NINEA_ER', 'NINEA Employeur', 'Employer business registration', false, true, 1),
('SN', 'IPRES_ER', 'Numéro Patronal IPRES', 'Employer IPRES registration', false, true, 2);

-- Ivory Coast / Côte d''Ivoire (CI)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CI', 'CNI', 'Carte Nationale d''Identité', 'National identity card', true, true, 1),
('CI', 'CC', 'Compte Contribuable', 'Tax account number', true, false, 2),
('CI', 'CNPS', 'Numéro CNPS', 'Social Security number', true, true, 3),
('CI', 'CC_ER', 'Compte Contribuable Employeur', 'Employer tax registration', false, true, 1),
('CI', 'CNPS_ER', 'Numéro Patronal CNPS', 'Employer CNPS registration', false, true, 2);

-- Cameroon (CM)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('CM', 'CNI', 'Carte Nationale d''Identité', 'National identity card', true, true, 1),
('CM', 'NIU', 'Numéro d''Identifiant Unique', 'Unique taxpayer identification', true, true, 2),
('CM', 'CNPS', 'Numéro CNPS', 'Social Security number', true, true, 3),
('CM', 'NIU_ER', 'NIU Employeur', 'Employer tax registration', false, true, 1),
('CM', 'CNPS_ER', 'Numéro Patronal CNPS', 'Employer CNPS registration', false, true, 2);

-- Angola (AO)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('AO', 'BI', 'Bilhete de Identidade', 'National identity card', true, true, 1),
('AO', 'NIF', 'Número de Identificação Fiscal', 'Tax identification number', true, true, 2),
('AO', 'INSS', 'Número INSS', 'Social Security number', true, true, 3),
('AO', 'NIF_ER', 'NIF Empregador', 'Employer tax registration', false, true, 1),
('AO', 'INSS_ER', 'Número Patronal INSS', 'Employer INSS registration', false, true, 2);

-- Mozambique (MZ)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('MZ', 'BI', 'Bilhete de Identidade', 'National identity card', true, true, 1),
('MZ', 'NUIT', 'NUIT', 'Número Único de Identificação Tributária', true, true, 2),
('MZ', 'INSS', 'Número INSS', 'Social Security number', true, true, 3),
('MZ', 'NUIT_ER', 'NUIT Empregador', 'Employer tax registration', false, true, 1),
('MZ', 'INSS_ER', 'Número Patronal INSS', 'Employer INSS registration', false, true, 2);

-- Zambia (ZM)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('ZM', 'NRC', 'National Registration Card', 'National identity card', true, true, 1),
('ZM', 'TPIN', 'TPIN', 'Taxpayer Identification Number', true, true, 2),
('ZM', 'NAPSA', 'NAPSA Number', 'National Pension Scheme number', true, true, 3),
('ZM', 'TPIN_ER', 'Employer TPIN', 'Employer tax registration', false, true, 1),
('ZM', 'NAPSA_ER', 'Employer NAPSA', 'Employer NAPSA registration', false, true, 2);

-- Zimbabwe (ZW)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('ZW', 'ID', 'National ID Number', 'National identity card', true, true, 1),
('ZW', 'BP', 'BP Number', 'ZIMRA tax number', true, true, 2),
('ZW', 'NSSA', 'NSSA Number', 'National Social Security number', true, true, 3),
('ZW', 'BP_ER', 'Employer BP Number', 'Employer tax registration', false, true, 1),
('ZW', 'NSSA_ER', 'Employer NSSA', 'Employer NSSA registration', false, true, 2);

-- Botswana (BW)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('BW', 'OMANG', 'Omang Number', 'National identity card', true, true, 1),
('BW', 'TIN', 'Tax Identification Number', 'BURS tax number', true, true, 2),
('BW', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1);

-- Namibia (NA)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('NA', 'ID', 'National ID Number', 'National identity card', true, true, 1),
('NA', 'TIN', 'Tax Identification Number', 'IRD tax number', true, true, 2),
('NA', 'SSC', 'SSC Number', 'Social Security Commission number', true, true, 3),
('NA', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1),
('NA', 'SSC_ER', 'Employer SSC', 'Employer SSC registration', false, true, 2);

-- Mauritius (MU)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('MU', 'NIC', 'National Identity Card', 'National identity number', true, true, 1),
('MU', 'TAN', 'Tax Account Number', 'MRA tax number', true, true, 2),
('MU', 'PRB', 'PRB Number', 'Pay Research Bureau number', true, false, 3),
('MU', 'TAN_ER', 'Employer TAN', 'Employer tax registration', false, true, 1),
('MU', 'NPF_ER', 'Employer NPF', 'Employer National Pension Fund registration', false, true, 2);

-- Seychelles (SC)
INSERT INTO public.government_id_types (country_code, code, name, description, is_employee_type, is_mandatory, display_order) VALUES
('SC', 'NIN', 'National Identity Number', 'National identity card', true, true, 1),
('SC', 'TIN', 'Tax Identification Number', 'SRC tax number', true, true, 2),
('SC', 'SPF', 'SPF Number', 'Seychelles Pension Fund number', true, true, 3),
('SC', 'TIN_ER', 'Employer TIN', 'Employer tax registration', false, true, 1),
('SC', 'SPF_ER', 'Employer SPF', 'Employer pension fund registration', false, true, 2);