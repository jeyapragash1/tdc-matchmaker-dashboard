"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "@/lib/firebaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("demo_token");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    // Try Firebase sign-in first (if configured). If it fails, fall back to backend auth.
    try {
      await signIn(username, password);
      router.push("/dashboard");
      return;
    } catch {
      // fallback to backend simple auth
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const json = await res.json();
      if (json.token) {
        localStorage.setItem("demo_token", json.token);
      }
      router.push("/dashboard");
    } catch {
      alert("Use username: matchmaker and password: password123");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">
          Matchmaker Dashboard
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Sign in to manage customer profiles
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="matchmaker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>

          <button className="w-full rounded-lg bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sample: matchmaker / password123
        </p>
      </div>
    </div>
  );
}