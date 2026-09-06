/* Doodle botani line-art yang dipakai landing page dan halaman auth.
   Semua memakai currentColor supaya bisa diwarnai lewat CSS induk. */

export function Sprig({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M60 114V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 92c-16 0-28-10-30-26 17-2 28 8 30 26ZM60 92c16 0 28-10 30-26-17-2-28 8-30 26ZM60 62c-13 0-23-8-25-21 14-2 23 6 25 21ZM60 62c13 0 23-8 25-21-14-2-23 6-25 21ZM60 36c-9 0-16-6-17-15 10-1 16 4 17 15ZM60 36c9 0 16-6 17-15-10-1-16 4-17 15Z"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function Wave({ className }) {
  return (
    <svg className={className} viewBox="0 0 220 26" fill="none" aria-hidden="true">
      <path d="M4 18c14-16 28-16 42 0s28 16 42 0 28-16 42 0 28 16 42 0 28-16 42 0"
        stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function Rays({ className }) {
  return (
    <svg className={className} viewBox="0 0 90 70" fill="none" aria-hidden="true">
      <path d="M10 58 22 34M45 52V22M80 58 68 34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function Rings({ className }) {
  return (
    <svg className={className} viewBox="0 0 140 90" fill="none" aria-hidden="true">
      <circle cx="52" cy="50" r="30" stroke="currentColor" strokeWidth="4" />
      <circle cx="90" cy="50" r="30" stroke="currentColor" strokeWidth="4" />
      <path d="M52 20v-9M46 11h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* Bunga kamboja sederhana — dipakai sebagai pengganti karakter ❧/❋ yang
   render-nya tidak konsisten (jadi emoji berwarna) di beberapa sistem. */
export function Frangipani({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M12 12c0-3.2-1.6-5.6-4-6.8 1 3 .6 5.4-1.4 7.4 3-.6 4.6.4 5.4 -.6Z" />
        <path d="M12 12c2.6-1.8 3.8-4.2 3.4-7.4-2 1.6-3.2 3.8-3.4 7.4Z" />
        <path d="M12 12c3.2.2 5.6-1 7.2-3.4-3.2-.2-5.6.8-7.2 3.4Z" />
        <path d="M12 12c-.2 3.2-1.8 5.4-4.8 6.8 3.2.4 5.6-.8 4.8-6.8Z" />
        <path d="M12 12c1.4 2.8 3.8 4.2 7 4-1.8-2.4-4-3.8-7-4Z" />
      </g>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

/* Daun kecil — pengganti karakter ❧ pada logo, avatar testimoni, dsb. */
export function Leaf({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 19c3-4 6-7 12.5-12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconWallet({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9.5h13a3 3 0 0 1 3 3V13a3 3 0 0 1-3 3H4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="12.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCompare({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.5" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.9 6.5 11 6.5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconHeart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7.5-4.6-9.5-9.4C1.3 7.2 3 4 6.6 4c2 0 3.5 1.2 4.4 2.6C11.9 5.2 13.4 4 15.4 4 19 4 20.7 7.2 19.5 10.6 17.5 15.4 12 20 12 20Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBox({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.2 12 4l8 4.2v7.6L12 20l-8-4.2V8.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 8.2 12 12l8-3.8M12 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDocument({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3.5V8h4M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3c.6 3.4 2.3 5.1 5.7 5.7-3.4.6-5.1 2.3-5.7 5.7-.6-3.4-2.3-5.1-5.7-5.7C9.7 8.1 11.4 6.4 12 3Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M18.5 15c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFlow({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.6 7.3 10.5 16.6M17.4 7.3 13.5 16.6M6.8 6h10.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconHourglass({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 4h11M6.5 20h11M7.5 4c0 4 3 5.4 4.5 6.2C13.5 9.4 16.5 8 16.5 4M7.5 20c0-4 3-5.4 4.5-6.2C13.5 14.6 16.5 16 16.5 20"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStack({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 20.5 8.5 12 13 3.5 8.5 12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.5 12.5 12 17l8.5-4.5M3.5 16.3 12 20.8l8.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8.5" cy="13.5" r="1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconClock({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
