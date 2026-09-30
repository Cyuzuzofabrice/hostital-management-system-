import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navItems } from "../../data/dashboard";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full min-h-screen w-60 flex-col bg-[#12403c] text-[#cfe0dc]">
      <div className="px-5 pb-6 pt-6">
        <p className="text-lg font-semibold tracking-tight text-white">MediCare</p>
        <p className="text-xs text-[#8fb0aa]">Kigali Referral Clinic</p>
      </div>

      <nav className="flex-1 px-3">
        <ul>
          {navItems.map(({ to, label, icon: Icon, count }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 border-l-2 py-2 pl-3 pr-2 text-sm ${
                    isActive
                      ? "border-[#f2c14e] bg-white/10 font-medium text-white"
                      : "border-transparent hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={17} strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                {count && <span className="text-xs text-[#8fb0aa]">{count}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm">
        <div>
          <p className="font-medium text-white">Admin User</p>
          <p className="text-xs text-[#8fb0aa]">Administrator</p>
        </div>
        <button title="Log out" className="text-[#8fb0aa] hover:text-white">
          <LogOut size={17} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}