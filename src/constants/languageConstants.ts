// ISO 639-1 Language Codes - comprehensive list with Caribbean/Africa focus
export const ISO_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" },
  { code: "de", name: "German" },
  { code: "nl", name: "Dutch" },
  { code: "it", name: "Italian" },
  { code: "zh", name: "Chinese (Mandarin)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "tl", name: "Filipino (Tagalog)" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "ur", name: "Urdu" },
  { code: "fa", name: "Persian (Farsi)" },
  { code: "he", name: "Hebrew" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "cs", name: "Czech" },
  { code: "sk", name: "Slovak" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "el", name: "Greek" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  // Caribbean languages
  { code: "ht", name: "Haitian Creole" },
  { code: "pap", name: "Papiamento" },
  { code: "jam", name: "Jamaican Patois" },
  { code: "srn", name: "Sranan Tongo" },
  // African languages
  { code: "sw", name: "Swahili" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "ha", name: "Hausa" },
  { code: "am", name: "Amharic" },
  { code: "om", name: "Oromo" },
  { code: "zu", name: "Zulu" },
  { code: "xh", name: "Xhosa" },
  { code: "af", name: "Afrikaans" },
  { code: "tw", name: "Twi" },
  { code: "ak", name: "Akan" },
  { code: "wo", name: "Wolof" },
  { code: "sn", name: "Shona" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "so", name: "Somali" },
  { code: "ti", name: "Tigrinya" },
  // Other
  { code: "other", name: "Other" },
] as const;

// Numeric Scale (1-5)
export const NUMERIC_PROFICIENCY = [
  { value: "1", label: "1 – Basic", description: "Understands simple words/phrases" },
  { value: "2", label: "2 – Conversational", description: "Handles routine conversations" },
  { value: "3", label: "3 – Intermediate", description: "Discusses familiar topics with some fluency" },
  { value: "4", label: "4 – Advanced", description: "Expresses complex ideas clearly" },
  { value: "5", label: "5 – Fluent/Native", description: "Full professional/native proficiency" },
] as const;

// CEFR Scale (A1-C2)
export const CEFR_PROFICIENCY = [
  { value: "A1", label: "A1 – Beginner", description: "Basic everyday expressions" },
  { value: "A2", label: "A2 – Elementary", description: "Simple, routine communication" },
  { value: "B1", label: "B1 – Intermediate", description: "Manages work/travel situations" },
  { value: "B2", label: "B2 – Upper Intermediate", description: "Interacts fluently on many topics" },
  { value: "C1", label: "C1 – Advanced", description: "Flexible for professional use" },
  { value: "C2", label: "C2 – Proficient", description: "Near-native proficiency" },
] as const;

// Common language certifications
export const LANGUAGE_CERTIFICATIONS = [
  "IELTS",
  "TOEFL",
  "TOEIC",
  "Cambridge (FCE/CAE/CPE)",
  "DELF/DALF",
  "TEF/TCF",
  "Goethe-Zertifikat",
  "TestDaF",
  "DELE",
  "SIELE",
  "CELPE-Bras",
  "JLPT",
  "HSK",
  "TOPIK",
  "CELPIP",
  "PTE Academic",
  "Duolingo English Test",
  "Other",
] as const;

export type ProficiencyScale = "numeric" | "cefr";
export type NumericProficiency = typeof NUMERIC_PROFICIENCY[number]["value"];
export type CEFRProficiency = typeof CEFR_PROFICIENCY[number]["value"];
