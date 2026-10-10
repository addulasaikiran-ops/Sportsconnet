export type OpportunityItem = {
  id?: string;
  type: string;
  title: string;
  organizer?: string;
  location?: string;
  deadline: string;
  icon?: string;
};

export function deadlineInfo(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { text: 'Closed', tone: 'muted' as const };
  const h = Math.floor(ms / 36e5);
  const d = Math.floor(h / 24);
  if (h < 24) return { text: `Closes in ${h}h`, tone: 'danger' as const };
  if (d < 3) return { text: `Closes in ${d} days`, tone: 'warn' as const };
  return { text: `Closes in ${d} days`, tone: 'ok' as const };
}

const TONE = {
  ok: 'text-[var(--muted)]',
  warn: 'text-[var(--warn)]',
  danger: 'text-[var(--danger)]',
  muted: 'text-[var(--muted)]',
};

export function OpportunityCard({
  o,
  onApply,
  applied,
}: {
  o: OpportunityItem;
  onApply?: () => void;
  applied?: boolean;
}) {
  const d = deadlineInfo(o.deadline);
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-xl">
        {o.icon ?? '🏆'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--brand-text)]">
          {o.type}
        </p>
        <h3 className="truncate font-semibold text-[var(--text)]">{o.title}</h3>
        <p className="truncate text-[13px] text-[var(--muted)]">
          {[o.organizer, o.location].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-[12px] font-semibold ${TONE[d.tone]}`}>{d.text}</p>
        <button
          type="button"
          disabled={applied || d.tone === 'muted'}
          onClick={onApply}
          className="mt-1 h-9 rounded-[10px] bg-[var(--brand)] px-4 text-[13px] font-semibold text-white transition disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)]"
        >
          {applied ? 'Applied' : 'View & apply'}
        </button>
      </div>
    </div>
  );
}
