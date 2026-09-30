import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Status = "scheduled" | "completed" | "cancelled";

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  status: Status;
}

const doctors = [
  { name: "Dr. Alice Mukamana", department: "General Medicine" },
  { name: "Dr. Patrick Nkurunziza", department: "Cardiology" },
  { name: "Dr. Sandrine Ingabire", department: "Pediatrics" },
  { name: "Dr. Olivier Habineza", department: "Orthopedics" },
];

/* ---------- Sample data (replace with your API) ----------
   Swap `loadAppointments` and `saveAppointment` for real calls, e.g.
   appointmentService.getAll() and appointmentService.create(data). */
function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const sample: Appointment[] = [
  { id: "A-2001", patient: "Aline Uwase", doctor: doctors[0].name, department: doctors[0].department, date: isoDate(0), time: "09:00", reason: "Fever follow-up", status: "scheduled" },
  { id: "A-2002", patient: "Jean Bosco Niyonzima", doctor: doctors[1].name, department: doctors[1].department, date: isoDate(0), time: "11:30", reason: "Blood pressure check", status: "scheduled" },
  { id: "A-2003", patient: "Grace Mukamana", doctor: doctors[2].name, department: doctors[2].department, date: isoDate(1), time: "10:15", reason: "Asthma review", status: "scheduled" },
  { id: "A-2004", patient: "Eric Habimana", doctor: doctors[3].name, department: doctors[3].department, date: isoDate(-1), time: "14:00", reason: "Cast removal", status: "completed" },
  { id: "A-2005", patient: "Diane Umutoni", doctor: doctors[0].name, department: doctors[0].department, date: isoDate(-2), time: "08:45", reason: "General check-up", status: "cancelled" },
];

async function loadAppointments(): Promise<Appointment[]> {
  return sample;
}

