import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Range = 7 | 30 | 90;

interface DayPoint {
  date: string; // YYYY-MM-DD
  patients: number;
  appointments: number;
  admissions: number;
  labTests: number;
  revenue: number; // RWF
}

interface Breakdown {
  label: string;
  value: number;
}

interface ReportData {
  days: DayPoint[];
  departments: Breakdown[];
  diagnoses: Breakdown[];
  wards: { name: string; used: number; beds: number }[];
}

/* ---------- Sample data (replace with your API) ----------
   Swap `loadReport` for a real call, e.g. reportService.get({ from, to }).
   It must return the same ReportData shape: one DayPoint per day in the range. */
function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Small deterministic pseudo-random so the sample numbers stay stable between renders.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

async function loadReport(range: Range): Promise<ReportData> {
  const days: DayPoint[] = Array.from({ length: range }, (_, i) => {
    const offset = -(range - 1 - i);
    const date = isoDate(offset);
    const weekday = new Date(date + "T00:00:00").getDay();
    const busy = weekday === 0 || weekday === 6 ? 0.55 : 1; // quieter weekends
    const appointments = Math.round((18 + seeded(i + 1) * 14) * busy);
    const patients = Math.round((8 + seeded(i + 40) * 9) * busy);
    const admissions = Math.round((2 + seeded(i + 80) * 4) * busy);
    const labTests = Math.round((14 + seeded(i + 120) * 16) * busy);
    return {
      date,
      patients,
      appointments,
      admissions,
      labTests,
      revenue: Math.round((appointments * 6500 + labTests * 4200 + admissions * 45000) / 1000) * 1000,
    };
  });

  return {
    days,
    departments: [
      { label: "General Medicine", value: 412 },
      { label: "Pediatrics", value: 286 },
      { label: "Cardiology", value: 198 },
      { label: "Gynecology", value: 171 },
      { label: "Orthopedics", value: 124 },
      { label: "Emergency", value: 96 },
    ],
    diagnoses: [
      { label: "Malaria", value: 148 },
      { label: "Hypertension", value: 102 },
      { label: "Respiratory infection", value: 87 },
      { label: "Diabetes", value: 64 },
      { label: "Typhoid", value: 41 },
    ],
    wards: [
      { name: "General Ward", used: 14, beds: 20 },
      { name: "ICU", used: 5, beds: 6 },
      { name: "Pediatrics", used: 6, beds: 10 },
      { name: "Maternity", used: 4, beds: 8 },
    ],
  };
}

/* ---------- Helpers ---------- */
const sum = (points: DayPoint[], key: keyof Omit<DayPoint, "date">) => points.reduce((t, p) => t + p[key], 0);

function money(n: number) {
  return `${n.toLocaleString()} RWF`;
}

function shortMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M RWF`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K RWF`;
  return `${n} RWF`;
}

function shortDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* Groups days into buckets so long ranges stay readable (90 days -> weekly). */
function bucketize(days: DayPoint[], size: number, key: keyof Omit<DayPoint, "date">) {
  const out: { label: string; value: number }[] = [];
  for (let i = 0; i < days.length; i += size) {
    const chunk = days.slice(i, i + size);
    out.push({ label: shortDate(chunk[0].date), value: sum(chunk, key) });
  }
  return out;
}

const cardShadow = "shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]";

