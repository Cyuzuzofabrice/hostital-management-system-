import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Button from "../components/ui/Button";

/* ---------- Types ---------- */
interface Medicine {
  id: string;
  name: string;
  category: string;
  unit: string; // tablets, bottles, vials...
  stock: number;
  reorderLevel: number;
  price: number; // RWF per unit
  expiry: string; // YYYY-MM-DD
}

type StockState = "in-stock" | "low" | "out";

const categories = [
  "Antibiotic",
  "Painkiller",
  "Antimalarial",
  "Antihypertensive",
  "Antidiabetic",
  "Vitamin",
  "Injection",
];

/* ---------- Sample data (replace with your API) ----------
   Swap `loadMedicines`, `saveMedicine`, `dispenseMedicine` and `restockMedicine`
   for real calls, e.g. pharmacyService.getAll(), pharmacyService.create(data). */
function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const sample: Medicine[] = [
  { id: "M-501", name: "Amoxicillin 500mg", category: "Antibiotic", unit: "capsules", stock: 420, reorderLevel: 100, price: 150, expiry: isoDate(320) },
  { id: "M-502", name: "Paracetamol 500mg", category: "Painkiller", unit: "tablets", stock: 85, reorderLevel: 200, price: 50, expiry: isoDate(210) },
  { id: "M-503", name: "Artemether/Lumefantrine", category: "Antimalarial", unit: "tablets", stock: 0, reorderLevel: 60, price: 900, expiry: isoDate(150) },
  { id: "M-504", name: "Amlodipine 5mg", category: "Antihypertensive", unit: "tablets", stock: 260, reorderLevel: 80, price: 120, expiry: isoDate(25) },
  { id: "M-505", name: "Metformin 500mg", category: "Antidiabetic", unit: "tablets", stock: 340, reorderLevel: 100, price: 100, expiry: isoDate(400) },
  { id: "M-506", name: "Ceftriaxone 1g", category: "Injection", unit: "vials", stock: 32, reorderLevel: 40, price: 1800, expiry: isoDate(60) },
  { id: "M-507", name: "Vitamin C 500mg", category: "Vitamin", unit: "tablets", stock: 600, reorderLevel: 150, price: 30, expiry: isoDate(500) },
];

async function loadMedicines(): Promise<Medicine[]> {
  return sample;
}

async function saveMedicine(data: Omit<Medicine, "id">): Promise<Medicine> {
  return { ...data, id: `M-${500 + Math.floor(Math.random() * 9000)}` };
}

async function dispenseMedicine(_id: string, _data: { patient: string; quantity: number }): Promise<void> {
  return;
}

async function restockMedicine(_id: string, _quantity: number): Promise<void> {
  return;
}

/* ---------- Helpers ---------- */
function stockState(m: Medicine): StockState {
  if (m.stock <= 0) return "out";
  if (m.stock <= m.reorderLevel) return "low";
  return "in-stock";
}

