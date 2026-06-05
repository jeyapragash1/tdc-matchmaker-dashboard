// Overhauled matching logic for Indian Matchmaking MVP

function getLabel(score) {
  if (score >= 80) return "High Potential Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Low Priority Match";
}

// Deterministic simulation of Kundali Guna Milan score (12-36)
function calculateGunaMilan(cust, cand) {
  const hash = (cust.id * cand.id * 17) % 25;
  return hash + 12; // ranges from 12 to 36
}

function getMatches(customer, profiles) {
  const oppositeProfiles = profiles.filter(
    (profile) => profile.gender !== customer.gender
  );

  const results = oppositeProfiles.map((profile) => {
    let rawScore = 0;
    let maxRawScore = 135;
    const reasons = [];

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
    // Manglik matches Manglik/Anshik, Non-Manglik matches Non-Manglik
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

// Generate 200 dummy profiles (matching src/data/profiles.ts)
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
  const gotras = ["Kashyap", "Bharadwaj", "Vasishta", "Gautam", "Atri", "Vatsa", "Agastya"];
  const manglikOptions = ["Yes", "No", "Anshik"];
  const familyValuesOptions = ["Traditional", "Moderate", "Liberal"];

  return Array.from({ length: 200 }, (_, i) => {
    const isFemale = i < 100;
    const name = isFemale 
      ? femaleNames[i % femaleNames.length] 
      : maleNames[(i - 100) % maleNames.length];

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

      manglik: manglikOptions[i % manglikOptions.length],
      gotra: gotras[i % gotras.length],
      familyValues: familyValuesOptions[i % familyValuesOptions.length],
      horoscopeMatch: preferences[i % 3],
    };
  });
}

module.exports = { getMatches, generateProfiles };