/* ---------- Charts (no chart library needed) ---------- */
function BarChart({ data, color = "#0f766e", title }: { data: { label: string; value: number }[]; color?: string; title: string }) {
  const W = 600;
  const H = 220;
  const padL = 34;
  const padB = 26;
  const padT = 10;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (W - padL) / data.length;
  const barW = Math.max(3, step * 0.62);
  const labelEvery = Math.ceil(data.length / 8);
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((t) => {
        const y = padT + (H - padB - padT) * (1 - t / max);
        return (
          <g key={t}>
            <line x1={padL} x2={W} y1={y} y2={y} stroke="#e3ebe9" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#7b8a87">
              {t}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = ((H - padB - padT) * d.value) / max;
        const x = padL + i * step + (step - barW) / 2;
        const y = H - padB - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="2" fill={color}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#7b8a87">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HBars({ data, color = "#0f766e" }: { data: Breakdown[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between text-sm">
            <span>{d.label}</span>
            <span className="font-medium">{d.value}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e3ebe9]">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Page ---------- */
export default function Reports() {
  const [range, setRange] = useState<Range>(30);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"appointments" | "patients" | "admissions" | "labTests">("appointments");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadReport(range).then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const kpis = useMemo(() => {
    if (!data) return [];
    return [
      { label: "New patients", value: sum(data.days, "patients").toLocaleString() },
      { label: "Appointments", value: sum(data.days, "appointments").toLocaleString() },
      { label: "Admissions", value: sum(data.days, "admissions").toLocaleString() },
      { label: "Lab tests", value: sum(data.days, "labTests").toLocaleString() },
      { label: "Revenue", value: shortMoney(sum(data.days, "revenue")) },
    ];
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return bucketize(data.days, range === 90 ? 7 : 1, metric);
  }, [data, range, metric]);

  function exportCsv() {
    if (!data) return;
    const header = "Date,New patients,Appointments,Admissions,Lab tests,Revenue (RWF)";
    const rows = data.days.map((d) => [d.date, d.patients, d.appointments, d.admissions, d.labTests, d.revenue].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hospital-report-last-${range}-days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const ranges: { key: Range; label: string }[] = [
    { key: 7, label: "7 days" },
    { key: 30, label: "30 days" },
    { key: 90, label: "90 days" },
  ];

  const metrics: { key: typeof metric; label: string }[] = [
    { key: "appointments", label: "Appointments" },
    { key: "patients", label: "New patients" },
    { key: "admissions", label: "Admissions" },
    { key: "labTests", label: "Lab tests" },
  ];

  const totalRevenue = data ? sum(data.days, "revenue") : 0;

  return (
    <div
      className="min-h-screen bg-[#f3f6f5] px-4 py-6 text-[#12302d] sm:px-6 lg:px-10"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">
              {shortDate(isoDate(-(range - 1)))} – {shortDate(isoDate(0))}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 rounded-lg border border-[#cfdad7] bg-white px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 sm:flex-none"
            >
              Print
            </button>
            <Button type="button" onClick={exportCsv} disabled={!data} className="flex-1 disabled:opacity-60 sm:flex-none">
              Export CSV
            </Button>
          </div>
        </header>

        {/* Range selector */}
        <div className={`mt-6 inline-flex rounded-xl bg-white p-1 print:hidden ${cardShadow}`} role="tablist" aria-label="Report period">
          {ranges.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 ${
                range === r.key ? "bg-[#0f766e] text-white" : "text-[#3f5451] hover:bg-[#eef4f2]"
              }`}
            >
              Last {r.label}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <p className={`mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#5b6b69] ${cardShadow}`}>Loading report...</p>
        ) : (
          <>
            {/* KPIs */}
            <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {kpis.map((k) => (
                <div key={k.label} className={`rounded-xl bg-white p-4 ${cardShadow}`}>
                  <dt className="text-sm text-[#5b6b69]">{k.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{k.value}</dd>
                </div>
              ))}
            </dl>

            {/* Trend chart */}
            <section className={`mt-6 rounded-xl bg-white p-4 sm:p-6 ${cardShadow}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Activity trend</h2>
                <div className="flex gap-1 overflow-x-auto print:hidden" role="tablist" aria-label="Metric">
                  {metrics.map((m) => (
                    <button
                      key={m.key}
                      role="tab"
                      aria-selected={metric === m.key}
                      onClick={() => setMetric(m.key)}
                      className={`whitespace-nowrap rounded-full px-3.5 py-1 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 ${
                        metric === m.key ? "bg-[#0f766e] text-white" : "text-[#3f5451] hover:bg-[#eef4f2]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-[#7b8a87]">
                {range === 90 ? "Totals per week" : "Totals per day"}
              </p>
              <div className="mt-4">
                <BarChart data={chartData} title={`${metric} over the last ${range} days`} />
              </div>
            </section>

            {/* Breakdowns */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className={`rounded-xl bg-white p-4 sm:p-6 ${cardShadow}`}>
                <h2 className="text-lg font-semibold">Visits by department</h2>
                <div className="mt-4">
                  <HBars data={data.departments} />
                </div>
              </section>

              <section className={`rounded-xl bg-white p-4 sm:p-6 ${cardShadow}`}>
                <h2 className="text-lg font-semibold">Top diagnoses</h2>
                <div className="mt-4">
                  <HBars data={data.diagnoses} color="#1e4f7c" />
                </div>
              </section>
            </div>

            {/* Bed occupancy + revenue */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <section className={`rounded-xl bg-white p-4 sm:p-6 ${cardShadow}`}>
                <h2 className="text-lg font-semibold">Bed occupancy today</h2>
                <ul className="mt-4 space-y-3">
                  {data.wards.map((w) => {
                    const pct = Math.round((w.used / w.beds) * 100);
                    return (
                      <li key={w.name}>
                        <div className="flex justify-between text-sm">
                          <span>{w.name}</span>
                          <span className="font-medium">
                            {w.used}/{w.beds} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e3ebe9]">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? "bg-[#b4432f]" : pct >= 70 ? "bg-[#d98a1c]" : "bg-[#0f766e]"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className={`rounded-xl bg-white p-4 sm:p-6 ${cardShadow}`}>
                <h2 className="text-lg font-semibold">Revenue summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-[#e3ebe9] pb-3">
                    <dt className="text-[#5b6b69]">Total revenue</dt>
                    <dd className="font-semibold">{money(totalRevenue)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#e3ebe9] pb-3">
                    <dt className="text-[#5b6b69]">Average per day</dt>
                    <dd className="font-medium">{money(Math.round(totalRevenue / data.days.length / 1000) * 1000)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5b6b69]">Best day</dt>
                    <dd className="font-medium">
                      {(() => {
                        const best = data.days.reduce((a, b) => (b.revenue > a.revenue ? b : a));
                        return `${shortDate(best.date)} · ${shortMoney(best.revenue)}`;
                      })()}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}