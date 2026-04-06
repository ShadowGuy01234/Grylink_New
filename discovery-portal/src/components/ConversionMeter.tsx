import React from 'react';

interface ConversionMeterProps {
  angle: number; // 0-180
  score: number; // 0-100
  classification: string; // RED, ORANGE, YELLOW, GREEN
  size?: 'sm' | 'md' | 'lg';
}

const ZONES = [
  { label: 'Reject', color: '#ef4444', start: 0, end: 45 },
  { label: 'Hold', color: '#f97316', start: 45, end: 90 },
  { label: 'Strategic', color: '#eab308', start: 90, end: 135 },
  { label: 'Priority', color: '#22c55e', start: 135, end: 180 },
];

const classColors: Record<string, string> = {
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

const ConversionMeter: React.FC<ConversionMeterProps> = ({ angle, score, classification, size = 'md' }) => {
  const dims = { sm: { w: 140, h: 85 }, md: { w: 200, h: 120 }, lg: { w: 280, h: 160 } };
  const { w, h } = dims[size];
  const cx = w / 2;
  const cy = h - 10;
  const r = w / 2 - 15;

  // Convert angle to position on arc (180° = left to right, 0° = left)
  const needleAngle = Math.PI - (angle * Math.PI) / 180;
  const nx = cx + r * 0.85 * Math.cos(needleAngle);
  const ny = cy - r * 0.85 * Math.sin(needleAngle);

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

  const color = classColors[classification] || '#64748b';

  return (
    <div className="conversion-meter">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="meter-svg">
        {/* Zone arcs */}
        {ZONES.map((zone) => (
          <path
            key={zone.label}
            d={arcPath(zone.start, zone.end)}
            fill="none"
            stroke={zone.color}
            strokeWidth={size === 'sm' ? 6 : 8}
            strokeLinecap="round"
            opacity={0.3}
          />
        ))}

        {/* Active arc up to needle */}
        {angle > 0 && (
          <path
            d={arcPath(0, Math.min(angle, 180))}
            fill="none"
            stroke={color}
            strokeWidth={size === 'sm' ? 6 : 8}
            strokeLinecap="round"
            opacity={0.9}
          />
        )}

        {/* Needle line */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Needle center dot */}
        <circle cx={cx} cy={cy} r={4} fill={color} />

        {/* Score text */}
        <text x={cx} y={cy - 20} textAnchor="middle" fill="#f1f5f9" fontSize={size === 'sm' ? 18 : 24} fontWeight="800">
          {score}
        </text>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#64748b" fontSize={size === 'sm' ? 8 : 10}>
          / 100
        </text>
      </svg>
      <div className="meter-label" style={{ color }}>{classLabels[classification] || '—'}</div>
      <div className="meter-score">{angle}° conversion angle</div>
    </div>
  );
};

export default ConversionMeter;
