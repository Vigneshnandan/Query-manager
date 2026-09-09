import { type ReactNode } from "react";

interface BadgeProps {
  label: string;
  className?: string;
  color?: string;
  icon?: ReactNode;
}

export default function Badge({ label, className, color, icon }: BadgeProps) {
  const finalClassName = className || (color ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700");

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${finalClassName}`}
      style={color && !className ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {label}
    </span>
  );
}
