// Simple matching logic ported from frontend matching.ts
function getLabel(score) {
  if (score >= 80) return "High Potential Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Low Priority Match";
}

function getMatches(customer, profiles) {
  const oppositeProfiles = profiles.filter(
    (profile) => profile.gender !== customer.gender
  );

  const results = oppositeProfiles.map((profile) => {
    let score = 0;
    const reasons = [];

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

      if (
        Array.isArray(profile.languages) &&
        profile.languages.some((lang) => customer.languages.includes(lang))
      ) {
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

      if (
        Array.isArray(profile.values) &&
        profile.values.some((value) => customer.values.includes(value))
      ) {
        score += 25;
        reasons.push("they share important personal values");
      }

      if (
        Array.isArray(profile.languages) &&
        profile.languages.some((lang) => customer.languages.includes(lang))
      ) {
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

// Generate 100 dummy profiles (same logic as frontend generator)
function generateProfiles() {
  const femaleNames = [
    "Aanya", "Diya", "Isha", "Kavya", "Meera", "Neha", "Pooja", "Riya", "Sneha", "Tanya",
    "Anika", "Bhavya", "Charvi", "Divya", "Esha", "Gayatri", "Harini", "Jhanvi", "Kiara", "Lavanya",
    "Mahika", "Nisha", "Oviya", "Prisha", "Radhika", "Sahana", "Trisha", "Vaishnavi", "Yamini", "Zoya",
    "Anjali", "Deepika", "Kritika", "Malavika", "Nandini", "Pavithra", "Reshma", "Shreya", "Tanvi", "Varsha",
    "Akshara", "Devika", "Janani", "Keerthi", "Lakshmi", "Madhuri", "Navya", "Sanjana", "Swetha", "Vidya",
  ];

  const maleNames = [
    "Aarav", "Aditya", "Akash", "Arjun", "Dev", "Karan", "Rohan", "Rahul", "Siddharth", "Vikram",
    "Abhinav", "Bharath", "Chetan", "Darshan", "Gautham", "Harish", "Ishan", "Jatin", "Kunal", "Manav",
    "Nikhil", "Omkar", "Pranav", "Raghav", "Sahil", "Tarun", "Uday", "Varun", "Yash", "Zubin",
    "Ajay", "Deepak", "Karthik", "Mohan", "Naveen", "Prakash", "Ramesh", "Sanjay", "Suresh", "Vignesh",
    "Amrit", "Dhruv", "Jay", "Krishna", "Lokesh", "Madhav", "Nirav", "Ritesh", "Suraj", "Vivek",
  ];

  const lastNames = [
    "Sharma", "Patel", "Nair", "Iyer", "Reddy", "Mehta", "Kapoor", "Joshi", "Menon", "Rao",
  ];

  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"];
  const companies = ["TCS", "Infosys", "Google", "Deloitte", "Wipro"];
  const designations = ["Software Engineer", "Business Analyst", "Product Manager", "UX Designer"];
  const degrees = ["B.Tech", "MBA", "B.Com", "MSc"];
  const castes = ["Brahmin", "Nair", "Rajput", "Agarwal"];
  const preferences = ["Yes", "No", "Maybe"];

  return Array.from({ length: 100 }, (_, i) => {
    const isFemale = i < 50;
    const name = isFemale ? femaleNames[i] : maleNames[i - 50];

    return {
      id: i + 101,
      firstName: name,
      lastName: lastNames[i % lastNames.length],
      gender: isFemale ? "Female" : "Male",
      dateOfBirth: isFemale ? "1998-04-12" : "1993-07-18",
      age: isFemale ? 24 + (i % 8) : 28 + (i % 8),
      country: "India",
      city: cities[i % cities.length],
      height: isFemale ? 155 + (i % 12) : 168 + (i % 15),
      email: `${name.toLowerCase()}${i + 1}@email.com`,
      phone: `+91 90000000${String(i).padStart(2, "0")}`,
      college: "Indian University",
      degree: degrees[i % degrees.length],
      income: isFemale ? 600000 + i * 12000 : 900000 + i * 15000,
      company: companies[i % companies.length],
      designation: designations[i % designations.length],
      maritalStatus: "Never Married",
      languages: ["English", "Hindi"],
      siblings: i % 3,
      caste: castes[i % castes.length],
      religion: "Hindu",
      wantKids: preferences[i % 3],
      openToRelocate: preferences[(i + 1) % 3],
      openToPets: preferences[(i + 2) % 3],
      statusTag: "Available",
      values: ["Family-oriented", "Career-focused", "Ambitious"],
      motherTongue: i % 2 === 0 ? "Hindi" : "Tamil",
      diet: i % 2 === 0 ? "Vegetarian" : "Non-Vegetarian",
      smoking: "No",
      drinking: i % 4 === 0 ? "Occasionally" : "No",
      familyType: i % 2 === 0 ? "Nuclear" : "Joint",
    };
  });
}

module.exports = { getMatches, generateProfiles };
