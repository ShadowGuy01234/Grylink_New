import { useId } from 'react';

interface ConversionMeterProps {
  angle: number; // 0-180
  score: number; // 0-100
  classification: string; // RED, ORANGE, YELLOW, GREEN
  size?: 'sm' | 'md' | 'lg';
  showReadout?: boolean;
}

const ZONES = [
  { label: 'Reject', color: '#ef4444', textColor: '#dc2626', start: 0, end: 45 },
  { label: 'Hold', color: '#f97316', textColor: '#c2410c', start: 45, end: 90 },
  { label: 'Strategic', color: '#eab308', textColor: '#a16207', start: 90, end: 135 },
  { label: 'Priority', color: '#22c55e', textColor: '#15803d', start: 135, end: 180 },
];

const classArcColors: Record<string, string> = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
};

const classLabels: Record<string, string> = {
  RED: 'Reject',
  ORANGE: 'Hold',
  YELLOW: 'Strategic',
  GREEN: 'Priority',
};

const classTextColors: Record<string, string> = {
  RED: '#dc2626',
  ORANGE: '#c2410c',
  YELLOW: '#a16207',
  GREEN: '#15803d',
};

const ConversionMeter: React.FC<ConversionMeterProps> = ({
  angle,
  score,
  classification,
  size = 'md',
  showReadout = false,
}) => {
  const meterId = useId().replace(/:/g, '');
  const dims = {
    sm: {
      w: 190,
      h: 124,
      stroke: 9,
      needle: 2.3,
      dot: 4.5,
      outerPadding: 18,
      bottomPadding: 14,
      wrapperMax: 'max-w-[180px]',
      scoreFont: 36,
      denominatorFont: 12,
      statusClass: 'text-2xl',
      angleClass: 'text-sm',
    },
    md: {
      w: 250,
      h: 158,
      stroke: 11,
      needle: 2.8,
      dot: 5.5,
      outerPadding: 22,
      bottomPadding: 16,
      wrapperMax: 'max-w-[240px]',
      scoreFont: 44,
      denominatorFont: 14,
      statusClass: 'text-3xl',
      angleClass: 'text-base',
    },
    lg: {
      w: 310,
      h: 192,
      stroke: 13,
      needle: 3.2,
      dot: 6.5,
      outerPadding: 24,
      bottomPadding: 18,
      wrapperMax: 'max-w-[310px]',
      scoreFont: 54,
      denominatorFont: 16,
      statusClass: 'text-4xl',
      angleClass: 'text-lg',
    },
  } as const;
  const cfg = dims[size];
  const { w, h } = cfg;
  const clampedAngle = Math.max(0, Math.min(180, Number.isFinite(angle) ? angle : 0));
  const clampedScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const cx = w / 2;
  const cy = h - cfg.bottomPadding;
  const r = w / 2 - cfg.outerPadding;
  const scoreY = cy - r * 0.34;
  const denominatorY = scoreY + (size === 'sm' ? 18 : 22);

  // Convert angle to position on arc (180° = left to right, 0° = left)
  const needleAngle = Math.PI - (clampedAngle * Math.PI) / 180;
  const nx = cx + r * 0.8 * Math.cos(needleAngle);
  const ny = cy - r * 0.8 * Math.sin(needleAngle);

  const arcPath = (startDeg: number, endDeg: number) => {
    const s = Math.PI - (startDeg * Math.PI) / 180;
    const e = Math.PI - (endDeg * Math.PI) / 180;
    const sx = cx + r * Math.cos(s);
    const sy = cy - r * Math.sin(s);
    const ex = cx + r * Math.cos(e);
    const ey = cy - r * Math.sin(e);
    const largeArc = endDeg - startDeg > 90 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey}`;
  };

  const accent = classArcColors[classification] || '#64748b';
  const label = classLabels[classification] || 'Unclassified';
  const labelColor = classTextColors[classification] || '#334155';
  const badgeBg = `${accent}12`;
  const badgeBorder = `${accent}4A`;
  const gradientId = `meter-gradient-${meterId}`;
  const meterAria = `Conversion score ${Math.round(clampedScore)} out of 100, ${label}, conversion angle ${Math.round(clampedAngle)} degrees`;
  const shellClass =
    size === 'sm'
      ? 'rounded-xl border border-slate-200 bg-slate-50/70 p-2'
      : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';

  return (
    <div className={`mx-auto w-full ${cfg.wrapperMax}`}>
      <div className={shellClass}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto w-full"
          role="img"
          aria-label={meterAria}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="52%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Base track */}
          <path
            d={arcPath(0, 180)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
          />

          {/* Segment hints */}
          {ZONES.map((zone) => (
            <path
              key={zone.label}
              d={arcPath(zone.start, zone.end)}
              fill="none"
              stroke={zone.color}
              strokeWidth={cfg.stroke}
              strokeLinecap="round"
              opacity="0.38"
            />
          ))}

          {/* Active arc */}
          {clampedAngle > 0 && (
            <path
              d={arcPath(0, clampedAngle)}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={cfg.stroke}
              strokeLinecap="round"
            />
          )}

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="#0f172a"
            strokeWidth={cfg.needle}
            strokeLinecap="round"
          />

          {/* Needle center */}
          <circle cx={cx} cy={cy} r={cfg.dot + 2} fill="white" stroke="#94a3b8" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={cfg.dot} fill={accent} />

          {/* Score */}
          <text
            x={cx}
            y={scoreY}
            textAnchor="middle"
            fill="#0f172a"
            fontSize={cfg.scoreFont}
            fontWeight="900"
            letterSpacing="-0.6"
          >
            {Math.round(clampedScore)}
          </text>
          <text
            x={cx}
            y={denominatorY}
            textAnchor="middle"
            fill="#475569"
            fontSize={cfg.denominatorFont}
            fontWeight="700"
          >
            / 100
          </text>
        </svg>

        <div className="mt-2 flex flex-col items-center gap-2">
          <div
            className={`font-extrabold tracking-tight ${cfg.statusClass}`}
            style={{ color: labelColor }}
          >
            {label}
          </div>
          <div className={`font-semibold text-slate-600 ${cfg.angleClass}`}>
            {Math.round(clampedAngle)}° conversion angle
          </div>
          <div
            className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: labelColor, borderColor: badgeBorder, backgroundColor: badgeBg }}
          >
            {label} zone
          </div>
        </div>

        {showReadout && (
          <div className="mt-3 flex justify-center">
            <div className="w-full max-w-[180px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Score</p>
              <p className="text-xl font-extrabold text-slate-900">{Math.round(clampedScore)}/100</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionMeter;
