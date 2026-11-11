const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

type P = { size?: number };
const sz = (size?: number) => (size ? { width: size, height: size } : {});

export const DumbbellIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
  </svg>
);
export const HistoryIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </svg>
);
export const ChartIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <path d="M3 3v18h18" />
    <path d="m7 15 4-4 3 3 5-6" />
  </svg>
);
export const ListIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);
export const GearIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
export const CheckIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size} strokeWidth={3}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const SunIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = ({ size }: P) => (
  <svg {...base} {...sz(size)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const PlusIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size} strokeWidth={2.5}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const PlayIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size} fill="currentColor" stroke="none">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
  </svg>
);
export const EditIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);
export const TrashIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </svg>
);
export const XIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const UpIcon = ({ size = 16 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);
export const DownIcon = ({ size = 16 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const SearchIcon = ({ size = 18 }: P) => (
  <svg {...base} width={size} height={size}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const ArrowUpIcon = ({ size = 14 }: P) => (
  <svg {...base} width={size} height={size} strokeWidth={2.5}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const ArrowDownIcon = ({ size = 14 }: P) => (
  <svg {...base} width={size} height={size} strokeWidth={2.5}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);
export const LeftIcon = ({ size = 20 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);
export const RightIcon = ({ size = 20 }: P) => (
  <svg {...base} width={size} height={size}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
