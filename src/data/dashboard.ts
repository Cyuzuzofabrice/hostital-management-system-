import {
  LayoutDashboard, Users, CalendarDays, Stethoscope, FlaskConical,
  Pill, Bed, Receipt, BarChart3, type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon; count?: number };

// Single source of truth for the totals shown around the app.
// Later, replace this with the response from your API.
export const summary = {
  patientsOnRecord: 2847,
  patientsAddedThisMonth: 342,
  appointmentsToday: 128,
  appointmentsUnconfirmed: 19,
  admitted: 64,
  dischargesDue: 6,
  revenueThisMonth: 48250,
  revenueVsLastMonth: 5900,
  labPending: 9,
};

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/appointments", label: "Appointments", icon: CalendarDays, count: summary.appointmentsToday },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/laboratory", label: "Laboratory", icon: FlaskConical, count: summary.labPending },
  { to: "/pharmacy", label: "Pharmacy", icon: Pill },
  { to: "/admissions", label: "Admissions", icon: Bed },
  { to: "/billing", label: "Billing", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const n = (v: number) => v.toLocaleString("en-US");

export const stats = [
  {
    label: "Patients on record",
    value: n(summary.patientsOnRecord),
    note: `${n(summary.patientsAddedThisMonth)} added this month`,
  },
  {
    label: "Appointments today",
    value: n(summary.appointmentsToday),
    note: `${summary.appointmentsUnconfirmed} not yet confirmed`,
  },
  {
    label: "Currently admitted",
    value: n(summary.admitted),
    note: `${summary.dischargesDue} discharges due today`,
  },
  {
    label: "Revenue this month",
    value: `$${n(summary.revenueThisMonth)}`,
    note: `$${n(summary.revenueVsLastMonth)} above last month`,
  },
];

export type AppointmentStatus = "Confirmed" | "Waiting" | "Pending";

export type Appointment = {
  id: number;
  time: string;
  patient: string;
  doctor: string;
  dept: string;
  status: AppointmentStatus;
};

export const appointments: Appointment[] = [
  { id: 1, time: "09:00", patient: "Jean Pierre", doctor: "Dr. Alice Mukamana", dept: "Cardiology", status: "Confirmed" },
  { id: 2, time: "10:30", patient: "Sarah Uwase", doctor: "Dr. Eric Niyonzima", dept: "Pediatrics", status: "Waiting" },
  { id: 3, time: "11:45", patient: "David Mugisha", doctor: "Dr. Diane Ingabire", dept: "General medicine", status: "Confirmed" },
  { id: 4, time: "14:00", patient: "Grace Mukamana", doctor: "Dr. Patrick Habimana", dept: "Dermatology", status: "Pending" },
];

export const wards = [
  { label: "General ward", used: 38, total: 50 },
  { label: "Emergency", used: 12, total: 20 },
  { label: "ICU", used: 8, total: 10 },
  { label: "Maternity", used: 16, total: 25 },
];