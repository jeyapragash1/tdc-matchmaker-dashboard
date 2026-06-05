import { Customer } from "./customers";

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
const preferences = ["Yes", "No", "Maybe"] as const;
const gotras = ["Kashyap", "Bharadwaj", "Vasishta", "Gautam", "Atri", "Vatsa", "Agastya"];
const manglikOptions = ["Yes", "No", "Anshik"] as const;
const familyValuesOptions = ["Traditional", "Moderate", "Liberal"] as const;

export const profiles: Customer[] = Array.from({ length: 200 }, (_, i) => {
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
    phone: `+91 90000000${i.toString().padStart(2, "0")}`,
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