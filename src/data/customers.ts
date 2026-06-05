export type Gender = "Male" | "Female";
export type Preference = "Yes" | "No" | "Maybe";
export type ManglikStatus = "Yes" | "No" | "Anshik";
export type FamilyValuesType = "Traditional" | "Moderate" | "Liberal";

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  country: string;
  city: string;
  height: number;
  email: string;
  phone: string;
  college: string;
  degree: string;
  income: number;
  company: string;
  designation: string;
  maritalStatus: string;
  languages: string[];
  siblings: number;
  caste: string;
  religion: string;
  wantKids: Preference;
  openToRelocate: Preference;
  openToPets: Preference;
  statusTag: string;
  values: string[];

  motherTongue: string;
  diet: string;
  smoking: string;
  drinking: string;
  familyType: string;

  manglik: ManglikStatus;
  gotra: string;
  familyValues: FamilyValuesType;
  horoscopeMatch: Preference;
};

export const customers: Customer[] = [
  {
    id: 1,
    firstName: "Rahul",
    lastName: "Sharma",
    gender: "Male",
    dateOfBirth: "1994-05-12",
    age: 31,
    country: "India",
    city: "Mumbai",
    height: 176,
    email: "rahul.sharma@email.com",
    phone: "+91 9876543210",
    college: "Mumbai University",
    degree: "B.Tech Computer Science",
    income: 1800000,
    company: "Infosys",
    designation: "Software Engineer",
    maritalStatus: "Never Married",
    languages: ["English", "Hindi"],
    siblings: 1,
    caste: "Brahmin",
    religion: "Hindu",
    wantKids: "Yes",
    openToRelocate: "Maybe",
    openToPets: "Yes",
    statusTag: "Searching",
    values: ["Family-oriented", "Career-focused"],
    motherTongue: "Hindi",
    diet: "Vegetarian",
    smoking: "No",
    drinking: "No",
    familyType: "Nuclear",
    manglik: "No",
    gotra: "Bharadwaj",
    familyValues: "Moderate",
    horoscopeMatch: "Yes",
  },
  {
    id: 2,
    firstName: "Priya",
    lastName: "Nair",
    gender: "Female",
    dateOfBirth: "1996-09-20",
    age: 29,
    country: "India",
    city: "Bangalore",
    height: 164,
    email: "priya.nair@email.com",
    phone: "+91 9876543211",
    college: "Christ University",
    degree: "MBA",
    income: 1500000,
    company: "Deloitte",
    designation: "Business Analyst",
    maritalStatus: "Never Married",
    languages: ["English", "Malayalam", "Hindi"],
    siblings: 2,
    caste: "Nair",
    religion: "Hindu",
    wantKids: "Maybe",
    openToRelocate: "Yes",
    openToPets: "Maybe",
    statusTag: "New",
    values: ["Ambitious", "Family-oriented"],
    motherTongue: "Malayalam",
    diet: "Non-Vegetarian",
    smoking: "No",
    drinking: "Occasionally",
    familyType: "Joint",
    manglik: "Yes",
    gotra: "Kashyap",
    familyValues: "Traditional",
    horoscopeMatch: "Yes",
  },
];