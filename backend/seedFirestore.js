require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const customersFile = path.join(dataDir, 'customers.json');
const notesFile = path.join(dataDir, 'notes.json');
const sentFile = path.join(dataDir, 'sentMatches.json');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) || [];
  } catch (e) {
    return [];
  }
}

async function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return admin.firestore();
}

(async () => {
  const db = await initFirebase();
  const customers = readJSON(customersFile);
  const notes = readJSON(notesFile);
  const sent = readJSON(sentFile);

  console.log(`Seeding ${customers.length} customers`);
  for (const c of customers) {
    const id = String(c.id);
    await db.collection('customers').doc(id).set(c);
  }

  console.log(`Seeding ${notes.length} notes`);
  for (const n of notes) {
    await db.collection('notes').add(n);
  }

  console.log(`Seeding ${sent.length} sentMatches`);
  for (const s of sent) {
    await db.collection('sentMatches').add(s);
  }

  console.log('Seeding complete.');
  process.exit(0);
})();
