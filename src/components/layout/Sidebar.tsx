import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navItems } from "../../data/dashboard";
import { authService } from "../../services/authService";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close the confirmation with the Escape key
  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loggingOut && setConfirming(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, loggingOut]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails, sign the user out on this device.
    } finally {
      setLoggingOut(false);
      setConfirming(false);
      onNavigate?.(); // closes the mobile menu if it is open
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex h-full min-h-screen w-60 flex-col bg-[#12403c] text-[#cfe0dc]">
      <div className="px-5 pb-6 pt-6">
        <p className="text-lg font-semibold tracking-tight text-white">MediCare</p>
        <p className="text-xs text-[#8fb0aa]">Kigali Referral Clinic</p>
      </div>

      <nav className="flex-1 px-3" aria-label="Main">
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

      <div className="border-t border-white/10 px-5 py-4 text-sm">
        <div>
          <p className="font-medium text-white">Admin User</p>
          <p className="text-xs text-[#8fb0aa]">Administrator</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 flex w-full items-center gap-2 rounded px-2 py-2 text-[#cfe0dc] transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c14e]"
        >
          <LogOut size={17} strokeWidth={1.75} />
          <span>Log out</span>
        </button>
      </div>

      {/* Confirmation dialog (rendered on top of everything, even inside the mobile drawer) */}
      {confirming &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#062a2a]/60 p-4"
            onClick={() => !loggingOut && setConfirming(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              aria-describedby="logout-desc"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-[#12302d] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)]"
            >
              <h2 id="logout-title" className="text-lg font-semibold">Log out of MediCare?</h2>
              <p id="logout-desc" className="mt-1 text-sm text-[#5b6b69]">
                You will need to sign in again to continue.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirming(false)}
                  disabled={loggingOut}
                  className="rounded-lg border border-[#cfdad7] px-4 py-2.5 text-sm font-medium text-[#3f5451] hover:bg-[#f3f6f5] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 disabled:opacity-60"
                >
                  Stay signed in
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg bg-[#b4432f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#9a3826] focus:outline-none focus:ring-2 focus:ring-[#b4432f]/40 disabled:opacity-60"
                >
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}