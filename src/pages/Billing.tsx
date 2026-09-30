import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
type Method = "cash" | "mobile-money" | "insurance" | "card";
type Status = "unpaid" | "partial" | "paid";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // RWF
}

interface Payment {
  amount: number;
  method: Method;
  date: string; // YYYY-MM-DD
}

interface Invoice {
  id: string;
  patient: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: LineItem[];
  payments: Payment[];
}

const methodLabel: Record<Method, string> = {
  cash: "Cash",
  "mobile-money": "Mobile money",
  insurance: "Insurance",
  card: "Card",
};

const commonServices: { description: string; price: number }[] = [
  { description: "Consultation", price: 5000 },
  { description: "Laboratory test", price: 4200 },
  { description: "Medication", price: 3000 },
  { description: "Ward bed (per day)", price: 15000 },
  { description: "X-ray", price: 12000 },
];

/* ---------- Sample data (replace with your API) ----------
   Swap `loadInvoices`, `saveInvoice` and `savePayment` for real calls, e.g.
   billingService.getAll(), billingService.create(data), billingService.pay(id, data). */
function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const sample: Invoice[] = [
  {
    id: "INV-7001", patient: "Aline Uwase", date: isoDate(-3), dueDate: isoDate(4),
    items: [
      { description: "Consultation", quantity: 1, unitPrice: 5000 },
      { description: "Laboratory test", quantity: 2, unitPrice: 4200 },
      { description: "Ward bed (per day)", quantity: 3, unitPrice: 15000 },
    ],
    payments: [{ amount: 30000, method: "mobile-money", date: isoDate(-2) }],
  },
  {
    id: "INV-7002", patient: "Jean Bosco Niyonzima", date: isoDate(-20), dueDate: isoDate(-6),
    items: [
      { description: "Consultation", quantity: 1, unitPrice: 5000 },
      { description: "Medication", quantity: 4, unitPrice: 3000 },
    ],
    payments: [],
  },
  {
    id: "INV-7003", patient: "Grace Mukamana", date: isoDate(-5), dueDate: isoDate(2),
    items: [
      { description: "Consultation", quantity: 1, unitPrice: 5000 },
      { description: "Medication", quantity: 2, unitPrice: 3000 },
    ],
    payments: [{ amount: 11000, method: "insurance", date: isoDate(-5) }],
  },
  {
    id: "INV-7004", patient: "Eric Habimana", date: isoDate(-8), dueDate: isoDate(-1),
    items: [
      { description: "X-ray", quantity: 1, unitPrice: 12000 },
      { description: "Consultation", quantity: 1, unitPrice: 5000 },
    ],
    payments: [{ amount: 17000, method: "cash", date: isoDate(-8) }],
  },
];

async function loadInvoices(): Promise<Invoice[]> {
  return sample;
}

async function saveInvoice(data: Omit<Invoice, "id" | "payments" | "date">): Promise<Invoice> {
  return { ...data, id: `INV-${7000 + Math.floor(Math.random() * 9000)}`, date: isoDate(0), payments: [] };
}

async function savePayment(_id: string, _data: Payment): Promise<void> {
  return;
}

/* ---------- Helpers ---------- */
const totalOf = (i: Invoice) => i.items.reduce((t, l) => t + l.quantity * l.unitPrice, 0);
const paidOf = (i: Invoice) => i.payments.reduce((t, p) => t + p.amount, 0);
const balanceOf = (i: Invoice) => Math.max(0, totalOf(i) - paidOf(i));

function statusOf(i: Invoice): Status {
  const paid = paidOf(i);
  if (paid >= totalOf(i)) return "paid";
  return paid > 0 ? "partial" : "unpaid";
}

function isOverdue(i: Invoice) {
  return statusOf(i) !== "paid" && i.dueDate < isoDate(0);
}

