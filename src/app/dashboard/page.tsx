"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error('Failed to load customers', err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-900/80 p-6 lg:block">
        <div>
          <h1 className="text-2xl font-bold">TDC</h1>
          <p className="mt-1 text-sm text-slate-400">
            Matchmaker Workspace
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-xl bg-pink-600 px-4 py-3 font-semibold"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard"
            className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            Customers
          </Link>

          <Link
            href="/customer/1"
            className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            Matches
          </Link>

          <Link
            href="/customer/1"
            className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            Notes
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-semibold">Sample Login</p>
          <p className="mt-2 text-xs text-slate-400">
            matchmaker / password123
          </p>
        </div>
      </aside>

      <section className="lg:ml-72">
        <header className="border-b border-white/10 bg-slate-950/80 px-6 py-6 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-pink-400">
                Internal Operations
              </p>
              <h2 className="mt-1 text-3xl font-bold">
                Customer Matchmaking Dashboard
              </h2>
              <p className="mt-2 text-slate-400">
                Track customer journey stages and open verified biodata profiles.
              </p>
            </div>

            <Link
              href="/login"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              Logout
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard
              title="Assigned Customers"
              value={customers.length.toString()}
              helper="Profiles assigned to this matchmaker"
            />
            <StatCard
              title="Searching"
              value={searchingCount.toString()}
              helper="Currently looking for matches"
            />
            <StatCard
              title="New Profiles"
              value={newCount.toString()}
              helper="Recently added customer profiles"
            />
            <StatCard
              title="Matched"
              value={matchedCount.toString()}
              helper="Customers moved to matched stage"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-xl font-bold">Assigned Customers</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Click a customer to open their detailed matchmaking view.
                  </p>
                </div>

                <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
                  {customers.length} customers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-slate-100 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 text-left">Customer</th>
                      <th className="px-6 py-4 text-left">Age</th>
                      <th className="px-6 py-4 text-left">City</th>
                      <th className="px-6 py-4 text-left">Marital Status</th>
                      <th className="px-6 py-4 text-left">Journey Stage</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-5 text-sm text-slate-400">
                          Loading customers…
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-t border-slate-100 transition hover:bg-pink-50"
                        >
                          <td className="px-6 py-5">
                            <Link
                              href={`/customer/${customer.id}`}
                              className="font-bold text-slate-950 hover:text-pink-600"
                            >
                              {customer.firstName} {customer.lastName}
                            </Link>
                            <p className="mt-1 text-sm text-slate-500">
                              {customer.designation}
                            </p>
                          </td>

                          <td className="px-6 py-5">{customer.age}</td>
                          <td className="px-6 py-5">{customer.city}</td>
                          <td className="px-6 py-5">{customer.maritalStatus}</td>

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
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <h3 className="text-xl font-bold">Today&apos;s Focus</h3>

                <div className="mt-5 space-y-4">
                  <FocusItem
                    title="Review new profiles"
                    value={`${newCount} pending`}
                  />
                  <FocusItem
                    title="Prepare match suggestions"
                    value="100 profile pool"
                  />
                  <FocusItem
                    title="Update meeting notes"
                    value="Customer calls"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-pink-600 p-6 shadow-2xl">
                <h3 className="text-xl font-bold">Matchmaker Tip</h3>
                <p className="mt-3 leading-7 text-pink-50">
                  Start with customers in Searching stage, review biodata, then
                  send only high-potential matches with clear compatibility
                  explanations.
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
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-3 text-4xl font-extrabold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function FocusItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{value}</p>
    </div>
  );
}