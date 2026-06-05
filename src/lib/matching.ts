import { Customer } from "@/data/customers";
import { profiles } from "@/data/profiles";

export type MatchResult = {
  profile: Customer;
  score: number;
  label: string;
  explanation: string;
};

function getLabel(score: number) {
  if (score >= 80) return "High Potential Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Low Priority Match";
}

export function getMatches(customer: Customer): MatchResult[] {
  const oppositeProfiles = profiles.filter(
    (profile) => profile.gender !== customer.gender
  );

  const results = oppositeProfiles.map((profile) => {
    let score = 0;
    const reasons: string[] = [];

    if (customer.gender === "Male") {
      if (profile.age < customer.age) {
        score += 25;
        reasons.push("the suggested profile is younger");
      }

      if (profile.income < customer.income) {
        score += 20;
        reasons.push("income expectation fits the stated matching rule");
      }

      if (profile.height < customer.height) {
        score += 20;
        reasons.push("height preference is aligned");
      }

      if (profile.wantKids === customer.wantKids) {
        score += 25;
        reasons.push("both have matching views on children");
      }

      if (profile.languages.some((lang) => customer.languages.includes(lang))) {
        score += 10;
        reasons.push("they share a common language");
      }
    } else {
      if (profile.designation === customer.designation) {
        score += 20;
        reasons.push("both have similar professional backgrounds");
      }

      if (profile.openToRelocate === customer.openToRelocate) {
        score += 25;
        reasons.push("their relocation preferences match");
      }

      if (profile.wantKids === customer.wantKids) {
        score += 20;
        reasons.push("both have compatible views on children");
      }

      if (profile.values.some((value) => customer.values.includes(value))) {
        score += 25;
        reasons.push("they share important personal values");
      }

      if (profile.languages.some((lang) => customer.languages.includes(lang))) {
        score += 10;
        reasons.push("they share a common language");
      }
    }

    const label = getLabel(score);

    return {
      profile,
      score,
      label,
      explanation:
        reasons.length > 0
          ? `${label}: This profile is ranked highly because ${reasons.join(
              ", "
            )}.`
          : `${label}: This profile has limited compatibility based on available data.`,
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 6);
}