function money(n: number) {
  return `${n.toLocaleString()} RWF`;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const smallInput =
  "w-full rounded-lg border border-[#cfdad7] bg-white px-3 py-2 text-sm text-[#12302d] " +
  "outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const cancelBtn =
  "rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";

const cardShadow = "shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]";

const statusBadge: Record<Status, string> = {
  unpaid: "bg-[#fbeeea] text-[#8a2f1f]",
  partial: "bg-[#fdf1e0] text-[#8a5a12]",
  paid: "bg-[#e6f4e4] text-[#2d6a24]",
};

const statusLabel: Record<Status, string> = {
  unpaid: "Unpaid",
  partial: "Partly paid",
  paid: "Paid",
};

function StatusBadge({ invoice }: { invoice: Invoice }) {
  const s = statusOf(invoice);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[s]}`}>{statusLabel[s]}</span>
      {isOverdue(invoice) && (
        <span className="inline-block rounded-full bg-[#b4432f] px-2.5 py-0.5 text-xs font-medium text-white">Overdue</span>
      )}
    </span>
  );
}

/* ---------- Page ---------- */
export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | Status | "overdue">("all");
  const [openNew, setOpenNew] = useState(false);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [viewing, setViewing] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices().then((data) => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const billed = invoices.reduce((t, i) => t + totalOf(i), 0);
    const collected = invoices.reduce((t, i) => t + paidOf(i), 0);
    const overdue = invoices.filter(isOverdue).reduce((t, i) => t + balanceOf(i), 0);
    return [
      { label: "Total billed", value: money(billed), color: "text-[#12302d]" },
      { label: "Collected", value: money(collected), color: "text-[#2d6a24]" },
      { label: "Outstanding", value: money(billed - collected), color: "text-[#8a5a12]" },
      { label: "Overdue", value: money(overdue), color: "text-[#8a2f1f]" },
    ];
  }, [invoices]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices
      .filter((i) => {
        const matchesText = !q || i.patient.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
        const matchesTab = tab === "all" ? true : tab === "overdue" ? isOverdue(i) : statusOf(i) === tab;
        return matchesText && matchesTab;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [invoices, query, tab]);

  function addPayment(id: string, payment: Payment) {
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, payments: [...i.payments, payment] } : i)));
  }

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unpaid", label: "Unpaid" },
    { key: "partial", label: "Partly paid" },
    { key: "paid", label: "Paid" },
    { key: "overdue", label: "Overdue" },
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
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">Create invoices and record patient payments.</p>
          </div>
          <Button type="button" onClick={() => setOpenNew(true)} className="w-full sm:w-auto">
            New invoice
          </Button>
        </header>

        {/* Summary */}
        <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl bg-white p-4 ${cardShadow}`}>
              <dt className="text-sm text-[#5b6b69]">{s.label}</dt>
              <dd className={`mt-1 break-words text-lg font-semibold sm:text-xl ${s.color}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        {/* Tabs + search */}
        <div className={`mt-6 rounded-xl bg-white p-3 ${cardShadow}`}>
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
          <label className="sr-only" htmlFor="search">Search invoices</label>
          <input
            id="search"
            type="search"
            placeholder="Search by patient or invoice number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25"
          />
        </div>

        {/* Content */}
        <div className={`mt-4 overflow-hidden rounded-xl bg-white ${cardShadow}`}>
          {loading ? (
            <p className="p-8 text-center text-sm text-[#5b6b69]">Loading invoices...</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No invoices found</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Change the filters, or create a new invoice.</p>
            </div>
          ) : (
            <>
              {/* Table: tablet and up */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-[#eef4f2] text-[#3f5451]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Invoice</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 text-right font-medium">Balance</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((i) => (
                    <tr key={i.id} className="border-t border-[#e3ebe9] hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <div className="font-medium">{i.id}</div>
                        <div className="text-xs text-[#7b8a87]">{formatDate(i.date)}</div>
                      </td>
                      <td className="px-5 py-3">{i.patient}</td>
                      <td className="px-5 py-3">{formatDate(i.dueDate)}</td>
                      <td className="px-5 py-3 text-right">{money(totalOf(i))}</td>
                      <td className="px-5 py-3 text-right font-medium">{money(balanceOf(i))}</td>
                      <td className="px-5 py-3"><StatusBadge invoice={i} /></td>
                      <td className="px-5 py-3">
                        <RowActions invoice={i} onView={setViewing} onPay={setPaying} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards: phones */}
              <ul className="divide-y divide-[#e3ebe9] md:hidden">
                {visible.map((i) => (
                  <li key={i.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{i.patient}</p>
                        <p className="text-xs text-[#7b8a87]">{i.id} · {formatDate(i.date)}</p>
                      </div>
                      <StatusBadge invoice={i} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Total</dt>
                        <dd>{money(totalOf(i))}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Balance</dt>
                        <dd className="font-medium">{money(balanceOf(i))}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-[#7b8a87]">Due</dt>
                        <dd>{formatDate(i.dueDate)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <RowActions invoice={i} onView={setViewing} onPay={setPaying} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {openNew && (
        <NewInvoiceModal
          onClose={() => setOpenNew(false)}
          onSaved={(inv) => {
            setInvoices((list) => [inv, ...list]);
            setOpenNew(false);
          }}
        />
      )}

      {paying && (
        <PaymentModal
          invoice={paying}
          onClose={() => setPaying(null)}
          onDone={(p) => {
            addPayment(paying.id, p);
            setPaying(null);
          }}
        />
      )}

      {viewing && (
        <ViewInvoiceModal
          // Read the latest copy so new payments show up immediately.
          invoice={invoices.find((i) => i.id === viewing.id) ?? viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

/* ---------- Row actions ---------- */
function RowActions({
  invoice,
  onView,
  onPay,
}: {
  invoice: Invoice;
  onView: (i: Invoice) => void;
  onPay: (i: Invoice) => void;
}) {
  const base = "rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";
  return (
    <div className="flex gap-2 md:justify-end">
      <button onClick={() => onView(invoice)} className={`${base} bg-[#e3f2f0] text-[#0b5c55] hover:bg-[#d2eae6]`}>
        View
      </button>
      {statusOf(invoice) !== "paid" && (
        <button onClick={() => onPay(invoice)} className={`${base} bg-[#0f766e] text-white hover:bg-[#0c635c]`}>
          Record payment
        </button>
      )}
    </div>
  );
}

