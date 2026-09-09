import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-lg px-4 py-2 font-medium transition-colors duration-150 cursor-pointer min-h-11 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
    ghost: "text-blue-600 hover:underline bg-transparent",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
