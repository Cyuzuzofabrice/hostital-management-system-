import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Status = "admitted" | "discharged";
type AdmissionType = "emergency" | "planned";
type Outcome = "recovered" | "improved" | "referred" | "deceased";

interface Admission {
  id: string;
  patient: string;
  ward: string;
  bed: string;
  doctor: string;
  diagnosis: string;
  type: AdmissionType;
  admittedOn: string; // YYYY-MM-DD
  status: Status;
  dischargedOn?: string;
  outcome?: Outcome;
  notes?: string;
}

/* Bed capacity per ward. Beds are numbered like G-01, G-02... */
const wards: { name: string; code: string; beds: number }[] = [
  { name: "General Ward", code: "G", beds: 20 },
  { name: "ICU", code: "I", beds: 6 },
  { name: "Pediatrics", code: "P", beds: 10 },
  { name: "Maternity", code: "M", beds: 8 },
];

const doctors = [
  "Dr. Alice Mukamana",
  "Dr. Patrick Nkurunziza",
  "Dr. Sandrine Ingabire",
  "Dr. Olivier Habineza",
];

function bedsFor(ward: string) {
  const w = wards.find((x) => x.name === ward);
  if (!w) return [];
  return Array.from({ length: w.beds }, (_, i) => `${w.code}-${String(i + 1).padStart(2, "0")}`);
}

/* ---------- Sample data (replace with your API) ----------
   Swap `loadAdmissions`, `saveAdmission` and `saveDischarge` for real calls, e.g.
   admissionService.getAll(), admissionService.create(data), admissionService.discharge(id, data). */
function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const sample: Admission[] = [
  { id: "AD-6001", patient: "Aline Uwase", ward: "General Ward", bed: "G-03", doctor: doctors[0], diagnosis: "Severe malaria", type: "emergency", admittedOn: isoDate(-3), status: "admitted" },
  { id: "AD-6002", patient: "Grace Mukamana", ward: "Pediatrics", bed: "P-02", doctor: doctors[2], diagnosis: "Acute asthma attack", type: "emergency", admittedOn: isoDate(-1), status: "admitted" },
  { id: "AD-6003", patient: "Jean Bosco Niyonzima", ward: "ICU", bed: "I-01", doctor: doctors[1], diagnosis: "Hypertensive crisis", type: "emergency", admittedOn: isoDate(-2), status: "admitted" },
  { id: "AD-6004", patient: "Claire Uwimana", ward: "Maternity", bed: "M-04", doctor: doctors[0], diagnosis: "Planned delivery", type: "planned", admittedOn: isoDate(0), status: "admitted" },
  { id: "AD-6005", patient: "Eric Habimana", ward: "General Ward", bed: "G-07", doctor: doctors[3], diagnosis: "Fractured forearm", type: "planned", admittedOn: isoDate(-6), status: "discharged", dischargedOn: isoDate(-4), outcome: "recovered", notes: "Cast applied. Review in 2 weeks." },
];

async function loadAdmissions(): Promise<Admission[]> {
  return sample;
}

async function saveAdmission(data: Omit<Admission, "id" | "status" | "admittedOn">): Promise<Admission> {
  return { ...data, id: `AD-${6000 + Math.floor(Math.random() * 9000)}`, status: "admitted", admittedOn: isoDate(0) };
}

async function saveDischarge(_id: string, _data: { outcome: Outcome; notes: string }): Promise<void> {
  return;
}

