require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

async function readFrontendApiKey() {
  const rootEnv = path.join(__dirname, '..', '.env.local');
  try {
    const txt = fs.readFileSync(rootEnv, 'utf8');
    const m = txt.match(/^NEXT_PUBLIC_FIREBASE_API_KEY=(.*)$/m);
    return m ? m[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const admin = require('firebase-admin');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  privateKey = privateKey.replace(/\\n/g, '\n');
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });

  const uid = 'test-user-1';
  const customToken = await admin.auth().createCustomToken(uid);
  console.log('Created custom token');

  const apiKey = await readFrontendApiKey();
  if (!apiKey) {
    console.error('Could not read frontend API key from .env.local');
    process.exit(1);
  }

  const exchangeRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const exchangeJson = await exchangeRes.json();
  if (!exchangeJson.idToken) {
    console.error('Failed to exchange custom token:', exchangeJson);
    process.exit(1);
  }
  const idToken = exchangeJson.idToken;
  console.log('Obtained ID token');

  // Call generate-intros
  const body = {
    customer: { firstName: 'Rahul', lastName: 'Sharma', age: 31, designation: 'Software Engineer', city: 'Mumbai' },
    match: { firstName: 'Priya', lastName: 'Nair' },
    variants: 2,
  };

  const res = await fetch('http://localhost:4000/generate-intros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log('generate-intros response:');
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
