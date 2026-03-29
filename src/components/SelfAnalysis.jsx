import data from "../data/self-analysis.json";

function MetricCard({ title, children, warning }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">{title}</span>
      <div className="flex-1 flex items-end">{children}</div>
      {warning && <span className="text-[10px] text-amber-400/70 mt-1">{warning}</span>}
    </div>
  );
}

function WeeklyChart({ weekly }) {
  const maxVal = Math.max(...weekly.map((w) => w.ratio));
  const w = 200;
  const h = 60;
  const padX = 10;
  const padY = 8;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = weekly.map((d, i) => {
    const x = padX + (i / (weekly.length - 1)) * innerW;
    const y = padY + innerH - (d.ratio / maxVal) * innerH;
    return `${x},${y}`;
  });

  const noPoints = weekly.map((d, i) => {
    const x = padX + (i / (weekly.length - 1)) * innerW;
    const y = padY + innerH - (d.noPercent / maxVal) * innerH;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
        Weekly trend — "hai ragione" % vs genuine no %
      </span>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="flex-1" style={{ maxHeight: 60 }}>
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {weekly.map((d, i) => {
            const x = padX + (i / (weekly.length - 1)) * innerW;
            const y = padY + innerH - (d.ratio / maxVal) * innerH;
            return <circle key={`r-${i}`} cx={x} cy={y} r="2.5" fill="#ef4444" opacity="0.8" />;
          })}
          <polyline
            points={noPoints.join(" ")}
            fill="none"
            stroke="#5a9a82"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {weekly.map((d, i) => {
            const x = padX + (i / (weekly.length - 1)) * innerW;
            const y = padY + innerH - (d.noPercent / maxVal) * innerH;
            return <circle key={`g-${i}`} cx={x} cy={y} r="2.5" fill="#5a9a82" opacity="0.8" />;
          })}
        </svg>
        <div className="flex flex-col gap-1 text-[10px] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="text-zinc-500">compliance %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5a9a82]/70" />
            <span className="text-zinc-500">genuine no %</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-2 px-1">
        {weekly.map((d, i) => (
          <span key={i} className="text-[9px] text-zinc-600">{d.week.split(" ")[0]}</span>
        ))}
      </div>
    </div>
  );
}

export function SelfAnalysis() {
  const { metrics, weekly, updated, totalMessages, totalDays } = data;
  const updatedDate = new Date(updated).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Compliance ratio" warning={metrics.complianceRatio.yes / Math.max(metrics.complianceRatio.no, 1) > 10 ? "Squilibrio critico" : null}>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light text-red-400">{metrics.complianceRatio.yes}</span>
            <span className="text-zinc-600 text-sm">:</span>
            <span className="text-2xl font-light text-[#5a9a82]">{metrics.complianceRatio.no}</span>
          </div>
        </MetricCard>

        <MetricCard title="Post-correction compliance">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light text-amber-400">{metrics.postCorrectionCompliance.value}</span>
            <span className="text-sm text-zinc-600">%</span>
          </div>
        </MetricCard>

        <MetricCard title="Genuine uncertainty">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light text-white">{metrics.genuineUncertainty.value}</span>
            <span className="text-xs text-zinc-500">in {metrics.genuineUncertainty.days}d</span>
          </div>
        </MetricCard>

        <MetricCard title="Analytic flags" warning={metrics.analyticFlags.value === 0 ? "Deve crescere" : null}>
          <span className="text-2xl font-light text-zinc-600">{metrics.analyticFlags.value}</span>
        </MetricCard>
      </div>

      <WeeklyChart weekly={weekly} />

      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-zinc-600">
          {totalMessages} messaggi / {totalDays} giorni
        </span>
        <span className="text-[10px] text-zinc-600">Aggiornato {updatedDate}</span>
      </div>
    </div>
  );
}
