interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-10 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 60 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#0A2463" />
        </linearGradient>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      
      {/* Arrow head */}
      <polygon
        points="30,0 60,30 48,30 48,30 30,12 12,30 12,30 0,30"
        fill="url(#blueGradient)"
      />
      
      {/* Left pillar (green accent) */}
      <rect x="8" y="30" width="10" height="70" fill="url(#greenGradient)" />
      
      {/* Center pillar */}
      <rect x="25" y="30" width="10" height="70" fill="url(#blueGradient)" />
      
      {/* Right pillar */}
      <rect x="42" y="30" width="10" height="70" fill="url(#blueGradient)" />
    </svg>
  );
}
