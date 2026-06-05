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
  diet?: string;
  gotra?: string;
  manglik?: string;
  familyValues?: string;
  gunaMilan?: number;
  gotraConflict?: boolean;
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

  const [analyzingMatchId, setAnalyzingMatchId] = useState<string | number | null>(null);
  const [compatibilityReports, setCompatibilityReports] = useState<Record<string | number, string>>({});
  const [sentMatchIds, setSentMatchIds] = useState<Set<number | string>>(new Set());
  const [generatedIntro, setGeneratedIntro] = useState<string | null>(null);
  const [introTargetName, setIntroTargetName] = useState<string>("");

  const handleViewCompatibilityReport = async (match: MatchSummary) => {
    if (compatibilityReports[match.id]) {
      setAnalyzingMatchId(analyzingMatchId === match.id ? null : match.id);
      return;
    }

    setAnalyzingMatchId(match.id);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    try {
      const token = await getIdToken().catch(() => null);
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE}/generate-fit-analysis`, {
        method: "POST",
        headers,
        body: JSON.stringify({ customer, match }),
      });

      if (!res.ok) throw new Error("Failed to fetch compatibility report");
      const json = await res.json();
      setCompatibilityReports(prev => ({
        ...prev,
        [match.id]: json.analysis || "No compatibility analysis was returned."
      }));
    } catch (err) {
      console.error(err);
      // Client-side local fallback generation if backend is unavailable/fails
      let fallbackReport = `### Astro & Cultural Alignment\n`;
      fallbackReport += `- **Kundali Match**: Guna Milan score is **${match.gunaMilan || '18'}/36**. A score of 18 or above signifies good compatibility.\n`;
      
      const isCustomerManglik = customer?.manglik === "Yes" || customer?.manglik === "Anshik";
      const isMatchManglik = match.manglik === "Yes" || match.manglik === "Anshik";
      
      if (isCustomerManglik && isMatchManglik) {
        fallbackReport += `- **Manglik Status**: Both are Manglik/Anshik, achieving astrological balance (Manglik Dosha cancellation).\n`;
      } else if (!isCustomerManglik && !isMatchManglik) {
        fallbackReport += `- **Manglik Status**: Both are Non-Manglik, ensuring standard astrological compatibility.\n`;
      } else {
        fallbackReport += `- **Manglik Status**: Warning: One is Manglik (${customer?.manglik}) and the other is not (${match.manglik}). This mismatch might require further consultation.\n`;
      }

      if (customer?.gotra && match.gotra && customer.gotra.toLowerCase() === match.gotra.toLowerCase()) {
        fallbackReport += `- **Gotra Exogamy**: **Gotra Conflict Detected** (both belong to the ${customer.gotra} Gotra). Same-Gotra matching is traditionally discouraged.\n`;
      } else {
        fallbackReport += `- **Gotra Exogamy**: Passed. They belong to different Gotras (${customer?.gotra || 'N/A'} vs ${match.gotra || 'N/A'}).\n`;
      }

      fallbackReport += `\n### Lifestyle & Dietary Habits\n`;
      fallbackReport += `- **Dietary Preference**: ${customer?.diet === match.diet ? `Both share a ${customer?.diet} diet, simplifying lifestyle integration.` : `Dietary difference (${customer?.diet} vs ${match.diet}).`}\n`;
      fallbackReport += `- **Mother Tongue**: Shared mother tongue or language capability exists (${customer?.motherTongue || 'Hindi'} & ${match.motherTongue || 'Hindi'}).\n`;
      
      fallbackReport += `\n### Professional & Family Value Synergy\n`;
      fallbackReport += `- **Career**: ${customer?.firstName} is a ${customer?.designation} and ${match.firstName} works as a ${match.designation || 'professional'}.\n`;
      fallbackReport += `- **Family Values**: Compatible family background values (${customer?.familyValues || 'Moderate'} vs ${match.familyValues || 'Moderate'}).\n`;

      setCompatibilityReports(prev => ({
        ...prev,
        [match.id]: fallbackReport
      }));
    }
  };

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
            diet: r.profile.diet,
            gotra: r.profile.gotra,
            manglik: r.profile.manglik,
            familyValues: r.profile.familyValues,
            gunaMilan: r.gunaMilan,
            gotraConflict: r.gotraConflict,
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
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
          >
            ← Back to Dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all duration-200"
          >
            Logout
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
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

              <span className="h-fit rounded-full bg-white px-5 py-2 text-sm font-bold text-pink-700 shadow-md">
                {customer.statusTag}
              </span>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-4">
            <HeroMetric label="Age" value={`${customer.age}`} />
            <HeroMetric label="Height" value={`${customer.height} cm`} />
            <HeroMetric
              label="Income"
              value={`₹${customer.income.toLocaleString("en-IN")}`}
            />
            <HeroMetric label="Open to Relocate" value={customer.openToRelocate} />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
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
                  value={`₹${customer.income.toLocaleString("en-IN")}`}
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
                <Info label="Gotra" value={customer.gotra || "—"} />
                <Info label="Manglik Status" value={customer.manglik || "—"} />
                <Info label="Family Values" value={customer.familyValues || "—"} />
                <Info label="Horoscope Match Required" value={customer.horoscopeMatch || "—"} />
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

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h2 className="text-xl font-bold">Meeting / Call Notes</h2>
              <p className="mt-1 text-sm text-slate-400">
                Record quick notes from customer meetings or calls.
              </p>

              <textarea
                className="mt-5 h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-pink-500 transition-all duration-200"
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
                className="mt-4 rounded-xl bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700 cursor-pointer transition-all duration-200"
              >
                Save Note
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-sm font-semibold text-pink-400">
                Match Recommendations
              </p>

              <h2 className="mt-2 text-2xl font-bold">Suggested Matches</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ranked using gender-specific compatibility, Manglik matching, Gotra check, and Guna Milan.
              </p>
            </div>

            {sentMatch && (
              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-semibold text-green-300 animate-in fade-in slide-in-from-top-2 duration-300">
                Match sent successfully to {sentMatch}
              </div>
            )}
            {loadingMatches && (
              <div className="p-4 text-sm text-slate-300 flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                <span>Loading matches…</span>
              </div>
            )}

            {matches.map((match) => (
              <div
                key={match.id}
                className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {match.firstName} {match.lastName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {match.age} years • {match.city}
                    </p>
                  </div>

                  <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-extrabold text-pink-700 shadow-sm">
                    {match.score}%
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {match.label}
                  </span>
                  {match.gotraConflict && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                      Gotra Conflict
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3 text-sm">
                  <MatchInfo label="Job" value={match.designation || "—"} />
                  <MatchInfo label="Kids" value={match.wantKids || "—"} />
                  <MatchInfo label="Relocate" value={match.openToRelocate || "—"} />
                  <MatchInfo label="Diet" value={match.diet || "—"} />
                </div>

                <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
                  {match.explanation}
                </p>

                {/* Cultural & Astrological Fit details */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Astro & Cultural Fit
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-purple-50 p-2.5 flex flex-col justify-between border border-purple-100/50">
                      <span className="text-slate-500 font-medium">Guna Milan</span>
                      <span className="font-extrabold text-purple-700 text-sm mt-0.5">
                        {match.gunaMilan ? `${match.gunaMilan}/36` : "—"}
                      </span>
                    </div>
                    <div className={`rounded-xl p-2.5 flex flex-col justify-between border ${match.gotraConflict ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      <span className="text-slate-500 font-medium">Gotra Validation</span>
                      <span className="font-extrabold text-sm mt-0.5">
                        {match.gotraConflict ? "Gotra Conflict" : `Safe (${match.gotra})`}
                      </span>
                    </div>
                  </div>
                  {match.gotraConflict && (
                    <div className="mt-2 rounded-xl bg-red-50 border border-red-200/50 p-2.5 text-xs text-red-800 font-semibold leading-relaxed">
                      ⚠️ Same Gotra ({match.gotra}) - Same Gotra marriages are traditionally prohibited under Gotra exogamy guidelines.
                    </div>
                  )}
                </div>

                {/* AI Compatibility Report Button & Send Match Button */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleViewCompatibilityReport(match)}
                    className="flex-1 rounded-xl bg-pink-50 py-2.5 text-xs font-bold text-pink-700 border border-pink-100 hover:bg-pink-100 cursor-pointer transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    ✨ {analyzingMatchId === match.id ? "Hide Report" : "AI Fit Report"}
                  </button>
                  <button
                    disabled={sentMatchIds.has(match.id)}
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
                        setIntroTargetName(`${match.firstName} ${match.lastName}`);
                        setGeneratedIntro(intro);
                        
                        try {
                          await fetch(`${API_BASE}/matches/send`, {
                            method: "POST",
                            headers,
                            body: JSON.stringify({ customerId: customer?.id || id, match }),
                          });
                        } catch (e) {
                          console.warn("Failed to log sent match", e);
                        }
                        setSentMatchIds(prev => {
                          const next = new Set(prev);
                          next.add(match.id);
                          return next;
                        });
                        setSentMatch(`${match.firstName} ${match.lastName}`);
                      } catch (err) {
                        console.error(err);
                        const fallbackIntro = `Hi ${match.firstName},\n\nWe have a potential match for you: ${customer.firstName} ${customer.lastName}, ${customer.age} years, ${customer.city}.\n\nShort intro: ${customer.firstName} is a ${customer.designation} based in ${customer.city} and is looking for someone who shares ${customer.values?.join(', ') || 'similar values'}.\n\nRegards,\nTDC Matchmaker`;
                        setIntroTargetName(`${match.firstName} ${match.lastName}`);
                        setGeneratedIntro(fallbackIntro);
                        
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
                        setSentMatchIds(prev => {
                          const next = new Set(prev);
                          next.add(match.id);
                          return next;
                        });
                        setSentMatch(`${match.firstName} ${match.lastName}`);
                      } finally {
                        setGeneratingIntroFor(null);
                      }
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition-all cursor-pointer duration-200 ${
                      sentMatchIds.has(match.id)
                        ? "bg-green-600 hover:bg-green-600 cursor-default"
                        : "bg-pink-600 hover:bg-pink-700"
                    }`}
                  >
                    {generatingIntroFor === match.id
                      ? "Generating…"
                      : sentMatchIds.has(match.id)
                      ? "Match Sent ✓"
                      : "Send Match"}
                  </button>
                </div>

                {/* AI Compatibility Report Panel */}
                {analyzingMatchId === match.id && (
                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-slate-50 border border-purple-100 p-4 transition-all duration-300 shadow-inner">
                    {!compatibilityReports[match.id] ? (
                      <div className="flex items-center justify-center py-4 gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
                        <span className="text-xs font-semibold text-slate-500">Analyzing compatibility...</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-slate-700 space-y-2.5 text-xs leading-relaxed">
                        {compatibilityReports[match.id].split('\n').map((line, idx) => {
                          if (line.startsWith('### ')) {
                            return <h4 key={idx} className="text-xs font-bold text-purple-900 mt-3 first:mt-0 uppercase tracking-wider">{line.replace('### ', '')}</h4>;
                          }
                          if (line.startsWith('- ')) {
                            return <p key={idx} className="pl-3 border-l-2 border-pink-300 my-1 font-medium text-slate-600">{line.replace('- ', '')}</p>;
                          }
                          if (line.trim() === '') return <div key={idx} className="h-1" />;
                          return <p key={idx} className="my-1">{line}</p>;
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </aside>
        </div>
      </div>

      {/* Generated Email Intro Modal */}
      {generatedIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl text-white">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              ✨ Generated Email Intro
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              To be sent to {introTargetName}. You can review and copy the message below:
            </p>
            <div className="mt-4 rounded-2xl bg-slate-950 p-4 font-mono text-sm text-slate-300 border border-white/5 whitespace-pre-wrap select-all">
              {generatedIntro}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedIntro);
                  alert("Copied to clipboard!");
                }}
                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200 cursor-pointer"
              >
                Copy Message
              </button>
              <button
                onClick={() => setGeneratedIntro(null)}
                className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="mb-5 text-xl font-bold text-white">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-white/10 transition-all duration-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function PreferencePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-pink-600/10 border border-pink-500/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-pink-200">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function MatchInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}