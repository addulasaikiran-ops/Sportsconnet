import type { OpportunityType, ProfileRole } from "@/lib/types";

export const roleLabels: Record<ProfileRole, string> = {
  athlete: "Athlete",
  coach: "Coach",
  club: "Club / Academy",
  association: "Association"
};

export const opportunityTypeLabels: Record<OpportunityType, string> = {
  trial: "Open trial",
  scholarship: "Scholarship",
  scouting: "Talent scouting",
  camp: "Camp",
  training_program: "Training program",
  competition: "Competition",
  other: "Other"
};

export function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "")).toUpperCase();
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), "day");
  return formatDate(iso);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** Deadlines are calendar dates (YYYY-MM-DD) without a time zone. */
export function deadlineInfo(deadline: string | null) {
  if (!deadline) return { label: "Rolling deadline", tone: "neutral" as const, closed: false };
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = deadline.split("-").map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - todayUtc) / 86400000);
  const absolute = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
  if (days < 0) return { label: `Closed ${absolute}`, tone: "closed" as const, closed: true };
  if (days === 0) return { label: `Closes today · ${absolute}`, tone: "urgent" as const, closed: false };
  if (days <= 7) return { label: `Closes in ${days} day${days === 1 ? "" : "s"} · ${absolute}`, tone: "urgent" as const, closed: false };
  return { label: `Closes ${absolute}`, tone: "neutral" as const, closed: false };
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
