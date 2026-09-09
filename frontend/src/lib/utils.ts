export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return then.toLocaleDateString();
}

export function getRemainingTime(slaDeadline: string | null): string {
  if (!slaDeadline) return "No deadline";

  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs < 0) {
    const absMs = Math.abs(diffMs);
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    return `Overdue by ${hours}h ${minutes}m`;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

export function isOverdue(slaDeadline: string | null): boolean {
  if (!slaDeadline) return false;
  return new Date(slaDeadline) < new Date();
}

export function getSLAProgressPercent(slaDeadline: string | null): number {
  if (!slaDeadline) return 100;

  const now = new Date();
  const deadline = new Date(slaDeadline);

  const assignmentTime = new Date(deadline.getTime() - 48 * 60 * 60 * 1000);
  const totalMs = deadline.getTime() - assignmentTime.getTime();
  const elapsedMs = now.getTime() - assignmentTime.getTime();

  const percent = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  return Math.round(percent);
}

export function getSLAProgressColor(slaDeadline: string | null): string {
  const percent = getSLAProgressPercent(slaDeadline);
  if (percent > 100 || isOverdue(slaDeadline)) return "#EF4444";
  if (percent > 50) return "#F59E0B";
  return "#0EA5E9";
}

export const DEPT_COLORS = {
  Water: "#0EA5E9",
  Electricity: "#FBBF24",
  Sanitation: "#10B981",
  Roads: "#F97316",
  Health: "#EC4899",
  Revenue: "#8B5CF6",
  Police: "#6B7280",
};

export const STATUS_COLORS = {
  new: "#6366F1",
  assigned: "#3B82F6",
  in_progress: "#F59E0B",
  resolved: "#10B981",
  escalated: "#EF4444",
};
