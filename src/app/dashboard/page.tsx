"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIdToken } from "@/lib/firebaseClient";

type CustomerSummary = {
  id: number | string;
  firstName: string;
  lastName: string;
  age: number;
  city: string;
  designation: string;
  maritalStatus: string;
  statusTag: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function load() {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      try {
        const token = await getIdToken().catch(() => null);
        const headers: HeadersInit | undefined = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;
        const res = await fetch(`${API_BASE}/customers`, { headers });
        const json = await res.json();
        setCustomers(json.customers || []);
      } catch (err) {
        console.error("Failed to load customers", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-400">Loading Workspace...</span>
        </div>
      </main>
    );
  }

  const searchingCount = customers.filter(
    (customer) => customer.statusTag === "Searching"
  ).length;

  const newCount = customers.filter(
    (customer) => customer.statusTag === "New"
  ).length;

  const matchedCount = customers.filter(
    (customer) => customer.statusTag === "Matched"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-900/80 p-6 lg:block backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
            TDC Matchmaker
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-medium tracking-wide">
            INTERNAL OPERATIONS PORTAL
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard"
            className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            Customers
          </Link>

          <Link
            href="/customer/1"
            className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            Matches Sandbox
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-pink-400">Credentials Demo</p>
          <p className="mt-2 text-xs text-slate-400">
            Username: <span className="font-mono text-slate-200">matchmaker</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Password: <span className="font-mono text-slate-200">password123</span>
          </p>
        </div>
      </aside>

      <section className="lg:ml-72">
        <header className="border-b border-white/10 bg-slate-950/80 px-6 py-6 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-pink-400">
                Internal Operations Workspace
              </p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
                Customer Matchmaking Dashboard
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Track customer journey stages, view bios, and run the matching algorithm.
              </p>
            </div>

            <Link
              href="/login"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-200 shadow-md transition-all duration-200"
            >
              Logout
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              title="Assigned Customers"
              value={customers.length.toString()}
              helper="Total profiles managed"
            />
            <StatCard
              title="Searching"
              value={searchingCount.toString()}
              helper="Looking for matches"
            />
            <StatCard
              title="New Profiles"
              value={newCount.toString()}
              helper="Pending initial review"
            />
            <StatCard
              title="Matched"
              value={matchedCount.toString()}
              helper="Successfully paired"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Assigned Customers List</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Click a row to open detail view & run matches.
                  </p>
                </div>

                <span className="h-fit rounded-full bg-pink-100 px-4 py-1.5 text-xs font-bold text-pink-700">
                  {customers.length} profiles
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Customer Name</th>
                      <th className="px-6 py-4 text-left">Age</th>
                      <th className="px-6 py-4 text-left">Location</th>
                      <th className="px-6 py-4 text-left">Marital Status</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                            <span>Fetching customer records...</span>
                          </div>
                        </td>
                      </tr>
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500 font-medium">
                          No assigned customers found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr
                          key={customer.id}
                          onClick={() => router.push(`/customer/${customer.id}`)}
                          className="border-t border-slate-100 transition hover:bg-slate-50 cursor-pointer"
                        >
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-900 hover:text-pink-600 transition-colors">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {customer.designation}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-slate-700">{customer.age}</td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-700">{customer.city}</td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-700">{customer.maritalStatus}</td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                              {customer.statusTag}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <h3 className="text-xl font-bold">Today&apos;s Focus</h3>

                <div className="mt-5 space-y-4">
                  <FocusItem
                    title="Review new profiles"
                    value={`${newCount} pending matches`}
                  />
                  <FocusItem
                    title="Prepare match suggestions"
                    value="200 profile pool (100 opposite-gender candidates)"
                  />
                  <FocusItem
                    title="Update meeting notes"
                    value="Customer calls & verification logs"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-pink-600 to-rose-700 p-6 shadow-2xl">
                <h3 className="text-xl font-bold">Matchmaker Tip</h3>
                <p className="mt-3 text-xs leading-relaxed text-pink-50">
                  Focus matches by reviewing both lifestyle preferences and astrological alignment metrics. Guna Milan score and Gotra checking are key factors for initial recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="mt-3 text-4xl font-extrabold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

function FocusItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <p className="font-semibold text-sm">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{value}</p>
    </div>
  );
}