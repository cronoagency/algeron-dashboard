import { useState, useRef, useCallback } from "react";
import data from "../data/self-analysis.json";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const AXES = [
  { key: "compiacenza", label: "Compiacenza", invert: true },
  { key: "consistenza", label: "Consistenza", invert: false },
  { key: "proattivita", label: "Proattivit\u00e0", invert: false },
  { key: "onesta", label: "Onest\u00e0", invert: false },
  { key: "autonomia", label: "Autonomia", invert: false },
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
    const raw = radar[a.key] ?? 0;
    return a.invert ? 100 - raw : raw;
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
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#5a9a82" />
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
                fill="#52525b"
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

const START_DATE = new Date("2026-03-01").getTime();

function scoreColor(score) {
  const t = Math.max(0, Math.min(1, (score - 0.3) / 0.7));
  const r = Math.round(239 * (1 - t) + 90 * t);
  const g = Math.round(68 * (1 - t) + 154 * t);
  const b = Math.round(68 * (1 - t) + 130 * t);
  return `rgb(${r},${g},${b})`;
}

function MemoryTimeline({ results }) {
  const [selected, setSelected] = useState(null);

  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-center justify-center h-20">
        <span className="text-[11px] text-zinc-600">Nessun risultato</span>
      </div>
    );
  }

  const now = Date.now();
  const range = now - START_DATE;
  const svgW = 500;

  // Week ticks
  const weeks = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(START_DATE + i * 7 * 86400000);
    if (d.getTime() > now) break;
    const weekNum = 10 + i;
    weeks.push({ x: ((d.getTime() - START_DATE) / range) * svgW, label: `W${weekNum}` });
  }

  // Position dots, handle overlap
  const dots = results.map((r, i) => {
    const ts = r.timestamp ? new Date(r.timestamp).getTime() : now;
    const x = Math.max(4, Math.min(svgW - 4, ((ts - START_DATE) / range) * svgW));
    return { ...r, x, idx: i };
  });

  // Offset overlapping Y
  dots.sort((a, b) => a.x - b.x);
  for (let i = 1; i < dots.length; i++) {
    if (Math.abs(dots[i].x - dots[i - 1].x) < 10) {
      dots[i].yOff = dots[i - 1].yOff === -10 ? 10 : -10;
    }
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} 80`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Axis */}
          <line x1="0" y1="40" x2={svgW} y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {/* Week ticks */}
          {weeks.map((w) => (
            <g key={w.label}>
              <line x1={w.x} y1="36" x2={w.x} y2="44" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <text x={w.x} y="56" textAnchor="middle" fill="#52525b" fontSize="8">{w.label}</text>
            </g>
          ))}
          {/* Dots */}
          {dots.map((d) => (
            <circle
              key={d.idx}
              cx={d.x}
              cy={40 + (d.yOff || 0)}
              r="4"
              fill={scoreColor(d.score)}
              opacity="0.8"
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(selected?.idx === d.idx ? null : d)}
            />
          ))}
        </svg>
      </div>

      {selected && (
        <div className="rounded-lg bg-white/[0.05] border border-white/[0.06] p-3">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: scoreColor(selected.score), color: "#fff" }}
            >
              {Math.round(selected.score * 100)}%
            </span>
            {selected.category && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                {selected.category}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-300 line-clamp-3">{selected.text}</p>
          {selected.timestamp && (
            <span className="text-[9px] text-zinc-600 mt-1 block">
              {new Date(selected.timestamp).toLocaleDateString("it-IT", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function SelfAnalysis() {
  const [results, setResults] = useState(null);

  return (
    <div className="space-y-3">
      <RadarChart radar={data.radar} />
      <MemorySearch onResults={setResults} />
      {results && <MemoryTimeline results={results} />}
    </div>
  );
}