/* ---------- Modal shell ---------- */
function Modal({
  title,
  subtitle,
  onClose,
  wide,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
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
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:p-8 ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
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

/* ---------- New invoice ---------- */
function NewInvoiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: (i: Invoice) => void }) {
  const [patient, setPatient] = useState("");
  const [dueDate, setDueDate] = useState(isoDate(7));
  const [items, setItems] = useState<{ description: string; quantity: string; unitPrice: string }[]>([
    { description: commonServices[0].description, quantity: "1", unitPrice: String(commonServices[0].price) },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const total = items.reduce((t, l) => t + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  function updateItem(index: number, field: "description" | "quantity" | "unitPrice", value: string) {
    setItems((list) => list.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function pickService(index: number, description: string) {
    const known = commonServices.find((s) => s.description === description);
    setItems((list) =>
      list.map((l, i) => (i === index ? { ...l, description, unitPrice: known ? String(known.price) : l.unitPrice } : l))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const cleaned: LineItem[] = items.map((l) => ({
      description: l.description.trim(),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
    }));

    if (cleaned.some((l) => !l.description || !Number.isInteger(l.quantity) || l.quantity < 1 || !(l.unitPrice >= 0))) {
      setError("Each item needs a description, a quantity of at least 1, and a valid price.");
      return;
    }
    if (dueDate < isoDate(0)) {
      setError("The due date cannot be in the past.");
      return;
    }

    setSaving(true);
    try {
      onSaved(await saveInvoice({ patient: patient.trim(), dueDate, items: cleaned }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the invoice.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New invoice" subtitle="Add the services provided to the patient." onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="b-patient">Patient name</label>
            <input id="b-patient" required value={patient} onChange={(e) => setPatient(e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="b-due">Due date</label>
            <input id="b-due" type="date" required min={isoDate(0)} value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} className={input} />
          </div>
        </div>

        <p className="mt-5 text-sm font-medium">Items</p>
        <ul className="mt-2 space-y-3">
          {items.map((l, index) => (
            <li key={index} className="rounded-lg border border-[#e3ebe9] p-3">
              <label className="sr-only" htmlFor={`b-desc-${index}`}>Description</label>
              <input
                id={`b-desc-${index}`}
                list="services"
                required
                placeholder="Service or item"
                value={l.description}
                onChange={(e) => pickService(index, e.target.value)}
                className={smallInput}
              />
              <div className="mt-2 grid grid-cols-[5rem_1fr_auto] items-end gap-3">
                <div>
                  <label className="text-xs text-[#7b8a87]" htmlFor={`b-qty-${index}`}>Qty</label>
                  <input id={`b-qty-${index}`} type="number" min={1} required value={l.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)} className={smallInput} />
                </div>
                <div>
                  <label className="text-xs text-[#7b8a87]" htmlFor={`b-price-${index}`}>Unit price (RWF)</label>
                  <input id={`b-price-${index}`} type="number" min={0} required value={l.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)} className={smallInput} />
                </div>
                <button
                  type="button"
                  onClick={() => setItems((list) => list.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                  aria-label={`Remove item ${index + 1}`}
                  className="mb-0.5 rounded-lg px-2.5 py-2 text-sm text-[#8a2f1f] hover:bg-[#fbeeea] focus:outline-none focus:ring-2 focus:ring-[#b4432f]/40 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
        <datalist id="services">
          {commonServices.map((s) => (
            <option key={s.description} value={s.description} />
          ))}
        </datalist>

        <button
          type="button"
          onClick={() => setItems((list) => [...list, { description: "", quantity: "1", unitPrice: "" }])}
          className="mt-3 text-sm font-medium text-[#0f766e] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
        >
          + Add another item
        </button>

        <p className="mt-5 flex justify-between rounded-lg bg-[#f3f6f5] px-4 py-3 text-sm">
          <span className="text-[#5b6b69]">Total</span>
          <span className="font-semibold">{money(total)}</span>
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Creating..." : "Create invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Record payment ---------- */
function PaymentModal({
  invoice,
  onClose,
  onDone,
}: {
  invoice: Invoice;
  onClose: () => void;
  onDone: (p: Payment) => void;
}) {
  const balance = balanceOf(invoice);
  const [amount, setAmount] = useState(String(balance));
  const [method, setMethod] = useState<Method>("cash");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (value > balance) {
      setError(`The amount cannot be more than the balance of ${money(balance)}.`);
      return;
    }
    setSaving(true);
    try {
      const payment: Payment = { amount: value, method, date: isoDate(0) };
      await savePayment(invoice.id, payment);
      onDone(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Record payment" subtitle={`${invoice.id} · ${invoice.patient} · balance ${money(balance)}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="p-amount">Amount (RWF)</label>
        <input id="p-amount" type="number" min={1} max={balance} required value={amount}
          onChange={(e) => setAmount(e.target.value)} className={input} />

        <label className="mt-4 block text-sm font-medium" htmlFor="p-method">Payment method</label>
        <select id="p-method" value={method} onChange={(e) => setMethod(e.target.value as Method)} className={input}>
          {(Object.keys(methodLabel) as Method[]).map((m) => (
            <option key={m} value={m}>{methodLabel[m]}</option>
          ))}
        </select>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- View invoice ---------- */
function ViewInvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <Modal title={invoice.id} subtitle={`${invoice.patient} · issued ${formatDate(invoice.date)} · due ${formatDate(invoice.dueDate)}`} onClose={onClose} wide>
      <div className="mb-4">
        <StatusBadge invoice={invoice} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-[#eef4f2] text-[#3f5451]">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((l, i) => (
              <tr key={i} className="border-t border-[#e3ebe9]">
                <td className="px-3 py-2">{l.description}</td>
                <td className="px-3 py-2 text-right">{l.quantity}</td>
                <td className="px-3 py-2 text-right">{l.unitPrice.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{(l.quantity * l.unitPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-[#5b6b69]">Total</dt>
          <dd>{money(totalOf(invoice))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#5b6b69]">Paid</dt>
          <dd>{money(paidOf(invoice))}</dd>
        </div>
        <div className="flex justify-between border-t border-[#e3ebe9] pt-2 font-semibold">
          <dt>Balance due</dt>
          <dd>{money(balanceOf(invoice))}</dd>
        </div>
      </dl>

      <h3 className="mt-6 text-sm font-semibold">Payments</h3>
      {invoice.payments.length === 0 ? (
        <p className="mt-2 text-sm text-[#7b8a87]">No payments recorded yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-[#e3ebe9] text-sm">
          {invoice.payments.map((p, i) => (
            <li key={i} className="flex justify-between py-2">
              <span>
                {methodLabel[p.method]} <span className="text-[#7b8a87]">· {formatDate(p.date)}</span>
              </span>
              <span className="font-medium">{money(p.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex sm:justify-end">
        <button type="button" onClick={onClose} className={`${cancelBtn} w-full sm:w-auto`}>Close</button>
      </div>
    </Modal>
  );
}