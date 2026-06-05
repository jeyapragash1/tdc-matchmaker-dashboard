require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getMatches, generateProfiles } = require('./matching');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const dataDir = path.join(__dirname, 'data');
const customersFile = path.join(dataDir, 'customers.json');
const notesFile = path.join(dataDir, 'notes.json');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function writeJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

const customers = readJSON(customersFile) || [];
const notes = readJSON(notesFile) || [];
let profiles = generateProfiles();

// Firestore (optional) — initialize if env vars present
let firestore = null;
function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    // handle escaped newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
    try {
      const admin = require('firebase-admin');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      firestore = admin.firestore();
      console.log('Firebase initialized — verifying connection...');
    } catch (e) {
      console.warn('Failed to init Firebase Admin, falling back to JSON files:', e && e.message);
      firestore = null;
    }
  } else {
    console.log('No Firebase credentials found — using local JSON storage.');
  }
}

initFirebase();

// Validate Firestore connection with a trial query
if (firestore) {
  firestore.collection('customers').limit(1).get()
    .then(() => {
      console.log('Firestore connection verified and active — using remote database.');
    })
    .catch((e) => {
      console.warn('Firestore service connection failed (API disabled or network error):', e.message);
      console.warn('Falling back to local JSON storage for this session.');
      firestore = null;
    });
}


// Authentication middleware — when Firebase admin is initialized, require a valid ID token
let admin = null;
try {
  admin = require('firebase-admin');
} catch (e) {
  admin = null;
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.*)$/);
  const idToken = match ? match[1] : null;

  // Allow static demo token bypass in both Firestore and local JSON modes
  if (idToken === 'demo-matchmaker-token-bypass') {
    req.user = { uid: 'demo-matchmaker', email: 'matchmaker@email.com' };
    return next();
  }

  if (!firestore || !admin) return next(); // no firebase configured — allow through
  if (!idToken) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (e) {
    console.error('Token verification failed', e && e.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'matchmaker' && password === 'password123') {
    return res.json({ ok: true, token: 'demo-matchmaker-token-bypass' });
  }

  return res.status(401).json({ ok: false, message: 'Invalid credentials' });
});

app.get('/matches', requireAuth, async (req, res) => {
  const id = Number(req.query.customerId);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid customerId' });

  let customer = null;
  if (firestore) {
    try {
      const doc = await firestore.collection('customers').doc(String(id)).get();
      if (!doc.exists) return res.status(404).json({ error: 'Customer not found' });
      customer = { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('Firestore read error', e);
      return res.status(500).json({ error: 'Firestore error' });
    }
  } else {
    customer = customers.find((c) => c.id === id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
  }

  const results = getMatches(customer, profiles);

  // Return trimmed match info (avoid sending full profile if desired)
  const trimmed = results.map((r) => ({
    id: r.profile.id,
    firstName: r.profile.firstName,
    lastName: r.profile.lastName,
    city: r.profile.city,
    age: r.profile.age,
    score: r.score,
    label: r.label,
    explanation: r.explanation,
    designation: r.profile.designation,
    wantKids: r.profile.wantKids,
    openToRelocate: r.profile.openToRelocate,
    motherTongue: r.profile.motherTongue,
    diet: r.profile.diet,
    gotra: r.profile.gotra,
    manglik: r.profile.manglik,
    familyValues: r.profile.familyValues,
    gunaMilan: r.gunaMilan,
    gotraConflict: r.gotraConflict,
  }));

  res.json({ matches: trimmed });
});

app.get('/customers', requireAuth, async (req, res) => {
  if (firestore) {
    try {
      const snapshot = await firestore.collection('customers').get();
      const customers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json({ customers });
    } catch (e) {
      console.error('Firestore read error', e);
      return res.status(500).json({ error: 'Firestore error' });
    }
  }
  const all = readJSON(customersFile) || [];
  res.json({ customers: all });
});

app.get('/customers/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  if (firestore) {
    try {
      const doc = await firestore.collection('customers').doc(String(id)).get();
      if (!doc.exists) return res.status(404).json({ error: 'Customer not found' });
      return res.json({ customer: { id: doc.id, ...doc.data() } });
    } catch (e) {
      console.error('Firestore read error', e);
      return res.status(500).json({ error: 'Firestore error' });
    }
  }
  const all = readJSON(customersFile) || [];
  const customer = all.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ customer });
});

