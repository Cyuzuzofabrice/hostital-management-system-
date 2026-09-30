import type { AppointmentStatus } from "../../data/dashboard";

const dots: Record<AppointmentStatus, string> = {
  Confirmed: "bg-[#0f766e]",
  Waiting: "bg-[#d99a1c]",
  Pending: "bg-[#a3aeab]",
};

export default function Badge({ status }: { status: AppointmentStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}