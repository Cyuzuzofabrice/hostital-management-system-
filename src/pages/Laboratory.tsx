import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Status = "pending" | "in-progress" | "completed";
type Priority = "routine" | "urgent";
type Flag = "normal" | "abnormal";

interface LabTest {
  id: string;
  patient: string;
  test: string;
  requestedBy: string;
  priority: Priority;
  date: string; // YYYY-MM-DD
  status: Status;
  result?: string;
  flag?: Flag;
}

const testTypes = [
  "Complete Blood Count (CBC)",
  "Malaria test",
  "Blood glucose",
  "Urinalysis",
  "Liver function test",
  "Kidney function test",
  "HIV test",
  "X-ray",
  "Stool examination",
];

const doctors = [
  "Dr. Alice Mukamana",
  "Dr. Patrick Nkurunziza",
  "Dr. Sandrine Ingabire",
  "Dr. Olivier Habineza",
];

/* ---------- Sample data (replace with your API) ----------
   Swap `loadTests`, `saveTest` and `saveResult` for real calls, e.g.
   labService.getAll(), labService.create(data), labService.saveResult(id, data). */
function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const sample: LabTest[] = [
  { id: "L-4001", patient: "Aline Uwase", test: "Malaria test", requestedBy: doctors[0], priority: "urgent", date: isoDate(0), status: "pending" },
  { id: "L-4002", patient: "Jean Bosco Niyonzima", test: "Blood glucose", requestedBy: doctors[1], priority: "routine", date: isoDate(0), status: "in-progress" },
  { id: "L-4003", patient: "Grace Mukamana", test: "Complete Blood Count (CBC)", requestedBy: doctors[2], priority: "routine", date: isoDate(0), status: "pending" },
  { id: "L-4004", patient: "Eric Habimana", test: "X-ray", requestedBy: doctors[3], priority: "routine", date: isoDate(-1), status: "completed", result: "No fracture line visible. Healing well.", flag: "normal" },
  { id: "L-4005", patient: "Diane Umutoni", test: "Liver function test", requestedBy: doctors[0], priority: "urgent", date: isoDate(-2), status: "completed", result: "ALT and AST raised above reference range.", flag: "abnormal" },
];

async function loadTests(): Promise<LabTest[]> {
  return sample;
}

async function saveTest(data: Omit<LabTest, "id" | "status" | "date">): Promise<LabTest> {
  return { ...data, id: `L-${4000 + Math.floor(Math.random() * 9000)}`, status: "pending", date: isoDate(0) };
}

