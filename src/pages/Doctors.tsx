import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Availability = "available" | "in-surgery" | "off-duty";

interface Doctor {
  id: string;
  name: string;
  department: string;
  phone: string;
  email: string;
  experience: number; // years
  schedule: string;
  availability: Availability;
}

const departments = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Emergency",
];

/* ---------- Sample data (replace with your API) ----------
   Swap `loadDoctors` and `saveDoctor` for real calls, e.g.
   doctorService.getAll() and doctorService.create(data). */
const sample: Doctor[] = [
  { id: "D-301", name: "Dr. Alice Mukamana", department: "General Medicine", phone: "0788 210 334", email: "alice.mukamana@medicare.rw", experience: 12, schedule: "Mon – Fri, 8:00 – 16:00", availability: "available" },
  { id: "D-302", name: "Dr. Patrick Nkurunziza", department: "Cardiology", phone: "0722 418 905", email: "patrick.n@medicare.rw", experience: 18, schedule: "Mon – Thu, 9:00 – 17:00", availability: "in-surgery" },
  { id: "D-303", name: "Dr. Sandrine Ingabire", department: "Pediatrics", phone: "0783 662 170", email: "sandrine.i@medicare.rw", experience: 9, schedule: "Tue – Sat, 8:00 – 15:00", availability: "available" },
  { id: "D-304", name: "Dr. Olivier Habineza", department: "Orthopedics", phone: "0730 907 448", email: "olivier.h@medicare.rw", experience: 15, schedule: "Mon – Fri, 10:00 – 18:00", availability: "off-duty" },
  { id: "D-305", name: "Dr. Claire Uwimana", department: "Gynecology", phone: "0788 553 019", email: "claire.u@medicare.rw", experience: 11, schedule: "Mon – Fri, 8:00 – 16:00", availability: "available" },
  { id: "D-306", name: "Dr. Emmanuel Tuyisenge", department: "Emergency", phone: "0722 300 871", email: "emmanuel.t@medicare.rw", experience: 7, schedule: "Rotating shifts, 24h", availability: "available" },
];

async function loadDoctors(): Promise<Doctor[]> {
  return sample;
}

