import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#f6f7f5] text-[#1c2b2a]"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden shrink-0 lg:block">
          <Sidebar />
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button
              aria-label="Close menu"
              className="flex-1 bg-black/40"
              onClick={() => setOpen(false)}
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setOpen(true)} />
          <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}