async function saveResult(_id: string, _data: { result: string; flag: Flag }): Promise<void> {
  return;
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const statusBadge: Record<Status, string> = {
  pending: "bg-[#fdf1e0] text-[#8a5a12]",
  "in-progress": "bg-[#e3eef8] text-[#1e4f7c]",
  completed: "bg-[#e6f4e4] text-[#2d6a24]",
};

const statusLabel: Record<Status, string> = {
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function PriorityTag({ priority }: { priority: Priority }) {
  return priority === "urgent" ? (
    <span className="inline-block rounded-full bg-[#fbeeea] px-2.5 py-0.5 text-xs font-medium text-[#8a2f1f]">Urgent</span>
  ) : (
    <span className="inline-block rounded-full bg-[#eceff0] px-2.5 py-0.5 text-xs font-medium text-[#4b5a58]">Routine</span>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* ---------- Page ---------- */
export default function Laboratory() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | Status>("all");
  const [openNew, setOpenNew] = useState(false);
  const [resultFor, setResultFor] = useState<LabTest | null>(null);
  const [viewing, setViewing] = useState<LabTest | null>(null);

  useEffect(() => {
    loadTests().then((data) => {
      setTests(data);
      setLoading(false);
    });
  }, []);

  const counts = useMemo(
    () => ({
      pending: tests.filter((t) => t.status === "pending").length,
      inProgress: tests.filter((t) => t.status === "in-progress").length,
      completed: tests.filter((t) => t.status === "completed").length,
      urgent: tests.filter((t) => t.priority === "urgent" && t.status !== "completed").length,
    }),
    [tests]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests
      .filter((t) => {
        const matchesText =
          !q || t.patient.toLowerCase().includes(q) || t.test.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
        const matchesTab = tab === "all" || t.status === tab;
        return matchesText && matchesTab;
      })
      .sort((a, b) => {
        // urgent open tests first, then newest
        const aUrgent = a.priority === "urgent" && a.status !== "completed" ? 0 : 1;
        const bUrgent = b.priority === "urgent" && b.status !== "completed" ? 0 : 1;
        return aUrgent - bUrgent || b.date.localeCompare(a.date);
      });
  }, [tests, query, tab]);

  function startTest(id: string) {
    setTests((list) => list.map((t) => (t.id === id ? { ...t, status: "in-progress" } : t)));
  }

  const stats = [
    { label: "Pending", value: counts.pending, color: "text-[#8a5a12]" },
    { label: "In progress", value: counts.inProgress, color: "text-[#1e4f7c]" },
    { label: "Completed", value: counts.completed, color: "text-[#2d6a24]" },
    { label: "Urgent open", value: counts.urgent, color: "text-[#8a2f1f]" },
  ];

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in-progress", label: "In progress" },
    { key: "completed", label: "Completed" },
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
            <h1 className="text-2xl font-semibold tracking-tight">Laboratory</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">Track test requests and record results.</p>
          </div>
          <Button type="button" onClick={() => setOpenNew(true)} className="w-full sm:w-auto">
            New test request
          </Button>
        </header>

        {/* Summary */}
        <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-4 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
              <dt className="text-sm text-[#5b6b69]">{s.label}</dt>
              <dd className={`mt-1 text-3xl font-semibold ${s.color}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        {/* Tabs + search */}
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
          <label className="sr-only" htmlFor="search">Search lab tests</label>
          <input
            id="search"
            type="search"
            placeholder="Search by patient, test or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25"
          />
        </div>

        {/* Content */}
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#5b6b69]">Loading lab tests...</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No lab tests found</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Change the filters, or create a new test request.</p>
            </div>
          ) : (
            <>
              {/* Table: tablet and up */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-[#eef4f2] text-[#3f5451]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Test</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Requested by</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <tr key={t.id} className="border-t border-[#e3ebe9] hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <div className="font-medium">{t.test}</div>
                        <div className="text-xs text-[#7b8a87]">{t.id} · {formatDate(t.date)}</div>
                      </td>
                      <td className="px-5 py-3">{t.patient}</td>
                      <td className="px-5 py-3">{t.requestedBy}</td>
                      <td className="px-5 py-3"><PriorityTag priority={t.priority} /></td>
                      <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-3">
                        <RowAction test={t} onStart={startTest} onResult={setResultFor} onView={setViewing} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards: phones */}
              <ul className="divide-y divide-[#e3ebe9] md:hidden">
                {visible.map((t) => (
                  <li key={t.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{t.test}</p>
                        <p className="text-xs text-[#7b8a87]">{t.id} · {formatDate(t.date)}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Patient</dt>
                        <dd>{t.patient}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Priority</dt>
                        <dd className="mt-0.5"><PriorityTag priority={t.priority} /></dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-[#7b8a87]">Requested by</dt>
                        <dd>{t.requestedBy}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <RowAction test={t} onStart={startTest} onResult={setResultFor} onView={setViewing} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {openNew && (
        <NewTestModal
          onClose={() => setOpenNew(false)}
          onSaved={(t) => {
            setTests((list) => [t, ...list]);
            setOpenNew(false);
          }}
        />
      )}

      {resultFor && (
        <ResultModal
          test={resultFor}
          onClose={() => setResultFor(null)}
          onSaved={(result, flag) => {
            setTests((list) =>
              list.map((t) => (t.id === resultFor.id ? { ...t, status: "completed", result, flag } : t))
            );
            setResultFor(null);
          }}
        />
      )}

      {viewing && <ViewResultModal test={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

/* ---------- Row action ---------- */
function RowAction({
  test,
  onStart,
  onResult,
  onView,
}: {
  test: LabTest;
  onStart: (id: string) => void;
  onResult: (t: LabTest) => void;
  onView: (t: LabTest) => void;
}) {
  const base =
    "rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";
  return (
    <div className="flex md:justify-end">
      {test.status === "pending" && (
        <button onClick={() => onStart(test.id)} className={`${base} bg-[#e3eef8] text-[#1e4f7c] hover:bg-[#d3e3f3]`}>
          Start test
        </button>
      )}
      {test.status === "in-progress" && (
        <button onClick={() => onResult(test)} className={`${base} bg-[#0f766e] text-white hover:bg-[#0c635c]`}>
          Enter result
        </button>
      )}
      {test.status === "completed" && (
        <button onClick={() => onView(test)} className={`${base} bg-[#e3f2f0] text-[#0b5c55] hover:bg-[#d2eae6]`}>
          View result
        </button>
      )}
    </div>
  );
}

/* ---------- Modal shell ---------- */
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
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

const cancelBtn =
  "rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";

/* ---------- New test request ---------- */
function NewTestModal({ onClose, onSaved }: { onClose: () => void; onSaved: (t: LabTest) => void }) {
  const [form, setForm] = useState({
    patient: "",
    test: testTypes[0],
    requestedBy: doctors[0],
    priority: "routine" as Priority,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      onSaved(await saveTest(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New test request" subtitle="Send a test request to the laboratory." onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="l-patient">Patient name</label>
        <input id="l-patient" required value={form.patient} onChange={(e) => update("patient", e.target.value)} className={input} />

        <label className="mt-4 block text-sm font-medium" htmlFor="l-test">Test</label>
        <select id="l-test" value={form.test} onChange={(e) => update("test", e.target.value)} className={input}>
          {testTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="l-doctor">Requested by</label>
            <select id="l-doctor" value={form.requestedBy} onChange={(e) => update("requestedBy", e.target.value)} className={input}>
              {doctors.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="l-priority">Priority</label>
            <select id="l-priority" value={form.priority} onChange={(e) => update("priority", e.target.value)} className={input}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Sending..." : "Send request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Enter result ---------- */
function ResultModal({
  test,
  onClose,
  onSaved,
}: {
  test: LabTest;
  onClose: () => void;
  onSaved: (result: string, flag: Flag) => void;
}) {
  const [result, setResult] = useState("");
  const [flag, setFlag] = useState<Flag>("normal");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (result.trim().length < 3) {
      setError("Enter the test result.");
      return;
    }
    setSaving(true);
    try {
      await saveResult(test.id, { result: result.trim(), flag });
      onSaved(result.trim(), flag);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the result.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Enter result" subtitle={`${test.test} — ${test.patient}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="r-result">Result</label>
        <textarea
          id="r-result"
          rows={4}
          required
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Write the findings and values"
          className={input}
        />

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Interpretation</legend>
          <div className="mt-2 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="flag" checked={flag === "normal"} onChange={() => setFlag("normal")} className="accent-[#0f766e]" />
              Normal
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="flag" checked={flag === "abnormal"} onChange={() => setFlag("abnormal")} className="accent-[#b4432f]" />
              Abnormal
            </label>
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save result"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- View result ---------- */
function ViewResultModal({ test, onClose }: { test: LabTest; onClose: () => void }) {
  return (
    <Modal title="Test result" subtitle={`${test.test} — ${test.patient}`} onClose={onClose}>
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
          test.flag === "abnormal" ? "bg-[#fbeeea] text-[#8a2f1f]" : "bg-[#e6f4e4] text-[#2d6a24]"
        }`}
      >
        {test.flag === "abnormal" ? "Abnormal" : "Normal"}
      </span>
      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-[#f3f6f5] p-4 text-sm">{test.result}</p>
      <p className="mt-3 text-xs text-[#7b8a87]">
        {test.id} · Requested by {test.requestedBy} · {formatDate(test.date)}
      </p>
      <div className="mt-6 flex sm:justify-end">
        <button type="button" onClick={onClose} className={`${cancelBtn} w-full sm:w-auto`}>Close</button>
      </div>
    </Modal>
  );
}