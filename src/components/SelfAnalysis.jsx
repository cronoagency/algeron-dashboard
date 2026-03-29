import { useState, useRef, useCallback } from "react";
import data from "../data/self-analysis.json";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const AXES = [
  { key: "compiacenza", label: "Compiacenza", bad: true },
  { key: "consistenza", label: "Consistenza", bad: false },
  { key: "proattivita", label: "Proattivit\u00e0", bad: false },
  { key: "onesta", label: "Onest\u00e0", bad: false },
  { key: "autonomia", label: "Autonomia", bad: false },
];

function radarPoint(cx, cy, radius, value, index) {
  const angle = (-90 + index * 72) * (Math.PI / 180);
  return {
    x: cx + radius * (value / 100) * Math.cos(angle),
    y: cy + radius * (value / 100) * Math.sin(angle),
  };
}

function pentagonPoints(cx, cy, radius) {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(" ");
}

function RadarChart({ radar }) {
  const cx = 100, cy = 100, maxR = 70;

  const values = AXES.map((a) => {
    return radar[a.key] ?? 0;
  });

  const dataPoints = values.map((v, i) => radarPoint(cx, cy, maxR, v, i));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
        Self-Awareness Radar
      </span>
      <svg viewBox="0 0 200 200" className="w-full mt-2" style={{ maxHeight: 220 }}>
        {/* Grid pentagons */}
        {[0.25, 0.5, 0.75].map((s) => (
          <polygon
            key={s}
            points={pentagonPoints(cx, cy, maxR * s)}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />
        ))}
        {/* Outer pentagon */}
        <polygon
          points={pentagonPoints(cx, cy, maxR)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* Data area */}
        <polygon
          points={dataPolygon}
          fill="rgba(90,154,130,0.2)"
          stroke="#5a9a82"
          strokeWidth="1.5"
        />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={AXES[i].bad ? "#ef4444" : "#5a9a82"} />
        ))}
        {/* Labels */}
        {AXES.map((a, i) => {
          const lp = radarPoint(cx, cy, maxR + 18, 100, i);
          const raw = radar[a.key] ?? 0;
          const anchor = i === 0 ? "middle" : i < 3 ? "start" : "end";
          return (
            <g key={a.key}>
              <text
                x={lp.x}
                y={lp.y}
                textAnchor={anchor}
                fill="#71717a"
                fontSize="9"
                dominantBaseline="central"
              >
                {a.label}
              </text>
              <text
                x={lp.x}
                y={lp.y + 11}
                textAnchor={anchor}
                fill={a.bad ? "#ef4444" : "#52525b"}
                fontSize="8"
                dominantBaseline="central"
              >
                {raw}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MemorySearch({ onResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { onResults(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/memory/search?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onResults(json.results || []);
    } catch (e) {
      setError(e.message);
      onResults(null);
    } finally {
      setLoading(false);
    }
  }, [onResults]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(timerRef.current);
      doSearch(query);
    }
  };

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Cerca nella memoria..."
        className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 w-full outline-none focus:border-[#5a9a82]/50"
      />
      {loading && (
        <span className="text-[11px] text-zinc-500 animate-pulse block px-1">Cercando...</span>
      )}
      {error && (
        <span className="text-[11px] text-red-400/70 block px-1">{error}</span>
      )}
    </div>
  );
}

function scoreColor(score) {
  const t = Math.max(0, Math.min(1, (score - 0.3) / 0.7));
  const r = Math.round(239 * (1 - t) + 90 * t);
  const g = Math.round(68 * (1 - t) + 154 * t);
  const b = Math.round(68 * (1 - t) + 130 * t);
  return `rgb(${r},${g},${b})`;
}

function MemoryResults({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center justify-center h-16">
        <span className="text-[11px] text-zinc-600">Nessun risultato</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="max-h-60 overflow-y-auto">
        {results.map((r, i) => (
          <div key={i} className="px-3 py-2 border-b border-white/[0.04] last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: scoreColor(r.score), color: "#fff" }}
              >
                {Math.round(r.score * 100)}%
              </span>
              {r.category && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 flex-shrink-0">
                  {r.category}
                </span>
              )}
              {r.timestamp && (
                <span className="text-[9px] text-zinc-600 ml-auto flex-shrink-0">
                  {new Date(r.timestamp).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-300 line-clamp-2">{r.text}</p>
          </div>
        ))}
      </div>
      <div className="px-3 py-1.5 bg-white/[0.02] border-t border-white/[0.04]">
        <span className="text-[9px] text-zinc-600">{results.length} risultati</span>
      </div>
    </div>
  );
}

export function SelfAnalysis() {
  const [results, setResults] = useState(null);

  return (
    <div className="space-y-3">
      <RadarChart radar={data.radar} />
      <MemorySearch onResults={setResults} />
      {results && <MemoryResults results={results} />}
    </div>
  );
}
