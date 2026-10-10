'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Briefcase, User } from 'lucide-react';
import type { ReactNode } from 'react';

export const TABS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/discover', label: 'Discover', Icon: Search },
  { href: '/create', label: 'Create', Icon: PlusSquare },
  { href: '/opportunities', label: 'Opportunities', Icon: Briefcase },
  { href: '/me', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur md:hidden"
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={`grid h-11 w-11 place-items-center rounded-xl transition ${
              active ? 'text-[var(--brand-text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarNav() {
  const path = usePathname();

  return (
    <aside
      aria-label="Sidebar navigation"
      className="fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--border)] bg-[var(--surface)] md:flex md:w-[72px] md:flex-col lg:w-[246px]"
    >
      <div className="flex h-16 items-center border-b border-[var(--border)] px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[var(--navy)]">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--lime)] font-black text-[var(--navy)]">
            SC
          </span>
          <span className="hidden text-base tracking-tight lg:inline">SportsConnect</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2 lg:p-3" aria-label="Desktop Primary">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              title={label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-[var(--brand-soft)] text-[var(--brand-text)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              } md:justify-center lg:justify-start`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SidebarNav />
      <div className="md:pl-[72px] lg:pl-[246px]">
        <main className="pb-16 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