async function saveAppointment(data: Omit<Appointment, "id" | "status">): Promise<Appointment> {
  return { ...data, id: `A-${2000 + Math.floor(Math.random() * 9000)}`, status: "scheduled" };
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const badge: Record<Status, string> = {
  scheduled: "bg-[#e3f2f0] text-[#0b5c55]",
  completed: "bg-[#e6f4e4] text-[#2d6a24]",
  cancelled: "bg-[#fbeeea] text-[#8a2f1f]",
};

const statusLabel: Record<Status, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/* ---------- Page ---------- */
export default function Appointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"upcoming" | "all" | Status>("upcoming");
  const [dateFilter, setDateFilter] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAppointments().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const today = isoDate(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((a) => {
        const matchesText =
          !q || a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
        const matchesDate = !dateFilter || a.date === dateFilter;
        const matchesTab =
          tab === "all" ? true : tab === "upcoming" ? a.status === "scheduled" && a.date >= today : a.status === tab;
        return matchesText && matchesDate && matchesTab;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [items, query, tab, dateFilter, today]);

  function setStatus(id: string, status: Status) {
    setItems((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const todayCount = items.filter((a) => a.date === today && a.status === "scheduled").length;

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "all", label: "All" },
  ];

  return (
    <div
      className="min-h-screen bg-[#f3f6f5] px-4 py-6 text-[#12302d] sm:px-6 lg:px-10"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">
              {todayCount} scheduled today · {items.length} in total
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="w-full sm:w-auto">
            Book appointment
          </Button>
        </header>

        {/* Tabs + search + date */}
        <div className="mt-6 rounded-xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
          <div className="flex gap-1 overflow-x-auto pb-3" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 ${
                  tab === t.key ? "bg-[#0f766e] text-white" : "text-[#3f5451] hover:bg-[#eef4f2]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="search">Search appointments</label>
            <input
              id="search"
              type="search"
              placeholder="Search by patient, doctor or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 sm:flex-1"
            />
            <label className="sr-only" htmlFor="date">Filter by date</label>
            <input
              id="date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 sm:w-48"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#5b6b69]">Loading appointments...</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No appointments found</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Change the filters, or book a new appointment.</p>
            </div>
          ) : (
            <>
              {/* Table: tablet and up */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-[#eef4f2] text-[#3f5451]">
                  <tr>
                    <th className="px-5 py-3 font-medium">When</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Doctor</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a) => (
                    <tr key={a.id} className="border-t border-[#e3ebe9] hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <div className="font-medium">{formatDate(a.date)}</div>
                        <div className="text-xs text-[#7b8a87]">{formatTime(a.time)}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{a.patient}</div>
                        <div className="text-xs text-[#7b8a87]">{a.id}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div>{a.doctor}</div>
                        <div className="text-xs text-[#7b8a87]">{a.department}</div>
                      </td>
                      <td className="px-5 py-3">{a.reason}</td>
                      <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3">
                        <Actions status={a.status} onChange={(s) => setStatus(a.id, s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards: phones */}
              <ul className="divide-y divide-[#e3ebe9] md:hidden">
                {visible.map((a) => (
                  <li key={a.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{a.patient}</p>
                        <p className="text-xs text-[#7b8a87]">{a.id}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-[#7b8a87]">When</dt>
                        <dd>{formatDate(a.date)}, {formatTime(a.time)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Doctor</dt>
                        <dd>{a.doctor}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-[#7b8a87]">Reason</dt>
                        <dd>{a.reason}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <Actions status={a.status} onChange={(s) => setStatus(a.id, s)} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {open && (
        <BookModal
          onClose={() => setOpen(false)}
          onSaved={(a) => {
            setItems((list) => [a, ...list]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Row actions ---------- */
function Actions({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  if (status !== "scheduled") return <span className="text-xs text-[#9aabA8]">No actions</span>;
  return (
    <div className="flex gap-2 md:justify-end">
      <button
        onClick={() => onChange("completed")}
        className="rounded-lg bg-[#e3f2f0] px-3 py-1.5 text-xs font-medium text-[#0b5c55] hover:bg-[#d2eae6] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
      >
        Mark completed
      </button>
      <button
        onClick={() => onChange("cancelled")}
        className="rounded-lg bg-[#fbeeea] px-3 py-1.5 text-xs font-medium text-[#8a2f1f] hover:bg-[#f7ddd6] focus:outline-none focus:ring-2 focus:ring-[#b4432f]/40"
      >
        Cancel
      </button>
    </div>
  );
}

/* ---------- Book appointment modal ---------- */
function BookModal({ onClose, onSaved }: { onClose: () => void; onSaved: (a: Appointment) => void }) {
  const [form, setForm] = useState({
    patient: "",
    doctor: doctors[0].name,
    date: isoDate(0),
    time: "09:00",
    reason: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.date < isoDate(0)) {
      setError("Choose today or a future date.");
      return;
    }
    setSaving(true);
    try {
      const department = doctors.find((d) => d.name === form.doctor)?.department ?? "";
      const saved = await saveAppointment({ ...form, department });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book the appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#062a2a]/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:p-8"
      >
        <h2 id="book-title" className="text-xl font-semibold">Book appointment</h2>
        <p className="mt-1 text-sm text-[#5b6b69]">Choose a doctor and a time for the patient.</p>

        <form onSubmit={handleSubmit} className="mt-5">
          {error && (
            <p role="alert" className="mb-4 rounded-r border-l-4 border-[#b4432f] bg-[#fbeeea] px-3 py-2 text-sm text-[#8a2f1f]">
              {error}
            </p>
          )}

          <label className="block text-sm font-medium" htmlFor="a-patient">Patient name</label>
          <input id="a-patient" required value={form.patient} onChange={(e) => update("patient", e.target.value)} className={input} />

          <label className="mt-4 block text-sm font-medium" htmlFor="a-doctor">Doctor</label>
          <select id="a-doctor" value={form.doctor} onChange={(e) => update("doctor", e.target.value)} className={input}>
            {doctors.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} — {d.department}
              </option>
            ))}
          </select>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="a-date">Date</label>
              <input id="a-date" type="date" required min={isoDate(0)} value={form.date}
                onChange={(e) => update("date", e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="a-time">Time</label>
              <input id="a-time" type="time" required value={form.time}
                onChange={(e) => update("time", e.target.value)} className={input} />
            </div>
          </div>

          <label className="mt-4 block text-sm font-medium" htmlFor="a-reason">Reason for visit</label>
          <input id="a-reason" required value={form.reason} onChange={(e) => update("reason", e.target.value)} className={input} />

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
            >
              Cancel
            </button>
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? "Booking..." : "Book appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}