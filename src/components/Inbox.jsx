import { useState } from "react";
import items from "../data/inbox.json";

const statusColors = {
  unread: "#ffffff",
  read: "#f59e0b",
  discussed: "#5a9a82",
};

const typeLabels = {
  ricerca: "Ricerca",
  draft: "Draft",
  report: "Report",
  notion: "Notion",
};

export function Inbox() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
      {items.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-left"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusColors[item.status] }}
            />
            <span className="text-[12px] text-white flex-1 truncate">{item.title}</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 flex-shrink-0">
              {typeLabels[item.type]}
            </span>
            <span className="text-[10px] text-zinc-600 flex-shrink-0">
              {new Date(item.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
            </span>
          </button>

          {expanded === item.id && (
            <div className="mx-3 mt-1 mb-1 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 break-all">
                {item.link || item.path}
              </span>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between px-1 pt-2">
        <span className="text-[10px] text-zinc-600">
          {items.filter((i) => i.status === "unread").length} non letti
        </span>
        <span className="text-[10px] text-zinc-600">{items.length} documenti</span>
      </div>
    </div>
  );
}
