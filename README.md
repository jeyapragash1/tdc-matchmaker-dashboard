# TDC Matchmaker Dashboard MVP

A production-style internal Matchmaker Dashboard MVP built for **The Date Crew Full Stack Developer Intern Assignment**.

This application helps matchmakers manage customer profiles, view detailed biodata, track customer journey stages, review suggested matches, save meeting notes, and send mock match recommendations.

## Live Demo

Add your Vercel link here:

```text
Live URL:https://tdc-matchmaker-dashboard-7x7b.vercel.app/
```

## GitHub Repository

```text
https://github.com/jeyapragash1/tdc-matchmaker-dashboard
```

## Sample Login Credentials

```text
Username: matchmaker
Password: password123
```

## Project Goal

The goal of this project is to design and build an internal dashboard that helps the TDC matchmaking team:

* View verified customer profiles
* Track each customer’s matchmaking journey
* Assign potential matches
* Record quick notes from meetings or calls
* Review AI-style compatibility explanations

## Features

### Landing Page

A production-style landing page introducing the Matchmaker Dashboard MVP with workflow highlights and business-focused metrics.

### Matchmaker Login

A basic login screen using sample credentials.

### Customer Dashboard

Displays all assigned customers with:

* Name
* Age
* City
* Marital Status
* Status Tag / Journey Stage

Clicking a customer opens their detailed matchmaking profile.

### Customer Detailed View

Each customer profile includes complete biodata:

* First Name and Last Name
* Gender
* Date of Birth
* Country and City
* Height
* Email and Phone Number
* Undergraduate College and Degree
* Income
* Current Company and Designation
* Marital Status
* Languages Known
* Siblings
* Caste and Religion
* Want Kids
* Open to Relocate
* Open to Pets

Additional Indian matchmaking-related fields were also included:

* Mother Tongue
* Diet
* Smoking
* Drinking
* Family Type

### Dummy Match Profiles

The project includes a matchmaking pool of **100 dummy profiles** to simulate real matchmaking recommendations.

### Gender-Specific Matching Logic

For male customers, the system prioritizes profiles based on:

* Younger age
* Lower income
* Shorter height
* Matching views on children
* Common language

For female customers, the system uses compatibility based on:

* Professional background
* Shared values
* Relocation preference
* Children preference
* Common language

### AI-Style Compatibility Scoring

The project uses similarity-based compatibility logic to score and rank matches.

Each suggested match includes:

* Compatibility percentage
* Match label such as `High Potential Match`
* Natural-language explanation describing why the match was recommended

This approach provides transparent and explainable recommendations for matchmakers.

### Send Match Action

Each suggested match includes a **Send Match** button.

When clicked, the system shows a mock success confirmation.

### Meeting / Call Notes

The customer detail page includes a notes section where matchmakers can record quick notes from meetings or calls.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Data

* Static TypeScript data files
* 100 generated dummy profiles

### AI / Matching

* Similarity-based compatibility scoring
* Rule-based AI-style explanation generation

### Hosting

* Vercel

## Folder Structure

```text
tdc-matchmaker-dashboard/
├── public/
├── src/
│   ├── app/
│   │   ├── customer/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── data/
│   │   ├── customers.ts
│   │   └── profiles.ts
│   └── lib/
│       └── matching.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Important Pages

```text
/              Landing Page
/login         Matchmaker Login
/dashboard     Customer Dashboard
/customer/1    Customer Detail and Suggested Matches
/customer/2    Customer Detail and Suggested Matches
```

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/jeyapragash1/tdc-matchmaker-dashboard.git
```

### 2. Open Project Folder

```bash
cd tdc-matchmaker-dashboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Open in Browser

```text
http://localhost:3000
```

## Build Command

```bash
npm run build
```

## Matching Logic Explanation

The matching engine filters profiles by opposite gender and calculates a compatibility score based on customer gender-specific rules.

For male customers, the logic follows the assignment requirement directly by checking younger age, lower income, shorter height, and matching views on children.

For female customers, the logic uses thoughtful compatibility signals such as profession, shared values, relocation preference, children preference, and common language.

The result is sorted by highest compatibility score and displayed as suggested matches.

## AI Usage Explanation

Instead of using a paid external AI API, this MVP uses similarity-based AI-style reasoning. The system generates compatibility scores and readable explanations based on the matching rules.

This makes the recommendation process:

* Transparent
* Fast
* Cost-effective
* Easy to explain during review
* Suitable for an MVP

Example:

```text
High Potential Match: This profile is ranked highly because the suggested profile is younger, income expectation fits the stated matching rule, height preference is aligned, both have matching views on children, and they share a common language.
```

## Assumptions Made

* This MVP is designed as an internal tool for matchmakers, not a public dating application.
* Authentication is simplified using sample login credentials.
* Static data is used to keep the MVP lightweight and easy to review.
* The Send Match button triggers a mock action instead of sending a real email.
* Similarity-based scoring is used instead of a paid OpenAI integration to keep the solution transparent and cost-effective.
* Customer notes are implemented as part of the frontend MVP workflow.
* The dummy profiles are generated to simulate a matchmaking pool.

## Evaluation Coverage

This project covers the assignment evaluation criteria as follows:

### UI/UX

Clean, modern, production-style interface with landing page, dashboard, biodata view, and match recommendation cards.

### Matching Logic

Gender-specific compatibility scoring based on realistic matchmaking rules.

### AI Integration

Similarity-based scoring with AI-style natural-language explanations.

### Code Quality

Modular Next.js structure with separate data and matching logic files.

### Ownership

Includes landing page, dashboard, detailed customer views, 100 dummy profiles, match scoring, explanations, notes, and mock send-match action.

## Author

```text
Kisho Jeyapragash
```
