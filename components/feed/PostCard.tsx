'use client';

import { useRef, useEffect } from 'react';
import { Flame, MessageCircle, Share2, Bookmark, BadgeCheck } from 'lucide-react';

export type PostCardProps = {
  post: {
    id?: string;
    author: {
      avatar_url?: string;
      full_name: string;
      verified?: boolean;
      sport?: string;
      position?: string;
      timeAgo?: string;
    };
    body?: string;
    stat?: {
      label: string;
      value: string | number;
    };
    media?: {
      type: 'image' | 'video';
      url: string;
      poster?: string;
      alt?: string;
    };
    reactionCount?: number;
    myReaction?: boolean;
    commentCount?: number;
  };
  onReact?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
};

export function PostCard({ post, onReact, onComment, onShare, onSave }: PostCardProps) {
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // autoplay muted only while visible
    const el = vid.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.6) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex items-center gap-3 p-4">
        {post.author.avatar_url ? (
          <img
            src={post.author.avatar_url}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-2)] text-sm font-bold text-[var(--muted)]">
            {post.author.full_name?.slice(0, 2).toUpperCase() || 'SC'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate font-semibold text-[var(--text)]">
            {post.author.full_name}
            {post.author.verified && <BadgeCheck size={16} className="text-[var(--brand)]" />}
          </p>
          <p className="truncate text-[13px] text-[var(--muted)]">
            {[post.author.sport, post.author.position, post.author.timeAgo].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      {post.body && (
        <p className="px-4 pb-3 text-[15px] leading-6 text-[var(--text)]">{post.body}</p>
      )}

      {post.stat && (
        <div className="mx-4 mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-text)]">
          {post.stat.label}: <span className="tabular-nums">{post.stat.value}</span>
        </div>
      )}

      {post.media?.type === 'video' && (
        <video
          ref={vid}
          src={post.media.url}
          poster={post.media.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="max-h-[560px] w-full bg-black object-cover"
        />
      )}
      {post.media?.type === 'image' && (
        <img
          src={post.media.url}
          alt={post.media.alt ?? ''}
          loading="lazy"
          className="w-full object-cover"
        />
      )}

      <footer className="grid grid-cols-4 border-t border-[var(--border)] text-[13px] text-[var(--muted)]">
        <Action
          icon={<Flame size={18} />}
          label={post.reactionCount ?? 0}
          active={post.myReaction}
          onClick={onReact}
          ariaLabel="Appreciate post"
        />
        <Action
          icon={<MessageCircle size={18} />}
          label={post.commentCount ?? 0}
          onClick={onComment}
          ariaLabel="Comment on post"
        />
        <Action
          icon={<Share2 size={18} />}
          label="Share"
          onClick={onShare}
          ariaLabel="Share post"
        />
        <Action
          icon={<Bookmark size={18} />}
          label="Save"
          onClick={onSave}
          ariaLabel="Save post"
        />
      </footer>
    </article>
  );
}

function Action({
  icon,
  label,
  active,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-11 items-center justify-center gap-1.5 transition hover:bg-[var(--surface-2)] ${
        active ? 'font-semibold text-[var(--brand-text)]' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
