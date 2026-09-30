import { Bell, Menu, Search } from "lucide-react";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#dfe4e1] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="p-1 lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <p className="text-sm text-[#5b6b69]">{today}</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="hidden items-center gap-2 border-b border-[#c9d1ce] pb-0.5 md:flex">
          <Search size={15} className="text-[#7b8a87]" />
          <input
            type="text"
            placeholder="Find a patient or record"
            className="w-56 bg-transparent text-sm outline-none placeholder:text-[#8a9794]"
          />
        </label>
        <button className="relative p-1" aria-label="Notifications">
          <Bell size={19} strokeWidth={1.75} />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b4432f] px-1 text-[10px] text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}