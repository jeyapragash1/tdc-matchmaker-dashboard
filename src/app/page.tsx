import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              TDC Matchmaker
            </h1>
            <p className="text-sm text-slate-500">
              Internal matchmaking operations platform
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
            Matchmaker Dashboard MVP
          </span>

          <h2 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-6xl">
            Manage customers, review biodata, and assign better matches faster.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A production-style internal dashboard designed for matchmaking
            teams to view verified customer profiles, track journey stages,
            review suggested matches, and record quick meeting notes in one
            focused workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-pink-600 px-6 py-3 text-center font-semibold text-white shadow-sm hover:bg-pink-700"
            >
              Open Workspace
            </Link>

            <a
              href="#workflow"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              View Workflow
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            <Metric value="10" label="Assigned Customers" />
            <Metric value="100" label="Match Pool" />
            <Metric value="6" label="In Progress" />
            <Metric value="3" label="Matched" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Customer Profile
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-950">
                  Rahul Sharma
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  31 years • Mumbai • Never Married
                </p>
              </div>

              <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
                Searching
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <ProfileItem label="Profession" value="Software Engineer" />
              <ProfileItem label="Income" value="₹18,00,000" />
              <ProfileItem label="Languages" value="English, Hindi" />
              <ProfileItem label="Preference" value="Wants Kids" />
            </div>

            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Suggested Match
                  </p>
                  <h4 className="mt-1 text-xl font-bold text-slate-950">
                    Aanya Sharma
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    24 years • Mumbai • Software Engineer
                  </p>
                </div>

                <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-700">
                  92%
                </span>
              </div>

              <div className="mt-4">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  High Potential Match
                </span>
              </div>

              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Ranked highly because the customer and suggested profile have
                compatible age, height, children preference, and shared language
                signals.
              </p>

              <button className="mt-5 w-full rounded-xl bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700">
                Send Match
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Built around the matchmaker workflow
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            The platform keeps the core process simple: review customers,
            understand preferences, evaluate suggested matches, and take action.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <WorkflowCard
            step="01"
            title="View Customers"
            description="See assigned customers with age, city, marital status, and journey stage."
          />
          <WorkflowCard
            step="02"
            title="Review Biodata"
            description="Open a detailed matchmaking profile with personal, career, family, and preference details."
          />
          <WorkflowCard
            step="03"
            title="Rank Matches"
            description="Use gender-specific compatibility logic to score and explain suggested profiles."
          />
          <WorkflowCard
            step="04"
            title="Send Match"
            description="Trigger a mock match action and keep quick notes from meetings or calls."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-slate-950 p-8 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              title="Customer Journey Tracking"
              description="Status tags help matchmakers understand whether a customer is new, searching, shortlisted, or matched."
            />
            <Feature
              title="Compatibility Explanations"
              description="Each suggested match includes a score, label, and clear reasoning based on profile signals."
            />
            <Feature
              title="Operationally Focused UI"
              description="The interface is designed to help internal teams act quickly without unnecessary complexity."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        TDC Matchmaker MVP • Internal dashboard for matchmaking operations
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function WorkflowCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-pink-600">{step}</p>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{description}</p>
    </div>
  );
}