import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-600/30 active:bg-primary-900 active:translate-y-0",
      secondary:
        "bg-accent-500 text-white hover:bg-accent-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-500/30 active:bg-accent-800 active:translate-y-0",
      outline:
        "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white",
      ghost: "bg-transparent text-primary-600 hover:underline",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
