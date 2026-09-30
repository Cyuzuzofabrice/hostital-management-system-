type Props = { label: string; value: string; note: string; className?: string };

export default function Stat({ label, value, note, className = "" }: Props) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      <dt className="text-sm text-[#5b6b69]">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tabular-nums">{value}</dd>
      <p className="mt-1 text-xs text-[#7b8a87]">{note}</p>
    </div>
  );
}