// Log a sent match (simple persistence)
const sentFile = path.join(dataDir, 'sentMatches.json');
if (!fs.existsSync(sentFile)) writeJSON(sentFile, []);

app.post('/matches/send', requireAuth, async (req, res) => {
  const { customerId, match } = req.body || {};
  if (!customerId || !match) return res.status(400).json({ error: 'Missing fields' });
  const entry = {
    customerId,
    match,
    sentAt: new Date().toISOString(),
  };

  if (firestore) {
    try {
      const ref = await firestore.collection('sentMatches').add(entry);
      const saved = await ref.get();
      return res.json({ ok: true, entry: { id: ref.id, ...saved.data() } });
    } catch (e) {
      console.error('Firestore write error', e);
      return res.status(500).json({ error: 'Firestore error' });
    }
  }

  const sent = readJSON(sentFile) || [];
  const fullEntry = { id: Date.now(), ...entry };
  sent.push(fullEntry);
  writeJSON(sentFile, sent);
  res.json({ ok: true, entry: fullEntry });
});

app.get('/notes', requireAuth, async (req, res) => {
  const id = Number(req.query.customerId);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid customerId' });
  if (firestore) {
    try {
      const snapshot = await firestore.collection('notes').where('customerId', '==', id).get();
      const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json({ notes });
    } catch (e) {
      console.error('Firestore read error', e);
      return res.status(500).json({ error: 'Firestore error' });
    }
  }

  const allNotes = readJSON(notesFile) || [];
  const filtered = allNotes.filter((n) => n.customerId === id);
  res.json({ notes: filtered });
});

app.post('/notes', requireAuth, async (req, res) => {
  const { customerId, note } = req.body || {};
  if (!customerId || !note) return res.status(400).json({ error: 'Missing fields' });

  const newNote = {
    id: Date.now(),
    customerId,
    note,
    createdAt: new Date().toISOString(),
  };

  if (firestore) {
    try {
      const ref = await firestore.collection('notes').add(newNote);
      const saved = await ref.get();
      return res.json({ ok: true, note: { id: ref.id, ...saved.data() } });
    } catch (e) {
      console.error('Firestore write error', e);
      return res.status(500).json({ error: 'Firestore error' });
    }
  }

  const allNotes = readJSON(notesFile) || [];
  allNotes.push(newNote);
  writeJSON(notesFile, allNotes);

  res.json({ ok: true, note: newNote });
});

app.post('/generate-intro', requireAuth, async (req, res) => {
  const { customer, match } = req.body || {};

  // If OPENAI_API_KEY is provided, call OpenAI; otherwise return a simple template.
  if (!process.env.OPENAI_API_KEY) {
    const intro = `Hi ${match.firstName},\n\nWe have a potential match for you: ${customer.firstName} ${customer.lastName}, ${customer.age} years, ${customer.city}.\n\nShort intro: ${customer.firstName} is ${customer.designation} based in ${customer.city} and is looking for someone who shares ${customer.values?.join(', ') || 'similar values'}.\n\nRegards,\nTDC Matchmaker`;
    return res.json({ intro });
  }

  // Optional: integrate OpenAI here (left as a placeholder to avoid mandatory key requirement)
  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const prompt = `Write a concise, friendly 2-sentence introduction email for ${customer.firstName} ${customer.lastName} (age ${customer.age}, ${customer.designation}, ${customer.city}) to be sent to ${match.firstName} ${match.lastName}. Include why they might be a good match and one suggested conversation starter.`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    const intro = completion.data.choices[0].message.content.trim();
    return res.json({ intro });
  } catch (err) {
    console.error('OpenAI error', err?.message || err);
    return res.status(500).json({ error: 'OpenAI error', details: err?.message });
  }
});

