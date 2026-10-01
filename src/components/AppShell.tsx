import { signOut } from "@/app/logout/actions";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    enabled: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    key: "scouting",
    label: "Player Scouting",
    href: "#",
    enabled: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    ),
  },
  {
    key: "shortlists",
    label: "Shortlists",
    href: "#",
    enabled: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
      </svg>
    ),
  },
  {
    key: "squad",
    label: "Squad Performance",
    href: "#",
    enabled: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 20v-4a3 3 0 013-3h2a3 3 0 013 3v4M13 20v-7a3 3 0 013-3h2a3 3 0 013 3v7" />
      </svg>
    ),
  },
  {
    key: "league",
    label: "League Analysis",
    href: "#",
    enabled: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 21V9l8-6 8 6v12" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
];

export function AppShell({
  userEmail,
  isAdmin,
  active,
  children,
}: {
  userEmail: string;
  isAdmin: boolean;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pm-bg text-pm-text font-sans">
      <div className="h-[3px] bg-pm-gold" />
      <header className="flex items-center justify-between px-10 py-4 border-b border-pm-border">
        <div className="font-display font-extrabold text-sm tracking-[3px]">
          PM <span className="text-pm-gold">SPORTS IQ</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs text-pm-text">{userEmail}</span>
          {isAdmin && (
            <span className="font-mono text-[9px] tracking-[1.5px] text-pm-gold uppercase border border-pm-gold-border bg-pm-gold-soft px-2 py-0.5">
              Admin
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="font-mono text-[10px] tracking-[1px] text-pm-text-soft uppercase border border-pm-border-strong px-2.5 py-1 hover:text-pm-text hover:border-pm-text-soft"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <div className="flex">
        <nav
          aria-label="Primary"
          className="w-16 shrink-0 border-r border-pm-border flex flex-col items-center gap-6 py-7"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              aria-disabled={!item.enabled}
              title={item.enabled ? item.label : `${item.label} — em breve`}
              className={`w-[18px] h-[18px] ${
                item.key === active
                  ? "text-pm-gold"
                  : item.enabled
                    ? "text-pm-text-muted hover:text-pm-text"
                    : "text-pm-text-soft/40 pointer-events-none"
              }`}
            >
              {item.icon}
            </a>
          ))}
        </nav>
        <main className="flex-1 min-w-0 px-16 pt-14 pb-24 max-w-[1480px]">{children}</main>
      </div>
    </div>
  );
}
