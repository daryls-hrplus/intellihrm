// Primary official/business language for countries
const countryLanguages: Record<string, string> = {
  // Caribbean
  TT: "English",
  JM: "English",
  BB: "English",
  BS: "English",
  GY: "English",
  BZ: "English",
  LC: "English",
  GD: "English",
  VC: "English",
  AG: "English",
  KN: "English",
  DM: "English",
  KY: "English",
  VG: "English",
  TC: "English",
  BM: "English",
  AI: "English",
  MS: "English",
  VI: "English",
  PR: "Spanish/English",
  HT: "French/Creole",
  DO: "Spanish",
  CU: "Spanish",
  SR: "Dutch",
  AW: "Dutch/Papiamento",
  CW: "Dutch/Papiamento",
  SX: "Dutch/English",
  BQ: "Dutch",
  GF: "French",
  
  // Central America
  MX: "Spanish",
  GT: "Spanish",
  HN: "Spanish",
  SV: "Spanish",
  NI: "Spanish",
  CR: "Spanish",
  PA: "Spanish",
  
  // South America
  CO: "Spanish",
  VE: "Spanish",
  EC: "Spanish",
  PE: "Spanish",
  BO: "Spanish",
  CL: "Spanish",
  AR: "Spanish",
  UY: "Spanish",
  PY: "Spanish/Guaraní",
  BR: "Portuguese",
  
  // Africa - English Speaking
  NG: "English",
  GH: "English",
  ZA: "English",
  KE: "English",
  TZ: "English/Swahili",
  UG: "English",
  RW: "English/French/Kinyarwanda",
  ZM: "English",
  ZW: "English",
  BW: "English",
  NA: "English",
  MU: "English/French",
  
  // Africa - French Speaking
  SN: "French",
  CI: "French",
  CM: "French/English",
  CD: "French",
  
  // Africa - Arabic Speaking
  EG: "Arabic",
  MA: "Arabic/French",
  DZ: "Arabic/French",
  TN: "Arabic/French",
  LY: "Arabic",
  SD: "Arabic",
  
  // Africa - Portuguese Speaking
  AO: "Portuguese",
  MZ: "Portuguese",
  
  // Africa - Other
  ET: "Amharic",
};

export function getCountryLanguage(countryCode: string): string {
  return countryLanguages[countryCode] || "—";
}
