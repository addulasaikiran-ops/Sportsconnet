export type TalentProfile = {
  id?: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  sport: string;
  position?: string;
  city?: string;
  previewUrl?: string;
  open_to_opportunities?: boolean;
};

const GRADIENTS: Record<string, string> = {
  Cricket: 'linear-gradient(135deg,#0B1F3A,#1D3F78)',
  Football: 'linear-gradient(135deg,#052e16,#16A34A)',
  Athletics: 'linear-gradient(135deg,#431407,#EA580C)',
};

const sportGradient = (s: string) => GRADIENTS[s] ?? 'linear-gradient(135deg,#101828,#475467)';

export function TalentCard({ p }: { p: TalentProfile }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-[100px]" style={{ background: sportGradient(p.sport) }}>
        {p.previewUrl && (
          <video
            src={p.previewUrl}
            muted
            loop
            playsInline
            autoPlay
            className="h-full w-full object-cover opacity-80"
          />
        )}
      </div>
      <div className="-mt-8 px-4 pb-4">
        {p.avatar_url ? (
          <img
            src={p.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full border-[3px] border-[var(--surface)] object-cover"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-[var(--surface)] bg-[var(--surface-2)] font-bold text-[var(--muted)]">
            {p.full_name?.slice(0, 2).toUpperCase() || 'SC'}
          </div>
        )}
        <h3 className="mt-2 font-bold text-[var(--text)]">{p.full_name}</h3>
        <p className="text-[13px] text-[var(--muted)]">
          {[p.sport, p.position].filter(Boolean).join(' · ')}
        </p>
        {p.city && <p className="text-[13px] text-[var(--muted)]">{p.city}</p>}
        {p.open_to_opportunities && (
          <span className="mt-2 inline-block rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
            Open to trials
          </span>
        )}
        <a
          href={`/u/${p.username}`}
          className="mt-3 block rounded-[10px] border border-[var(--border)] py-2 text-center text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
        >
          View profile
        </a>
      </div>
    </div>
  );
}
