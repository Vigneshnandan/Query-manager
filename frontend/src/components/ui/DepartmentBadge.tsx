import { Droplet, Zap, Trash2, Construction, HeartPulse, FileText, Shield } from "lucide-react";
import Badge from "./Badge";

interface DepartmentBadgeProps {
  department: "Water" | "Electricity" | "Sanitation" | "Roads" | "Health" | "Revenue" | "Police";
}

const DEPT_MAP: Record<string, { className: string; icon: React.ComponentType<{ size: number; strokeWidth: number }> }> = {
  Water: { className: "bg-sky-50 text-sky-700", icon: Droplet },
  Electricity: { className: "bg-amber-50 text-amber-700", icon: Zap },
  Sanitation: { className: "bg-emerald-50 text-emerald-700", icon: Trash2 },
  Roads: { className: "bg-orange-50 text-orange-700", icon: Construction },
  Health: { className: "bg-rose-50 text-rose-700", icon: HeartPulse },
  Revenue: { className: "bg-violet-50 text-violet-700", icon: FileText },
  Police: { className: "bg-indigo-50 text-indigo-700", icon: Shield },
};

export default function DepartmentBadge({ department }: DepartmentBadgeProps) {
  const { className, icon: IconComponent } = DEPT_MAP[department];
  return (
    <Badge
      label={department}
      className={className}
      icon={<IconComponent size={14} strokeWidth={2.5} />}
    />
  );
}
