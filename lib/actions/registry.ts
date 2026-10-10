import type { LucideIcon } from 'lucide-react';
import { Video, Trophy, BarChart3, Dumbbell, Briefcase, Search, MessageSquare, UserPlus, Bookmark } from 'lucide-react';

export type ActionCtx = {
  router: { push: (href: string) => void };
  setComposer: (p: { type?: string; text?: string }) => void;
  openMention: () => void;
};

export type SlashAction = {
  id: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
  keywords: string[];                 // extra search terms
  group: 'Create' | 'Go to' | 'People';
  roles?: Array<'athlete' | 'coach' | 'club' | 'scout'>;   // who can see it
  run: (ctx: ActionCtx) => void;
};

export const ACTIONS: SlashAction[] = [
  { id: 'highlight', label: 'Highlight clip', hint: 'Share a video moment', Icon: Video, group: 'Create',
    keywords: ['video', 'clip', 'reel'], run: (c) => c.setComposer({ type: 'highlight' }) },
  { id: 'achievement', label: 'Achievement', hint: 'Medal, record, selection', Icon: Trophy, group: 'Create',
    keywords: ['medal', 'record', 'award'], run: (c) => c.setComposer({ type: 'achievement' }) },
  { id: 'result', label: 'Match result', hint: 'Score and performance', Icon: BarChart3, group: 'Create',
    keywords: ['score', 'match', 'game'], run: (c) => c.setComposer({ type: 'result' }) },
  { id: 'training', label: 'Training log', hint: 'Session and stats', Icon: Dumbbell, group: 'Create',
    keywords: ['workout', 'session'], roles: ['athlete', 'coach'], run: (c) => c.setComposer({ type: 'training' }) },
  { id: 'opportunity', label: 'Post opportunity', hint: 'Trial, job, scholarship', Icon: Briefcase, group: 'Create',
    keywords: ['trial', 'job', 'scholarship'], roles: ['coach', 'club', 'scout'], run: (c) => c.router.push('/opportunities/new') },

  { id: 'discover', label: 'Find athletes', hint: 'Search by sport and position', Icon: Search, group: 'Go to',
    keywords: ['search', 'talent', 'scout'], run: (c) => c.router.push('/discover') },
  { id: 'messages', label: 'Messages', hint: 'Open your inbox', Icon: MessageSquare, group: 'Go to',
    keywords: ['chat', 'dm', 'inbox'], run: (c) => c.router.push('/messages') },
  { id: 'saved', label: 'Saved', hint: 'Posts and opportunities', Icon: Bookmark, group: 'Go to',
    keywords: ['bookmark'], run: (c) => c.router.push('/saved') },

  { id: 'mention', label: 'Mention someone', hint: 'Tag an athlete or coach', Icon: UserPlus, group: 'People',
    keywords: ['tag', '@'], run: (c) => c.openMention() },
];

export type UserRole = 'athlete' | 'coach' | 'club' | 'scout';

export function filterActions(query: string, role?: UserRole) {
  const q = query.toLowerCase().trim();
  return ACTIONS
    .filter((a) => !a.roles || (role && a.roles.includes(role as UserRole)))
    .filter((a) => !q || [a.id, a.label, ...a.keywords].some((s) => s.toLowerCase().includes(q)));
}