// Generate multiple intro variants (optional AI). Accepts { customer, match, variants }
app.post('/generate-intros', requireAuth, async (req, res) => {
  const { customer, match, variants = 3 } = req.body || {};
  if (!customer || !match) return res.status(400).json({ error: 'Missing customer or match' });

  // If no OpenAI key, return simple template variants
  if (!process.env.OPENAI_API_KEY) {
    const outs = [];
    for (let i = 0; i < Math.max(1, Math.min(5, variants)); i++) {
      outs.push(`Hi ${match.firstName},\n\nWe have a potential match for you: ${customer.firstName} ${customer.lastName}, ${customer.age} years, ${customer.city}.\n\nShort intro: ${customer.firstName} is ${customer.designation} based in ${customer.city} and is looking for someone who shares ${customer.values?.join(', ') || 'similar values'}.\n\nRegards,\nTDC Matchmaker`);
    }
    return res.json({ intros: outs });
  }

  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const prompt = `Write ${variants} concise, friendly 1-2 sentence introduction messages for ${customer.firstName} ${customer.lastName} (age ${customer.age}, ${customer.designation}, ${customer.city}) to be sent to ${match.firstName} ${match.lastName}. For each variant include a suggested conversation starter. Return each variant as a separate paragraph.`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const text = completion.data.choices[0].message.content.trim();
    // Split on double newlines as simple separator
    const parts = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    return res.json({ intros: parts.slice(0, variants) });
  } catch (err) {
    console.error('OpenAI error (generate-intros)', err?.message || err);
    return res.status(500).json({ error: 'OpenAI error', details: err?.message });
  }
});

// AI re-ranker: accepts { customer, matches } and returns a re-ranked matches array
app.post('/ai/rerank', requireAuth, async (req, res) => {
  const { customer, matches } = req.body || {};
  if (!customer || !Array.isArray(matches)) return res.status(400).json({ error: 'Missing customer or matches array' });

  // Fallback: return original order if no model key
  if (!process.env.OPENAI_API_KEY) {
    return res.json({ matches });
  }

  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const sample = matches.slice(0, 10).map((m, idx) => `${idx + 1}. ${m.firstName} ${m.lastName} (${m.age}, ${m.city}) - score:${m.score}`).join('\n');
    const prompt = `You are an assistant that re-ranks match suggestions. Given the customer:\n${JSON.stringify(customer)}\n\nAnd the following matches (one per line):\n${sample}\n\nReturn a JSON array of indices (1-based) representing the recommended order, ranked best-first, based on compatibility. Only output valid JSON like: [3,1,2]`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const text = completion.data.choices[0].message.content.trim();
    // Try to extract JSON from response
    let order = null;
    try {
      const maybe = text.match(/\[.*\]/s);
      order = maybe ? JSON.parse(maybe[0]) : JSON.parse(text);
    } catch (e) {
      console.warn('Failed to parse AI rerank output, returning original', e && e.message);
      return res.json({ matches });
    }

    const reordered = [];
    for (const i of order) {
      const idx = Number(i) - 1;
      if (idx >= 0 && idx < matches.length) reordered.push(matches[idx]);
    }
    // append any missing
    for (let i = 0; i < matches.length; i++) if (!reordered.includes(matches[i])) reordered.push(matches[i]);

    return res.json({ matches: reordered });
  } catch (err) {
    console.error('OpenAI error (rerank)', err?.message || err);
    return res.status(500).json({ error: 'OpenAI error', details: err?.message });
  }
});

