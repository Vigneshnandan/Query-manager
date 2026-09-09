import { type SelectHTMLAttributes, type ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export default function Select({
  label,
  id,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none w-full transition-colors ${className || ""}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
