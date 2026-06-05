require('dotenv').config();
const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.log('Firebase environment variables are missing in backend/.env');
  process.exit(0);
}

privateKey = privateKey.replace(/\\n/g, '\n');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} catch (e) {
  console.error('Initialization error:', e.message);
  process.exit(1);
}

const db = admin.firestore();

async function check() {
  try {
    const customersSnap = await db.collection('customers').get();
    console.log(`Customers count in Firestore: ${customersSnap.size}`);
    customersSnap.forEach(doc => {
      console.log(`- ID: ${doc.id}, Name: ${doc.data().firstName} ${doc.data().lastName}`);
    });

    const notesSnap = await db.collection('notes').get();
    console.log(`Notes count in Firestore: ${notesSnap.size}`);

    const sentSnap = await db.collection('sentMatches').get();
    console.log(`Sent matches count in Firestore: ${sentSnap.size}`);
  } catch (err) {
    console.error('Error querying Firestore:', err);
  }
  process.exit(0);
}

check();