// AI Fit Analysis: accepts { customer, match } and returns detailed compatibility analysis
app.post('/generate-fit-analysis', requireAuth, async (req, res) => {
  const { customer, match } = req.body || {};
  if (!customer || !match) return res.status(400).json({ error: 'Missing customer or match profile' });

  // Fallback: rule-based template if no OpenAI key
  if (!process.env.OPENAI_API_KEY) {
    let analysis = `### Astro-Compatibility Check\n`;
    analysis += `- **Kundali Match**: Guna Milan score is **${match.gunaMilan || '18'}/36**. A score of 18 or above signifies good compatibility.\n`;
    
    const isCustomerManglik = customer.manglik === "Yes" || customer.manglik === "Anshik";
    const isMatchManglik = match.manglik === "Yes" || match.manglik === "Anshik";
    
    if (isCustomerManglik && isMatchManglik) {
      analysis += `- **Manglik Status**: Both are Manglik/Anshik, achieving astrological balance (Manglik Dosha cancellation).\n`;
    } else if (!isCustomerManglik && !isMatchManglik) {
      analysis += `- **Manglik Status**: Both are Non-Manglik, ensuring standard astrological compatibility.\n`;
    } else {
      analysis += `- **Manglik Status**: Warning: One is Manglik (${customer.manglik}) and the other is not (${match.manglik}). This mismatch might require further consultation.\n`;
    }

    if (customer.gotra && match.gotra && customer.gotra.toLowerCase() === match.gotra.toLowerCase()) {
      analysis += `- **Gotra Exogamy**: **Gotra Conflict Detected** (both belong to the ${customer.gotra} Gotra). Same-Gotra matching is traditionally discouraged.\n`;
    } else {
      analysis += `- **Gotra Exogamy**: Passed. They belong to different Gotras (${customer.gotra || 'N/A'} vs ${match.gotra || 'N/A'}).\n`;
    }

    analysis += `\n### Lifestyle & Social Alignment\n`;
    analysis += `- **Dietary Preference**: ${customer.diet === match.diet ? `Both share a ${customer.diet} diet, simplifying lifestyle integration.` : `Dietary difference (${customer.diet} vs ${match.diet}).`}\n`;
    analysis += `- **Mother Tongue**: Shared mother tongue or language capability exists (${customer.motherTongue || 'Hindi'} & ${match.motherTongue || 'Hindi'}).\n`;
    
    analysis += `\n### Professional & Values Fit\n`;
    analysis += `- **Career**: ${customer.firstName} is a ${customer.designation} at ${customer.company || 'their firm'} and ${match.firstName} works as a ${match.designation || 'professional'} at ${match.company || 'their firm'}.\n`;
    analysis += `- **Family Values**: Compatible family background values (${customer.familyValues || 'Moderate'} vs ${match.familyValues || 'Moderate'}).\n`;
    
    return res.json({ analysis });
  }

  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const prompt = `You are a professional matchmaker. Write a comprehensive, elegant, structured 3-paragraph compatibility analysis between the following two profiles.
Customer: ${JSON.stringify(customer)}
Candidate Match: ${JSON.stringify(match)}

Structure your response into 3 distinct sections with markdown subheadings:
1. ### Astro & Cultural Alignment: Discuss their Guna Milan score (${match.gunaMilan || 'N/A'}), Gotra check (Customer's Gotra is ${customer.gotra || 'N/A'} and Candidate's Gotra is ${match.gotra || 'N/A'}; note if they match it is a conflict), and Manglik status.
2. ### Lifestyle & Dietary Habits: Discuss their diet, languages, and general habits.
3. ### Professional & Family Value Synergy: Discuss their career, designation, family values, and what common themes they can talk about.

Make the tone highly professional, encouraging, yet honest.`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const analysis = completion.data.choices[0].message.content.trim();
    return res.json({ analysis });
  } catch (err) {
    console.error('OpenAI error (fit-analysis)', err?.message || err);
    return res.status(500).json({ error: 'OpenAI error', details: err?.message });
  }
});

app.listen(PORT, () => {
  console.log(`Matchmaker backend running on http://localhost:${PORT}`);
});