async function saveDoctor(data: Omit<Doctor, "id" | "availability">): Promise<Doctor> {
  return { ...data, id: `D-${300 + Math.floor(Math.random() * 9000)}`, availability: "available" };
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const badge: Record<Availability, string> = {
  available: "bg-[#e6f4e4] text-[#2d6a24]",
  "in-surgery": "bg-[#fdf1e0] text-[#8a5a12]",
  "off-duty": "bg-[#eceff0] text-[#4b5a58]",
};

const dot: Record<Availability, string> = {
  available: "bg-[#3a9a2d]",
  "in-surgery": "bg-[#d98a1c]",
  "off-duty": "bg-[#8a9896]",
};

const availabilityLabel: Record<Availability, string> = {
  available: "Available",
  "in-surgery": "In surgery",
  "off-duty": "Off duty",
};

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ---------- Page ---------- */
export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [availability, setAvailability] = useState<"all" | Availability>("all");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadDoctors().then((data) => {
      setDoctors(data);
      setLoading(false);
    });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchesText = !q || d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
      const matchesDept = department === "all" || d.department === department;
      const matchesAvail = availability === "all" || d.availability === availability;
      return matchesText && matchesDept && matchesAvail;
    });
  }, [doctors, query, department, availability]);

  function setStatus(id: string, status: Availability) {
    setDoctors((list) => list.map((d) => (d.id === id ? { ...d, availability: status } : d)));
  }

  const availableNow = doctors.filter((d) => d.availability === "available").length;

  return (
    <div
      className="min-h-screen bg-[#f3f6f5] px-4 py-6 text-[#12302d] sm:px-6 lg:px-10"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">
              {doctors.length} doctors · {availableNow} available now
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="w-full sm:w-auto">
            Add doctor
          </Button>
        </header>

        {/* Search + filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)] md:flex-row md:items-center">
          <label className="sr-only" htmlFor="search">Search doctors</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name, department or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 md:flex-1"
          />
          <label className="sr-only" htmlFor="department">Filter by department</label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 md:w-52"
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="availability">Filter by availability</label>
          <select
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as "all" | Availability)}
            className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 md:w-44"
          >
            <option value="all">Any availability</option>
            <option value="available">Available</option>
            <option value="in-surgery">In surgery</option>
            <option value="off-duty">Off duty</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <p className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#5b6b69] shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
            Loading doctors...
          </p>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-10 text-center shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
            <p className="font-medium">No doctors found</p>
            <p className="mt-1 text-sm text-[#5b6b69]">Change the filters, or add a new doctor.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((d) => (
              <li
                key={d.id}
                className="flex flex-col rounded-xl bg-white p-5 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]"
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-lg font-semibold text-white"
                  >
                    {initials(d.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{d.name}</h2>
                    <p className="text-sm text-[#5b6b69]">{d.department}</p>
                    <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[d.availability]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dot[d.availability]}`} />
                      {availabilityLabel[d.availability]}
                    </span>
                  </div>
                </div>

                <dl className="mt-4 space-y-2 border-t border-[#e3ebe9] pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#7b8a87]">Experience</dt>
                    <dd>{d.experience} years</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#7b8a87]">Schedule</dt>
                    <dd className="text-right">{d.schedule}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#7b8a87]">Phone</dt>
                    <dd>
                      <a href={`tel:${d.phone.replace(/\s/g, "")}`} className="text-[#0f766e] hover:underline">
                        {d.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#7b8a87]">Email</dt>
                    <dd className="min-w-0 truncate">
                      <a href={`mailto:${d.email}`} className="text-[#0f766e] hover:underline">
                        {d.email}
                      </a>
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 pt-1">
                  <label className="sr-only" htmlFor={`status-${d.id}`}>Change availability for {d.name}</label>
                  <select
                    id={`status-${d.id}`}
                    value={d.availability}
                    onChange={(e) => setStatus(d.id, e.target.value as Availability)}
                    className="w-full rounded-lg border border-[#cfdad7] bg-white px-3 py-2 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25"
                  >
                    <option value="available">Available</option>
                    <option value="in-surgery">In surgery</option>
                    <option value="off-duty">Off duty</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <AddDoctorModal
          onClose={() => setOpen(false)}
          onSaved={(d) => {
            setDoctors((list) => [d, ...list]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Add doctor modal ---------- */
function AddDoctorModal({ onClose, onSaved }: { onClose: () => void; onSaved: (d: Doctor) => void }) {
  const [form, setForm] = useState({
    name: "",
    department: departments[0],
    phone: "",
    email: "",
    experience: "",
    schedule: "Mon – Fri, 8:00 – 16:00",
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
    const experience = Number(form.experience);
    if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
      setError("Enter years of experience between 0 and 60.");
      return;
    }
    const name = form.name.trim().startsWith("Dr") ? form.name.trim() : `Dr. ${form.name.trim()}`;
    setSaving(true);
    try {
      const saved = await saveDoctor({ ...form, name, experience });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the doctor.");
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
        aria-labelledby="doc-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:p-8"
      >
        <h2 id="doc-title" className="text-xl font-semibold">Add doctor</h2>
        <p className="mt-1 text-sm text-[#5b6b69]">Enter the doctor's details to add them to the hospital.</p>

        <form onSubmit={handleSubmit} className="mt-5">
          {error && (
            <p role="alert" className="mb-4 rounded-r border-l-4 border-[#b4432f] bg-[#fbeeea] px-3 py-2 text-sm text-[#8a2f1f]">
              {error}
            </p>
          )}

          <label className="block text-sm font-medium" htmlFor="d-name">Full name</label>
          <input id="d-name" required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium" htmlFor="d-dept">Department</label>
              <select id="d-dept" value={form.department} onChange={(e) => update("department", e.target.value)} className={input}>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="d-exp">Experience (years)</label>
              <input id="d-exp" type="number" required min={0} max={60} value={form.experience}
                onChange={(e) => update("experience", e.target.value)} className={input} />
            </div>
          </div>

          <label className="mt-4 block text-sm font-medium" htmlFor="d-phone">Phone</label>
          <input id="d-phone" type="tel" required autoComplete="tel" value={form.phone}
            onChange={(e) => update("phone", e.target.value)} className={input} />

          <label className="mt-4 block text-sm font-medium" htmlFor="d-email">Email</label>
          <input id="d-email" type="email" required value={form.email}
            onChange={(e) => update("email", e.target.value)} className={input} />

          <label className="mt-4 block text-sm font-medium" htmlFor="d-schedule">Working schedule</label>
          <input id="d-schedule" required value={form.schedule}
            onChange={(e) => update("schedule", e.target.value)} className={input} />

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
            >
              Cancel
            </button>
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? "Saving..." : "Save doctor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}