/* ---------- Helpers ---------- */
function daysBetween(from: string, to: string) {
  const ms = new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function stayLabel(a: Admission) {
  const days = daysBetween(a.admittedOn, a.dischargedOn ?? isoDate(0));
  return days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const cancelBtn =
  "rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";

function StatusBadge({ status }: { status: Status }) {
  return status === "admitted" ? (
    <span className="inline-block rounded-full bg-[#fdf1e0] px-2.5 py-0.5 text-xs font-medium text-[#8a5a12]">Admitted</span>
  ) : (
    <span className="inline-block rounded-full bg-[#e6f4e4] px-2.5 py-0.5 text-xs font-medium text-[#2d6a24]">Discharged</span>
  );
}

function TypeTag({ type }: { type: AdmissionType }) {
  return type === "emergency" ? (
    <span className="inline-block rounded-full bg-[#fbeeea] px-2.5 py-0.5 text-xs font-medium text-[#8a2f1f]">Emergency</span>
  ) : (
    <span className="inline-block rounded-full bg-[#eceff0] px-2.5 py-0.5 text-xs font-medium text-[#4b5a58]">Planned</span>
  );
}

/* ---------- Page ---------- */
export default function Admissions() {
  const [items, setItems] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"admitted" | "discharged" | "all">("admitted");
  const [ward, setWard] = useState("all");
  const [openNew, setOpenNew] = useState(false);
  const [discharging, setDischarging] = useState<Admission | null>(null);

  useEffect(() => {
    loadAdmissions().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const current = useMemo(() => items.filter((a) => a.status === "admitted"), [items]);

  const occupancy = useMemo(
    () =>
      wards.map((w) => {
        const used = current.filter((a) => a.ward === w.name).length;
        return { ...w, used, percent: Math.round((used / w.beds) * 100) };
      }),
    [current]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((a) => {
        const matchesText =
          !q || a.patient.toLowerCase().includes(q) || a.diagnosis.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
        const matchesTab = tab === "all" || a.status === tab;
        const matchesWard = ward === "all" || a.ward === ward;
        return matchesText && matchesTab && matchesWard;
      })
      .sort((a, b) => b.admittedOn.localeCompare(a.admittedOn));
  }, [items, query, tab, ward]);

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "admitted", label: "Currently admitted" },
    { key: "discharged", label: "Discharged" },
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
            <h1 className="text-2xl font-semibold tracking-tight">Admissions</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">
              {current.length} patients currently admitted across {wards.length} wards.
            </p>
          </div>
          <Button type="button" onClick={() => setOpenNew(true)} className="w-full sm:w-auto">
            Admit patient
          </Button>
        </header>

        {/* Ward occupancy */}
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {occupancy.map((w) => (
            <li key={w.name} className="rounded-xl bg-white p-4 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
              <p className="text-sm text-[#5b6b69]">{w.name}</p>
              <p className="mt-1 text-2xl font-semibold">
                {w.used}
                <span className="text-base font-normal text-[#7b8a87]"> / {w.beds} beds</span>
              </p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3ebe9]"
                role="progressbar"
                aria-valuenow={w.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${w.name} occupancy`}
              >
                <div
                  className={`h-full rounded-full ${w.percent >= 90 ? "bg-[#b4432f]" : w.percent >= 70 ? "bg-[#d98a1c]" : "bg-[#0f766e]"}`}
                  style={{ width: `${w.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Tabs + search + ward filter */}
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
            <label className="sr-only" htmlFor="search">Search admissions</label>
            <input
              id="search"
              type="search"
              placeholder="Search by patient, diagnosis or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 sm:flex-1"
            />
            <label className="sr-only" htmlFor="ward">Filter by ward</label>
            <select
              id="ward"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 sm:w-52"
            >
              <option value="all">All wards</option>
              {wards.map((w) => (
                <option key={w.name} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#5b6b69]">Loading admissions...</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No admissions found</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Change the filters, or admit a new patient.</p>
            </div>
          ) : (
            <>
              {/* Table: tablet and up */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-[#eef4f2] text-[#3f5451]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Ward / Bed</th>
                    <th className="px-5 py-3 font-medium">Diagnosis</th>
                    <th className="px-5 py-3 font-medium">Admitted</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a) => (
                    <tr key={a.id} className="border-t border-[#e3ebe9] align-top hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <div className="font-medium">{a.patient}</div>
                        <div className="text-xs text-[#7b8a87]">{a.id} · {a.doctor}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div>{a.ward}</div>
                        <div className="text-xs text-[#7b8a87]">Bed {a.bed}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div>{a.diagnosis}</div>
                        <div className="mt-1"><TypeTag type={a.type} /></div>
                      </td>
                      <td className="px-5 py-3">
                        <div>{formatDate(a.admittedOn)}</div>
                        <div className="text-xs text-[#7b8a87]">Stay: {stayLabel(a)}</div>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3 text-right">
                        {a.status === "admitted" ? (
                          <button
                            onClick={() => setDischarging(a)}
                            className="rounded-lg bg-[#0f766e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0c635c] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
                          >
                            Discharge
                          </button>
                        ) : (
                          <span className="text-xs text-[#7b8a87] capitalize">{a.outcome}</span>
                        )}
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
                        <dt className="text-xs text-[#7b8a87]">Ward / Bed</dt>
                        <dd>{a.ward} · {a.bed}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Stay</dt>
                        <dd>{stayLabel(a)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-[#7b8a87]">Diagnosis</dt>
                        <dd className="flex flex-wrap items-center gap-2">{a.diagnosis} <TypeTag type={a.type} /></dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-[#7b8a87]">Doctor · Admitted</dt>
                        <dd>{a.doctor} · {formatDate(a.admittedOn)}</dd>
                      </div>
                    </dl>
                    {a.status === "admitted" && (
                      <button
                        onClick={() => setDischarging(a)}
                        className="mt-3 w-full rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-medium text-white hover:bg-[#0c635c] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
                      >
                        Discharge
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {openNew && (
        <AdmitModal
          occupiedBeds={current.map((a) => `${a.ward}|${a.bed}`)}
          onClose={() => setOpenNew(false)}
          onSaved={(a) => {
            setItems((list) => [a, ...list]);
            setOpenNew(false);
          }}
        />
      )}

      {discharging && (
        <DischargeModal
          admission={discharging}
          onClose={() => setDischarging(null)}
          onDone={(outcome, notes) => {
            setItems((list) =>
              list.map((a) =>
                a.id === discharging.id
                  ? { ...a, status: "discharged", dischargedOn: isoDate(0), outcome, notes }
                  : a
              )
            );
            setDischarging(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Modal shell ---------- */
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#062a2a]/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:p-8"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[#5b6b69]">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 rounded-r border-l-4 border-[#b4432f] bg-[#fbeeea] px-3 py-2 text-sm text-[#8a2f1f]">
      {message}
    </p>
  );
}

/* ---------- Admit patient ---------- */
function AdmitModal({
  occupiedBeds,
  onClose,
  onSaved,
}: {
  occupiedBeds: string[]; // "Ward|Bed"
  onClose: () => void;
  onSaved: (a: Admission) => void;
}) {
  const freeBeds = (ward: string) => bedsFor(ward).filter((b) => !occupiedBeds.includes(`${ward}|${b}`));

  const [form, setForm] = useState({
    patient: "",
    ward: wards[0].name,
    bed: freeBeds(wards[0].name)[0] ?? "",
    doctor: doctors[0],
    diagnosis: "",
    type: "planned" as AdmissionType,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const available = freeBeds(form.ward);

  function changeWard(ward: string) {
    setForm((f) => ({ ...f, ward, bed: freeBeds(ward)[0] ?? "" }));
  }

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.bed) {
      setError(`No free beds in ${form.ward}. Choose another ward.`);
      return;
    }
    setSaving(true);
    try {
      onSaved(await saveAdmission(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not admit the patient.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Admit patient" subtitle="Assign a ward and bed to the patient." onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="ad-patient">Patient name</label>
        <input id="ad-patient" required value={form.patient} onChange={(e) => update("patient", e.target.value)} className={input} />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="ad-ward">Ward</label>
            <select id="ad-ward" value={form.ward} onChange={(e) => changeWard(e.target.value)} className={input}>
              {wards.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name} ({freeBeds(w.name).length} free)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="ad-bed">Bed</label>
            <select
              id="ad-bed"
              value={form.bed}
              onChange={(e) => update("bed", e.target.value)}
              disabled={available.length === 0}
              className={input}
            >
              {available.length === 0 && <option value="">No free beds</option>}
              {available.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium" htmlFor="ad-diagnosis">Diagnosis</label>
        <input id="ad-diagnosis" required value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)} className={input} />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="ad-doctor">Attending doctor</label>
            <select id="ad-doctor" value={form.doctor} onChange={(e) => update("doctor", e.target.value)} className={input}>
              {doctors.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="ad-type">Admission type</label>
            <select id="ad-type" value={form.type} onChange={(e) => update("type", e.target.value)} className={input}>
              <option value="planned">Planned</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving || available.length === 0} className="disabled:opacity-60">
            {saving ? "Admitting..." : "Admit patient"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Discharge ---------- */
function DischargeModal({
  admission,
  onClose,
  onDone,
}: {
  admission: Admission;
  onClose: () => void;
  onDone: (outcome: Outcome, notes: string) => void;
}) {
  const [outcome, setOutcome] = useState<Outcome>("recovered");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await saveDischarge(admission.id, { outcome, notes: notes.trim() });
      onDone(outcome, notes.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not discharge the patient.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Discharge patient"
      subtitle={`${admission.patient} · ${admission.ward}, bed ${admission.bed} · stay ${stayLabel(admission)}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="dc-outcome">Outcome</label>
        <select id="dc-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} className={input}>
          <option value="recovered">Recovered</option>
          <option value="improved">Improved</option>
          <option value="referred">Referred to another facility</option>
          <option value="deceased">Deceased</option>
        </select>

        <label className="mt-4 block text-sm font-medium" htmlFor="dc-notes">Discharge notes</label>
        <textarea
          id="dc-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Follow-up care, medication, next review date"
          className={input}
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Discharging..." : "Confirm discharge"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}