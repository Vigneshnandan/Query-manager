import Badge from "./Badge";

interface StatusBadgeProps {
  status: "new" | "assigned" | "in_progress" | "resolved" | "escalated";
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-slate-100 text-slate-700" },
  assigned: { label: "Assigned", className: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-700" },
  escalated: { label: "Escalated", className: "bg-red-50 text-red-700" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = STATUS_MAP[status];
  return <Badge label={label} className={className} />;
}
