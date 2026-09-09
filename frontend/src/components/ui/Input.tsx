import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, id, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none w-full transition-colors ${className || ""}`}
        {...props}
      />
    </div>
  );
}
