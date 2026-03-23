import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function createIcon(pathD: string) {
  return function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        <path d={pathD} />
      </svg>
    );
  };
}

export const ArrowUpRight = createIcon("M7 17L17 7M9 7h8v8");
export const Menu = createIcon("M3 6h18M3 12h18M3 18h18");
export const X = createIcon("M6 6l12 12M18 6L6 18");
export const Sparkles = createIcon("M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3");

export const Mail = createIcon("M4 6h16v12H4zM4 7l8 6 8-6");
export const Phone = createIcon("M5 4h4l2 5-2 2a13 13 0 0 0 6 6l2-2 5 2v4c0 1-1 2-2 2A17 17 0 0 1 3 6c0-1 1-2 2-2");
export const MapPin = createIcon("M12 21s7-5 7-11a7 7 0 1 0-14 0c0 6 7 11 7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6");
export const Handshake = createIcon("M4 12l4-4 4 4-4 4-4-4m8-2 3-3 5 5-3 3-5-5");
export const MessageCircle = createIcon("M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 3v-6.5A8.5 8.5 0 1 1 21 12z");
export const Landmark = createIcon("M3 10h18M5 10v8m4-8v8m4-8v8m4-8v8M2 21h20M12 3l9 4H3l9-4z");

export const Star = createIcon("M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z");
export const Rocket = createIcon("M5 19c0-2.5 2-4.5 4.5-4.5L19 5l-9.5 9.5A4.5 4.5 0 0 0 5 19zm0 0-2 2m11-13 3 3");
export const MessageSquareHeart = createIcon("M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10zm-9-4-2-2a1.5 1.5 0 1 1 2-2 1.5 1.5 0 1 1 2 2l-2 2z");

export const Gauge = createIcon("M12 14l4-4M4 13a8 8 0 1 1 16 0M6 18h12");
export const WalletCards = createIcon("M3 7h18v10H3zM3 10h18M16 14h3");
export const ClipboardCheck = createIcon("M9 3h6l1 2h3v16H5V5h3l1-2zm-1 10 2 2 5-5");
export const Building2 = createIcon("M3 21h18M6 21V7l6-3 6 3v14M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01");

export const LineChart = createIcon("M3 3v18h18M7 14l3-3 3 2 4-5");
export const ShieldCheck = createIcon("M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3zm-2 9 2 2 4-4");
export const Banknote = createIcon("M3 7h18v10H3zM7 12h.01M17 12h.01M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4");
export const Clock3 = createIcon("M12 6v6l4 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18");
export const SlidersHorizontal = createIcon("M4 6h16M4 12h16M4 18h16M8 5v2M16 11v2M12 17v2");

export const Bolt = createIcon("M13 2L4 14h6l-1 8 9-12h-6l1-8z");
export const BadgePercent = createIcon("M8 16l8-8M8.5 8.5h.01M15.5 15.5h.01M12 2l2.5 2.5L18 5l-.5 3.5L20 11l-2.5 2.5L18 17l-3.5.5L12 20l-2.5-2.5L6 17l.5-3.5L4 11l2.5-2.5L6 5l3.5-.5L12 2z");
export const FileCheck2 = createIcon("M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6zm0 1v5h5M8 14l2 2 4-4");
export const LayoutDashboard = createIcon("M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z");
export const TrendingUp = createIcon("M3 17l6-6 4 4 7-7M14 8h6v6");
export const TimerReset = createIcon("M12 8v5l3 2M3 12a9 9 0 1 0 3-6.7M3 3v4h4");
