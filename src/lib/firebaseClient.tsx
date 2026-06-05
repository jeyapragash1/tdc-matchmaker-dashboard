"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_token");
  }
  return fbSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  if (!auth.currentUser) {
    if (typeof window !== "undefined") {
      return localStorage.getItem("demo_token");
    }
    return null;
  }
  return auth.currentUser.getIdToken();
}

export { auth };
