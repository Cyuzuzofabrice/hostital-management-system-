import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Status = "admitted" | "outpatient" | "discharged";
type Gender = "male" | "female" | "other";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  condition: string;
  status: Status;
  admittedOn: string; // ISO date
}

/* ---------- Sample data (replace with your API) ----------
   Swap `loadPatients` and `savePatient` for real calls, e.g.
   patientService.getAll() and patientService.create(data). */
const sample: Patient[] = [
  { id: "P-1001", name: "Aline Uwase", age: 34, gender: "female", phone: "0788 123 456", condition: "Malaria", status: "admitted", admittedOn: "2026-09-25" },
  { id: "P-1002", name: "Jean Bosco Niyonzima", age: 52, gender: "male", phone: "0722 555 019", condition: "Hypertension", status: "outpatient", admittedOn: "2026-09-27" },
  { id: "P-1003", name: "Grace Mukamana", age: 8, gender: "female", phone: "0783 908 221", condition: "Asthma", status: "admitted", admittedOn: "2026-09-28" },
  { id: "P-1004", name: "Eric Habimana", age: 41, gender: "male", phone: "0730 447 812", condition: "Fractured arm", status: "discharged", admittedOn: "2026-09-20" },
];

async function loadPatients(): Promise<Patient[]> {
  return sample;
}

async function savePatient(data: Omit<Patient, "id" | "admittedOn">): Promise<Patient> {
  return {
    ...data,
    id: `P-${1000 + Math.floor(Math.random() * 9000)}`,
    admittedOn: new Date().toISOString().slice(0, 10),
  };
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const badge: Record<Status, string> = {
  admitted: "bg-[#fdf1e0] text-[#8a5a12]",
  outpatient: "bg-[#e3f2f0] text-[#0b5c55]",
  discharged: "bg-[#eceff0] text-[#4b5a58]",
};

const statusLabel: Record<Status, string> = {
  admitted: "Admitted",
  outpatient: "Outpatient",
  discharged: "Discharged",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Page ---------- */
export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadPatients().then((data) => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      const matchesText =
        !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q);
      const matchesStatus = filter === "all" || p.status === filter;
      return matchesText && matchesStatus;
    });
  }, [patients, query, filter]);

  return (
    <div
      className="min-h-screen bg-[#f3f6f5] px-4 py-6 text-[#12302d] sm:px-6 lg:px-10"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">
              {patients.length} registered · {patients.filter((p) => p.status === "admitted").length} currently admitted
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="w-full sm:w-auto">
            Add patient
          </Button>
        </header>

        {/* Search + filter */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)] sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="search">Search patients</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name, ID or condition"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 sm:flex-1"
          />
          <label className="sr-only" htmlFor="status">Filter by status</label>
          <select
            id="status"
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | Status)}
            className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 sm:w-48"
          >
            <option value="all">All statuses</option>
            <option value="admitted">Admitted</option>
            <option value="outpatient">Outpatient</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#5b6b69]">Loading patients...</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No patients found</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Try a different search, or add a new patient.</p>
            </div>
          ) : (
            <>
              {/* Table: tablet and up */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-[#eef4f2] text-[#3f5451]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Age / Gender</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Condition</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id} className="border-t border-[#e3ebe9] hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-[#7b8a87]">{p.id}</div>
                      </td>
                      <td className="px-5 py-3 capitalize">{p.age} · {p.gender}</td>
                      <td className="px-5 py-3">{p.phone}</td>
                      <td className="px-5 py-3">{p.condition}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-[#5b6b69]">{formatDate(p.admittedOn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards: phones */}
              <ul className="divide-y divide-[#e3ebe9] md:hidden">
                {visible.map((p) => (
                  <li key={p.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-[#7b8a87]">{p.id}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Age / Gender</dt>
                        <dd className="capitalize">{p.age} · {p.gender}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Phone</dt>
                        <dd>{p.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Condition</dt>
                        <dd>{p.condition}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Registered</dt>
                        <dd>{formatDate(p.admittedOn)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {open && (
        <AddPatientModal
          onClose={() => setOpen(false)}
          onSaved={(p) => {
            setPatients((list) => [p, ...list]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Add patient modal ---------- */
function AddPatientModal({ onClose, onSaved }: { onClose: () => void; onSaved: (p: Patient) => void }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "female" as Gender,
    phone: "",
    condition: "",
    status: "outpatient" as Status,
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
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      setError("Enter a valid age between 0 and 120.");
      return;
    }
    setSaving(true);
    try {
      const saved = await savePatient({ ...form, age });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the patient.");
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
        aria-labelledby="add-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:p-8"
      >
        <h2 id="add-title" className="text-xl font-semibold">Add patient</h2>
        <p className="mt-1 text-sm text-[#5b6b69]">Fill in the details to register a new patient.</p>

        <form onSubmit={handleSubmit} className="mt-5">
          {error && (
            <p role="alert" className="mb-4 rounded-r border-l-4 border-[#b4432f] bg-[#fbeeea] px-3 py-2 text-sm text-[#8a2f1f]">
              {error}
            </p>
          )}

          <label className="block text-sm font-medium" htmlFor="p-name">Full name</label>
          <input id="p-name" required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="p-age">Age</label>
              <input id="p-age" type="number" required min={0} max={120} value={form.age}
                onChange={(e) => update("age", e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="p-gender">Gender</label>
              <select id="p-gender" value={form.gender} onChange={(e) => update("gender", e.target.value)} className={input}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label className="mt-4 block text-sm font-medium" htmlFor="p-phone">Phone</label>
          <input id="p-phone" type="tel" required autoComplete="tel" value={form.phone}
            onChange={(e) => update("phone", e.target.value)} className={input} />

          <label className="mt-4 block text-sm font-medium" htmlFor="p-condition">Condition</label>
          <input id="p-condition" required value={form.condition}
            onChange={(e) => update("condition", e.target.value)} className={input} />

          <label className="mt-4 block text-sm font-medium" htmlFor="p-status">Status</label>
          <select id="p-status" value={form.status} onChange={(e) => update("status", e.target.value)} className={input}>
            <option value="outpatient">Outpatient</option>
            <option value="admitted">Admitted</option>
            <option value="discharged">Discharged</option>
          </select>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
            >
              Cancel
            </button>
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? "Saving..." : "Save patient"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}