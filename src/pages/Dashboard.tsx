import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Stat from "../components/ui/Stat";
import { appointments, stats, summary, wards } from "../data/dashboard";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function wardLevel(pct: number) {
  if (pct >= 80) return { label: "Almost full", bar: "bg-[#b4432f]", text: "text-[#8a2f1f]" };
  if (pct >= 65) return { label: "Getting busy", bar: "bg-[#d99a1c]", text: "text-[#8a6410]" };
  return { label: "Beds available", bar: "bg-[#0f766e]", text: "text-[#0b5c55]" };
}

function WarningIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const appointmentsRef = useRef<HTMLElement>(null);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Status tabs built from the list, with counts
  const statusTabs = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach((a) => counts.set(a.status, (counts.get(a.status) ?? 0) + 1));
    return [
      { name: "All", count: appointments.length },
      ...Array.from(counts, ([name, count]) => ({ name, count })),
    ];
  }, []);

  const visibleAppointments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      const matchesQuery =
        !q ||
        a.patient.toLowerCase().includes(q) ||
        a.doctor.toLowerCase().includes(q) ||
        a.dept.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  // Busiest ward, computed from data
  const busiestWard = useMemo(() => {
    const withPct = wards.map((w) => ({ ...w, pct: Math.round((w.used / w.total) * 100) }));
    return withPct.sort((a, b) => b.pct - a.pct)[0];
  }, []);
  const showWardAlert = !!busiestWard && busiestWard.pct >= 80;
  const bedsLeft = showWardAlert ? busiestWard.total - busiestWard.used : 0;

  const toConfirm = summary.appointmentsUnconfirmed;

  function reviewPending() {
    setQuery("");
    setStatusFilter("Pending");
    appointmentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#5b6b69]">{today}</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, Admin
          </h1>
          <p className="mt-2 text-base text-[#3f5451]">
            You have <strong className="font-semibold text-[#12302d]">{summary.appointmentsToday} appointments</strong> today
            {toConfirm > 0 && (
              <>
                , and <strong className="font-semibold text-[#12302d]">{toConfirm}</strong> still need
                {toConfirm === 1 ? "s" : ""} your confirmation
              </>
            )}
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => navigate("/patients/new")} className="w-full sm:w-auto">
            + Register patient
          </Button>
          <Button variant="secondary" onClick={() => navigate("/appointments/new")} className="w-full sm:w-auto">
            Book appointment
          </Button>
        </div>
      </div>

      {/* Things to do first */}
      {(showWardAlert || toConfirm > 0) && (
        <section aria-label="Things to do" className="mt-6 space-y-3">
          {toConfirm > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border-l-4 border-[#d99a1c] bg-[#fdf6e3] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 text-[#8a6410]" />
                <div>
                  <p className="font-medium text-[#5f4508]">
                    {toConfirm} appointment{toConfirm === 1 ? " is" : "s are"} waiting for confirmation
                  </p>
                  <p className="text-sm text-[#7a5a12]">Patients will not know their booking is safe until you reply.</p>
                </div>
              </div>
              <Button onClick={reviewPending} className="w-full sm:w-auto">
                Confirm now
              </Button>
            </div>
          )}

          {showWardAlert && (
            <div className="flex flex-col gap-3 rounded-xl border-l-4 border-[#b4432f] bg-[#fbeeea] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <WarningIcon className="mt-0.5 text-[#8a2f1f]" />
                <div>
                  <p className="font-medium text-[#6d2214]">
                    {busiestWard.label} is {busiestWard.pct}% full
                  </p>
                  <p className="text-sm text-[#8a2f1f]">
                    {bedsLeft === 0
                      ? "No beds are free. Plan transfers or discharges."
                      : `Only ${bedsLeft} bed${bedsLeft === 1 ? "" : "s"} left. Plan discharges or transfers.`}
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate("/admissions")} className="w-full sm:w-auto">
                View admissions
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Numbers at a glance */}
      <dl className="mt-6 grid overflow-hidden rounded-xl bg-white shadow-[0_6px_20px_-12px_rgba(6,42,42,0.3)] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Appointments */}
        <section
          ref={appointmentsRef}
          className="scroll-mt-4 rounded-xl bg-white shadow-[0_6px_20px_-12px_rgba(6,42,42,0.3)]"
          aria-labelledby="appts-title"
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
            <h2 id="appts-title" className="text-lg font-semibold">Today&apos;s appointments</h2>
            <Button variant="link" onClick={() => navigate("/appointments")} className="whitespace-nowrap">
              See all {summary.appointmentsToday}
            </Button>
          </div>

          <div className="px-4 pt-3 sm:px-5">
            <label htmlFor="appt-search" className="sr-only">Search appointments</label>
            <input
              id="appt-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient, doctor or department"
              className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25"
            />
          </div>

          {/* Status tabs */}
          <div
            className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-5"
            role="tablist"
            aria-label="Filter by status"
          >
            {statusTabs.map((t) => {
              const active = statusFilter === t.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(t.name)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 ${
                    active
                      ? "bg-[#0f766e] font-medium text-white"
                      : "bg-[#eef4f2] text-[#3f5451] hover:bg-[#e0ebe8]"
                  }`}
                >
                  {t.name} <span className="tabular-nums opacity-80">({t.count})</span>
                </button>
              );
            })}
          </div>

          {/* List (works on phones without sideways scrolling) */}
          {visibleAppointments.length > 0 ? (
            <ul className="border-t border-[#e3ebe9]">
              {visibleAppointments.map((a) => (
                <li key={a.id} className="border-b border-[#e3ebe9] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => navigate("/appointments")}
                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[#f7faf9] focus:bg-[#f0f6f5] focus:outline-none sm:px-5"
                  >
                    <span className="w-16 shrink-0 text-base font-semibold tabular-nums text-[#0b5c55]">
                      {a.time}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{a.patient}</span>
                      <span className="block truncate text-sm text-[#5b6b69]">
                        {a.doctor} · {a.dept}
                      </span>
                    </span>
                    <Badge status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-t border-[#e3ebe9] px-5 py-10 text-center">
              <p className="font-medium">Nothing matches your search</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Try another name, or show all appointments.</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("All");
                }}
              >
                Show all appointments
              </Button>
            </div>
          )}
        </section>

        {/* Beds */}
        <section className="h-fit rounded-xl bg-white shadow-[0_6px_20px_-12px_rgba(6,42,42,0.3)]" aria-labelledby="beds-title">
          <div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
            <h2 id="beds-title" className="text-lg font-semibold">Free beds</h2>
            <Button variant="link" onClick={() => navigate("/admissions")}>
              Admissions
            </Button>
          </div>
          <ul className="divide-y divide-[#e3ebe9] px-4 pb-2 pt-2 sm:px-5">
            {wards.map(({ label, used, total }) => {
              const pct = Math.round((used / total) * 100);
              const free = total - used;
              const level = wardLevel(pct);
              return (
                <li key={label} className="py-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className={`text-sm ${level.text}`}>{level.label}</p>
                    </div>
                    <p className="text-right">
                      <span className="text-2xl font-semibold tabular-nums">{free}</span>
                      <span className="ml-1 text-sm text-[#5b6b69]">of {total} free</span>
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e6ebe8]"
                    role="progressbar"
                    aria-label={`${label} beds in use`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className={`h-full rounded-full ${level.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}