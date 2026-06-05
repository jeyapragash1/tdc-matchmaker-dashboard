# Submission Write-up - TDC Matchmaker Dashboard & Algo MVP

This project uses Next.js 16.2.7 (Turbopack) for the frontend dashboard and a separate Node.js/Express backend on port 4000. It is designed to help the TDC matchmaking team manage clients, review verified biodata, run advanced matchmaking queries, write interaction notes, and generate candidate intros. The frontend is built as a Client Component system with automatic SSR-hydration protection, offering a highly responsive glassmorphism aesthetic, stats summaries, and instant transitions. The backend provides secure API operations, authentication middleware (token-based check when Firebase is enabled), a self-verifying Firestore startup fallback (automatically switching to local JSON files if Firestore API is disabled or inaccessible), and an AI generation engine.

## The Matching Pool & Algorithm
To satisfy the requirement of at least 100 opposite-gender candidates, the profile database generates **200 dummy profiles** (100 male and 100 female profiles). This guarantees that whether the active customer is male or female, there is always a pool of at least 100 candidates of the opposite gender. 

The algorithm has been overhauled to integrate specialized **Indian Matchmaking Rules** alongside the original requirements, computing a score out of 100 based on a 135-point raw weight structure:
1. **Gender-Specific Weights (65 pts)**:
   - **For Male Customers**: Younger (20 pts), earns less (15 pts), shorter (15 pts), and matching kids views (15 pts).
   - **For Female Customers**: Similar professional designation (20 pts), matching relocation views (15 pts), matching kids views (15 pts), and shared values (15 pts).
2. **Shared Cultural & Lifestyle Weights (70 pts)**:
   - **Diet Alignment (10 pts)**: vegetarian vs non-vegetarian preferences must align.
   - **Language Overlap (10 pts)**: sharing at least one common language.
   - **Religion (10 pts) & Caste Matching (10 pts)**.
   - **Manglik Compatibility (15 pts)**: Aligning Manglik with Manglik/Anshik and Non-Manglik with Non-Manglik.
   - **Kundali Guna Milan (15 pts)**: A simulated Guna Milan score out of 36 is computed deterministically. If the score is >= 18, the match receives a 15-point bonus.
3. **Gotra Exogamy Penalty (-30 pts & warning badge)**: Belonging to the same Gotra is traditionally avoided in Hindu marriages. If the customer and candidate share a Gotra, a -30 point penalty is applied, and a warning is flagged on the dashboard.

## AI Features & Fallbacks
Two AI-driven features are implemented in the Express backend:
1. **Email Intro Generator (`POST /generate-intro`)**: Drafts a friendly 2-sentence introduction email with custom conversation starters. It displays in a smooth, custom copy-to-clipboard modal in the frontend, preventing intrusive popups.
2. **AI Compatibility Report (`POST /generate-fit-analysis`)**: Analyzes the specific strengths, lifestyle alignments, and astrological factors of the two profiles, structured into three distinct markdown headers. 

Both AI features are designed with **robust, rich fallbacks**: if `OPENAI_API_KEY` is not set or the API fails, the system automatically uses a detailed, structured rule-based template parser on the server (or client) to populate the emails and reports with the correct Guna Milan, Gotra validation, diet, and career information. This ensures the app is fully functional and offers a premium user experience out-of-the-box.
