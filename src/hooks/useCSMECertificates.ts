import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CSMECertificateType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  requires_expiry: boolean;
  eligible_countries: string[] | null;
  display_order: number;
  is_active: boolean;
}

export interface CSMEIssuingAuthority {
  id: string;
  country_code: string;
  country_name: string;
  name: string;
  authority_type: string | null;
  is_active: boolean;
}

export interface CSMECertificate {
  id: string;
  employee_id: string;
  certificate_number: string;
  skill_category: string;
  occupation: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string | null;
  status: string;
  verification_status: string;
  verified_by_country: string | null;
  verification_date: string | null;
  document_url: string | null;
  document_name: string | null;
  notes: string | null;
  // New fields
  certificate_type_id: string | null;
  issuing_authority_id: string | null;
  issuing_authority_name: string | null;
  verified_by_user_id: string | null;
  verified_by_name: string | null;
  verification_method: string | null;
  // Joined data
  certificate_type?: CSMECertificateType;
  issuing_authority?: CSMEIssuingAuthority;
}

export interface CSMEFormData {
  certificate_number: string;
  certificate_type_id: string;
  occupation: string;
  issuing_country: string;
  issuing_authority_id: string;
  issuing_authority_name: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  verification_status: string;
  verified_by_country: string;
  verified_by_user_id: string;
  verified_by_name: string;
  verification_method: string;
  notes: string;
}

export const VERIFICATION_METHODS = [
  { value: "manual", label: "Manual Review" },
  { value: "api", label: "API Verification" },
  { value: "government_portal", label: "Government Portal Check" },
  { value: "in_person", label: "In-Person Verification" },
];

export function useCSMECertificates(employeeId: string) {
  const [certificates, setCertificates] = useState<CSMECertificate[]>([]);
  const [certificateTypes, setCertificateTypes] = useState<CSMECertificateType[]>([]);
  const [issuingAuthorities, setIssuingAuthorities] = useState<CSMEIssuingAuthority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  // Fetch certificate types
  const fetchCertificateTypes = async () => {
    const { data, error } = await supabase
      .from("csme_certificate_types")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (!error && data) {
      setCertificateTypes(data as CSMECertificateType[]);
    }
  };

  // Fetch issuing authorities
  const fetchIssuingAuthorities = async () => {
    const { data, error } = await supabase
      .from("csme_issuing_authorities")
      .select("*")
      .eq("is_active", true)
      .order("country_name");

    if (!error && data) {
      setIssuingAuthorities(data as CSMEIssuingAuthority[]);
    }
  };

  // Fetch certificates for employee
  const fetchCertificates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_csme_certificates")
      .select(`
        *,
        certificate_type:csme_certificate_types(*),
        issuing_authority:csme_issuing_authorities(*)
      `)
      .eq("employee_id", employeeId)
      .order("issue_date", { ascending: false });

    if (!error && data) {
      setCertificates(data as unknown as CSMECertificate[]);
    }
    setIsLoading(false);
  };

  // Load lookups on mount
  useEffect(() => {
    const loadLookups = async () => {
      setIsLoadingLookups(true);
      await Promise.all([fetchCertificateTypes(), fetchIssuingAuthorities()]);
      setIsLoadingLookups(false);
    };
    loadLookups();
  }, []);

  // Load certificates when employeeId changes
  useEffect(() => {
    if (employeeId) {
      fetchCertificates();
    }
  }, [employeeId]);

  // Filter authorities by country
  const getAuthoritiesByCountry = (countryName: string): CSMEIssuingAuthority[] => {
    return issuingAuthorities.filter(
      (auth) => auth.country_name.toLowerCase() === countryName.toLowerCase()
    );
  };

  // Get certificate type by ID
  const getCertificateTypeById = (id: string): CSMECertificateType | undefined => {
    return certificateTypes.find((type) => type.id === id);
  };

  // Check if expiry is required for a certificate type
  const isExpiryRequired = (certificateTypeId: string): boolean => {
    const type = getCertificateTypeById(certificateTypeId);
    return type?.requires_expiry ?? true;
  };

  // Get certificate type name
  const getCertificateTypeName = (certificateTypeId: string | null): string => {
    if (!certificateTypeId) return "Unknown";
    const type = getCertificateTypeById(certificateTypeId);
    return type?.name ?? "Unknown";
  };

  // Get default form values
  const getDefaultFormValues = (): CSMEFormData => ({
    certificate_number: "",
    certificate_type_id: "",
    occupation: "",
    issuing_country: "",
    issuing_authority_id: "",
    issuing_authority_name: "",
    issue_date: "",
    expiry_date: "",
    status: "active",
    verification_status: "pending",
    verified_by_country: "",
    verified_by_user_id: "",
    verified_by_name: "",
    verification_method: "",
    notes: "",
  });

  // Map certificate to form data
  const certificateToFormData = (cert: CSMECertificate): CSMEFormData => ({
    certificate_number: cert.certificate_number,
    certificate_type_id: cert.certificate_type_id || "",
    occupation: cert.occupation,
    issuing_country: cert.issuing_country,
    issuing_authority_id: cert.issuing_authority_id || "",
    issuing_authority_name: cert.issuing_authority_name || "",
    issue_date: cert.issue_date,
    expiry_date: cert.expiry_date || "",
    status: cert.status,
    verification_status: cert.verification_status,
    verified_by_country: cert.verified_by_country || "",
    verified_by_user_id: cert.verified_by_user_id || "",
    verified_by_name: cert.verified_by_name || "",
    verification_method: cert.verification_method || "",
    notes: cert.notes || "",
  });

  return {
    certificates,
    certificateTypes,
    issuingAuthorities,
    isLoading,
    isLoadingLookups,
    fetchCertificates,
    getAuthoritiesByCountry,
    getCertificateTypeById,
    isExpiryRequired,
    getCertificateTypeName,
    getDefaultFormValues,
    certificateToFormData,
  };
}
