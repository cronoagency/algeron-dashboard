import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export function Systems() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-40 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <span className="text-zinc-600 text-sm animate-pulse">Loading systems...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-40 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <span className="text-red-400/70 text-sm">Connection error: {error}</span>
      </div>
    );
  }

  const services = data?.services ? Object.values(data.services) : [];
  const downCount = services.filter((s) => !s.ok).length;
  const allOk = downCount === 0;

  const timestamp = data?.timestamp
    ? new Date(data.timestamp).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {services.map((service) => (
          <div
            key={service.label}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 flex items-center gap-2.5"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: service.ok ? "#5a9a82" : "#ef4444" }}
            />
            <div className="min-w-0">
              <span className="text-[12px] text-white block leading-tight">{service.label}</span>
              <span className="text-[10px] text-zinc-500 block leading-tight">{service.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <span
          className="text-[10px] font-medium"
          style={{ color: allOk ? "#5a9a82" : "#ef4444" }}
        >
          {allOk ? "All systems OK" : `${downCount} system${downCount > 1 ? "s" : ""} down`}
        </span>
        <span className="text-[10px] text-zinc-600">
          Last check: {timestamp}
          {error && <span className="text-amber-400/70 ml-2">(stale)</span>}
        </span>
      </div>
    </div>
  );
}