function daysUntil(iso: string) {
  const ms = new Date(iso + "T00:00:00").getTime() - new Date(isoDate(0) + "T00:00:00").getTime();
  return Math.round(ms / 86400000);
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function money(n: number) {
  return `${n.toLocaleString()} RWF`;
}

/* ---------- Styles ---------- */
const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

const cancelBtn =
  "rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";

const stockBadge: Record<StockState, string> = {
  "in-stock": "bg-[#e6f4e4] text-[#2d6a24]",
  low: "bg-[#fdf1e0] text-[#8a5a12]",
  out: "bg-[#fbeeea] text-[#8a2f1f]",
};

const stockLabel: Record<StockState, string> = {
  "in-stock": "In stock",
  low: "Low stock",
  out: "Out of stock",
};

function StockBadge({ medicine }: { medicine: Medicine }) {
  const s = stockState(medicine);
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${stockBadge[s]}`}>
      {stockLabel[s]}
    </span>
  );
}

function Expiry({ iso }: { iso: string }) {
  const days = daysUntil(iso);
  const soon = days <= 90;
  return (
    <span className={soon ? "font-medium text-[#8a2f1f]" : ""}>
      {formatDate(iso)}
      {days < 0 ? " (expired)" : soon ? ` (${days}d left)` : ""}
    </span>
  );
}

/* ---------- Page ---------- */
export default function Pharmacy() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<"all" | StockState>("all");
  const [openNew, setOpenNew] = useState(false);
  const [dispensing, setDispensing] = useState<Medicine | null>(null);
  const [restocking, setRestocking] = useState<Medicine | null>(null);

  useEffect(() => {
    loadMedicines().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(
    () => [
      { label: "Medicines", value: items.length, color: "text-[#12302d]" },
      { label: "Low stock", value: items.filter((m) => stockState(m) === "low").length, color: "text-[#8a5a12]" },
      { label: "Out of stock", value: items.filter((m) => stockState(m) === "out").length, color: "text-[#8a2f1f]" },
      { label: "Expiring in 90 days", value: items.filter((m) => daysUntil(m.expiry) <= 90).length, color: "text-[#8a2f1f]" },
    ],
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((m) => {
        const matchesText = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
        const matchesCat = category === "all" || m.category === category;
        const matchesStock = stock === "all" || stockState(m) === stock;
        return matchesText && matchesCat && matchesStock;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, query, category, stock]);

  function changeStock(id: string, delta: number) {
    setItems((list) => list.map((m) => (m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m)));
  }

  return (
    <div
      className="min-h-screen bg-[#f3f6f5] px-4 py-6 text-[#12302d] sm:px-6 lg:px-10"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pharmacy</h1>
            <p className="mt-1 text-sm text-[#5b6b69]">Manage medicine stock and dispense to patients.</p>
          </div>
          <Button type="button" onClick={() => setOpenNew(true)} className="w-full sm:w-auto">
            Add medicine
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

        {/* Search + filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)] md:flex-row md:items-center">
          <label className="sr-only" htmlFor="search">Search medicines</label>
          <input
            id="search"
            type="search"
            placeholder="Search by medicine name or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 md:flex-1"
          />
          <label className="sr-only" htmlFor="category">Filter by category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 md:w-52"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="stock">Filter by stock</label>
          <select
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value as "all" | StockState)}
            className="w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25 md:w-44"
          >
            <option value="all">Any stock level</option>
            <option value="in-stock">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-12px_rgba(6,42,42,0.25)]">
          {loading ? (
            <p className="p-8 text-center text-sm text-[#5b6b69]">Loading medicines...</p>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No medicines found</p>
              <p className="mt-1 text-sm text-[#5b6b69]">Change the filters, or add a new medicine.</p>
            </div>
          ) : (
            <>
              {/* Table: tablet and up */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-[#eef4f2] text-[#3f5451]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Medicine</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Expiry</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => (
                    <tr key={m.id} className="border-t border-[#e3ebe9] hover:bg-[#f7faf9]">
                      <td className="px-5 py-3">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-[#7b8a87]">{m.id}</div>
                      </td>
                      <td className="px-5 py-3">{m.category}</td>
                      <td className="px-5 py-3">
                        <div>{m.stock} {m.unit}</div>
                        <div className="mt-1"><StockBadge medicine={m} /></div>
                      </td>
                      <td className="px-5 py-3">{money(m.price)}</td>
                      <td className="px-5 py-3"><Expiry iso={m.expiry} /></td>
                      <td className="px-5 py-3">
                        <RowActions m={m} onDispense={setDispensing} onRestock={setRestocking} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards: phones */}
              <ul className="divide-y divide-[#e3ebe9] md:hidden">
                {visible.map((m) => (
                  <li key={m.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-[#7b8a87]">{m.id} · {m.category}</p>
                      </div>
                      <StockBadge medicine={m} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Stock</dt>
                        <dd>{m.stock} {m.unit}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#7b8a87]">Price</dt>
                        <dd>{money(m.price)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-[#7b8a87]">Expiry</dt>
                        <dd><Expiry iso={m.expiry} /></dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <RowActions m={m} onDispense={setDispensing} onRestock={setRestocking} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {openNew && (
        <NewMedicineModal
          onClose={() => setOpenNew(false)}
          onSaved={(m) => {
            setItems((list) => [m, ...list]);
            setOpenNew(false);
          }}
        />
      )}

      {dispensing && (
        <DispenseModal
          medicine={dispensing}
          onClose={() => setDispensing(null)}
          onDone={(qty) => {
            changeStock(dispensing.id, -qty);
            setDispensing(null);
          }}
        />
      )}

      {restocking && (
        <RestockModal
          medicine={restocking}
          onClose={() => setRestocking(null)}
          onDone={(qty) => {
            changeStock(restocking.id, qty);
            setRestocking(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Row actions ---------- */
function RowActions({
  m,
  onDispense,
  onRestock,
}: {
  m: Medicine;
  onDispense: (m: Medicine) => void;
  onRestock: (m: Medicine) => void;
}) {
  const base = "rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40";
  return (
    <div className="flex gap-2 md:justify-end">
      <button
        onClick={() => onDispense(m)}
        disabled={m.stock <= 0}
        className={`${base} bg-[#0f766e] text-white hover:bg-[#0c635c] disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Dispense
      </button>
      <button onClick={() => onRestock(m)} className={`${base} bg-[#e3f2f0] text-[#0b5c55] hover:bg-[#d2eae6]`}>
        Restock
      </button>
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

/* ---------- Add medicine ---------- */
function NewMedicineModal({ onClose, onSaved }: { onClose: () => void; onSaved: (m: Medicine) => void }) {
  const [form, setForm] = useState({
    name: "",
    category: categories[0],
    unit: "tablets",
    stock: "",
    reorderLevel: "50",
    price: "",
    expiry: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const stock = Number(form.stock);
    const reorderLevel = Number(form.reorderLevel);
    const price = Number(form.price);
    if (![stock, reorderLevel, price].every((n) => Number.isFinite(n) && n >= 0)) {
      setError("Stock, reorder level and price must be zero or more.");
      return;
    }
    if (form.expiry <= isoDate(0)) {
      setError("The expiry date must be in the future.");
      return;
    }
    setSaving(true);
    try {
      onSaved(await saveMedicine({ ...form, stock, reorderLevel, price }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the medicine.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add medicine" subtitle="Register a new medicine in the pharmacy stock." onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="m-name">Medicine name</label>
        <input id="m-name" required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="m-cat">Category</label>
            <select id="m-cat" value={form.category} onChange={(e) => update("category", e.target.value)} className={input}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="m-unit">Unit</label>
            <select id="m-unit" value={form.unit} onChange={(e) => update("unit", e.target.value)} className={input}>
              {["tablets", "capsules", "bottles", "vials", "sachets", "tubes"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="m-stock">Quantity</label>
            <input id="m-stock" type="number" min={0} required value={form.stock}
              onChange={(e) => update("stock", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="m-reorder">Reorder level</label>
            <input id="m-reorder" type="number" min={0} required value={form.reorderLevel}
              onChange={(e) => update("reorderLevel", e.target.value)} className={input} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="m-price">Price per unit (RWF)</label>
            <input id="m-price" type="number" min={0} required value={form.price}
              onChange={(e) => update("price", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="m-expiry">Expiry date</label>
            <input id="m-expiry" type="date" required value={form.expiry}
              onChange={(e) => update("expiry", e.target.value)} className={input} />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save medicine"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Dispense ---------- */
function DispenseModal({
  medicine,
  onClose,
  onDone,
}: {
  medicine: Medicine;
  onClose: () => void;
  onDone: (qty: number) => void;
}) {
  const [patient, setPatient] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const qty = Number(quantity);
  const total = Number.isFinite(qty) && qty > 0 ? qty * medicine.price : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Enter a quantity of at least 1.");
      return;
    }
    if (qty > medicine.stock) {
      setError(`Only ${medicine.stock} ${medicine.unit} left in stock.`);
      return;
    }
    if (daysUntil(medicine.expiry) < 0) {
      setError("This medicine has expired and cannot be dispensed.");
      return;
    }
    setSaving(true);
    try {
      await dispenseMedicine(medicine.id, { patient: patient.trim(), quantity: qty });
      onDone(qty);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not dispense the medicine.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Dispense medicine" subtitle={`${medicine.name} · ${medicine.stock} ${medicine.unit} available`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="dp-patient">Patient name</label>
        <input id="dp-patient" required value={patient} onChange={(e) => setPatient(e.target.value)} className={input} />

        <label className="mt-4 block text-sm font-medium" htmlFor="dp-qty">Quantity</label>
        <input id="dp-qty" type="number" min={1} max={medicine.stock} required value={quantity}
          onChange={(e) => setQuantity(e.target.value)} className={input} />

        <p className="mt-4 flex justify-between rounded-lg bg-[#f3f6f5] px-4 py-3 text-sm">
          <span className="text-[#5b6b69]">Total</span>
          <span className="font-semibold">{money(total)}</span>
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Dispensing..." : "Dispense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Restock ---------- */
function RestockModal({
  medicine,
  onClose,
  onDone,
}: {
  medicine: Medicine;
  onClose: () => void;
  onDone: (qty: number) => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Enter a quantity of at least 1.");
      return;
    }
    setSaving(true);
    try {
      await restockMedicine(medicine.id, qty);
      onDone(qty);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restock the medicine.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Restock medicine" subtitle={`${medicine.name} · currently ${medicine.stock} ${medicine.unit}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label className="block text-sm font-medium" htmlFor="rs-qty">Quantity to add</label>
        <input id="rs-qty" type="number" min={1} required value={quantity}
          onChange={(e) => setQuantity(e.target.value)} className={input} />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <Button type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Add stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}