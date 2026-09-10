// Google Forms & Referral Config
// To integrate with Google Forms:
// 1. Create a Google Form with fields: Full Name, Age, City, Gender, Phone Number.
// 2. Obtain the form action URL (e.g. https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse).
// 3. Inspect the form inputs or use get-prefilled-link to find the entry IDs (e.g. entry.123456789).
// 4. Fill in the values below.
// Note: Referral registrations are stored automatically in the Google Sheet connected to the Google Form. No Supabase knowledge is required.

export interface ReferralConfig {
  formUrl: string; // The Google Form action URL or public view URL
  entries: {
    fullName: string;
    age: string;
    city: string;
    gender: string;
    phoneNumber: string;
  };
}

export const REFERRAL_FORM_CONFIG: ReferralConfig = {
  // Exact Google Form response URL extracted from https://forms.gle/8SD6uNFS3AVEGTwK6
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeGXimYvkNDenFUrFhN2UJmj6PNapAsgMPdPkxxb-ok4FEYRg/formResponse",

  // Exact entry IDs extracted from the Google Form definition:
  // Full Name: entry.2005620554
  // Gender: entry.1983292347
  // Age: entry.1045781291
  // City: entry.1065046570
  // Phone Number: entry.1166974658
  entries: {
    fullName: "entry.2005620554",
    age: "entry.1045781291",
    city: "entry.1065046570",
    gender: "entry.1983292347",
    phoneNumber: "entry.1166974658",
  },
};

// Interface for future referral tracking (extensible schema)
export interface ReferralPartner {
  id?: string;
  referralCode?: string;
  fullName: string;
  age: number | string;
  city: string;
  gender: string;
  phoneNumber: string;
  createdAt?: string;
  totalEarnings?: number;
  totalReferrals?: number;
}
