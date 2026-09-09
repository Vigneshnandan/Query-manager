import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  accentColor?: string;
  className?: string;
}

export default function Card({ children, accentColor, className }: CardProps) {
  const accentClass = accentColor ? `border-l-4 ${accentColor}` : "";

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm p-6 transition-all duration-150 hover:shadow-md${
        accentClass ? ` ${accentClass}` : ""
      }${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
