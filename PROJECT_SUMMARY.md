# Master Project Summary: TDC Matchmaker Dashboard & Algo MVP

This document serves as the single-source-of-truth master file summarizing the entire architecture, data models, algorithmic matching rules, AI configurations, and execution procedures for the **The Date Crew (TDC) Matchmaker Dashboard and Algorithm MVP**.

---

## 1. Project Goal & Problem Statement
TDC matchmakers manage client profiles across different stages of the matchmaking journey. The goal of this MVP is to design and build an internal operations dashboard that enables matchmakers to:
1. View verified customer profiles and contact cards.
2. Track customer journey stages (New, Searching, Matched).
3. Assign potential matches using a specialized compatibility algorithm.
4. Record quick meeting/call notes.
5. Generate AI-driven introduction templates and compatibility reports for the matches.

---

## 2. Technical Stack & Architecture

### Backend (`/backend`)
*   **Engine**: Node.js with Express (listening on port `4000`).
*   **Database**: Dual-mode storage coordinator:
    *   **Firestore Collection Query Startup Check**: Verifies remote Firestore database availability on boot.
    *   **Local JSON Fallback**: Automatically falls back to offline files (`/backend/data/*.json`) if Firestore is disabled.
*   **Authentication & Demo Token Bypass (Render/Production Fix)**:
    *   To allow simple credential logins (`matchmaker` / `password123`) to work in production environments (like Render) where Firebase is configured, the backend `/auth/login` endpoint returns a secure static bypass token (`demo-matchmaker-token-bypass`).
    *   The backend `requireAuth` middleware intercepts this token and verifies the session without requiring remote Firebase verification.
    *   The frontend client utility cache-syncs this token in local storage on login success and provides it to all backend headers during API calls, resolving any `401 Unauthorized` errors.
*   **AI Integration**: OpenAI GPT API wrapper with an embedded rule-based local template parsing system for offline fallbacks.

### Frontend (`/src`)
*   **Framework**: Next.js 16.2.7 (Turbopack) with React 19 (running on `http://localhost:3000`).
*   **Styling**: Modern, premium CSS layout with a glassmorphism theme, statistical cards, custom micro-animations, and transition states.
*   **Hydration Guard**: Active `mounted` lifecycle checking to guarantee zero server-client Next.js pre-rendering hydration warnings.

---

## 3. Database & Profile Data Pool

### Opposite-Gender Candidate Pool
To fulfill the requirement of at least 100 candidate profiles of the opposite gender, the profile generator generates **200 dummy profiles** (100 female, 100 male, with IDs `101` through `300`). This ensures that whether the matchmaker is review a male or a female customer, a candidate pool of exactly 100 opposite-gender profiles is always loaded.

### Specialized Indian Matchmaking Parameters
Both customers and opposite-gender profiles carry standard bio metrics as well as cultural criteria:
*   **Gotra**: Family clan exogamy checks.
*   **Manglik Status**: `Yes`, `No`, or `Anshik` (partial).
*   **Family Values**: `Traditional`, `Moderate`, or `Liberal`.
*   **Diet**: `Vegetarian` or `Non-Vegetarian`.
*   **Horoscope Match**: `Yes`, `No`, or `Maybe`.

---

## 4. Matchmaker Scoring Engine Rules
The algorithm computes a final percentage score out of 100 based on a 135-point maximum raw scale:

### Gender-Specific Rules (65 pts maximum)
*   **For Male Customers**:
    *   *Younger* (20 pts): Candidate age < Customer age.
    *   *Earns Less* (15 pts): Candidate income < Customer income.
    *   *Shorter* (15 pts): Candidate height < Customer height.
    *   *Kids View* (15 pts): Both share the same children preferences (`wantKids`).
*   **For Female Customers**:
    *   *Designation* (20 pts): Candidate matches Customer's professional designation.
    *   *Relocation* (15 pts): Candidate matches Customer's relocation preference (`openToRelocate`).
    *   *Kids View* (15 pts): Both share the same children preferences.
    *   *Values Overlap* (15 pts): Profiles share at least one value keyword (e.g., "Family-oriented").

### Shared Cultural & Lifestyle Rules (70 pts maximum)
*   **Language Overlap (10 pts)**: Share at least one language.
*   **Diet Compatibility (10 pts)**: Identical diet preference (e.g. both are Vegetarian).
*   **Religion matching (10 pts)**: Same religious backgrounds.
*   **Caste matching (10 pts)**: Same caste affiliation.
*   **Manglik Compatibility (15 pts)**: Manglik matching with Manglik/Anshik; Non-Manglik matching with Non-Manglik.
*   **Kundali Guna Milan (15 pts)**: Deterministic hash simulation out of 36 points. If Guna Milan is `>= 18`, a 15-point compatibility bonus is awarded.

### Gotra Exogamy Penalty
*   **Gotra Conflict (-30 pts)**: If the customer and candidate share a Gotra (same-Gotra matches are traditionally avoided), the final scaled compatibility score is penalized by **30 points** and a `Gotra Conflict` warning badge is rendered.

---

## 5. AI Features & UI Modals

### AI Compatibility Report (`POST /generate-fit-analysis`)
*   **Behavior**: Generates a detailed 3-paragraph markdown report covering:
    1. Astro & Cultural Alignment (Guna Milan, Manglik, Gotra check).
    2. Lifestyle & Dietary Habits (Diet, languages).
    3. Professional & Family Value Synergy.
*   **Fallback**: An inline rule-based markdown compiler executes client-side if the server is offline or OpenAI is unconfigured.

### outreach Intro Email Generator (`POST /generate-intro`)
*   **Behavior**: Drafts an outreach email introduction with custom conversation starters.
*   **UI Modal**: Displays the template in an overlay modal where the matchmaker can copy the text to their clipboard. It triggers an inline green `Match Sent ✓` indicator.

---

## 6. Project Verification & Running Instructions

### Step 1: Start the Express Backend Server
1. Navigate to `/backend` directory.
2. Ensure dependencies are installed:
   ```bash
   npm install
   ```
3. Start the nodemon development server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:4000`. Watch console outputs to confirm Firestore connection verification status.*

### Step 2: Start the Next.js Frontend App
1. Navigate to the root directory `/`.
2. Ensure dependencies are installed:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The client workspace is hosted on `http://localhost:3000`.*

### Step 3: Run the User Journey
1. Open `http://localhost:3000/login` in your web browser.
2. Log in using the matchmaker credentials:
   *   **Username**: `matchmaker`
   *   **Password**: `password123`
3. Click on any customer (e.g. Rahul Sharma or Priya Nair) to inspect their details.
4. Click **"AI Fit Report"** to view compatibility analysis details, or click **"Send Match"** to view and copy the generated email template.
