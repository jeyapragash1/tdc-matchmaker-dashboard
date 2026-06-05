import { Customer } from "@/data/customers";
import { profiles } from "@/data/profiles";

export type MatchResult = {
  profile: Customer;
  score: number;
  label: string;
  explanation: string;
  gunaMilan: number;
  gotraConflict: boolean;
};

function getLabel(score: number) {
  if (score >= 80) return "High Potential Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Low Priority Match";
}

// Deterministic simulation of Kundali Guna Milan score (12-36)
function calculateGunaMilan(cust: Customer, cand: Customer) {
  const hash = (cust.id * cand.id * 17) % 25;
  return hash + 12; // ranges from 12 to 36
}

export function getMatches(customer: Customer): MatchResult[] {
  const oppositeProfiles = profiles.filter(
    (profile) => profile.gender !== customer.gender
  );

  const results = oppositeProfiles.map((profile) => {
    let rawScore = 0;
    const maxRawScore = 135;
    const reasons: string[] = [];

    // --- GENDER-SPECIFIC RULES ---
    if (customer.gender === "Male") {
      // 1. Younger (20 pts)
      if (profile.age < customer.age) {
        rawScore += 20;
        reasons.push("younger age");
      }
      // 2. Earns less (15 pts)
      if (profile.income < customer.income) {
        rawScore += 15;
        reasons.push("income alignment");
      }
      // 3. Shorter (15 pts)
      if (profile.height < customer.height) {
        rawScore += 15;
        reasons.push("height alignment");
      }
      // 4. Matching kids view (15 pts)
      if (profile.wantKids === customer.wantKids) {
        rawScore += 15;
        reasons.push("similar kids preferences");
      }
    } else {
      // For Female Customers
      // 1. Similar designation/profession (20 pts)
      if (profile.designation === customer.designation) {
        rawScore += 20;
        reasons.push("similar professional background");
      }
      // 2. Matching relocation view (15 pts)
      if (profile.openToRelocate === customer.openToRelocate) {
        rawScore += 15;
        reasons.push("aligned relocation preference");
      }
      // 3. Matching kids view (15 pts)
      if (profile.wantKids === customer.wantKids) {
        rawScore += 15;
        reasons.push("similar kids preferences");
      }
      // 4. Values overlap (15 pts)
      if (
        Array.isArray(profile.values) &&
        profile.values.some((v) => customer.values.includes(v))
      ) {
        rawScore += 15;
        reasons.push("shared personal values");
      }
    }

    // --- SHARED CULTURAL & LIFESTYLE RULES ---
    // 1. Language overlap (10 pts)
    if (
      Array.isArray(profile.languages) &&
      profile.languages.some((lang) => customer.languages.includes(lang))
    ) {
      rawScore += 10;
      reasons.push("shared language");
    }

    // 2. Diet compatibility (10 pts)
    if (profile.diet === customer.diet) {
      rawScore += 10;
      reasons.push("identical diet preference");
    }

    // 3. Religion matching (10 pts)
    if (profile.religion === customer.religion) {
      rawScore += 10;
      reasons.push("same religion");
    }

    // 4. Caste matching (10 pts)
    if (profile.caste === customer.caste) {
      rawScore += 10;
      reasons.push("same caste");
    }

    // 5. Manglik compatibility (15 pts)
    const isCustomerManglik = customer.manglik === "Yes" || customer.manglik === "Anshik";
    const isProfileManglik = profile.manglik === "Yes" || profile.manglik === "Anshik";
    if (isCustomerManglik === isProfileManglik) {
      rawScore += 15;
      reasons.push("compatible Manglik status");
    }

    // 6. Kundali Guna Milan (15 pts if >= 18)
    const gunaMilan = calculateGunaMilan(customer, profile);
    if (gunaMilan >= 18) {
      rawScore += 15;
      reasons.push("strong Kundali compatibility");
    }

    // Scale raw score to percentage out of 100
    let score = Math.round((rawScore / maxRawScore) * 100);

    // Gotra check (Exogamy check): -30 pts penalty if same Gotra
    let gotraConflict = false;
    if (
      customer.gotra &&
      profile.gotra &&
      customer.gotra.toLowerCase() === profile.gotra.toLowerCase()
    ) {
      gotraConflict = true;
      score = Math.max(0, score - 30);
      reasons.push("Gotra warning");
    }

    const label = getLabel(score);

    return {
      profile,
      score,
      label,
      explanation: gotraConflict
        ? `Warning: Gotra Conflict (${customer.gotra} Gotra matches). compatibility score has been penalized.`
        : reasons.length > 0
        ? `${label}: High compatibility due to ${reasons.join(", ")}.`
        : `${label}: Profile has limited parameters overlap.`,
      gunaMilan,
      gotraConflict,
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 6);
}