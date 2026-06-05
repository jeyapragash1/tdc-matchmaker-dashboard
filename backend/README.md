# TDC Matchmaker Backend

This is a minimal Express backend for the TDC Matchmaker project. It provides endpoints for matches, notes, a sample auth, and an OpenAI intro stub.

Quick start

1. Install dependencies

```bash
cd backend
npm install
```

2. Copy the example env and start

```bash
cp .env.example .env
# (set OPENAI_API_KEY if you want OpenAI integration)
npm run dev
```

Endpoints

- `GET /health` — healthcheck
- `POST /auth/login` — body `{ username, password }` (matchmaker/password123)
- `GET /matches?customerId=1` — returns top matches for given customer
- `GET /notes?customerId=1` — returns notes for customer
- `POST /notes` — body `{ customerId, note }` to persist a note
- `POST /generate-intro` — body `{ customer, match }` returns a short intro; uses OpenAI when `OPENAI_API_KEY` is set

Firebase (optional)

You can configure the backend to use Firestore instead of the local JSON files by setting the following environment variables in `.env`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (replace literal newlines with `\n` if pasting)

When provided, the backend will read/write `customers`, `notes`, and `sentMatches` to Firestore collections. If the vars are not set, the backend falls back to local JSON storage in `backend/data/`.

Seed Firestore from local data

Once you set the Firebase env vars in `.env`, you can seed Firestore with the sample data by running:

```bash
npm run seed
```

This will upload `backend/data/customers.json`, `backend/data/notes.json`, and `backend/data/sentMatches.json` into Firestore collections.

Data

- `data/customers.json` — sample customers (copied from frontend)
- `matching.js` — generates 100 dummy profiles and contains match logic
