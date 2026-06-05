"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { customers as localCustomers, type Customer } from "@/data/customers";
import { getMatches as fallbackGetMatches } from "@/lib/matching";
import { getIdToken } from "@/lib/firebaseClient";
import { useEffect, useMemo, useState } from "react";

type MatchSummary = {
  id: number | string;
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  score: number;
  label: string;
  explanation: string;
  designation?: string;
  wantKids?: string;
  openToRelocate?: string;
  motherTongue?: string;
};

type CustomerData = Customer;

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const initialCustomer = useMemo<CustomerData | null>(
    () => localCustomers.find((item) => item.id === id) || null,
    [id]
  );

  const [customer, setCustomer] = useState<CustomerData | null>(initialCustomer);
  const [note, setNote] = useState("");
  const [sentMatch, setSentMatch] = useState("");
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [generatingIntroFor, setGeneratingIntroFor] = useState<string | number | null>(null);

  useEffect(() => {
    async function loadCustomerAndMatches() {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

      let resolvedCustomer = customer ?? localCustomers.find((c) => c.id === id) ?? null;

      if (!resolvedCustomer) {
        try {
          const res = await fetch(`${API_BASE}/customers/${id}`);
          if (res.ok) {
            const json = await res.json();
            resolvedCustomer = json.customer as CustomerData;
            setCustomer(resolvedCustomer);
          }
        } catch (err) {
          console.warn("Failed to fetch customer from backend", err);
        }
      }

      if (!resolvedCustomer) {
        setMatches([]);
        setLoadingMatches(false);
        return;
      }

      setLoadingMatches(true);

      try {
        const token = await getIdToken().catch(() => null);
        const headers: HeadersInit | undefined = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;

        const res = await fetch(`${API_BASE}/matches?customerId=${resolvedCustomer.id}`, { headers });
        if (!res.ok) throw new Error("failed to fetch");
        const json = await res.json();
        setMatches((json.matches || []) as MatchSummary[]);
      } catch (err) {
        console.warn("Backend matches failed, falling back to client matching", err);
        const fallback = fallbackGetMatches(resolvedCustomer);
        setMatches(
          fallback.map((r) => ({
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
          }))
        );
      } finally {
        setLoadingMatches(false);
      }
    }

    loadCustomerAndMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Customer not found.</p>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            ← Back to Dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            Logout
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
          <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-pink-100">
                  Customer Matchmaking Profile
                </p>

                <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  {customer.firstName} {customer.lastName}
                </h1>

                <p className="mt-3 text-pink-50">
                  {customer.designation} • {customer.city}, {customer.country} •{" "}
                  {customer.maritalStatus}
                </p>
              </div>

              <span className="h-fit rounded-full bg-white px-5 py-2 text-sm font-bold text-pink-700">
                {customer.statusTag}
              </span>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-4">
            <HeroMetric label="Age" value={`${customer.age}`} />
            <HeroMetric label="Height" value={`${customer.height} cm`} />
            <HeroMetric
              label="Income"
              value={`₹${customer.income.toLocaleString()}`}
            />
            <HeroMetric label="Open to Relocate" value={customer.openToRelocate} />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <InfoPanel title="Personal Information">
                <Info label="First Name" value={customer.firstName} />
                <Info label="Last Name" value={customer.lastName} />
                <Info label="Gender" value={customer.gender} />
                <Info label="Date of Birth" value={customer.dateOfBirth} />
                <Info label="Country" value={customer.country} />
                <Info label="City" value={customer.city} />
              </InfoPanel>

              <InfoPanel title="Contact Information">
                <Info label="Email" value={customer.email} />
                <Info label="Phone Number" value={customer.phone} />
                <Info label="Languages Known" value={customer.languages.join(", ")} />
                <Info label="Mother Tongue" value={customer.motherTongue} />
              </InfoPanel>
            </div>

            <InfoPanel title="Education & Career">
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Undergraduate College" value={customer.college} />
                <Info label="Degree" value={customer.degree} />
                <Info label="Current Company" value={customer.company} />
                <Info label="Designation" value={customer.designation} />
                <Info
                  label="Income"
                  value={`₹${customer.income.toLocaleString()}`}
                />
              </div>
            </InfoPanel>

            <InfoPanel title="Family, Background & Lifestyle">
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Marital Status" value={customer.maritalStatus} />
                <Info label="Siblings" value={String(customer.siblings)} />
                <Info label="Caste" value={customer.caste} />
                <Info label="Religion" value={customer.religion} />
                <Info label="Diet" value={customer.diet} />
                <Info label="Smoking" value={customer.smoking} />
                <Info label="Drinking" value={customer.drinking} />
                <Info label="Family Type" value={customer.familyType} />
              </div>
            </InfoPanel>

            <InfoPanel title="Preferences">
              <div className="grid gap-4 md:grid-cols-3">
                <PreferencePill label="Want Kids" value={customer.wantKids} />
                <PreferencePill
                  label="Open to Relocate"
                  value={customer.openToRelocate}
                />
                <PreferencePill label="Open to Pets" value={customer.openToPets} />
              </div>
            </InfoPanel>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h2 className="text-xl font-bold">Meeting / Call Notes</h2>
              <p className="mt-1 text-sm text-slate-400">
                Record quick notes from customer meetings or calls.
              </p>

              <textarea
                className="mt-5 h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-pink-500"
                placeholder="Example: Customer prefers Mumbai-based profiles..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <button
                onClick={async () => {
                  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
                  try {
                    const res = await fetch(`${API_BASE}/notes`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ customerId: customer.id, note }),
                    });

                    if (!res.ok) throw new Error("failed to save note");
                    setNote("");
                    alert("Note saved successfully");
                  } catch (err) {
                    console.error(err);
                    alert("Failed to save note. Try again.");
                  }
                }}
                className="mt-4 rounded-xl bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700"
              >
                Save Note
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-pink-400">
                Match Recommendations
              </p>

              <h2 className="mt-2 text-2xl font-bold">Suggested Matches</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ranked using AI-style, gender-specific compatibility logic based
                on preferences, profile data, and matchmaking rules.
              </p>
            </div>

            {sentMatch && (
              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-semibold text-green-300">
                Match sent successfully to {sentMatch}
              </div>
            )}
            {loadingMatches && (
              <div className="p-4 text-sm text-slate-300">Loading matches…</div>
            )}

            {matches.map((match) => (
              <div
                key={match.id}
                className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {match.firstName} {match.lastName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {match.age} years • {match.city}
                    </p>
                  </div>

                  <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-extrabold text-pink-700">
                    {match.score}%
                  </span>
                </div>

                <div className="mt-4">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    {match.label}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm">
                  <MatchInfo label="Job" value={match.designation || "—"} />
                  <MatchInfo label="Kids" value={match.wantKids || "—"} />
                  <MatchInfo label="Relocate" value={match.openToRelocate || "—"} />
                  <MatchInfo label="Mother Tongue" value={match.motherTongue || "—"} />
                </div>

                <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
                  {match.explanation}
                </p>

                <button
                  onClick={async () => {
                    setGeneratingIntroFor(match.id);
                    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
                    try {
                      const token = await getIdToken().catch(() => null);
                      const headers: HeadersInit = token
                        ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
                        : { "Content-Type": "application/json" };
                      const res = await fetch(`${API_BASE}/generate-intro`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ customer, match }),
                      });

                      if (!res.ok) throw new Error("failed to generate intro");
                      const json = await res.json();
                      const intro = json.intro || json?.message || "";
                      alert(`Generated intro:\n\n${intro}`);
                      try {
                        await fetch(`${API_BASE}/matches/send`, {
                          method: "POST",
                          headers,
                          body: JSON.stringify({ customerId: customer?.id || id, match }),
                        });
                      } catch (e) {
                        console.warn("Failed to log sent match", e);
                      }
                      setSentMatch(`${match.firstName} ${match.lastName}`);
                    } catch (err) {
                      console.error(err);
                      alert("Failed to generate intro. Falling back to quick send.");
                      try {
                        const token = await getIdToken().catch(() => null);
                        const headers: HeadersInit = token
                          ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
                          : { "Content-Type": "application/json" };
                        await fetch(`${API_BASE}/matches/send`, {
                          method: "POST",
                          headers,
                          body: JSON.stringify({ customerId: customer?.id || id, match }),
                        });
                      } catch (e) {
                        console.warn("Failed to log sent match", e);
                      }
                      setSentMatch(`${match.firstName} ${match.lastName}`);
                    } finally {
                      setGeneratingIntroFor(null);
                    }
                  }}
                  className="mt-5 w-full rounded-xl bg-pink-600 py-3 font-bold text-white hover:bg-pink-700"
                >
                  {generatingIntroFor === match.id ? "Generating…" : "Send Match"}
                </button>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 bg-slate-900/80 p-5 md:border-r md:border-t-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
      <h2 className="mb-5 text-xl font-bold text-white">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function PreferencePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-pink-600/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-pink-200">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function MatchInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}